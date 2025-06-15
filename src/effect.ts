import { createEvent, TypedEvent } from "./event"
import { SignalGlobal } from "./global"
import { Observer } from "./observer"
import { type Scheduler } from "./scheduler"
import { isFunction, isNil, isString } from "./shared"

export type EffectCallback = () => any | EffectCleanup
export type EffectCleanup = () => any
export type EffectEvent = {
  track: (ob: Observer) => void
  untrack: (ob: Observer) => void
  "before-clean": (cleanups: Set<EffectCleanup>) => void
  "before-run": () => void
  "after-run": (ret: any) => void
  trigger: (ob: Observer) => void
  dispose: () => void
}
export interface EffectOptions {
  scheduler?: Scheduler | string
  shouldTrack?: boolean
  onTrack?: EffectEvent["track"]
  onUntrack?: EffectEvent["untrack"]
  onBeforeClean?: EffectEvent["before-clean"]
  onBeforeRun?: EffectEvent["before-run"]
  onAfterRun?: EffectEvent["after-run"]
  onTrigger?: EffectEvent["trigger"]
  onDispose?: EffectEvent["dispose"]
}

const { SchedulerCoordinator, Effects } = SignalGlobal

export class Effect extends TypedEvent<EffectEvent> {
  private readonly _callback: EffectCallback
  private readonly _cleanup: Set<EffectCleanup> = new Set()

  private readonly _scheduler?: Scheduler
  public readonly shouldTrack: boolean = true
  private readonly _owners: Set<Observer> = new Set()

  private _closed: boolean = false

  constructor(callback: EffectCallback, options: EffectOptions = {}) {
    super()
    this._callback = callback

    const { scheduler, shouldTrack } = options
    this.shouldTrack = shouldTrack ?? true
    this._scheduler = isString(scheduler) ? SchedulerCoordinator.get(scheduler) : scheduler

    if (!isNil(options.onTrack)) this.on("track", options.onTrack)
    if (!isNil(options.onUntrack)) this.on("untrack", options.onUntrack)
    if (!isNil(options.onBeforeClean)) this.on("before-clean", options.onBeforeClean)
    if (!isNil(options.onBeforeRun)) this.on("before-run", options.onBeforeRun)
    if (!isNil(options.onAfterRun)) this.on("after-run", options.onAfterRun)
    if (!isNil(options.onTrigger)) this.on("trigger", options.onTrigger)
    if (!isNil(options.onDispose)) this.on("dispose", options.onDispose)
    this.on("dispose", () => {
      this._owners.forEach((ob) => ob.remove(this))
      this._owners.clear()
    })
  }

  add(cleanup: EffectCleanup) {
    if (this._closed) return cleanup(), this
    this._cleanup.add(cleanup)
    return this
  }

  run() {
    if (this._closed) return this

    Effects.push(this)
    this.emit("before-clean", this._cleanup)
    this._cleanup.forEach((cleanup) => cleanup())
    this._cleanup.clear()
    this.emit("before-run")
    const result = this._callback()
    if (isFunction(result)) this._cleanup.add(result)
    this.emit("after-run", result)
    Effects.pop()

    return result
  }

  /**
   * Add effect to scheduler when it exists, otherwise run immediately.
   * @description Perform all cleanup before running effect
   */
  submit() {
    if (this._closed) return
    if (!isNil(this._scheduler)) {
      this._scheduler.next(this)
    } else {
      this.run()
    }
  }

  track(ob: Observer) {
    if (this._closed || this._owners.has(ob)) return
    this._owners.add(ob)
    this.emit("track", ob)
  }

  untrack(ob: Observer) {
    if (this._closed) return
    this._owners.delete(ob)
    this.emit("untrack", ob)
  }

  dispose() {
    if (this._closed) return
    this._closed = true
    this._cleanup.forEach((cleanup) => cleanup())
    this._cleanup.clear()
    this.emit("dispose")
    this.clear()
  }
}
