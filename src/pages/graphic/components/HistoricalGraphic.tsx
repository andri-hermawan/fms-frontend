import { useEffect, useRef } from 'react'
import { Card } from 'antd'
import ReactECharts from 'echarts-for-react'

export interface SpeedDataPoint {
  time: string
  speed: number
  fuel: number
}

interface HistoricalGraphicProps {
  equipmentCode: string
  data: SpeedDataPoint[]
}

const HistoricalGraphic = ({ equipmentCode, data }: HistoricalGraphicProps) => {
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
        }>
        return arr
          .map(
            (p) =>
              `${p.seriesName}: <b>${p.value}</b>`,
          )
          .join('<br/>')
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
      axisLabel: { fontSize: 11 },
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
        symbol: 'circle',
        symbolSize: 6,
        data: data.map((d) => d.speed),
        lineStyle: { color: '#064596', width: 2.5 },
        itemStyle: { color: '#064596' },
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
        symbol: 'circle',
        symbolSize: 6,
        data: data.map((d) => d.fuel),
        lineStyle: { color: '#ff7f00', width: 2.5 },
        itemStyle: { color: '#ff7f00' },
      },
    ],
  }

  return (
    <Card
      title={`Historical Graphic - ${equipmentCode}`}
      size="small"
      style={{
        height: 320,
        marginTop: 16,
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
        },
      }}
    >
      <ReactECharts
        ref={chartRef}
        option={option}
        notMerge
        lazyUpdate
        style={{ width: '100%', height: '100%' }}
      />
    </Card>
  )
}

export default HistoricalGraphic