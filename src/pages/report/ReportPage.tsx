import { Card, Col, Row, Typography, Button, Space } from 'antd'
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  FileTextOutlined,
  DashboardOutlined,
  AlertOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import PageHeader from '@/components/ui/PageHeader'

const { Title, Text } = Typography

interface ReportItem {
  key: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  route: string
}

const reports: ReportItem[] = [
  {
    key: 'report-a',
    title: 'Report A',
    description: 'Monitoring ritase by date and shift',
    icon: <BarChartOutlined style={{ fontSize: 36 }} />,
    color: '#064596',
    route: '/report/a',
  },
  {
    key: 'report-b',
    title: 'Report B',
    description: 'Ringkasan performa equipment harian',
    icon: <DashboardOutlined style={{ fontSize: 36 }} />,
    color: '#064596',
    route: '/report/b',
  },
  {
    key: 'report-c',
    title: 'Report C',
    description: 'Laporan konsumsi fuel per equipment',
    icon: <LineChartOutlined style={{ fontSize: 36 }} />,
    color: '#064596',
    route: '/report/c',
  },
  {
    key: 'report-d',
    title: 'Report D',
    description: 'Rekap alert dan pelanggaran per periode',
    icon: <AlertOutlined style={{ fontSize: 36 }} />,
    color: '#064596',
    route: '/report/d',
  },
  {
    key: 'report-e',
    title: 'Report E',
    description: 'Ringkasan aktivitas operator harian',
    icon: <PieChartOutlined style={{ fontSize: 36 }} />,
    color: '#064596',
    route: '/report/e',
  },
  {
    key: 'report-f',
    title: 'Report F',
    description: 'Laporan produktivitas per project',
    icon: <FileTextOutlined style={{ fontSize: 36 }} />,
    color: '#064596',
    route: '/report/f',
  },
]

const ReportPage = () => {
  const navigate = useNavigate()

  return (
    <div style={{ overflow: 'hidden' }}>
      <PageHeader
        title="Reports"
      />
      <br />
      <Row gutter={[16, 16]}>
        {reports.map((report) => (
          <Col key={report.key} xs={24} sm={12} lg={8}>
            <Card
              hoverable
              style={{
                borderTop: `4px solid ${report.color}`,
                height: '100%',
              }}
              styles={{ body: { padding: 24 } }}
            >
              <Space direction="vertical" size="middle" style={{ flex: 1, width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ color: report.color, flexShrink: 0 }}>{report.icon}</div>
                  <Title level={4} style={{ margin: 0 }}>
                    {report.title}
                  </Title>
                </div>
                <Text type="secondary">{report.description}</Text>
              </Space>
              <Button
                type="primary"
                ghost
                onClick={() => navigate(report.route)}
                style={{ marginTop: 16 }}
              >
                View Report
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default ReportPage
