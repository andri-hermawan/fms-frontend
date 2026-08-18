import { useEffect, useRef } from 'react'
import { PassingSummaryItem } from '@/types/geofence.types'
import { Card, Empty } from 'antd'
import ReactECharts from 'echarts-for-react'

interface Props {
  data: PassingSummaryItem[]
}

const HourlyTrafficChart = ({ data }: Props) => {
  const chartRef = useRef<ReactECharts | null>(null)

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      chartRef.current?.getEchartsInstance().resize()
    })

    const el = chartRef.current?.ele
    if (el) ro.observe(el)

    return () => ro.disconnect()
  }, [])

  const isEmpty = data.length === 0

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
      data: data.map((x) => x.hour.substring(0, 2)),
      axisTick: { alignWithLabel: true },
      axisLabel: { fontSize: 11 },
    },

    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: { fontSize: 11 },
      splitLine: { lineStyle: { type: 'dashed' } },
    },

    series: [
      {
        name: 'IN',
        type: 'bar',
        data: data.map((x) => x.in),
        barWidth: 16,
        itemStyle: { color: '#52c41a', borderRadius: [4, 4, 0, 0] },
      },
      {
        name: 'OUT',
        type: 'bar',
        data: data.map((x) => x.out),
        barWidth: 16,
        itemStyle: { color: '#ff4d4f', borderRadius: [4, 4, 0, 0] },
      },
    ],
  }

  return (
    <Card
      title="HOURLY TRAFFIC CHART"
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