export function isFunction(value: any): value is (...args: any[]) => any {
  return typeof value === "function"
}

export function isString(value: any): value is string {
  return typeof value === "string"
}

export function isNumber(value: any): value is number {
  return typeof value === "number"
}

export function isNil(value: any): value is null | undefined {
  return value == null
}
