type FunctionConstructor = new (...args: any[]) => any; // eslint-disable-line @typescript-eslint/no-explicit-any

export interface DatabaseItem {
  id: string;
}

interface DatabaseItemConstructor {
  new (...arg: any[]): DatabaseItem; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export class Db<T extends FunctionConstructor & DatabaseItemConstructor, U extends DatabaseItem> {
  items: U[] = [];
  protected itemConstructor: T;

  constructor(itemConstructor: T) {
    this.itemConstructor = itemConstructor;
  }

  public getAll(): U[] {
    return this.items;
  }

  public add(...args: ConstructorParameters<T>): U {
    const item = new this.itemConstructor(...args);
    this.items.push(item);
    return item;
  }

  public getById(id: string): U | undefined {
    return this.items.find((item) => item.id === id);
  }

  public update(id: string, data: Partial<U>): U {
    const index = this.items.findIndex((item) => item.id === id);
    this.items[index] = {
      ...this.items[index],
      ...data,
    };
    return this.items[index];
  }

  public remove(id: string) {
    this.items.filter((item) => item.id !== id);
  }
}
