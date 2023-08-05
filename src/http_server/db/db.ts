type DatabaseItemConstructor<U> = new (...arg: any[]) => U; // eslint-disable-line @typescript-eslint/no-explicit-any

export interface DatabaseItem {
  id: string;
}

export class Db<T extends DatabaseItemConstructor<U>, U extends DatabaseItem> {
  protected items: U[] = [];
  protected itemConstructor: T;

  constructor(itemConstructor: T) {
    this.itemConstructor = itemConstructor;
  }

  public getAll(): U[] {
    return structuredClone(this.items);
  }

  public add(...args: ConstructorParameters<T>): U {
    const item = new this.itemConstructor(...args);
    this.items.push(item);
    return structuredClone(item);
  }

  public getById(id: string): U | undefined {
    return structuredClone(this.items.find((item) => item.id === id));
  }

  public update(id: string, data: Partial<U>): U {
    const index = this.items.findIndex((item) => item.id === id);
    this.items[index] = {
      ...this.items[index],
      ...data,
    };
    return structuredClone(this.items[index]);
  }

  public remove(id: string) {
    const index = this.items.findIndex((item) => item.id === id);
    if (index !== -1) {
      this.items.splice(index, 1);
    }
  }
}

export interface NamedDatabaseItem extends DatabaseItem {
  name: string;
}

export class ExtDb<T extends DatabaseItemConstructor<U>, U extends NamedDatabaseItem> extends Db<T, U> {
  constructor(itemConstructor: T) {
    super(itemConstructor);
  }

  public getByName(name: string) {
    return structuredClone(this.items.find((item) => item.name === name));
  }
}
