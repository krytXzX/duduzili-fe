export interface ListingPricing {
  readonly price: string;
  readonly originalPrice?: string;
  readonly discountBadge?: string;
}

export function formatListingPricing(record: Record<string, unknown>): ListingPricing {
  if (readBoolean(record['is_free']) === true) {
    return { price: 'Free' };
  }

  const salePrice = readNumber(
    record['sale_price'] ??
      record['discounted_price'] ??
      record['discount_price'] ??
      record['current_price'],
  );
  const listedPrice = readNumber(record['price'] ?? record['amount']);
  const currentPrice = salePrice ?? listedPrice;
  const explicitOriginalPrice = readNumber(
    record['original_price'] ??
      record['originalPrice'] ??
      record['regular_price'] ??
      record['list_price'] ??
      record['old_price'] ??
      record['before_discount_price'],
  );
  const explicitDiscount = readNumber(
    record['discount_percentage'] ??
      record['discount_percent'] ??
      record['discount_rate'] ??
      record['discount'],
  );
  const computedOriginalPrice =
    currentPrice !== null &&
    explicitDiscount !== null &&
    explicitDiscount > 0 &&
    explicitDiscount < 100
      ? currentPrice / (1 - explicitDiscount / 100)
      : null;
  const originalPrice =
    explicitOriginalPrice ??
    (salePrice !== null && listedPrice !== null && listedPrice > salePrice ? listedPrice : null) ??
    computedOriginalPrice;
  const hasDiscount =
    currentPrice !== null &&
    originalPrice !== null &&
    originalPrice > currentPrice;
  const computedDiscount =
    hasDiscount ? ((originalPrice - currentPrice) / originalPrice) * 100 : null;
  const discountValue = hasDiscount ? explicitDiscount ?? computedDiscount : null;

  return {
    price:
      formatCurrency(currentPrice) ||
      readString(record['price_display']) ||
      readString(record['formatted_price']) ||
      '',
    originalPrice: hasDiscount ? formatCurrency(originalPrice) || undefined : undefined,
    discountBadge: hasDiscount
      ? formatDiscountBadge(discountValue) ??
        readString(record['discount_badge']) ??
        readString(record['badge']) ??
        undefined
      : undefined,
  };
}

export function formatDiscountBadge(value: unknown): string | undefined {
  const parsed = readNumber(value);
  if (parsed === null || parsed <= 0) {
    return undefined;
  }

  return `-${Math.round(parsed)}%`;
}

function formatCurrency(value: number | null): string {
  return value === null
    ? ''
    : `₦${new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 }).format(value)}`;
}

function readBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    if (value === 1) {
      return true;
    }

    if (value === 0) {
      return false;
    }
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes'].includes(normalized)) {
      return true;
    }

    if (['false', '0', 'no'].includes(normalized)) {
      return false;
    }
  }

  return null;
}

function readNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    const parsed = Number(trimmed.replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function readString(value: unknown): string | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return typeof value === 'string' && value.trim() ? value.trim() : null;
}
