export class Optional<T> {
  #instance: T;

  constructor(instance: T) {
    this.#instance = instance;
  }

  static of<T>(instance: T): Optional<T> {
    return new Optional(instance);
  }

  throwIfPresent(exception: Error) {
    if (
      (Array.isArray(this.#instance) && (this.#instance as any)[0]) ||
      (!Array.isArray(this.#instance) && this.#instance)
    ) {
      throw exception;
    }
    return this;
  }

  throwIfNotPresent(exception: Error) {
    if (
      (Array.isArray(this.#instance) && !(this.#instance as any)[0]) ||
      (!Array.isArray(this.#instance) && !this.#instance)
    ) {
      throw exception;
    }
    return this;
  }

  throwIfNullable(exception: Error) {
    if (this.#instance === null) {
      throw exception;
    }
    return this;
  }

  throwIfExist(exception: Error) {
    if ((Array.isArray(this.#instance) && (this.#instance as any)[0]) || this.#instance) {
      throw exception;
    }
    return this;
  }

  isPresent(): boolean {
    if (Array.isArray(this.#instance)) {
      return Boolean((this.#instance as any)[0]);
    }
    return Boolean(this.#instance);
  }

  get<U = T>(): U {
    if (!this.#instance) throw new Error('Should call throwIfNullable first');
    return this.#instance as unknown as U;
  }
}
