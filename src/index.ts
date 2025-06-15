import { Effect, EffectCallback, EffectCleanup, EffectOptions } from "./effect"
import { SignalGlobal } from "./global"
import { State, Computed, SignalOptions } from "./signal"

export function createState<T = any>(initialValue: T, options: SignalOptions<T> = {}) {
  const s = new State(initialValue, options)
  const ret: [() => T, (value: T | ((prev: T) => T)) => void] = [s.get.bind(s), s.set.bind(s)]
  return ret
}

export function state<T = any>(initialValue: T, options: SignalOptions<T> = {}) {
  return new State(initialValue, options)
}

export function createComputed<T = any>(getter: () => T, options: SignalOptions<T> = {}) {
  const g = new Computed(getter, options)
  const ret: () => T = g.get.bind(g)
  return ret
}

export function computed<T = any>(getter: () => T, options: SignalOptions<T> = {}) {
  return new Computed(getter, options)
}

export function effect(callback: EffectCallback, options: EffectOptions = {}) {
  const e = new Effect(callback, options)
  e.submit()
  return e
}

export const createEffect = effect

export function untrack<T = any>(fn: () => T): T {
  SignalGlobal.setShouldTrackGlobalEffect(false)
  const ret = fn()
  SignalGlobal.setShouldTrackGlobalEffect(true)
  return ret
}

export function cleanup(cleanup: EffectCleanup) {
  SignalGlobal.Effects.top?.add(cleanup)
}
