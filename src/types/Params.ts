export type FxParamType =
  | "number"
  | "bigint"
  | "boolean"
  | "color"
  | "string"
  | "select"

export interface FxParamTypeMap {
  number: number
  bigint: bigint
  boolean: boolean
  color: string
  string: string
  select: string
}

export interface FxParamOptionsMap {
  number: FxParamOption_number
  bigint: FxParamOption_bigint
  boolean: undefined
  color: undefined
  string: FxParamOption_string
  select: FxParamOption_select
}

interface FxParamOption_bigint {
  min?: number | bigint
  max?: number | bigint
}

interface FxParamOption_number {
  min?: number
  max?: number
  step?: number
}

interface FxParamOption_string {
  minLength?: number
  maxLength?: number
}

interface FxParamOption_select {
  options: string[]
}

export interface FxParamDefinition {
  id: string
  name?: string
  type: FxParamType
  default: keyof FxParamTypeMap
  options: keyof FxParamOptionsMap
}
