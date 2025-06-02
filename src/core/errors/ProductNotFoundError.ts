export class ProductNotFoundError extends Error {
  constructor(productId: string) {
    super(`Product with ID ${productId} was not found`)
    this.name = 'ProductNotFoundError'
  }
}
