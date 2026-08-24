import { useCallback, useEffect, useRef, useState } from 'react'
import dayjs, { Dayjs } from 'dayjs'
import trackingApi from '@/services/api/tracking.api'
import type { ActivitySummaryData } from '@/types/tracking.types'

interface UseActivitySummaryOptions {
  /** Refetch otomatis tiap interval ms. Default 60_000 (1 menit). */
  refreshInterval?: number
  enabled?: boolean
}

interface UseActivitySummaryResult {
  /** Key summary per equipment_id -> data. */
  summaries: Record<string, ActivitySummaryData>
  /** equipment_id yang sedang dalam proses fetch. */
  loadingIds: string[]
  /** Waktu terakhir fetch berhasil. */
  lastUpdatedAt: dayjs.Dayjs | null
  /** Fetch ulang untuk satu equipment (atau semua jika tidak diberi id). */
  refresh: (equipmentId?: string) => Promise<void>
}

const DEFAULT_STALE_MS = 5 * 60_000 // 5 menit

/**
 * Hook untuk mengambil Activity Summary kendaraan dari endpoint
 * GET /fms/api/equipment-logs/activity_summary.
 *
 * Periode yang dipakai mengikuti `selectedDate` dari TrackingPage
 * (parameter `start_date` / `end_date`).
 * `selectedShift` digunakan untuk filter shift.
 */
export const useActivitySummary = (
  selectedDate: Dayjs,
  selectedShift?: string,
  options?: UseActivitySummaryOptions,
): UseActivitySummaryResult => {
  const { refreshInterval = 60_000, enabled = true } = options ?? {}

  const [summaries, setSummaries] = useState<Record<string, ActivitySummaryData>>({})
  const [loadingIds, setLoadingIds] = useState<string[]>([])
  const [lastUpdatedAt, setLastUpdatedAt] = useState<dayjs.Dayjs | null>(null)

  // Track fetch terakhir per equipment untuk menghindari refetch berlebihan.
  const lastFetchedAtRef = useRef<Record<string, number>>({})

  const buildParams = useCallback(
    (equipmentId: string) => {
      const params: Record<string, string> = {
        equipment_id: equipmentId,
        start_date: selectedDate.startOf('day').format('YYYY-MM-DD'),
        end_date: selectedDate.endOf('day').format('YYYY-MM-DD'),
      }
      if (selectedShift) {
        params.shift = selectedShift
      }
      return params
    },
    [selectedDate, selectedShift],
  )

  const fetchSummary = useCallback(
    async (equipmentId: string, force = false) => {
      // Skip bila data masih fresh (kecuali dipaksa refresh).
      if (!force && lastFetchedAtRef.current[equipmentId]) {
        const age = Date.now() - lastFetchedAtRef.current[equipmentId]
        if (age < DEFAULT_STALE_MS) return
      }

      setLoadingIds((prev) => (prev.includes(equipmentId) ? prev : [...prev, equipmentId]))
      try {
        const { data } = await trackingApi.getActivitySummary(
          buildParams(equipmentId),
        )
        setSummaries((prev) => ({
          ...prev,
          [equipmentId]: data.data,
        }))
        lastFetchedAtRef.current[equipmentId] = Date.now()
        setLastUpdatedAt(dayjs())
      } catch (error) {
        // Biarkan summary lama tetap tampil bila gagal.
        console.error(
          `[useActivitySummary] Gagal fetch summary ${equipmentId}:`,
          error,
        )
      } finally {
        setLoadingIds((prev) => prev.filter((id) => id !== equipmentId))
      }
    },
    [buildParams],
  )

  const refresh = useCallback(
    async (equipmentId?: string) => {
      if (equipmentId) {
        await fetchSummary(equipmentId, true)
        return
      }
      await Promise.all(
        Object.keys(lastFetchedAtRef.current).map((id) => fetchSummary(id, true)),
      )
    },
    [fetchSummary],
  )

  // Fetch ulang semua summary yang sudah pernah diambil
  // saat `selectedDate` atau `selectedShift` berubah.
  useEffect(() => {
    const ids = Object.keys(lastFetchedAtRef.current)
    if (ids.length > 0) {
      // Hapus cache agar dipaksa fetch ulang (period/shift berubah).
      lastFetchedAtRef.current = {}
      setSummaries({})
      ids.forEach((id) => void fetchSummary(id, true))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedShift])

  // Interval refresh otomatis.
  useEffect(() => {
    if (!enabled) return
    const timer = setInterval(() => {
      Object.keys(lastFetchedAtRef.current).forEach((id) => {
        void fetchSummary(id)
      })
    }, refreshInterval)
    return () => clearInterval(timer)
  }, [enabled, refreshInterval, fetchSummary])

  return { summaries, loadingIds, lastUpdatedAt, refresh }
}
