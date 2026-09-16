import { Card, Col, Row, Typography, Button, Space } from 'antd'
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  FileTextOutlined,
  DashboardOutlined,
  AlertOutlined,
} from '@ant-design/icons'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '@/components/ui/PageHeader'
import { useAuthStore } from '@/stores/auth.store'
import type { Role } from '@/types/auth.types'

const { Title, Text } = Typography

interface ReportItem {
  key: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  route: string
  /** Role yang boleh mengakses report ini. Kosong = semua role. */
  roles?: Role[]
}

const reports: ReportItem[] = [
  {
    key: 'report/report-equipment-logs',
    title: 'Equipment Logs',
    description: 'Riwayat log equipment per tanggal & shift',
    icon: <BarChartOutlined style={{ fontSize: 36 }} />,
    color: '#064596',
    route: '/report/report-equipment-logs',
  },
  {
    key: 'report/report-alert-summary',
    title: 'Report Alert Summary',
    description: 'Ringkasan alert dan pelanggaran per periode',
    icon: <DashboardOutlined style={{ fontSize: 36 }} />,
    color: '#064596',
    route: '/report/report-alert-summary',
    roles: ['superadmin', 'admin'],
  },
  {
    key: 'report-c',
    title: 'Report C',
    description: 'Laporan konsumsi fuel per equipment',
    icon: <LineChartOutlined style={{ fontSize: 36 }} />,
    color: '#064596',
    route: '/report/c',
    roles: ['superadmin', 'admin'],
  },
  {
    key: 'report-d',
    title: 'Report D',
    description: 'Rekap alert dan pelanggaran per periode',
    icon: <AlertOutlined style={{ fontSize: 36 }} />,
    color: '#064596',
    route: '/report/d',
    roles: ['superadmin', 'admin'],
  },
  {
    key: 'report-e',
    title: 'Report E',
    description: 'Ringkasan aktivitas operator harian',
    icon: <PieChartOutlined style={{ fontSize: 36 }} />,
    color: '#064596',
    route: '/report/e',
    roles: ['superadmin', 'admin'],
  },
  {
    key: 'report-f',
    title: 'Report F',
    description: 'Laporan produktivitas per project',
    icon: <FileTextOutlined style={{ fontSize: 36 }} />,
    color: '#064596',
    route: '/report/f',
    roles: ['superadmin', 'admin'],
  },
]

const ReportPage = () => {
  const navigate = useNavigate()
  const userRole = useAuthStore((s) => s.user?.role)

  // Filter kartu report sesuai role user
  const visibleReports = useMemo(
    () => reports.filter((r) => !r.roles || (userRole && r.roles.includes(userRole))),
    [userRole],
  )

  return (
    <div style={{ overflow: 'hidden' }}>
      <PageHeader
        title="Reports"
      />
      <br />
      <Row gutter={[16, 16]}>
        {visibleReports.map((report) => (
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
