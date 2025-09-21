import { ObjectType, Field } from '@nestjs/graphql';
import { PaginatorInfo } from '../../../common/dto/paginator-info.model';
import { ProductGraphQL } from './product.type';

@ObjectType()
export class ProductPaginator {
  @Field(() => [ProductGraphQL])
  data: ProductGraphQL[];

  @Field(() => PaginatorInfo)
  paginatorInfo: PaginatorInfo;
}