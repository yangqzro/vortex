import { Effect } from "./effect"
import { createObserver } from "./observer"
import { isFunction } from "./shared"

export interface SignalOptions<T = any> {
  equal?: boolean | ((current?: T, next?: T) => boolean)
}
const DefaultSignalOptions: SignalOptions = {
  equal: Object.is,
}

function equal<T>(eq: Required<SignalOptions<T>>["equal"], current?: T, next?: T) {
  return isFunction(eq) ? eq(current, next) : eq
}

export class State<T = any> {
  private _value: T
  private readonly _observer = createObserver()
  private readonly _equal: Required<SignalOptions<T>>["equal"]

  constructor(initialValue: T | (() => T), options: SignalOptions<T> = {}) {
    this._value = isFunction(initialValue) ? initialValue() : initialValue
    this._equal = options.equal ?? DefaultSignalOptions.equal!
  }

  get raw() {
    return this._value
  }

  get() {
    this._observer.track()
    return this._value
  }

  set(value: T | ((prev: T) => T)) {
    if (!equal(this._equal, this._value, (this._value = isFunction(value) ? value(this._value) : value))) {
      this._observer.trigger()
    }
  }
}

export class Computed<T = any> {
  private _value!: T
  private readonly _observer = createObserver()
  private readonly _equal: Required<SignalOptions<T>>["equal"]

  private readonly _effect: Effect
  private _version: number = 0

  constructor(getter: () => T, options: SignalOptions<T> = {}) {
    this._equal = options.equal ?? DefaultSignalOptions.equal!
    this._effect = new Effect(getter, {
      onTrigger: () => {
        if (equal(this._equal, this._value, (this._value = this._effect.run()))) return
        this._observer.trigger()
        this._version++
      },
    })
  }

  get raw() {
    return this._value
  }

  get() {
    this._observer.track()
    if (this._version === 0) {
      this._value = this._effect.run()
      this._version++
    }
    return this._value
  }
}
