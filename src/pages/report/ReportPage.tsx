import { Card, Col, Row, Typography, Button, Space, Input, Empty, theme } from 'antd'
import {
  // BarChartOutlined,
  // LineChartOutlined,
  AlertOutlined,
  FireOutlined,
  UnorderedListOutlined,
  BellOutlined,
  DashboardOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '@/components/ui/PageHeader'
import { useAuthStore } from '@/stores/auth.store'
import type { Role } from '@/types/auth.types'

const { Title, Text } = Typography

type ReportTone = 'data' | 'analysis'

interface ReportItem {
  key: string
  title: string
  description: string
  icon: React.ReactNode
  tone: ReportTone
  route: string
  /** Role yang boleh mengakses report ini. Kosong = semua role. */
  roles?: Role[]
}

interface ReportGroup {
  key: string
  title: string
  description: string
  reports: ReportItem[]
}

// Satu tone per grup supaya warna tidak dipilih per-kartu.
const GROUP_TONE: Record<ReportTone, string> = {
  data: '#064596',
  analysis: '#389e0d',
}

const reportGroups: ReportGroup[] = [
  {
    key: 'raw-data',
    title: 'Raw Data',
    description: 'Data mentah per tanggal, shift dan asset code.',
    reports: [
      {
        key: 'report/report-equipment-logs',
        title: 'Asset History',
        description: 'Riwayat asset history per tanggal, shift dan asset code.',
        icon: <UnorderedListOutlined />,
        tone: 'data',
        route: '/report/report-equipment-logs',
      },
      {
        key: 'report/report-fuel-history',
        title: 'Fuel History',
        description: 'Riwayat konsumsi fuel per tanggal, shift dan asset code.',
        icon: <FireOutlined />,
        tone: 'data',
        route: '/report/report-fuel-history',
      },
      {
        key: 'report/report-alert-history',
        title: 'Abnormal Alert History',
        description: 'Riwayat abnormal alert per tanggal, shift dan asset code.',
        icon: <AlertOutlined />,
        tone: 'data',
        route: '/alert',
      },
    ],
  },
  {
    key: 'report',
    title: 'Report',
    description: 'Laporan yang sudah diagregasi per periode.',
    reports: [
      {
        key: 'report/report-alert-summary',
        title: 'Abnormal Alert Summary',
        description: 'Laporan abnormal alert per periode',
        icon: <BellOutlined />,
        tone: 'analysis',
        route: '/report/report-alert-summary',
      },
      {
        key: 'report/physical-availability',
        title: 'Physical Availability',
        description: 'Rekap physical availability unit per tanggal.',
        icon: <DashboardOutlined />,
        tone: 'analysis',
        route: '/report/physical-availability',
      },
    ],
  },
]

const ReportPage = () => {
  const navigate = useNavigate()
  const userRole = useAuthStore((s) => s.user?.role)
  const { token } = theme.useToken()
  const [keyword, setKeyword] = useState('')

  // Filter kartu report sesuai role user, buang grup yang tidak punya report tersisa.
  // Keyword dicocokkan ke judul, deskripsi, dan nama grup.
  const visibleGroups = useMemo(() => {
    const query = keyword.trim().toLowerCase()

    return reportGroups
      .map((group) => {
        const groupMatches = group.title.toLowerCase().includes(query)

        return {
          ...group,
          reports: group.reports
            .filter((r) => !r.roles || (userRole && r.roles.includes(userRole)))
            .filter(
              (r) =>
                !query ||
                groupMatches ||
                r.title.toLowerCase().includes(query) ||
                r.description.toLowerCase().includes(query),
            ),
        }
      })
      .filter((group) => group.reports.length > 0)
  }, [userRole, keyword])

  const isSearching = keyword.trim().length > 0

  return (
    <div style={{ minWidth: 0, overflowX: 'hidden' }}>
      <PageHeader
        title="All Reports"
        extra={
          <Input
            allowClear
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Cari report..."
            prefix={<SearchOutlined style={{ color: token.colorTextPlaceholder }} />}
            style={{ width: 260, maxWidth: '100%' }}
          />
        }
      />

      {visibleGroups.length === 0 ? (
        <Empty
          style={{ marginTop: 48 }}
          description={
            isSearching
              ? `Tidak ada report yang cocok dengan "${keyword.trim()}"`
              : 'Belum ada report yang bisa diakses'
          }
        />
      ) : (
        visibleGroups.map((group, groupIndex) => (
          <section key={group.key} style={{ marginTop: groupIndex === 0 ? 20 : 32, minWidth: 0 }}>
            <Space size={8} align="baseline">
              <Title level={5} style={{ margin: 0 }}>
                {group.title}
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {group.description}
              </Text>
            </Space>

            <Row gutter={[16, 16]} style={{ marginTop: 12, marginLeft: 0, marginRight: 0 }}>
              {group.reports.map((report) => {
                const color = GROUP_TONE[report.tone]

                return (
                  <Col key={report.key} xs={24} sm={12} lg={8}>
                    <Card
                      hoverable
                      style={{
                        height: '100%',
                        borderTop: `3px solid ${color}`,
                        borderRadius: token.borderRadiusLG,
                      }}
                      styles={{ body: { padding: 20, display: 'flex', flexDirection: 'column', gap: 12, height: '100%' } }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: token.borderRadiusLG,
                          background: `${color}14`,
                          color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 22,
                        }}
                      >
                        {report.icon}
                      </div>

                      <div>
                        <Title level={5} style={{ margin: 0 }}>
                          {report.title}
                        </Title>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          {report.description}
                        </Text>
                      </div>

                      <Button
                        type="link"
                        onClick={() => navigate(report.route)}
                        style={{ padding: 0, height: 'auto', marginTop: 'auto', alignSelf: 'flex-start', fontWeight: 500 }}
                      >
                        View Report →
                      </Button>
                    </Card>
                  </Col>
                )
              })}
            </Row>
          </section>
        ))
      )}
    </div>
  )
}

export default ReportPage
