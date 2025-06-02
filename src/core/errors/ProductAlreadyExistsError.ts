export class ProductAlreadyExistsError extends Error {
  constructor(productName: string) {
    super(`Product "${productName}" already exists`)
    this.name = 'ProductAlreadyExistsError'
  }
}
