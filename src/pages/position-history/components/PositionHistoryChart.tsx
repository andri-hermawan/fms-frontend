import { useEffect, useRef } from 'react'
import { Card, Empty } from 'antd'
import ReactECharts from 'echarts-for-react'

export interface AlertDataPoint {
  time: string
  speed: number
  fuel: number
  speedMin: number
  speedMax: number
  fuelMin: number
  fuelMax: number
  count: number
  alertStatus?: string   // e.g. "Overspeed", "Underspeed", etc
}

const chartColors: Record<string, string> = {
  Speed: '#064596',
  Fuel: '#ff7f00',
}

const categoryColors: Record<string, string> = {
  Overspeed: 'red',
  Underspeed: 'blue',
  Offtrack: 'orange',
  'Fuel Decrease': 'gold',
  'FUEL DECREASE': 'gold',
}

// Custom SVG path: warning triangle + exclamation
const ALERT_ICON = 'path://M0,-10 L8.66,5 L-8.66,5 Z M-1.5,-4 L1.5,-4 L1.5,2 L-1.5,2 Z M-1.5,4 L1.5,4 L1.5,6 L-1.5,6 Z'

interface PositionHistoryChartProps {
  equipmentCode: string
  data: AlertDataPoint[]
  onClick?: (dataIndex: number) => void
}

const PositionHistoryChart = ({ equipmentCode, data, onClick }: PositionHistoryChartProps) => {
  const chartRef = useRef<ReactECharts | null>(null)

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      chartRef.current?.getEchartsInstance().resize()
    })

    const el = chartRef.current?.ele
    if (el) ro.observe(el)

    return () => ro.disconnect()
  }, [])

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: unknown) => {
        const arr = params as Array<{
          value: number
          seriesName: string
          axisValue: string
        }>
        const hour = arr[0]?.axisValue ?? ''
        const lines = arr
          .map((p) => {
            if (p.seriesName === 'Speed') {
              return `${p.seriesName}: <b>${p.value.toFixed(1)}</b> km/h`
            }
            if (p.seriesName === 'Fuel') {
              return `${p.seriesName}: <b>${p.value.toFixed(1)}%</b>`
            }
            return `${p.seriesName}: <b>${p.value}</b>`
          })
          .join('<br/>')
        return `${hour}<br/>${lines}`
      },
    },

    legend: {
      bottom: 4,
      left: 'center',
      textStyle: { fontSize: 12 },
    },

    grid: {
      left: 45,
      right: 45,
      top: 30,
      bottom: 40,
      containLabel: true,
    },

    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map((d) => d.time),
      axisTick: { alignWithLabel: true },
      axisLabel: {
        fontSize: 11,
        interval: (index: number, value: string) => {
          if (index === 0) return true
          const prev = data[index - 1]?.time ?? ''
          return prev.slice(0, 2) !== value.slice(0, 2)
        },
      },
    },

    yAxis: [
      {
        type: 'value',
        name: 'Speed (km/h)',
        minInterval: 1,
        axisLabel: { fontSize: 11 },
        splitLine: { lineStyle: { type: 'dashed' } },
      },
      {
        type: 'value',
        name: 'Fuel (%)',
        minInterval: 1,
        max: 100,
        axisLabel: { fontSize: 11, formatter: '{value}%' },
        splitLine: { show: false },
      },
    ],

    series: [
      {
        name: 'Speed',
        type: 'line',
        smooth: true,
        symbol: (_: unknown, p: { dataIndex: number }) =>
          data[p.dataIndex]?.alertStatus ? ALERT_ICON : 'circle',
        symbolSize: (_val: number, p: { dataIndex: number }) =>
          data[p.dataIndex]?.alertStatus ? 16 : 6,
        data: data.map((d) => d.speed),
        lineStyle: { color: chartColors.Speed, width: 2.5 },
        itemStyle: {
          color: (p: { dataIndex: number }) => {
            const status = data[p.dataIndex]?.alertStatus
            if (!status) return chartColors.Speed
            return categoryColors[status] ?? '#e74c3c'
          },
          borderColor: (p: { dataIndex: number }) => {
            const status = data[p.dataIndex]?.alertStatus
            return status ? '#fff' : 'transparent'
          },
          borderWidth: 2,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(6,69,150,0.35)' },
              { offset: 1, color: 'rgba(6,69,150,0.02)' },
            ],
          },
        },
      },
      {
        name: 'Fuel',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: (_: unknown, p: { dataIndex: number }) =>
          data[p.dataIndex]?.alertStatus ? ALERT_ICON : 'circle',
        symbolSize: (_val: number, p: { dataIndex: number }) =>
          data[p.dataIndex]?.alertStatus ? 16 : 6,
        data: data.map((d) => d.fuel),
        lineStyle: { color: chartColors.Fuel, width: 2.5 },
        itemStyle: {
          color: (p: { dataIndex: number }) => {
            const status = data[p.dataIndex]?.alertStatus
            if (!status) return chartColors.Fuel
            return categoryColors[status] ?? '#e74c3c'
          },
          borderColor: (p: { dataIndex: number }) => {
            const status = data[p.dataIndex]?.alertStatus
            return status ? '#fff' : 'transparent'
          },
          borderWidth: 2,
        },
      },
    ],
  }

  return (
    <Card
      title={`Graph View Position History - ${equipmentCode}`}
      size="small"
      style={{
        height: 290,
        minWidth: 0,
        minHeight: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #064596',
        borderRadius: 8,
        flexShrink: 0,
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
        },
      }}
    >
      {data.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Empty description="No equipment selected or no data available" />
        </div>
      ) : (
        <ReactECharts
          ref={chartRef}
          option={option}
          notMerge
          lazyUpdate
          style={{ width: '100%', height: '100%' }}
          onEvents={{
            click: (params: { dataIndex?: number }) => {
              if (params.dataIndex != null) onClick?.(params.dataIndex)
            },
          }}
        />
      )}
    </Card>
  )
}

export default PositionHistoryChart