export enum ProductStatus {
  PUBLISH = 'publish',
  DRAFT = 'draft',
}

export enum ProductType {
  SIMPLE = 'simple',
  VARIABLE = 'variable',
}

export interface ProductVariation {
  id: number;
  title: string;
  price: number;
  sku: string;
  quantity: number;
  soldQuantity: number;
  isDisabled: boolean;
  isDigital: boolean;
  salePrice?: number;
  imageUrl?: string;
  options: ProductVariationOption[];
}

export interface ProductVariationOption {
  name: string;
  value: string;
}

export interface ProductVideo {
  url: string;
}

export interface ProductAttachment {
  id?: number;
  thumbnail?: string;
  original?: string;
  fileName?: string;
}

export class Product {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly slug: string,
    public readonly description?: string,
    public readonly typeId?: number,
    public readonly shopId?: number,
    public readonly authorId?: number,
    public readonly manufacturerId?: number,
    public readonly productType: ProductType = ProductType.SIMPLE,
    public readonly price?: number,
    public readonly salePrice?: number,
    public readonly maxPrice?: number,
    public readonly minPrice?: number,
    public readonly sku?: string,
    public readonly quantity: number = 0,
    public readonly soldQuantity: number = 0,
    public readonly unit?: string,
    public readonly status: ProductStatus = ProductStatus.DRAFT,
    public readonly inStock: boolean = true,
    public readonly isTaxable: boolean = false,
    public readonly isDigital: boolean = false,
    public readonly isExternal: boolean = false,
    public readonly externalProductUrl?: string,
    public readonly externalProductButtonText?: string,
    public readonly height?: string,
    public readonly length?: string,
    public readonly width?: string,
    public readonly image?: ProductAttachment,
    public readonly gallery?: ProductAttachment[],
    public readonly videos?: ProductVideo[],
    public readonly variations?: ProductVariation[],
    public readonly categoryIds?: number[],
    public readonly tagIds?: number[],
    public readonly ratings?: number,
    public readonly inWishlist: boolean = false,
    public readonly inFlashSale?: number,
    public readonly language?: string,
    public readonly translatedLanguages?: string[],
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  static create(data: {
    name: string;
    slug: string;
    description?: string;
    typeId?: number;
    shopId?: number;
    authorId?: number;
    manufacturerId?: number;
    productType?: ProductType;
    price?: number;
    salePrice?: number;
    sku?: string;
    quantity?: number;
    unit?: string;
    status?: ProductStatus;
    inStock?: boolean;
    isTaxable?: boolean;
    isDigital?: boolean;
    isExternal?: boolean;
    externalProductUrl?: string;
    externalProductButtonText?: string;
    height?: string;
    length?: string;
    width?: string;
    image?: ProductAttachment;
    gallery?: ProductAttachment[];
    videos?: ProductVideo[];
    categoryIds?: number[];
    tagIds?: number[];
    language?: string;
  }): Product {
    return new Product(
      0, // Will be set by repository
      data.name,
      data.slug,
      data.description,
      data.typeId,
      data.shopId,
      data.authorId,
      data.manufacturerId,
      data.productType || ProductType.SIMPLE,
      data.price,
      data.salePrice,
      undefined, // maxPrice - calculated
      undefined, // minPrice - calculated
      data.sku,
      data.quantity || 0,
      0, // soldQuantity
      data.unit,
      data.status || ProductStatus.DRAFT,
      data.inStock !== false,
      data.isTaxable || false,
      data.isDigital || false,
      data.isExternal || false,
      data.externalProductUrl,
      data.externalProductButtonText,
      data.height,
      data.length,
      data.width,
      data.image,
      data.gallery,
      data.videos,
      [], // variations - empty initially
      data.categoryIds,
      data.tagIds,
      undefined, // ratings - calculated
      false, // inWishlist
      undefined, // inFlashSale
      data.language,
      [], // translatedLanguages
      new Date(),
      new Date()
    );
  }

  updateBasicInfo(data: {
    name?: string;
    description?: string;
    price?: number;
    salePrice?: number;
    quantity?: number;
    status?: ProductStatus;
  }): Product {
    return new Product(
      this.id,
      data.name ?? this.name,
      this.slug,
      data.description ?? this.description,
      this.typeId,
      this.shopId,
      this.authorId,
      this.manufacturerId,
      this.productType,
      data.price ?? this.price,
      data.salePrice ?? this.salePrice,
      this.maxPrice,
      this.minPrice,
      this.sku,
      data.quantity ?? this.quantity,
      this.soldQuantity,
      this.unit,
      data.status ?? this.status,
      this.inStock,
      this.isTaxable,
      this.isDigital,
      this.isExternal,
      this.externalProductUrl,
      this.externalProductButtonText,
      this.height,
      this.length,
      this.width,
      this.image,
      this.gallery,
      this.videos,
      this.variations,
      this.categoryIds,
      this.tagIds,
      this.ratings,
      this.inWishlist,
      this.inFlashSale,
      this.language,
      this.translatedLanguages,
      this.createdAt,
      new Date()
    );
  }

  publish(): Product {
    if (this.status === ProductStatus.PUBLISH) {
      return this;
    }

    return this.updateBasicInfo({ status: ProductStatus.PUBLISH });
  }

  unpublish(): Product {
    if (this.status === ProductStatus.DRAFT) {
      return this;
    }

    return this.updateBasicInfo({ status: ProductStatus.DRAFT });
  }

  updateStock(quantity: number): Product {
    return this.updateBasicInfo({ quantity });
  }

  incrementSoldQuantity(amount: number = 1): Product {
    return new Product(
      this.id,
      this.name,
      this.slug,
      this.description,
      this.typeId,
      this.shopId,
      this.authorId,
      this.manufacturerId,
      this.productType,
      this.price,
      this.salePrice,
      this.maxPrice,
      this.minPrice,
      this.sku,
      this.quantity,
      this.soldQuantity + amount,
      this.unit,
      this.status,
      this.inStock,
      this.isTaxable,
      this.isDigital,
      this.isExternal,
      this.externalProductUrl,
      this.externalProductButtonText,
      this.height,
      this.length,
      this.width,
      this.image,
      this.gallery,
      this.videos,
      this.variations,
      this.categoryIds,
      this.tagIds,
      this.ratings,
      this.inWishlist,
      this.inFlashSale,
      this.language,
      this.translatedLanguages,
      this.createdAt,
      new Date()
    );
  }

  isAvailable(): boolean {
    return this.status === ProductStatus.PUBLISH && 
           this.inStock && 
           this.quantity > 0;
  }

  isLowStock(threshold: number = 10): boolean {
    return this.quantity <= threshold;
  }
}