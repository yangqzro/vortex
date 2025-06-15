type DefaultEvent = Record<string, (...args: any[]) => any>

export class TypedEvent<EventDefine extends DefaultEvent = DefaultEvent> {
  private _events: Map<keyof EventDefine, Set<EventDefine[keyof EventDefine]>> = new Map()

  has(evt: string) {
    return this._events.has(evt) && this._events.get(evt)?.size !== 0
  }

  on<Evt extends keyof EventDefine & string>(evt: Evt, fn: EventDefine[Evt]) {
    if (!this._events.has(evt)) this._events.set(evt, new Set())
    this._events.get(evt)?.add(fn)
  }

  once<Evt extends keyof EventDefine & string>(evt: Evt, fn: EventDefine[Evt]) {
    if (!this._events.has(evt)) this._events.set(evt, new Set())
    const once: any = (...args: any[]) => {
      this.off(evt, once)
      return fn(...args)
    }
    this._events.get(evt)?.add(once)
  }

  emit<Evt extends keyof EventDefine & string>(evt: Evt, ...args: Parameters<EventDefine[Evt]>) {
    const rets: ReturnType<EventDefine[Evt]>[] = []
    this._events.get(evt)?.forEach((fn) => rets.push(fn(...args)))
    return rets
  }

  off<Evt extends keyof EventDefine & string>(evt: Evt, fn?: EventDefine[Evt]) {
    if (fn) {
      this._events.get(evt)?.delete(fn)
    } else {
      this._events.get(evt)?.clear()
    }
  }

  clear() {
    this._events.clear()
  }
}

export function createEvent<EventDefine extends DefaultEvent>() {
  return new TypedEvent<EventDefine>()
}
