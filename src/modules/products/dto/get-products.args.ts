import { ArgsType, Field, ID, Float, registerEnumType, } from '@nestjs/graphql';
import { IsOptional, IsNumber, IsString, IsEnum, IsArray, Min } from 'class-validator';
import { PaginationArgs } from '../../../common/dto/pagination.args';

export enum ProductOrderBy {
  CREATED_AT = 'createdAt',
  NAME = 'name',
  PRICE = 'price',
  SOLD_QUANTITY = 'soldQuantity',
  RATINGS = 'ratings',
}

registerEnumType(ProductOrderBy, { name: 'ProductOrderBy' });

@ArgsType()
export class GetProductsArgs extends PaginationArgs {
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
  searchJoin?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  shopId?: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  typeId?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  typeSlug?: string;

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  categoryIds?: number[];

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  tagIds?: number[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  productType?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  language?: string;

  @Field(() => ProductOrderBy, { nullable: true })
  @IsOptional()
  @IsEnum(ProductOrderBy)
  orderBy?: ProductOrderBy;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortedBy?: 'ASC' | 'DESC';

  @Field({ nullable: true })
  @IsOptional()
  flashSaleBuilder?: boolean;
}