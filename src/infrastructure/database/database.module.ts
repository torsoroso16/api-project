import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfigAsync } from './database.config';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync(typeOrmConfigAsync),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}