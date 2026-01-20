// Currency utilities for formatting amounts in different currencies

export type Currency = 'ILS' | 'USD' | 'EUR';

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  ILS: '₪',
  USD: '$',
  EUR: '€'
};

const CURRENCY_LOCALES: Record<Currency, string> = {
  ILS: 'he-IL',
  USD: 'en-US',
  EUR: 'en-EU'
};

export function formatCurrency(
  amount: number,
  currency: Currency = 'ILS'
): string {
  try {
    return new Intl.NumberFormat(CURRENCY_LOCALES[currency], {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Fallback in case Intl is not available
    return `${amount.toFixed(0)} ${CURRENCY_SYMBOLS[currency]}`;
  }
}