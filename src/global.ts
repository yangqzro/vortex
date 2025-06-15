import { Effect } from "./effect"
import { SchedulerCoordinatorInstance } from "./scheduler"
import { createStack } from "./collection"

export namespace SignalGlobal {
  export const SchedulerCoordinator = SchedulerCoordinatorInstance

  export const Effects = createStack<Effect>({ unique: true })

  export let ShouldTrackGlobalEffect = true
  export function setShouldTrackGlobalEffect(value: boolean) {
    ShouldTrackGlobalEffect = value
  }
}
