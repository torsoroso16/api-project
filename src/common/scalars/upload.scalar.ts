import { CustomScalar, Scalar } from '@nestjs/graphql';
import { GraphQLError, ValueNode } from 'graphql';

// Note: You might need to install graphql-upload
// npm install graphql-upload @types/graphql-upload

@Scalar('Upload')
export class Upload implements CustomScalar<any, any> {
  description = 'File upload scalar type';

  parseValue(value: any) {
    // Handle file upload from client
    return value;
  }

  serialize(value: any) {
    // Send file info to client
    if (typeof value === 'string') {
      return value;
    }
    if (value && typeof value === 'object') {
      return value.filename || value.originalname || String(value);
    }
    return null;
  }

  parseLiteral(ast: ValueNode) {
    throw new GraphQLError(
      'Upload scalar can only be used as a variable',
      { nodes: ast }
    );
  }
}