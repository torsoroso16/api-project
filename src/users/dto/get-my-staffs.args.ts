import {
  ArgsType,
  ObjectType,
  Field,
} from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';
import { PaginationArgs } from '../../common/dto/pagination.args';
import { PaginatorInfo } from '../../common/dto/paginator-info.model';
import { User } from '../../database/entities/user.entity';

@ObjectType()
export class StaffPaginator {
  @Field(() => [User])
  data: User[];

  @Field(() => PaginatorInfo)
  paginatorInfo: PaginatorInfo;
}

@ArgsType()
export class GetMyStaffsArgs extends PaginationArgs {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  orderBy?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sortedBy?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  searchJoin?: string;
}