import { CustomScalar, Scalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('Mixed')
export class Mixed implements CustomScalar<any, any> {
  description = 'Mixed custom scalar type that can represent any JSON value';

  parseValue(value: any): any {
    return value; // value from the client input
  }

  serialize(value: any): any {
    return value; // value sent to the client
  }

  parseLiteral(ast: ValueNode): any {
    switch (ast.kind) {
      case Kind.STRING:
      case Kind.BOOLEAN:
        return ast.value;
      case Kind.INT:
      case Kind.FLOAT:
        return parseFloat(ast.value);
      case Kind.OBJECT:
        return this.parseObject(ast);
      case Kind.LIST:
        return ast.values.map(n => this.parseLiteral(n));
      case Kind.NULL:
        return null;
      default:
        return null;
    }
  }

  private parseObject(ast: any): any {
    const value = {};
    ast.fields.forEach((field: any) => {
      value[field.name.value] = this.parseLiteral(field.value);
    });
    return value;
  }
}