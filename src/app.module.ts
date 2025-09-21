import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

// Infrastructure
import { DatabaseModule } from './infrastructure/database/database.module';
import { SharedModule } from './shared/shared.module';

// Authentication
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';

// Global Exception Filter
import { AllExceptionsFilter } from './shared/exceptions/all-exceptions.filter';

// Feature Modules
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
// import { SettingsModule } from './modules/settings/settings.module';
// ...import modules lain

@Module({
  imports: [
    // Global Config
    ConfigModule.forRoot({ isGlobal: true }),

    // Database
    DatabaseModule,

    // Shared resources (e.g., utilities, pipes, interceptors)
    SharedModule,

    // GraphQL setup
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      context: ({ req, res }) => ({ req, res }),
    }),

    // Throttling (rate limit)
    ThrottlerModule.forRoot([{
      name: 'short',
      ttl: 1000,
      limit: 3,
    }]),

    // Authentication
    AuthModule,

    // Domain Modules
    UsersModule,
    ProductsModule,
    OrdersModule,
    // SettingsModule,
    // ...module lain
  ],
  providers: [
    // Global Guards
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // Global Exception Filter
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
