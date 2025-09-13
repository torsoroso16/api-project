import { ArgsType, Field, ID, Int } from '@nestjs/graphql';
import { IsOptional, IsString, IsInt, IsBoolean, Min } from 'class-validator';

@ArgsType()
export class GetUserPermissionArgs {
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
  permission?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

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
  shop_id?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  exclude?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  searchJoin?: string;
}