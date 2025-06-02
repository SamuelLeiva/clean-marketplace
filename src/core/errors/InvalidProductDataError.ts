export class InvalidProductDataError extends Error {
  constructor(reason: string) {
    super(`Invalid product data: ${reason}`)
    this.name = 'InvalidProductDataError'
  }
}