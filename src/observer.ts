import type { Effect } from "./effect"
import { SignalGlobal } from "./global"
import { isNil } from "./shared"

export class Observer {
  private readonly _effects = new Set<Effect>()

  add(effect: Effect) {
    if (this._effects.has(effect) || !effect.shouldTrack) return false
    this._effects.add(effect)
    effect.track(this)
    return true
  }

  remove(effect: Effect) {
    if (!this._effects.has(effect)) return false
    this._effects.delete(effect)
    effect.untrack(this)
    return true
  }

  track() {
    if (!SignalGlobal.ShouldTrackGlobalEffect) return
    const effect = SignalGlobal.Effects.top
    if (!isNil(effect)) this.add(effect)
  }

  trigger() {
    this._effects.forEach((effect) => {
      effect.submit()
      effect.emit("trigger", this)
    })
  }

  dispose() {
    this._effects.forEach((e) => e.untrack(this))
    this._effects.clear()
  }
}

export function createObserver() {
  return new Observer()
}
