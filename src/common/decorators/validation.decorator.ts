import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const ValidateInput = createParamDecorator(
  (validationRules: any, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const args = ctx.getArgs();
    
    // Custom validation logic can be added here
    // For now, just pass through - class-validator handles most cases
    return args.input;
  },
);