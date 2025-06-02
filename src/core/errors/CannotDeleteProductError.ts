export class CannotDeleteProductError extends Error {
  // se podría usar este error más adelante
  constructor(productId: string) {
    super(`Cannot delete product with ID ${productId} because it is in use`)
    this.name = 'CannotDeleteProductError'
  }
}