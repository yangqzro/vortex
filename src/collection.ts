import { isNil, isNumber } from "./shared"

export interface CollectionOptions {
  /** collection capacity, must be a positive integer when provided */
  cap?: number
  /** elements of a collection are unique */
  unique?: boolean
}

export interface StackOptions extends CollectionOptions {}
export interface QueueOptions extends CollectionOptions {}

function checkCap(cap: number | undefined | null): asserts cap is number {
  if (isNil(cap)) return
  if (!isNumber(cap)) throw new TypeError(`Stack cap must be a number, got ${typeof cap}`)
  if (cap < 0) throw new RangeError(`Stack cap must be a positive number, got ${cap}`)
  if (!Number.isInteger(cap)) throw new TypeError(`Stack cap must be an integer, got ${cap}`)
}

export abstract class Collection<T> {
  protected readonly _elements: T[] = []
  protected _cap?: number
  protected _unique: boolean = false

  constructor(options: CollectionOptions = {}) {
    checkCap(options.cap)
    this._cap = options.cap
    this._unique = options.unique ?? false
  }

  get cap() {
    return this._cap
  }

  set cap(cap: number | undefined) {
    checkCap(cap)
    this._cap = cap
    if (this._elements.length > cap) this._elements.length = cap
  }

  get size() {
    return this._elements.length
  }

  /** determines if collection is empty */
  get empty() {
    return this._elements.length === 0
  }

  /** determines if collection is full */
  get full() {
    return !isNil(this._cap) && this._elements.length >= this._cap
  }

  clear() {
    this._elements.length = 0
  }
}

export class Stack<T = any> extends Collection<T> {
  get top(): T | undefined {
    return this._elements[this._elements.length - 1]
  }

  push(element: T) {
    if (this.full) return false
    if (this._unique && this._elements.includes(element)) return false
    return this._elements.push(element), true
  }

  pop() {
    return this._elements.pop()
  }
}

export class Queue<T = any> extends Collection<T> {
  enqueue(element: T) {
    if (this.full) return false
    if (this._unique && this._elements.includes(element)) return false
    return this._elements.push(element), true
  }

  dequeue() {
    return this._elements.shift()
  }
}

export function createStack<T = any>(options: StackOptions = {}) {
  return new Stack<T>(options)
}

export function createQueue<T = any>(options: QueueOptions = {}) {
  return new Queue<T>(options)
}
