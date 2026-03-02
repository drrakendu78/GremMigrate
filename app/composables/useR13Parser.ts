import type {
  R13Profile,
  R13Device,
  R13Mode,
  R13Input,
  R13Container,
  R13ActionSet,
  R13Action,
  R13MacroAction,
  R13VirtualButton,
} from '~/types/profile'

export function parseR13(xmlString: string): R13Profile {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlString, 'text/xml')

  const parseError = doc.querySelector('parsererror')
  if (parseError) {
    throw new Error(`Invalid XML: ${parseError.textContent}`)
  }

  const profileEl = doc.documentElement
  const version = profileEl.getAttribute('version') || ''

  return {
    version,
    devices: parseDevices(profileEl),
    vjoyDevices: parseVjoyDevices(profileEl),
    settings: parseSettings(profileEl),
  }
}

function parseDevices(profileEl: Element): R13Device[] {
  const devicesEl = profileEl.querySelector(':scope > devices')
  if (!devicesEl) return []

  return Array.from(devicesEl.querySelectorAll(':scope > device')).map((deviceEl) => ({
    deviceGuid: deviceEl.getAttribute('device-guid') || '',
    label: deviceEl.getAttribute('label') || '',
    name: deviceEl.getAttribute('name') || '',
    type: (deviceEl.getAttribute('type') || 'joystick') as 'joystick' | 'keyboard',
    modes: parseModes(deviceEl),
  }))
}

function parseModes(deviceEl: Element): R13Mode[] {
  return Array.from(deviceEl.querySelectorAll(':scope > mode')).map((modeEl) => ({
    name: modeEl.getAttribute('name') || '',
    inherit: modeEl.getAttribute('inherit') || undefined,
    inputs: parseInputs(modeEl),
  }))
}

function parseInputs(modeEl: Element): R13Input[] {
  const inputs: R13Input[] = []

  for (const inputEl of Array.from(modeEl.children)) {
    const tag = inputEl.tagName.toLowerCase()
    if (tag !== 'axis' && tag !== 'button' && tag !== 'hat') continue

    const containers = parseContainers(inputEl)
    // Only include inputs that have actual actions
    if (containers.length === 0) continue

    inputs.push({
      type: tag as 'axis' | 'button' | 'hat',
      id: parseInt(inputEl.getAttribute('id') || '0'),
      description: inputEl.getAttribute('description') || '',
      containers,
    })
  }

  return inputs
}

function parseContainers(inputEl: Element): R13Container[] {
  return Array.from(inputEl.querySelectorAll(':scope > container'))
    .map((containerEl) => {
      const actionSets = parseActionSets(containerEl)
      const virtualButtonEl = containerEl.querySelector(':scope > virtual-button')

      // Skip empty containers (no actions)
      if (actionSets.every((as) => as.actions.length === 0) && !virtualButtonEl) {
        return null
      }

      const container: R13Container = {
        type: (containerEl.getAttribute('type') || 'basic') as 'basic' | 'tempo',
        actionSets,
      }

      if (containerEl.getAttribute('activate-on')) {
        container.activateOn = containerEl.getAttribute('activate-on')!
      }
      if (containerEl.getAttribute('delay')) {
        container.delay = parseFloat(containerEl.getAttribute('delay')!)
      }

      if (virtualButtonEl) {
        container.virtualButton = parseVirtualButton(virtualButtonEl)
      }

      return container
    })
    .filter((c): c is R13Container => c !== null)
}

function parseActionSets(containerEl: Element): R13ActionSet[] {
  return Array.from(containerEl.querySelectorAll(':scope > action-set')).map((asEl) => ({
    actions: parseActions(asEl),
  }))
}

function parseActions(actionSetEl: Element): R13Action[] {
  const actions: R13Action[] = []

  for (const el of Array.from(actionSetEl.children)) {
    const action = parseAction(el)
    if (action) actions.push(action)
  }

  return actions
}

