/**
 * Currency utilities for InvoiceFlow - PKR As Only Currency
 */

export const DEFAULT_CURRENCY = "PKR";

/**
 * Format an amount in Pakistani Rupee formatting:
 * "Rs. X,XXX" (comma-separated thousands, no decimals unless needed)
 * Examples:
 * - 5000 -> "Rs. 5,000"
 * - 2800 -> "Rs. 2,800"
 * - 150000 -> "Rs. 150,000"
 * - 1234.5 -> "Rs. 1,234.50"
 * - 0 -> "Rs. 0"
 */
export function formatPKR(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || amount === "") {
    return "Rs. 0";
  }

  const num = typeof amount === "string" ? parseFloat(amount.replace(/[^0-9.-]+/g, "")) : Number(amount);
  if (isNaN(num)) {
    return "Rs. 0";
  }

  const hasDecimals = num % 1 !== 0;
  const formatted = Math.abs(num).toLocaleString("en-PK", {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  });

  return num < 0 ? `-Rs. ${formatted}` : `Rs. ${formatted}`;
}
