import { useState, useEffect } from 'react'
import { Button, Card, Space, Typography } from 'antd'
import { FilterOutlined, DownloadOutlined } from '@ant-design/icons'
import PageHeader from '@/components/ui/PageHeader'
import ReportFilter, { type ReportFilterValues } from '@/components/report/ReportFilter'

const { Text } = Typography

const ReportAPage = () => {
  const [filterOpen, setFilterOpen] = useState(false)

  useEffect(() => {
    setFilterOpen(true)
  }, [])

  const handleApply = (values: ReportFilterValues) => {
    console.log('Report A filter:', values)
    setFilterOpen(false)
  }

  return (
    <>
      <PageHeader
        title="Report A"
        subtitle="Monitoring ritase by date and shift"
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
        title="Report A — Filter"
        onClose={() => setFilterOpen(false)}
        onApply={handleApply}
      />
    </>
  )
}

export default ReportAPage