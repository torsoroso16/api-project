import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class CategoryWiseProductCount {
  @Field(() => ID)
  categoryId: number;

  @Field()
  categoryName: string;

  @Field({ nullable: true })
  shopName?: string;

  @Field(() => Int)
  productCount: number;
}

@ObjectType()
export class CategoryWiseProductSale {
  @Field(() => ID)
  categoryId: number;

  @Field()
  categoryName: string;

  @Field({ nullable: true })
  shopName?: string;

  @Field(() => Float)
  totalSales: number;
}

@ObjectType()
export class TopRatedProduct {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field(() => Int)
  typeId: number;

  @Field({ nullable: true })
  typeSlug?: string;

  @Field(() => Float, { nullable: true })
  regularPrice?: number;

  @Field(() => Float, { nullable: true })
  salePrice?: number;

  @Field(() => Float, { nullable: true })
  minPrice?: number;

  @Field(() => Float, { nullable: true })
  maxPrice?: number;

  @Field({ nullable: true })
  productType?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int, { nullable: true })
  totalRating?: number;

  @Field(() => Int, { nullable: true })
  ratingCount?: number;

  @Field(() => Float, { nullable: true })
  actualRating?: number;

  @Field({ nullable: true })
  imageUrl?: string;
}