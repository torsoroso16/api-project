import {
  ObjectType,
  Field,
  Int,
  Float,
  ID,
  registerEnumType,
} from '@nestjs/graphql';
import { ProductStatus, ProductType } from '../../../core/entities/product.entity';
import { CoreEntity } from '../../../common/entities/core.entity';
import { Attachment } from '../../../common/entities/attachment.entity';

registerEnumType(ProductStatus, { name: 'ProductStatus' });
registerEnumType(ProductType, { name: 'ProductType' });

@ObjectType()
export class Video {
  @Field()
  url: string;
}

@ObjectType()
export class VariationOption {
  @Field()
  name: string;

  @Field()
  value: string;
}

@ObjectType()
export class Variation {
  @Field(() => ID)
  id: number;

  @Field()
  title: string;

  @Field(() => Float)
  price: number;

  @Field(() => Float, { nullable: true })
  salePrice?: number;

  @Field()
  sku: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => Int)
  soldQuantity: number;

  @Field()
  isDisabled: boolean;

  @Field()
  isDigital: boolean;

  @Field(() => Attachment, { nullable: true })
  image?: Attachment;

  @Field(() => [VariationOption])
  options: VariationOption[];
}

@ObjectType()
export class ProductGraphQL extends CoreEntity {
  @Field()
  name: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => ID, { nullable: true })
  typeId?: number;

  @Field(() => ID, { nullable: true })
  shopId?: number;

  @Field(() => ID, { nullable: true })
  authorId?: number;

  @Field(() => ID, { nullable: true })
  manufacturerId?: number;

  @Field(() => ProductType)
  productType: ProductType;

  @Field(() => Float, { nullable: true })
  price?: number;

  @Field(() => Float, { nullable: true })
  salePrice?: number;

  @Field(() => Float, { nullable: true })
  maxPrice?: number;

  @Field(() => Float, { nullable: true })
  minPrice?: number;

  @Field({ nullable: true })
  sku?: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => Int)
  soldQuantity: number;

  @Field({ nullable: true })
  unit?: string;

  @Field(() => ProductStatus)
  status: ProductStatus;

  @Field()
  inStock: boolean;

  @Field()
  isTaxable: boolean;

  @Field()
  isDigital: boolean;

  @Field()
  isExternal: boolean;

  @Field({ nullable: true })
  externalProductUrl?: string;

  @Field({ nullable: true })
  externalProductButtonText?: string;

  @Field({ nullable: true })
  height?: string;

  @Field({ nullable: true })
  length?: string;

  @Field({ nullable: true })
  width?: string;

  @Field(() => Attachment, { nullable: true })
  image?: Attachment;

  @Field(() => [Attachment], { nullable: 'itemsAndList' })
  gallery?: Attachment[];

  @Field(() => [Video], { nullable: 'itemsAndList' })
  videos?: Video[];

  @Field(() => [Variation], { nullable: 'itemsAndList' })
  variations?: Variation[];

  @Field(() => Float, { nullable: true })
  ratings?: number;

  @Field()
  inWishlist: boolean;

  @Field(() => Int, { nullable: true })
  inFlashSale?: number;

  @Field({ nullable: true })
  language?: string;

  @Field(() => [String], { nullable: 'itemsAndList' })
  translatedLanguages?: string[];

  // Relations - these would be resolved by field resolvers
  @Field(() => [ProductGraphQL], { nullable: 'itemsAndList' })
  relatedProducts?: ProductGraphQL[];

  // These would be populated by field resolvers when we have the entities
  // @Field(() => Type, { nullable: true })
  // type?: Type;

  // @Field(() => Shop, { nullable: true })
  // shop?: Shop;

  // @Field(() => [Category], { nullable: 'itemsAndList' })
  // categories?: Category[];

  // @Field(() => [Tag], { nullable: 'itemsAndList' })
  // tags?: Tag[];
}