export class CannotDeleteProductError extends Error {
  constructor(productId: string) {
    super(`Cannot delete product with ID ${productId} because it is in use`)
    this.name = 'CannotDeleteProductError'
  }
}