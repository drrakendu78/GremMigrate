import type {
  R13Profile,
  R13Device,
  R13Action,
  R13Input,
  ConversionResult,
  ConversionStats,
  DeviceSummary,
} from '~/types/profile'

function uuid(): string {
  return crypto.randomUUID()
}

function mapAxisButtonDirection(dir: string): string {
  const map: Record<string, string> = { low: 'below', high: 'above' }
  return map[dir] || dir
}

function stripBraces(guid: string): string {
  return guid.replace(/^\{/, '').replace(/\}$/, '')
}

interface LibraryEntry {
  xml: string
}

interface ActionConfig {
  rootActionId: string
  behavior: string
  virtualButton?: {
    lowerLimit: number
    upperLimit: number
    direction: string
  }
}

interface InputEntry {
  deviceGuid: string
  inputType: string
  inputId: number
  mode: string
  actionConfigs: ActionConfig[]
}

export function generateR14(profile: R13Profile): ConversionResult {
  const warnings: string[] = []
  const libraryEntries: LibraryEntry[] = []
  const inputs: InputEntry[] = []
  const modes = new Map<string, string | undefined>()
  const deviceSet = new Map<string, string>() // guid -> name
  let skippedInputs = 0

  // Collect modes and devices
  for (const device of profile.devices) {
    if (device.type !== 'keyboard') {
      deviceSet.set(stripBraces(device.deviceGuid), device.name)
    }
    for (const mode of device.modes) {
      if (!modes.has(mode.name)) {
        modes.set(mode.name, mode.inherit)
      }
    }
  }

  // Process each device's inputs
  for (const device of profile.devices) {
    if (device.type === 'keyboard') continue

    for (const mode of device.modes) {
      for (const input of mode.inputs) {
        const result = convertInput(input, device, mode.name, warnings)

        for (const entry of result.libraryEntries) {
          libraryEntries.push(entry)
        }

        if (result.inputEntry) {
          inputs.push(result.inputEntry)
        }

        skippedInputs += result.skipped
      }
    }
  }

  const xml = buildXml(profile, libraryEntries, inputs, modes, deviceSet)

  // Build per-device summaries
  const deviceSummaries: DeviceSummary[] = []
  for (const device of profile.devices) {
    if (device.type === 'keyboard') continue
    const guid = stripBraces(device.deviceGuid)
    const modeSummaries = device.modes
      .map((mode) => {
        const modeInputs = inputs.filter((i) => i.deviceGuid === guid && i.mode === mode.name)
        const actionCount = modeInputs.reduce((sum, i) => sum + i.actionConfigs.length, 0)
        return { name: mode.name, inputCount: modeInputs.length, actionCount }
      })
      .filter((m) => m.inputCount > 0)
    if (modeSummaries.length > 0) {
      deviceSummaries.push({ name: device.name, guid, modes: modeSummaries })
    }
  }

  const stats: ConversionStats = {
    devicesCount: deviceSet.size,
    modesCount: modes.size,
    actionsCount: libraryEntries.length,
    inputsCount: inputs.length,
    skippedInputs,
    devices: deviceSummaries,
  }

  return { xml, stats, warnings }
}

function createRootAction(entries: LibraryEntry[], childActionIds: string[]): string {
  const rootId = uuid()
  const childIdsXml = childActionIds
    .map((id) => `                <action-id>${id}</action-id>`)
    .join('\n')

  entries.push({
    xml: `        <action id="${rootId}" type="root">
            <actions>
${childIdsXml}
            </actions>
            <property type="string">
                <name>action-label</name>
                <value>Root</value>
            </property>
            <property type="activation-mode">
                <name>activation-mode</name>
                <value>disallowed</value>
            </property>
        </action>`,
  })

  return rootId
}

