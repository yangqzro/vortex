import { createQueue } from "./collection"
import type { Effect } from "./effect"
import { isNil } from "./shared"

export enum SchedulerKind {
  Sync = "sync",
  Queue = "queue",
}

export abstract class Scheduler {
  abstract readonly kind: string
  abstract next(effect: Effect): void
}

export class SyncScheduler extends Scheduler {
  public readonly kind = SchedulerKind.Sync

  next(effect: Effect) {
    effect.run()
  }
}

export class QueueScheduler extends Scheduler {
  public readonly kind = SchedulerKind.Queue

  private _running: boolean = false
  private readonly _queue = createQueue<Effect>({ unique: true })

  next(effect: Effect) {
    if (this._running) this._queue.enqueue(effect)
  }
}

export class SchedulerCoordinator {
  private static readonly _instance = new SchedulerCoordinator()
  static create() {
    return this._instance
  }

  static {
    this._instance.on(new SyncScheduler())
    this._instance.on(new QueueScheduler())
  }

  private readonly _schedulers: Record<string, Scheduler> = {}

  on(scheduler: Scheduler) {
    if (!isNil(this._schedulers[scheduler.kind])) return false
    this._schedulers[scheduler.kind] = scheduler
    return true
  }

  off(kind: string) {
    return delete this._schedulers[kind]
  }

  get(kind: string): Scheduler | undefined {
    return this._schedulers[kind]
  }
}

export const SchedulerCoordinatorInstance = SchedulerCoordinator.create()
