import { ArgsType, ObjectType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsString, IsInt, Min, IsBoolean } from 'class-validator';
import { UserEntity } from '../entities/user.entity';
import { PaginatorInfo } from '../../../common/dto/paginator-info.model';

@ObjectType()
export class UserPaginator {
  @Field(() => [UserEntity])
  data: UserEntity[];

  @Field(() => PaginatorInfo)
  paginatorInfo: PaginatorInfo;
}

@ArgsType()
export class GetUsersArgs {
  @Field(() => Int, { defaultValue: 15 })
  @IsOptional()
  @IsInt()
  @Min(1)
  first?: number = 15;

  @Field(() => Int, { defaultValue: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

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
  @IsBoolean()
  is_active?: boolean;
}

@ArgsType()
export class GetMyStaffsArgs {
  @Field(() => Int, { defaultValue: 15 })
  @IsOptional()
  @IsInt()
  @Min(1)
  first?: number = 15;

  @Field(() => Int, { defaultValue: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

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
}

@ObjectType()
export class StaffPaginator {
  @Field(() => [UserEntity])
  data: UserEntity[];

  @Field(() => PaginatorInfo)
  paginatorInfo: PaginatorInfo;
}