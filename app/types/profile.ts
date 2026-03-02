// ─── R13 Types (input) ───

export interface R13Profile {
  version: string
  devices: R13Device[]
  vjoyDevices: string[]
  settings: R13Settings
}

export interface R13Settings {
  defaultDelay: number
}

export interface R13Device {
  deviceGuid: string
  label: string
  name: string
  type: 'joystick' | 'keyboard'
  modes: R13Mode[]
}

export interface R13Mode {
  name: string
  inherit?: string
  inputs: R13Input[]
}

export interface R13Input {
  type: 'axis' | 'button' | 'hat'
  id: number
  description: string
  containers: R13Container[]
}

export interface R13Container {
  type: 'basic' | 'tempo'
  activateOn?: string
  delay?: number
  actionSets: R13ActionSet[]
  virtualButton?: R13VirtualButton
}

export interface R13ActionSet {
  actions: R13Action[]
}

export type R13Action =
  | R13RemapButton
  | R13RemapAxis
  | R13RemapHat
  | R13TemporaryModeSwitch
  | R13CycleModes
  | R13Macro
  | R13ResponseCurve
  | R13MapToMouse
  | R13TextToSpeech
  | R13UnknownAction

export interface R13RemapButton {
  type: 'remap-button'
  button: number
  vjoy: number
}

export interface R13RemapAxis {
  type: 'remap-axis'
  axis: number
  vjoy: number
  axisScaling: number
  axisType: string
}

export interface R13RemapHat {
  type: 'remap-hat'
  hat: number
  vjoy: number
}

export interface R13TemporaryModeSwitch {
  type: 'temporary-mode-switch'
  modeName: string
}

export interface R13CycleModes {
  type: 'cycle-modes'
  modes: string[]
}

export interface R13Macro {
  type: 'macro'
  actions: R13MacroAction[]
}

export type R13MacroAction =
  | { type: 'key'; scanCode: number; press: boolean; extended: boolean }
  | { type: 'pause'; duration: number }

export interface R13ResponseCurve {
  type: 'response-curve'
  mappingType: string
  controlPoints: { x: number; y: number }[]
  deadzone: {
    centerLow: number
    centerHigh: number
    low: number
    high: number
  }
}

export interface R13MapToMouse {
  type: 'map-to-mouse'
  buttonId: number
  direction: number
  minSpeed: number
  maxSpeed: number
  motionInput: boolean
  timeToMaxSpeed: number
}

export interface R13TextToSpeech {
  type: 'text-to-speech'
  text: string
}

export interface R13UnknownAction {
  type: 'unknown'
  tagName: string
  rawXml: string
}

export interface R13VirtualButton {
  lowerLimit: number
  upperLimit: number
  direction: string
}

// ─── Conversion Result ───

export interface ConversionResult {
  xml: string
  stats: ConversionStats
  warnings: string[]
}

export interface DeviceSummary {
  name: string
  guid: string
  modes: { name: string; inputCount: number; actionCount: number }[]
}

export interface ConversionStats {
  devicesCount: number
  modesCount: number
  actionsCount: number
  inputsCount: number
  skippedInputs: number
  devices: DeviceSummary[]
}
