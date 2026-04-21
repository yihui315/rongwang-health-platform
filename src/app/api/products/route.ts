import { plans } from '@/data/plans';
import { NextRequest, NextResponse } from 'next/server';
import { PlanSlug } from '@/types';

export function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get('slug') as PlanSlug | null;

  if (slug) {
    const product = plans.find(p => p.slug === slug);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  }

  return NextResponse.json(plans);
}
