// src/tests/utils/mockNext.ts
import { NextRequest, NextResponse } from 'next/server'

/**
 * Creates a mock NextRequest object.
 * @param options.method HTTP method (GET, POST, PUT, DELETE)
 * @param options.url URL path (e.g., "/api/products/123")
 * @param options.body Optional request body for POST/PUT
 * @param options.headers Optional request headers
 * @returns A mock NextRequest instance.
 */
export function createMockRequest({
  method,
  url = '/',
  body = {},
  headers = {},
}: {
  method: string
  url?: string
  body?: unknown
  headers?: Record<string, string>
}): NextRequest {
  const mockUrl = new URL(url, 'http://localhost') // Base URL is required for URL object
  return new NextRequest(mockUrl, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body:
      method !== 'GET' && method !== 'HEAD' ? JSON.stringify(body) : undefined,
  })
}

/**
 * Mocks NextResponse.json to capture its arguments.
 * This is primarily for testing the internal logic of the route handler.
 * For true integration, you'd check the `Response` object itself.
 */
// NOTE: `NextResponse.json` returns a `Response` object.
// We'll capture the parsed JSON and status from the actual `Response`.

/**
 * Parses a NextResponse object to extract its JSON body and status.
 * @param response The NextResponse object returned by an API route handler.
 * @returns An object containing the parsed JSON body and the HTTP status.
 */
export async function parseNextResponse(response: NextResponse) {
  const status = response.status
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let json: any = null

  // A 204 No Content response must not contain a message body.
  // Attempting to parse JSON from a 204 response will cause an error.
  if (status !== 204) {
    try {
      json = await response.json()
    } catch (error) {
      // Log error if parsing fails for non-204 responses,
      // but don't prevent the test from proceeding with status.
      console.error(
        'Error parsing response JSON for status',
        status,
        ':',
        error,
      )
      // You might want to re-throw if this is an unexpected error for non-204
      // throw error;
    }
  }

  return { json, status }
}
