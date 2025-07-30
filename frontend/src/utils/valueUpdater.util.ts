export function valueUpdater<T>(updaterOrValue: T | ((old: T) => T), targetRef: { value: T }) {
    if (typeof updaterOrValue === 'function') {
        const updaterFn = updaterOrValue as (old: T) => T
        targetRef.value = updaterFn(targetRef.value)
    } else {
        targetRef.value = updaterOrValue
    }
}
