import { useState, useEffect } from 'react'
import { Button, Card, Space, Typography } from 'antd'
import { FilterOutlined, DownloadOutlined } from '@ant-design/icons'
import PageHeader from '@/components/ui/PageHeader'
import ReportFilter, { type ReportFilterValues } from '@/components/report/ReportFilter'

const { Text } = Typography

const ReportBPage = () => {
  const [filterOpen, setFilterOpen] = useState(false)

  useEffect(() => {
    setFilterOpen(true)
  }, [])

  const handleApply = (values: ReportFilterValues) => {
    console.log('Report B filter:', values)
    setFilterOpen(false)
  }

  return (
    <>
      <PageHeader
        title="Report B"
        subtitle="Ringkasan performa equipment harian"
        extra={
          <Space>
            <Button icon={<FilterOutlined />} onClick={() => setFilterOpen(true)}>
              Filter
            </Button>
            <Button icon={<DownloadOutlined />} onClick={() => {}}>
              Download
            </Button>
          </Space>
        }
      />
      <Card>
        <Text type="secondary">Terapkan filter untuk melihat data report.</Text>
      </Card>
      <ReportFilter
        open={filterOpen}
        title="Report B — Filter"
        onClose={() => setFilterOpen(false)}
        onApply={handleApply}
      />
    </>
  )
}

export default ReportBPage