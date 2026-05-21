export const PAYMENT_METHOD_OPTIONS = [
  { value: "cash_check", label: "Cash or check", residentText: "cash or check" },
  { value: "cash", label: "Cash only", residentText: "cash" },
  { value: "check", label: "Check only", residentText: "check" }
];

export function normalizePaymentMethod(value) {
  return PAYMENT_METHOD_OPTIONS.some((option) => option.value === value) ? value : "cash_check";
}

export function getPaymentMethodText(value) {
  const normalizedValue = normalizePaymentMethod(value);
  return PAYMENT_METHOD_OPTIONS.find((option) => option.value === normalizedValue).residentText;
}

export function getPaymentMethodLabel(value) {
  const normalizedValue = normalizePaymentMethod(value);
  return PAYMENT_METHOD_OPTIONS.find((option) => option.value === normalizedValue).label;
}
