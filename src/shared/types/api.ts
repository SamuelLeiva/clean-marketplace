export interface ApiResponseSuccess<T> {
  success: true
  data: T
  message?: string
  statusCode: number
}

export interface ApiResponseError {
  success: false
  message: string
  statusCode: number
  errors?: Array<{
    path: string
    message: string
    code?: string
  }>
}

export type ApiResponse<T = unknown> = ApiResponseSuccess<T> | ApiResponseError