import { useEffect, useMemo, useRef } from 'react'
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

const ALERT_COLOR = '#ff4d4f'

interface FuelHistoryChartProps {
  equipmentCode: string
  data: AlertDataPoint[]
  onClick?: (dataIndex: number) => void
}

const FuelHistoryChart = ({ equipmentCode, data, onClick }: FuelHistoryChartProps) => {
  const chartRef = useRef<ReactECharts | null>(null)

  // useEffect(() => {
  //   const alertCount = data.filter(d => !!d.alertStatus).length
  //   console.log('[FuelHistoryChart] data length:', data.length, 'alertCount:', alertCount)
  // }, [data])

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      chartRef.current?.getEchartsInstance().resize()
    })

    const el = chartRef.current?.ele
    if (el) ro.observe(el)

    return () => ro.disconnect()
  }, [])

  const alertPoints = useMemo(
    () =>
      data.reduce<Array<{
        name: string
        coord: [number, number]
        value: string
      }>>((points, point, index) => {
        if (!point.alertStatus) return points

        points.push({
          name: point.alertStatus,
          coord: [index, point.fuel],
          value: point.alertStatus,
        })
        return points
      }, []),
    [data],
  )

  const option = useMemo(() => ({
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
        name: 'Fuel (%)',
        minInterval: 1,
        max: 100,
        axisLabel: { fontSize: 11, formatter: '{value}%' },
        splitLine: { lineStyle: { type: 'dashed' } },
      },
    ],

    series: [
      {
        name: 'Fuel',
        type: 'line',
        smooth: true,
        showSymbol: true,
        symbol: 'circle',
        data: data.map((d) => ({
          value: d.fuel,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: {
            color: chartColors.Fuel,
            borderColor: 'transparent',
            borderWidth: 0,
          },
        })),
        lineStyle: { color: chartColors.Fuel, width: 2.5 },
        markPoint: {
          silent: false,
          symbol: 'triangle',
          symbolSize: 18,
          symbolRotate: 0,
          label: {
            show: false,
          },
          itemStyle: {
            color: ALERT_COLOR,
            borderColor: '#fff',
            borderWidth: 2,
            shadowBlur: 16,
            shadowColor: 'rgba(255, 77, 79, 0.55)',
          },
          data: alertPoints,
        },
      },
    ],
  }), [data, alertPoints])

  return (
    <Card
      title={`Graph View Fuel History - ${equipmentCode}`}
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
          <Empty description="No asset selected or no data available" />
        </div>
      ) : (
        <ReactECharts
          ref={chartRef}
          option={option}
          notMerge
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

export default FuelHistoryChart
