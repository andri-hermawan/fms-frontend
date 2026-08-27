import { useEffect, useMemo, useRef, useState } from 'react'
import { PassingSummaryItem } from '@/types/geofence.types'
import { Card, Empty } from 'antd'
import ReactECharts from 'echarts-for-react'
import shiftApi from '@/services/api/shift.api'

interface Props {
  data: PassingSummaryItem[]
  shift?: string
}

interface ShiftTime {
  start_time: string
  end_time: string
}

interface LoadedShiftTime {
  name: string
  time: ShiftTime
}

const getHour = (value?: string) => {
  const hour = Number(value?.slice(0, 2))
  return Number.isInteger(hour) && hour >= 0 && hour <= 23 ? hour : undefined
}

const HourlyTrafficChart = ({ data, shift }: Props) => {
  const chartRef = useRef<ReactECharts | null>(null)
  const [loadedShiftTime, setLoadedShiftTime] = useState<LoadedShiftTime>()

  useEffect(() => {
    let cancelled = false

    if (!shift) return () => {
      cancelled = true
    }

    const loadShiftTime = async () => {
      try {
        const response = await shiftApi.getByName(shift)
        const shiftData = response.data.data?.[0]

        if (!cancelled) {
          if (shiftData?.start_time && shiftData.end_time) {
            setLoadedShiftTime({
              name: shift,
              time: {
                start_time: shiftData.start_time,
                end_time: shiftData.end_time,
              },
            })
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error('[HourlyTrafficChart] Failed to load shift time:', error)
        }
      }
    }

    void loadShiftTime()

    return () => {
      cancelled = true
    }
  }, [shift])

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      chartRef.current?.getEchartsInstance().resize()
    })

    const el = chartRef.current?.ele
    if (el) ro.observe(el)

    return () => ro.disconnect()
  }, [])

  const shiftTime = loadedShiftTime && loadedShiftTime.name === shift
    ? loadedShiftTime.time
    : undefined
  const startHour = getHour(shiftTime?.start_time)
  const endHour = getHour(shiftTime?.end_time)

  const chartData = useMemo(() => {
    if (startHour === undefined || endHour === undefined) return data

    const dataByHour = new Map(
      data.map((item) => [getHour(item.hour), item] as const),
    )
    const hours: number[] = []
    let hour = startHour

    do {
      hours.push(hour)
      hour = (hour + 1) % 24
    } while (hour !== (endHour + 1) % 24)

    return hours.map((hourValue) => {
      const item = dataByHour.get(hourValue)
      return {
        hour: `${String(hourValue).padStart(2, '0')}:00`,
        in: item?.in ?? 0,
        out: item?.out ?? 0,
        total: item?.total ?? 0,
      }
    })
  }, [data, endHour, startHour])

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