function convertInput(
  input: R13Input,
  device: R13Device,
  modeName: string,
  warnings: string[]
): { libraryEntries: LibraryEntry[]; inputEntry: InputEntry | null; skipped: number } {
  const entries: LibraryEntry[] = []
  const actionConfigs: ActionConfig[] = []
  let skipped = 0

  // Separate containers: regular ones vs virtual-button ones
  const regularChildIds: string[] = []

  for (const container of input.containers) {
    if (container.virtualButton) {
      // Each virtual-button container becomes its own action-configuration
      const vbChildIds: string[] = []
      for (const actionSet of container.actionSets) {
        for (const action of actionSet.actions) {
          const result = convertAction(action, input, device, modeName, warnings)
          if (result) {
            entries.push({ xml: result.xml })
            vbChildIds.push(result.id)
          } else {
            skipped++
          }
        }
      }

      if (vbChildIds.length > 0) {
        const rootId = createRootAction(entries, vbChildIds)
        actionConfigs.push({
          rootActionId: rootId,
          behavior: 'button',
          virtualButton: {
            lowerLimit: container.virtualButton.lowerLimit,
            upperLimit: container.virtualButton.upperLimit,
            direction: mapAxisButtonDirection(container.virtualButton.direction),
          },
        })
      }
    } else {
      // Regular container — collect actions for a single action-configuration
      for (const actionSet of container.actionSets) {
        for (const action of actionSet.actions) {
          const result = convertAction(action, input, device, modeName, warnings)
          if (result) {
            entries.push({ xml: result.xml })
            regularChildIds.push(result.id)
          } else {
            skipped++
          }
        }
      }
    }
  }

  // Create action-configuration for regular (non-virtual-button) actions
  if (regularChildIds.length > 0) {
    const rootId = createRootAction(entries, regularChildIds)
    actionConfigs.push({
      rootActionId: rootId,
      behavior: input.type,
    })
  }

  if (actionConfigs.length === 0) {
    return { libraryEntries: entries, inputEntry: null, skipped }
  }

  return {
    libraryEntries: entries,
    inputEntry: {
      deviceGuid: stripBraces(device.deviceGuid),
      inputType: input.type,
      inputId: input.id,
      mode: modeName,
      actionConfigs,
    },
    skipped,
  }
}

function convertAction(
  action: R13Action,
  input: R13Input,
  device: R13Device,
  modeName: string,
  warnings: string[]
): { id: string; xml: string } | null {
  const id = uuid()
  const loc = `${device.name} ${input.type}${input.id} [${modeName}]`

  switch (action.type) {
    case 'remap-button':
      return {
        id,
        xml: buildMapToVjoyAction(id, {
          vjoyDeviceId: action.vjoy,
          vjoyInputId: action.button,
          vjoyInputType: 'button',
          buttonInverted: false,
        }),
      }

    case 'remap-axis':
      return {
        id,
        xml: buildMapToVjoyAction(id, {
          vjoyDeviceId: action.vjoy,
          vjoyInputId: action.axis,
          vjoyInputType: 'axis',
          axisMode: action.axisType,
          axisScaling: action.axisScaling,
        }),
      }

    case 'remap-hat':
      return {
        id,
        xml: buildMapToVjoyAction(id, {
          vjoyDeviceId: action.vjoy,
          vjoyInputId: action.hat,
          vjoyInputType: 'hat',
        }),
      }

    case 'temporary-mode-switch':
      return { id, xml: buildChangeModeAction(id, 'Temporary', [action.modeName]) }

    case 'cycle-modes':
      return { id, xml: buildChangeModeAction(id, 'Cycle', action.modes) }

    case 'macro':
      return { id, xml: buildMacroAction(id, action.actions) }

    case 'response-curve':
      return { id, xml: buildResponseCurveAction(id, action) }

    case 'map-to-mouse':
      return { id, xml: buildMapToMouseAction(id, action) }

    case 'text-to-speech':
      warnings.push(
        `TTS "${action.text}" on ${loc} — Text-to-Speech has been removed in R14 with no equivalent yet.`
      )
      return null

    case 'unknown':
      warnings.push(`Unsupported action <${action.tagName}> on ${loc} — skipped`)
      return null

    default:
      warnings.push(`Unknown action type on ${loc} — skipped`)
      return null
  }
}

