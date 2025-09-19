import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

@Catch()
export class AllExceptionsFilter implements GqlExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): GraphQLError {
    const gqlHost = GqlArgumentsHost.create(host);
    const context = gqlHost.getContext();
    const request = context.req;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();
      
      if (typeof response === 'string') {
        message = response;
      } else if (typeof response === 'object' && response !== null) {
        message = (response as any).message || message;
      }

      // Map HTTP status to GraphQL error codes
      switch (status) {
        case HttpStatus.BAD_REQUEST:
          code = 'BAD_USER_INPUT';
          break;
        case HttpStatus.UNAUTHORIZED:
          code = 'UNAUTHENTICATED';
          break;
        case HttpStatus.FORBIDDEN:
          code = 'FORBIDDEN';
          break;
        case HttpStatus.NOT_FOUND:
          code = 'NOT_FOUND';
          break;
        case HttpStatus.CONFLICT:
          code = 'CONFLICT';
          break;
        case HttpStatus.TOO_MANY_REQUESTS:
          code = 'TOO_MANY_REQUESTS';
          break;
        default:
          code = 'INTERNAL_SERVER_ERROR';
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(`Unexpected error: ${exception.message}`, exception.stack);
    }

    // Log security-related errors
    if (status === HttpStatus.UNAUTHORIZED || status === HttpStatus.FORBIDDEN) {
      this.logger.warn(`Security event: ${message}`, {
        ip: request.ip,
        userAgent: request.headers['user-agent'],
        query: request.body?.query,
      });
    }

    return new GraphQLError(message, {
      extensions: {
        code,
        status,
        timestamp: new Date().toISOString(),
      },
    });
  }
}