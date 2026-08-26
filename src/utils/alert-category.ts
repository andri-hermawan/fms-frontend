/**
 * Warna baris/indikator berdasarkan kategori alert.
 * Dipakai di AlertSectionsPanel dan komponen lain yang menampilkan kategori alert.
 */
export const ALERT_CATEGORY_ROW_COLOR: Record<string, string> = {
  'Fuel Decrease': '#5186B3',
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
