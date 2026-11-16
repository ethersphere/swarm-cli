export function createPropertyMetadata<T>(): {
  decorate: (value: T) => PropertyDecorator
  get: (target: object, property: string) => T | undefined
} {
  const store = new WeakMap<object, Map<string | symbol, T>>()

  return {
    decorate: value => (target, property) => {
      const entries = store.get(target) ?? new Map<string | symbol, T>()
      entries.set(property, value)
      store.set(target, entries)
    },
    get: (target, property) => {
      for (let current: object | null = target; current; current = Object.getPrototypeOf(current)) {
        const value = store.get(current)?.get(property)

        if (value !== undefined) {
          return value
        }
      }

      return undefined
    },
  }
}
