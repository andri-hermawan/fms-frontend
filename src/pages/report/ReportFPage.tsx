import { useState, useEffect } from 'react'
import { Button, Card, Space, Typography } from 'antd'
import { FilterOutlined, DownloadOutlined } from '@ant-design/icons'
import PageHeader from '@/components/ui/PageHeader'
import ReportFilter, { type ReportFilterValues } from '@/components/report/ReportFilter'

const { Text } = Typography

const ReportFPage = () => {
  const [filterOpen, setFilterOpen] = useState(false)

  useEffect(() => {
    setFilterOpen(true)
  }, [])

  const handleApply = (values: ReportFilterValues) => {
    console.log('Report F filter:', values)
    setFilterOpen(false)
  }

  return (
    <>
      <PageHeader
        title="Report F"
        subtitle="Laporan produktivitas per project"
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
        title="Report F — Filter"
        onClose={() => setFilterOpen(false)}
        onApply={handleApply}
      />
    </>
  )
}

export default ReportFPage