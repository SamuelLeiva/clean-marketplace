// export abstract class BaseError extends Error {
//   abstract readonly code: string
//   abstract readonly statusCode: number

//   constructor(
//     message: string,
//     public readonly context?: Record<string, unknown>,
//   ) {
//     super(message)
//     this.name = this.constructor.name
//   }
// }

export class BaseError extends Error {
  public readonly name: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean; // Useful for distinguishing expected errors from unexpected ones

  constructor(message: string, statusCode: number, name: string = 'BaseError', isOperational: boolean = true) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype); // Restore prototype chain
    this.name = name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor); // Capture stack trace
  }
}