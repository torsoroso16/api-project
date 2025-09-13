import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '../../database/entities/user.entity';

export const CurrentUser = createParamDecorator(
  (data: keyof User | undefined, context: ExecutionContext): User => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const user = request.user;

    return data ? user?.[data] : user;
  },
);