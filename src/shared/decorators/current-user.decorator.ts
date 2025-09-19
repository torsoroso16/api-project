import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserEntity } from '../../modules/auth/entities/user.entity';

export const CurrentUser = createParamDecorator(
  (data: keyof UserEntity | undefined, context: ExecutionContext): UserEntity => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const user = request.user;

    return data ? user?.[data] : user;
  },
);