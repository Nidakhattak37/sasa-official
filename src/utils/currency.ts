import { Currency } from '../types';

// Approximate conversion rates relative to PKR base
const RATES: Record<Currency, { symbol: string; rate: number; prefix: boolean }> = {
  PKR: { symbol: 'PKR ', rate: 1, prefix: true },
  USD: { symbol: '$', rate: 0.0036, prefix: true },
  AED: { symbol: 'AED ', rate: 0.013, prefix: true },
  GBP: { symbol: '£', rate: 0.0028, prefix: true },
};

export function formatPrice(amountPKR: number, currency: Currency = 'PKR'): string {
  const config = RATES[currency] || RATES.PKR;
  const converted = amountPKR * config.rate;

  if (currency === 'PKR') {
    return `${config.symbol}${Math.round(converted).toLocaleString()}`;
  }

  return `${config.symbol}${converted.toFixed(2)}`;
}

export function getCurrencySymbol(currency: Currency = 'PKR'): string {
  return RATES[currency]?.symbol || 'PKR ';
}
