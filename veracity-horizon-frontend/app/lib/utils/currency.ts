export const formatCurrency = (amount: number | undefined | null): string => {
  if (amount == null || isNaN(amount)) return "रु 0";
  return `रु ${amount.toLocaleString()}`;
};

export const formatPrice = (amount: number | undefined | null): string => {
  if (amount == null || isNaN(amount)) return "रु 0";
  return `रु ${amount.toLocaleString()}`;
};