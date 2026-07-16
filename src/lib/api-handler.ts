import { NextRequest, NextResponse } from 'next/server';
import { Default } from './api-contracts';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateRequired(data: Record<string, unknown>, fields: string[]): void {
  for (const field of fields) {
    if (!data[field] || (typeof data[field] === 'string' && !(data[field] as string).trim())) {
      throw new ValidationError(`${field} is required`);
    }
  }
}

export async function defaultHandler<T extends Default>(
  params: { request: NextRequest; validate?: (body: T['data']) => void },
  handler: (body: T['data']) => Promise<T['result']>,
): Promise<NextResponse> {
  try {
    const body = await params.request.json() as T['data'];
    if (params.validate) params.validate(body);
    const result = await handler(body);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 },
    );
  }
}

export function errorResponse(status: number, message: string): NextResponse {
  return NextResponse.json({ error: message }, { status });
}
