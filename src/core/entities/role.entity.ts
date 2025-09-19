export class Role {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly description?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  static create(name: string, description?: string): Role {
    return new Role(0, name, description, new Date(), new Date());
  }
}