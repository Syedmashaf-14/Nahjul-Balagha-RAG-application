import { NextResponse } from 'next/server';
import { ApiResponse, PaginatedResponse } from '../types/api.types';

export function formatZodError(error: any): string {
  if (error?.issues && error.issues[0]?.message) {
    return error.issues[0].message;
  }
  if (error?.errors && error.errors[0]?.message) {
    return error.errors[0].message;
  }
  return 'Invalid input data';
}

export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      data,
    },
    { status }
  );
}

export function paginatedResponse<T>(
  data: T[],
  pagination: PaginatedResponse<T>['pagination'],
  status: number = 200
) {
  return NextResponse.json<PaginatedResponse<T>>(
    {
      success: true,
      data,
      pagination,
    },
    { status }
  );
}

export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json<ApiResponse>(
    {
      success: false,
      error: message,
    },
    { status }
  );
}
