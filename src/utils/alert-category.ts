/**
 * Warna baris/indikator berdasarkan kategori alert.
 * Dipakai di AlertSectionsPanel dan komponen lain yang menampilkan kategori alert.
 */
export const ALERT_CATEGORY_ROW_COLOR: Record<string, string> = {
  'Fuel Decrease Engine Off': '#5186B3',
  'Fuel Decrease Engine On': '#5186B3',
  'Off Track': '#8A8A8A',
  'Overspeed': '#C87033',
  'Underspeed': '#DCA62D',
}

/**
 * Ambil warna untuk sebuah kategori alert. Mengembalikan `undefined`
 * bila kategori tidak dikenal sehingga pemanggil bisa memakai fallback.
 */
export const getAlertCategoryColor = (categoryName?: string): string | undefined =>
  categoryName ? ALERT_CATEGORY_ROW_COLOR[categoryName] : undefined

/**
 * Warna teks yang kontras terhadap warna kategori alert,
 * agar tetap terbaca di atas background berwarna (terang/gelap).
 */
export const getAlertCategoryTextColor = (categoryName?: string): string => {
  const hex = (getAlertCategoryColor(categoryName) ?? '#1f1f1f').replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? '#1f1f1f' : '#ffffff'
}