interface VjoyProps {
  vjoyDeviceId: number
  vjoyInputId: number
  vjoyInputType: 'axis' | 'button' | 'hat'
  axisMode?: string
  axisScaling?: number
  buttonInverted?: boolean
}

function buildMapToVjoyAction(id: string, props: VjoyProps): string {
  const lines: string[] = []
  lines.push(`        <action id="${id}" type="map-to-vjoy">`)

  // vjoy-device-id
  lines.push('            <property type="int">')
  lines.push('                <name>vjoy-device-id</name>')
  lines.push(`                <value>${props.vjoyDeviceId}</value>`)
  lines.push('            </property>')

  // vjoy-input-id
  lines.push('            <property type="int">')
  lines.push('                <name>vjoy-input-id</name>')
  lines.push(`                <value>${props.vjoyInputId}</value>`)
  lines.push('            </property>')

  // vjoy-input-type
  lines.push('            <property type="input_type">')
  lines.push('                <name>vjoy-input-type</name>')
  lines.push(`                <value>${props.vjoyInputType}</value>`)
  lines.push('            </property>')

  // Axis-specific properties
  if (props.vjoyInputType === 'axis') {
    lines.push('            <property type="axis_mode">')
    lines.push('                <name>axis-mode</name>')
    lines.push(`                <value>${props.axisMode || 'absolute'}</value>`)
    lines.push('            </property>')

    lines.push('            <property type="float">')
    lines.push('                <name>axis-scaling</name>')
    lines.push(`                <value>${props.axisScaling ?? 1.0}</value>`)
    lines.push('            </property>')
  }

  // Button-specific properties
  if (props.vjoyInputType === 'button') {
    lines.push('            <property type="bool">')
    lines.push('                <name>button-inverted</name>')
    lines.push(`                <value>${props.buttonInverted ? 'True' : 'False'}</value>`)
    lines.push('            </property>')
  }

  // action-label
  lines.push('            <property type="string">')
  lines.push('                <name>action-label</name>')
  lines.push('                <value>Map to vJoy</value>')
  lines.push('            </property>')

  // activation-mode
  lines.push('            <property type="activation-mode">')
  lines.push('                <name>activation-mode</name>')
  lines.push('                <value>both</value>')
  lines.push('            </property>')

  lines.push('        </action>')
  return lines.join('\n')
}

function buildChangeModeAction(id: string, changeType: string, modeNames: string[]): string {
  const lines: string[] = []
  lines.push(`        <action id="${id}" type="change-mode">`)
  lines.push('            <property type="string">')
  lines.push('                <name>change-type</name>')
  lines.push(`                <value>${changeType}</value>`)
  lines.push('            </property>')

  for (const modeName of modeNames) {
    lines.push('            <target-mode>')
    lines.push('                <property type="string">')
    lines.push('                    <name>name</name>')
    lines.push(`                    <value>${esc(modeName)}</value>`)
    lines.push('                </property>')
    lines.push('            </target-mode>')
  }

  lines.push('            <property type="string">')
  lines.push('                <name>action-label</name>')
  lines.push('                <value>Change Mode</value>')
  lines.push('            </property>')
  lines.push('            <property type="activation-mode">')
  lines.push('                <name>activation-mode</name>')
  lines.push('                <value>both</value>')
  lines.push('            </property>')
  lines.push('        </action>')
  return lines.join('\n')
}

