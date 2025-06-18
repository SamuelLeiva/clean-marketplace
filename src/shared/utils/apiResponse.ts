import { NextResponse } from 'next/server'
import { ApiResponseError, ApiResponseSuccess } from '../types/api'

export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200,
): NextResponse {
  // If the status is 204 No Content, return a response without a body
  if(status === 204) {
    return new NextResponse(null, { status })
  }

  const responseBody: ApiResponseSuccess<T> = {
    success: true,
    data,
    message,
    statusCode: status,
  }
  return NextResponse.json(responseBody, { status })
}

export function errorResponse(
  message: string = 'An unexpected error ocurred',
  status: number = 500,
  errors?: Array<{ path: string; message: string; code?: string }>,
): NextResponse {
  const responseBody: ApiResponseError = {
    success: false,
    message,
    statusCode: status,
    errors,
  }
  return NextResponse.json(responseBody, { status })
}