function parseAction(el: Element): R13Action | null {
  const tag = el.tagName.toLowerCase()

  switch (tag) {
    case 'remap':
      return parseRemap(el)
    case 'temporary-mode-switch':
      return {
        type: 'temporary-mode-switch',
        modeName: el.getAttribute('name') || '',
      }
    case 'cycle-modes':
      return {
        type: 'cycle-modes',
        modes: Array.from(el.querySelectorAll(':scope > mode')).map(
          (m) => m.getAttribute('name') || ''
        ),
      }
    case 'macro':
      return parseMacro(el)
    case 'response-curve':
      return parseResponseCurve(el)
    case 'map-to-mouse':
      return {
        type: 'map-to-mouse',
        buttonId: parseInt(el.getAttribute('button-id') || '0'),
        direction: parseInt(el.getAttribute('direction') || '0'),
        minSpeed: parseInt(el.getAttribute('min-speed') || '0'),
        maxSpeed: parseInt(el.getAttribute('max-speed') || '0'),
        motionInput: el.getAttribute('motion-input') === 'True',
        timeToMaxSpeed: parseFloat(el.getAttribute('time-to-max-speed') || '0'),
      }
    case 'text-to-speech':
      return {
        type: 'text-to-speech',
        text: el.getAttribute('text') || '',
      }
    default:
      return {
        type: 'unknown',
        tagName: tag,
        rawXml: new XMLSerializer().serializeToString(el),
      }
  }
}

function parseRemap(el: Element): R13Action {
  if (el.hasAttribute('button')) {
    return {
      type: 'remap-button',
      button: parseInt(el.getAttribute('button')!),
      vjoy: parseInt(el.getAttribute('vjoy') || '1'),
    }
  }
  if (el.hasAttribute('axis')) {
    return {
      type: 'remap-axis',
      axis: parseInt(el.getAttribute('axis')!),
      vjoy: parseInt(el.getAttribute('vjoy') || '1'),
      axisScaling: parseFloat(el.getAttribute('axis-scaling') || '1.0'),
      axisType: el.getAttribute('axis-type') || 'absolute',
    }
  }
  if (el.hasAttribute('hat')) {
    return {
      type: 'remap-hat',
      hat: parseInt(el.getAttribute('hat')!),
      vjoy: parseInt(el.getAttribute('vjoy') || '1'),
    }
  }

  return {
    type: 'unknown',
    tagName: 'remap',
    rawXml: new XMLSerializer().serializeToString(el),
  }
}

function parseMacro(el: Element): R13Action {
  const actionsEl = el.querySelector(':scope > actions')
  const macroActions: R13MacroAction[] = []

  if (actionsEl) {
    for (const child of Array.from(actionsEl.children)) {
      const tag = child.tagName.toLowerCase()
      if (tag === 'key') {
        macroActions.push({
          type: 'key',
          scanCode: parseInt(child.getAttribute('scan-code') || '0'),
          press: child.getAttribute('press') === 'True',
          extended: child.getAttribute('extended') === 'True',
        })
      } else if (tag === 'pause') {
        macroActions.push({
          type: 'pause',
          duration: parseFloat(child.getAttribute('duration') || '0'),
        })
      }
    }
  }

  return { type: 'macro', actions: macroActions }
}

function parseResponseCurve(el: Element): R13Action {
  const mappingEl = el.querySelector(':scope > mapping')
  const deadzoneEl = el.querySelector(':scope > deadzone')

  return {
    type: 'response-curve',
    mappingType: mappingEl?.getAttribute('type') || 'cubic-bezier-spline',
    controlPoints: Array.from(mappingEl?.querySelectorAll(':scope > control-point') || []).map(
      (cp) => ({
        x: parseFloat(cp.getAttribute('x') || '0'),
        y: parseFloat(cp.getAttribute('y') || '0'),
      })
    ),
    deadzone: {
      centerLow: parseFloat(deadzoneEl?.getAttribute('center-low') || '0'),
      centerHigh: parseFloat(deadzoneEl?.getAttribute('center-high') || '0'),
      low: parseFloat(deadzoneEl?.getAttribute('low') || '-1'),
      high: parseFloat(deadzoneEl?.getAttribute('high') || '1'),
    },
  }
}

function parseVirtualButton(el: Element): R13VirtualButton {
  return {
    lowerLimit: parseFloat(el.getAttribute('lower-limit') || '0'),
    upperLimit: parseFloat(el.getAttribute('upper-limit') || '0'),
    direction: el.getAttribute('direction') || 'anywhere',
  }
}

function parseVjoyDevices(profileEl: Element): string[] {
  const vjoyEl = profileEl.querySelector(':scope > vjoy-devices')
  if (!vjoyEl) return []
  return Array.from(vjoyEl.querySelectorAll(':scope > device')).map(
    (d) => d.getAttribute('device-guid') || ''
  )
}

function parseSettings(profileEl: Element): { defaultDelay: number } {
  const settingsEl = profileEl.querySelector(':scope > settings')
  const delayEl = settingsEl?.querySelector(':scope > default-delay')
  return {
    defaultDelay: parseFloat(delayEl?.textContent || '0.05'),
  }
}
