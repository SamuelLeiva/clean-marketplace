import { NextResponse } from "next/server";
import { DEFAULT_ERROR_STATUS, errorStatusMap } from "./errorMapper";

export function handleError(error: unknown) {
  console.error('Error occurred:', error)
  for(const [ErrorClass, statusCode] of errorStatusMap.entries()){
    if(error instanceof ErrorClass){
      return NextResponse.json({ error: error.message }, { status: statusCode });
    }
  }

  // If it's a generic Error or an unexpected error
  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: DEFAULT_ERROR_STATUS });
  }

  // Fallback for any other type of error
  return NextResponse.json({ error: 'Unexpected error' }, { status: DEFAULT_ERROR_STATUS });

}