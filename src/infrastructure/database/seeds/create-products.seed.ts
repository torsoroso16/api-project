import { DataSource } from 'typeorm';
import { ProductEntity } from '../../../modules/products/entities/product.entity';
import { ProductStatus, ProductType } from '../../../core/entities/product.entity';

export async function seedProducts(dataSource: DataSource) {
  const productRepository = dataSource.getRepository(ProductEntity);

  const sampleProducts = [
    {
      name: 'Sample Product 1',
      slug: 'sample-product-1',
      description: 'This is a sample product for testing purposes.',
      productType: ProductType.SIMPLE,
      price: 29.99,
      salePrice: 24.99,
      sku: 'SP001',
      quantity: 100,
      unit: 'piece',
      status: ProductStatus.PUBLISH,
      inStock: true,
      isTaxable: true,
      isDigital: false,
      isExternal: false,
      language: 'en',
      image: {
        original: '/images/sample-product-1.jpg',
        thumbnail: '/images/sample-product-1-thumb.jpg',
        fileName: 'sample-product-1.jpg'
      }
    },
    {
      name: 'Sample Product 2',
      slug: 'sample-product-2',
      description: 'Another sample product with different specifications.',
      productType: ProductType.VARIABLE,
      price: 49.99,
      sku: 'SP002',
      quantity: 50,
      unit: 'piece',
      status: ProductStatus.PUBLISH,
      inStock: true,
      isTaxable: true,
      isDigital: false,
      isExternal: false,
      language: 'en',
      gallery: [
        {
          original: '/images/sample-product-2-1.jpg',
          thumbnail: '/images/sample-product-2-1-thumb.jpg',
          fileName: 'sample-product-2-1.jpg'
        },
        {
          original: '/images/sample-product-2-2.jpg',
          thumbnail: '/images/sample-product-2-2-thumb.jpg',
          fileName: 'sample-product-2-2.jpg'
        }
      ]
    },
    {
      name: 'Digital Product Sample',
      slug: 'digital-product-sample',
      description: 'A sample digital product like an ebook or software.',
      productType: ProductType.SIMPLE,
      price: 19.99,
      sku: 'DIG001',
      quantity: 999,
      unit: 'download',
      status: ProductStatus.PUBLISH,
      inStock: true,
      isTaxable: false,
      isDigital: true,
      isExternal: false,
      language: 'en'
    },
    {
      name: 'External Product Sample',
      slug: 'external-product-sample',
      description: 'A sample external product that redirects to another site.',
      productType: ProductType.SIMPLE,
      price: 99.99,
      sku: 'EXT001',
      quantity: 0,
      unit: 'piece',
      status: ProductStatus.PUBLISH,
      inStock: true,
      isTaxable: true,
      isDigital: false,
      isExternal: true,
      externalProductUrl: 'https://example.com/external-product',
      externalProductButtonText: 'Buy on External Site',
      language: 'en'
    },
    {
      name: 'Draft Product Sample',
      slug: 'draft-product-sample',
      description: 'A sample product in draft status.',
      productType: ProductType.SIMPLE,
      price: 15.99,
      sku: 'DRF001',
      quantity: 25,
      unit: 'piece',
      status: ProductStatus.DRAFT,
      inStock: true,
      isTaxable: true,
      isDigital: false,
      isExternal: false,
      language: 'en'
    }
  ];

  for (const productData of sampleProducts) {
    const existingProduct = await productRepository.findOne({
      where: { slug: productData.slug },
    });

    if (!existingProduct) {
      const product = productRepository.create(productData);
      await productRepository.save(product);
      console.log(`✅ Created product: ${productData.name}`);
    } else {
      console.log(`⚠️  Product already exists: ${productData.name}`);
    }
  }
}