/**
 * Định dạng một số thành chuỗi tiền tệ Việt Nam (VND).
 * @param value - Số cần định dạng
 * @returns Chuỗi đã định dạng, ví dụ: "150.000 ₫"
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return ''
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value)
}