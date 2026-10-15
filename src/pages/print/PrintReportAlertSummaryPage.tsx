import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import AlertSummaryReport from '@/pages/report/report-alert-summary/AlertSummaryReport'

declare global {
  interface Window {
    __REPORT_READY__?: boolean
  }
}

// Halaman tanpa layout/login yang dibuka headless browser (backend) untuk dijadikan PDF.
// Token sementara dari URL disimpan di memori saja (accessToken tidak dipersist).
const PrintReportAlertSummaryPage = () => {
  const [params] = useSearchParams()
  const date = params.get('date')
  const shift = params.get('shift')
  const token = params.get('token')
  const [tokenReady, setTokenReady] = useState(false)

  useEffect(() => {
    if (token) {
      useAuthStore.getState().setAccessToken(token)
      setTokenReady(true)
    }
  }, [token])

  // Beri jeda singkat agar layout chart (ResponsiveContainer) selesai sebelum dicetak.
  const handleReady = useCallback(() => {
    setTimeout(() => {
      window.__REPORT_READY__ = true
    }, 1000)
  }, [])

  if (!date || !shift || !token || !tokenReady) return null

  return <AlertSummaryReport date={date} shift={shift} animate={false} onReady={handleReady} />
}

export default PrintReportAlertSummaryPage
