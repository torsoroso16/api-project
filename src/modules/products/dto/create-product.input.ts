import { InputType, Field, ID, Float, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsNumber, IsArray, IsString, Min } from 'class-validator';
import { ProductStatus, ProductType } from '../../../core/entities/product.entity';

@InputType()
export class CreateProductInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  typeId?: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  shopId?: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  authorId?: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  manufacturerId?: number;

  @Field(() => ProductType, { defaultValue: ProductType.SIMPLE })
  @IsOptional()
  @IsEnum(ProductType)
  productType?: ProductType;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salePrice?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sku?: string;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  unit?: string;

  @Field(() => ProductStatus, { defaultValue: ProductStatus.DRAFT })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @Field({ defaultValue: true })
  @IsOptional()
  @IsBoolean()
  inStock?: boolean;

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isTaxable?: boolean;

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isDigital?: boolean;

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isExternal?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  externalProductUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  externalProductButtonText?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  height?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  length?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  width?: string;

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
  language?: string;
}