function buildMacroAction(
  id: string,
  macroActions: import('~/types/profile').R13MacroAction[]
): string {
  const lines: string[] = []
  lines.push(`        <action id="${id}" type="macro">`)

  lines.push('            <property type="bool">')
  lines.push('                <name>is-exclusive</name>')
  lines.push('                <value>False</value>')
  lines.push('            </property>')
  lines.push('            <property type="string">')
  lines.push('                <name>repeat-mode</name>')
  lines.push('                <value>Single</value>')
  lines.push('            </property>')
  lines.push('            <property type="int">')
  lines.push('                <name>repeat-count</name>')
  lines.push('                <value>1</value>')
  lines.push('            </property>')
  lines.push('            <property type="float">')
  lines.push('                <name>repeat-delay</name>')
  lines.push('                <value>0.1</value>')
  lines.push('            </property>')

  for (const ma of macroActions) {
    if (ma.type === 'key') {
      lines.push('            <macro-action type="key">')
      lines.push('                <property type="int">')
      lines.push('                    <name>scan-code</name>')
      lines.push(`                    <value>${ma.scanCode}</value>`)
      lines.push('                </property>')
      lines.push('                <property type="bool">')
      lines.push('                    <name>is-extended</name>')
      lines.push(`                    <value>${ma.extended ? 'True' : 'False'}</value>`)
      lines.push('                </property>')
      lines.push('                <property type="bool">')
      lines.push('                    <name>is-pressed</name>')
      lines.push(`                    <value>${ma.press ? 'True' : 'False'}</value>`)
      lines.push('                </property>')
      lines.push('            </macro-action>')
    } else if (ma.type === 'pause') {
      lines.push('            <macro-action type="pause">')
      lines.push('                <property type="float">')
      lines.push('                    <name>duration</name>')
      lines.push(`                    <value>${ma.duration}</value>`)
      lines.push('                </property>')
      lines.push('            </macro-action>')
    }
  }

  lines.push('            <property type="string">')
  lines.push('                <name>action-label</name>')
  lines.push('                <value>Macro</value>')
  lines.push('            </property>')
  lines.push('            <property type="activation-mode">')
  lines.push('                <name>activation-mode</name>')
  lines.push('                <value>both</value>')
  lines.push('            </property>')
  lines.push('        </action>')
  return lines.join('\n')
}

function buildResponseCurveAction(
  id: string,
  action: import('~/types/profile').R13ResponseCurve
): string {
  const lines: string[] = []
  lines.push(`        <action id="${id}" type="response-curve">`)

  // Deadzone
  lines.push('            <deadzone>')
  lines.push('                <property type="float">')
  lines.push('                    <name>low</name>')
  lines.push(`                    <value>${action.deadzone.low}</value>`)
  lines.push('                </property>')
  lines.push('                <property type="float">')
  lines.push('                    <name>center-low</name>')
  lines.push(`                    <value>${action.deadzone.centerLow}</value>`)
  lines.push('                </property>')
  lines.push('                <property type="float">')
  lines.push('                    <name>center-high</name>')
  lines.push(`                    <value>${action.deadzone.centerHigh}</value>`)
  lines.push('                </property>')
  lines.push('                <property type="float">')
  lines.push('                    <name>high</name>')
  lines.push(`                    <value>${action.deadzone.high}</value>`)
  lines.push('                </property>')
  lines.push('            </deadzone>')

  // Control points
  lines.push('            <control-points>')
  for (const cp of action.controlPoints) {
    lines.push('                <property type="point2d">')
    lines.push('                    <name>point</name>')
    lines.push(`                    <value>${cp.x},${cp.y}</value>`)
    lines.push('                </property>')
  }
  lines.push('            </control-points>')

  // Curve type mapping
  const curveTypeMap: Record<string, string> = {
    'cubic-bezier-spline': 'CubicBezierSpline',
    'cubic-spline': 'CubicSpline',
    'piecewise-linear': 'PiecewiseLinear',
  }
  const curveType = curveTypeMap[action.mappingType] || 'CubicBezierSpline'

  lines.push('            <property type="string">')
  lines.push('                <name>curve-type</name>')
  lines.push(`                <value>${curveType}</value>`)
  lines.push('            </property>')
  lines.push('            <property type="string">')
  lines.push('                <name>action-label</name>')
  lines.push('                <value>Response Curve</value>')
  lines.push('            </property>')
  lines.push('            <property type="activation-mode">')
  lines.push('                <name>activation-mode</name>')
  lines.push('                <value>disallowed</value>')
  lines.push('            </property>')
  lines.push('        </action>')
  return lines.join('\n')
}

