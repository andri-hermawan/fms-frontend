import { useEffect, useMemo, useRef } from 'react'
import { PassingSummaryItem } from '@/types/geofence.types'
import { Card, Empty } from 'antd'
import ReactECharts from 'echarts-for-react'
import { useShifts } from '@/pages/master/shift/useShift'

interface Props {
  data: PassingSummaryItem[]
  shift?: string
}

const getHour = (value?: string) => {
  const hour = Number(value?.slice(0, 2))
  return Number.isInteger(hour) && hour >= 0 && hour <= 23 ? hour : undefined
}

// Ambil nomor shift dari nama shift API ("Shift 1" -> "1"), fallback ke sequence.
// Sama seperti PositionHistoryPage supaya pencocokan shift konsisten.
const toShiftValue = (shift?: { shift_name?: string; sequence?: number }): string | undefined => {
  const parsed = shift?.shift_name?.match(/(\d+)\s*$/)?.[1]
  if (parsed) return parsed
  return shift?.sequence != null ? String(shift.sequence) : undefined
}

const buildShiftHours = (startHour: number, endHour: number): number[] => {
  const hours: number[] = []
  let hour = startHour

  do {
    hours.push(hour)
    hour = (hour + 1) % 24
  } while (hour !== (endHour + 1) % 24)

  return hours
}

const detectShiftWindow = (items: PassingSummaryItem[]) => {
  const hours = Array.from(
    new Set(
      items
        .map((item) => getHour(item.hour))
        .filter((hour): hour is number => hour !== undefined),
    ),
  ).sort((a, b) => a - b)

  if (hours.length === 0) return undefined
  if (hours.length === 1) return { startHour: hours[0], endHour: hours[0] }

  let maxGap = -1
  let maxGapIndex = -1

  for (let i = 0; i < hours.length - 1; i += 1) {
    const gap = hours[i + 1] - hours[i]
    if (gap > maxGap) {
      maxGap = gap
      maxGapIndex = i
    }
  }

  const wrapGap = 24 - hours[hours.length - 1] + hours[0]
  if (wrapGap > maxGap) {
    return { startHour: hours[0], endHour: hours[hours.length - 1] }
  }

  return { startHour: hours[maxGapIndex + 1], endHour: hours[maxGapIndex] }
}

const HourlyTrafficChart = ({ data, shift }: Props) => {
  const chartRef = useRef<ReactECharts | null>(null)

  // Sama seperti PositionHistoryPage: ambil daftar shift untuk dapatkan
  // start_time & end_time (bukan fetch terpisah per nama shift).
  const { data: shiftList } = useShifts({ page: 1, limit: 100 })

  // Prop `shift` berformat "Shift 1" / "Shift 2"; bandingkan nomornya saja.
  const activeShift = useMemo(
    () =>
      shiftList?.data?.find(
        (s) => toShiftValue(s) === shift?.replace('Shift ', ''),
      ),
    [shiftList, shift],
  )

  const startHour = getHour(activeShift?.start_time)
  const endHour = getHour(activeShift?.end_time)

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      chartRef.current?.getEchartsInstance().resize()
    })

    const el = chartRef.current?.ele
    if (el) ro.observe(el)

    return () => ro.disconnect()
  }, [])

  const chartData = useMemo(() => {
    const window =
      startHour !== undefined && endHour !== undefined
        ? { startHour, endHour }
        : detectShiftWindow(data)

    if (!window) return data

    const dataByHour = new Map(
      data.map((item) => [getHour(item.hour), item] as const),
    )

    return buildShiftHours(window.startHour, window.endHour).map((hourValue) => {
      const item = dataByHour.get(hourValue)
      return {
        hour: `${String(hourValue).padStart(2, '0')}:00`,
        in: item?.in ?? 0,
        out: item?.out ?? 0,
        total: item?.total ?? 0,
      }
    })
  }, [data, startHour, endHour])

  const isEmpty = chartData.length === 0

  const option = {
    tooltip: { trigger: 'axis' },

    legend: {
      bottom: 4,
      left: 'center',
      textStyle: { fontSize: 12 },
    },

    grid: {
      left: 45,
      right: 15,
      top: 20,
      bottom: 40,
      containLabel: true,
    },

    xAxis: {
      type: 'category',
      data: chartData.map((x) => `${x.hour.substring(0, 2)}:00`),
      axisTick: { alignWithLabel: true },
      axisLabel: { fontSize: 11 },
      splitLine: {
        show: true,
        lineStyle: { type: 'dashed', color: '#e5e5e5', width: 1 },
      },
    },

    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: { fontSize: 11 },
      splitLine: {
        show: true,
        lineStyle: { type: 'dashed', color: '#e5e5e5', width: 1 },
      },
    },

    series: [
      {
        name: 'IN',
        type: 'bar',
        data: chartData.map((x) => x.in),
        barWidth: 16,
        label: {
          show: true,
          position: 'top',
          fontSize: 11,
          color: '#333',
          formatter: (params: { value: number }) =>
            params.value === 0 ? '' : String(params.value),
        },
        itemStyle: { color: '#C6E0B3', borderRadius: [4, 4, 0, 0] },
      },
      {
        name: 'OUT',
        type: 'bar',
        data: chartData.map((x) => x.out),
        barWidth: 16,
        label: {
          show: true,
          position: 'top',
          fontSize: 11,
          color: '#333',
          formatter: (params: { value: number }) =>
            params.value === 0 ? '' : String(params.value),
        },
        itemStyle: { color: '#F9CBAC', borderRadius: [4, 4, 0, 0] },
      },
    ],
  }

  return (
    <Card
      title={`HOURLY TRAFFIC CHART${shift ? ` - ${shift}` : ''}`}
      size="small"
      style={{
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #064596',
      }}
      styles={{
        header: {
          padding: '12px 16px',
          flexShrink: 0,
          borderBottom: '1px solid #f0f0f0',
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 0.4,
          background: '#064596',
          color: '#fff',
        },
        body: {
          padding: 8,
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
      }}
    >
      {isEmpty ? (
        <Empty
          description="No equipment passing available"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <ReactECharts
          ref={chartRef}
          option={option}
          notMerge
          lazyUpdate
          style={{ width: '100%', height: '100%' }}
        />
      )}
    </Card>
  )
}

export default HourlyTrafficChart