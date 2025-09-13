import {
  ArgsType,
  InputType,
  ObjectType,
  registerEnumType,
  Field,
  Int,
} from '@nestjs/graphql';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { SortOrder } from '../../common/dto/generic-conditions.input';
import { PaginationArgs } from '../../common/dto/pagination.args';
import { PaginatorInfo } from '../../common/dto/paginator-info.model';
import { User } from '../../database/entities/user.entity';

@ObjectType()
export class UserPaginator {
  @Field(() => [User])
  data: User[];

  @Field(() => PaginatorInfo)
  paginatorInfo: PaginatorInfo;
}

@ArgsType()
export class GetUsersArgs extends PaginationArgs {
  @Field(() => [QueryUsersOrderByOrderByClause], { nullable: true })
  @IsOptional()
  orderBy?: QueryUsersOrderByOrderByClause[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  text?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  permission?: string;

  @Field({ nullable: true })
  @IsOptional()
  is_active?: boolean;
}

@InputType()
export class QueryUsersOrderByOrderByClause {
  @Field(() => QueryUsersOrderByColumn)
  column: QueryUsersOrderByColumn;

  @Field(() => SortOrder)
  order: SortOrder;
}

export enum QueryUsersOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  NAME = 'NAME',
  UPDATED_AT = 'UPDATED_AT',
  IS_ACTIVE = 'IS_ACTIVE',
  EMAIL = 'EMAIL',
}

registerEnumType(QueryUsersOrderByColumn, {
  name: 'QueryUsersOrderByColumn',
});