function buildMapToMouseAction(
  id: string,
  action: import('~/types/profile').R13MapToMouse
): string {
  const lines: string[] = []
  lines.push(`        <action id="${id}" type="map-to-mouse">`)

  lines.push('            <property type="string">')
  lines.push('                <name>mode</name>')
  lines.push('                <value>Motion</value>')
  lines.push('            </property>')
  lines.push('            <property type="int">')
  lines.push('                <name>direction</name>')
  lines.push(`                <value>${action.direction}</value>`)
  lines.push('            </property>')
  lines.push('            <property type="int">')
  lines.push('                <name>min-speed</name>')
  lines.push(`                <value>${action.minSpeed}</value>`)
  lines.push('            </property>')
  lines.push('            <property type="int">')
  lines.push('                <name>max-speed</name>')
  lines.push(`                <value>${action.maxSpeed}</value>`)
  lines.push('            </property>')
  lines.push('            <property type="float">')
  lines.push('                <name>time-to-max-speed</name>')
  lines.push(`                <value>${action.timeToMaxSpeed}</value>`)
  lines.push('            </property>')
  lines.push('            <property type="string">')
  lines.push('                <name>action-label</name>')
  lines.push('                <value>Map to Mouse</value>')
  lines.push('            </property>')
  lines.push('            <property type="activation-mode">')
  lines.push('                <name>activation-mode</name>')
  lines.push('                <value>both</value>')
  lines.push('            </property>')
  lines.push('        </action>')
  return lines.join('\n')
}

function buildXml(
  profile: R13Profile,
  libraryEntries: LibraryEntry[],
  inputs: InputEntry[],
  modes: Map<string, string | undefined>,
  devices: Map<string, string>
): string {
  const lines: string[] = []
  lines.push('<?xml version="1.0" ?>')
  lines.push('<profile version="14">')

  // Inputs
  lines.push('    <inputs>')
  for (const input of inputs) {
    lines.push('        <input>')
    lines.push(`            <device-id>${input.deviceGuid}</device-id>`)
    lines.push(`            <input-type>${input.inputType}</input-type>`)
    lines.push(`            <mode>${esc(input.mode)}</mode>`)
    lines.push(`            <input-id>${input.inputId}</input-id>`)
    for (const ac of input.actionConfigs) {
      lines.push('            <action-configuration>')
      lines.push(`                <root-action>${ac.rootActionId}</root-action>`)
      lines.push(`                <behavior>${ac.behavior}</behavior>`)
      if (ac.virtualButton) {
        lines.push('                <virtual-button>')
        lines.push(`                    <lower-limit>${ac.virtualButton.lowerLimit}</lower-limit>`)
        lines.push(`                    <upper-limit>${ac.virtualButton.upperLimit}</upper-limit>`)
        lines.push(`                    <axis-button-direction>${ac.virtualButton.direction}</axis-button-direction>`)
        lines.push('                </virtual-button>')
      }
      lines.push('            </action-configuration>')
    }
    lines.push('        </input>')
  }
  lines.push('    </inputs>')

  // Settings
  lines.push('    <settings>')
  lines.push('        <startup-mode>Use Heuristic</startup-mode>')
  lines.push(`        <macro-default-delay>${profile.settings.defaultDelay}</macro-default-delay>`)
  lines.push('    </settings>')

  // Logical devices (empty)
  lines.push('    <logical-device/>')

  // Library
  lines.push('    <library>')
  for (const entry of libraryEntries) {
    lines.push(entry.xml)
  }
  lines.push('    </library>')

  // Modes
  lines.push('    <modes>')
  for (const [name, parent] of modes) {
    if (parent) {
      lines.push(`        <mode parent="${esc(parent)}">${esc(name)}</mode>`)
    } else {
      lines.push(`        <mode>${esc(name)}</mode>`)
    }
  }
  lines.push('    </modes>')

  // Scripts
  lines.push('    <scripts/>')

  // Devices
  lines.push('    <devices>')
  for (const [guid, name] of devices) {
    lines.push('        <device>')
    lines.push(`            <device-id>${guid}</device-id>`)
    lines.push(`            <device-name>${esc(name)}</device-name>`)
    lines.push('        </device>')
  }
  lines.push('    </devices>')

  lines.push('</profile>')

  return lines.join('\n')
}

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
