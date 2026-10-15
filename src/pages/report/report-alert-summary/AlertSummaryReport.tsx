import { useEffect, useMemo } from 'react';
import { Card, Col, Row, Typography } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { getAlertCategoryColor } from '@/utils/alert-category';
import { useAlertAbnormalActivity, useAlertSummaryByDateShift } from '@/pages/alert/useAlert';
import { useShifts } from '@/pages/master/shift/useShift';
import rmkoLogo from '@/assets/rmko/RMKO_logo.png';

const { Text, Title } = Typography;

// Ambil jam (0-23) dari string waktu seperti "07:00:00" / "07:00"
const getHour = (value?: string) => {
  const hour = Number(value?.slice(0, 2))
  return Number.isInteger(hour) && hour >= 0 && hour <= 23 ? hour : undefined
}

// Nomor shift dari nama shift API ("Shift 1" -> "1"), fallback ke sequence.
// Sama seperti HourlyTrafficChart supaya pencocokan shift konsisten.
const toShiftValue = (shift?: { shift_name?: string; sequence?: number }): string | undefined => {
  const parsed = shift?.shift_name?.match(/(\d+)\s*$/)?.[1]
  if (parsed) return parsed
  return shift?.sequence != null ? String(shift.sequence) : undefined
}

// Bangun daftar jam dari start ke end (inklusif), mendukung shift lintas tengah malam.
const buildShiftHours = (startHour: number, endHour: number): number[] => {
  const hours: number[] = []
  let hour = startHour

  do {
    hours.push(hour)
    hour = (hour + 1) % 24
  } while (hour !== (endHour + 1) % 24)

  return hours
}

// Label rentang jam per kategori, mis. jam 7 -> "07-08"
const buildTimeRanges = (hours: number[]): string[] =>
  hours.map((hourValue) => {
    const next = (hourValue + 1) % 24
    return `${String(hourValue).padStart(2, '0')}-${String(next).padStart(2, '0')}`
  })

const DEFAULT_TIME_RANGES = [
  '07-08', '08-09', '09-10', '10-11', '11-12', '12-13',
  '13-14', '14-15', '15-16', '16-17', '17-18', '18-19',
]

const HOURLY_CATEGORIES = ['Fuel Decrease', 'Off Track', 'Overspeed', 'Underspeed'] as const

const EMPTY_HOURLY_VALUES: Record<string, number[]> = {
  'Fuel Decrease': [],
  'Off Track': [],
  Overspeed: [],
  Underspeed: [],
}

interface Props {
  date: string
  shift: string
  // Matikan animasi chart saat dicetak ke PDF agar tidak terpotong di tengah animasi.
  animate?: boolean
  // Dipanggil saat semua data sudah termuat (dipakai halaman print untuk menandai siap cetak).
  onReady?: () => void
}

// Isi report Alert Summary; dipakai halaman report (web) dan halaman print (PDF terjadwal).
const AlertSummaryReport = ({ date, shift, animate = true, onReady }: Props) => {
  const filterValues = { date, shift }

  const summaryQuery = useAlertSummaryByDateShift({ date, shift })
  const { isLoading: summaryLoading } = summaryQuery
  const alerts = summaryQuery.data?.data ?? []

  const abnormalQuery = useAlertAbnormalActivity({ date, shift })
  const abnormalActivity = abnormalQuery.data?.data

  // Ambil daftar shift untuk dapatkan start_time & end_time, lalu susun
  // timeRanges secara terpisah sesuai shift yang dipilih (mirip HourlyTrafficChart).
  const shiftQuery = useShifts({ page: 1, limit: 100 })
  const shiftList = shiftQuery.data

  const allLoaded = summaryQuery.isSuccess && abnormalQuery.isSuccess && shiftQuery.isSuccess
  useEffect(() => {
    if (allLoaded) onReady?.()
  }, [allLoaded, onReady])

  const activeShift = useMemo(
    () =>
      shiftList?.data?.find(
        (s) => toShiftValue(s) === filterValues.shift?.replace('Shift ', ''),
      ),
    [shiftList, filterValues.shift],
  )

  const timeRanges = useMemo(() => {
    const startHour = getHour(activeShift?.start_time)
    const endHour = getHour(activeShift?.end_time)

    if (startHour === undefined || endHour === undefined) return DEFAULT_TIME_RANGES

    const hours = buildShiftHours(startHour, endHour)
    return hours.length > 0 ? buildTimeRanges(hours) : DEFAULT_TIME_RANGES
  }, [activeShift])

  const locationChartData = (abnormalActivity?.abnormalEventLocation ?? []).map((location) => ({
    name: location.segment,
    fuelDecrease: location.fuelDecrease,
    offTrack: location.offTrack,
    overspeed: location.overspeed,
    underspeed: location.underspeed,
  }))

  const hourlyFrequencyValues = abnormalActivity?.hourlyFrequency ?? EMPTY_HOURLY_VALUES

  const hourlyChartData = HOURLY_CATEGORIES.map((category) => ({
    category,
    data: hourlyFrequencyValues[category as keyof typeof hourlyFrequencyValues].map((count, i) => {
      return {
        name: timeRanges[i],
        count,
      }
    }),
  }))

  const equipmentQuantityValues = abnormalActivity?.equipmentQuantity ?? EMPTY_HOURLY_VALUES

  const equipmentQtyChartData = HOURLY_CATEGORIES.map((category) => ({
    category,
    data: equipmentQuantityValues[category as keyof typeof equipmentQuantityValues].map((count, i) => {
      return {
        name: timeRanges[i],
        count,
      }
    }),
  }))

  return (
    <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', background: '#f0f2f5', margin: 0, padding: '20px', color: '#333', minHeight: '100vh' }}>
      
      {/* Header */}
      <Card bordered={false} style={{ marginBottom: 16, borderRadius: 10 }} bodyStyle={{ padding: 18 }}>
        <Row gutter={[18, 16]} align="middle">
          <Col flex="0 0 auto">
            <img src={rmkoLogo} alt="PT Royaltama Mulia Kontraktorindo Tbk" style={{ height: 52, width: 'auto' }} />
          </Col>
          <Col flex="1 1 220px">
            <Title level={4} style={{ margin: 0, color: '#1e3a8a' }}>
              RMKO
            </Title>
            <Text type="secondary">
               <strong>Date:</strong> {filterValues.date ? filterValues.date.split('-').reverse().join('/') : '-'} |{' '}
               <strong>Shift:</strong> {filterValues.shift?.replace('Shift ', '') ?? '-'} |{' '}
              <strong>Update Time:</strong> {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Alert Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        {summaryLoading ? (
          <Text type="secondary">Memuat data alert summary...</Text>
        ) : alerts.length === 0 ? (
          <Text type="secondary">Tidak ada data alert summary untuk filter ini.</Text>
        ) : alerts.map((alert, index) => {
          const color = getAlertCategoryColor(alert.title) ?? '#1e3a8a'

          return (
          <div key={index} style={{ background: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #eef0f3' }}>
            <div style={{ background: color, padding: '10px 16px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '14px', fontWeight: 600, letterSpacing: 0.3 }}>{alert.title}</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px 16px' }}>
              {[
                { label: 'Empty', metric: alert.empty },
                { label: 'Loaded', metric: alert.loaded },
              ].map(({ label, metric }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '8px 12px', background: '#f7f9fc', borderRadius: '8px', border: '1px solid #edf0f5' }}>
                  <span style={{ fontSize: '12px', color: '#8a94a6', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#1f2937', whiteSpace: 'nowrap' }}>
                    {metric.events} event <span style={{ color, fontWeight: 600 }}>{metric.dt} DT</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
          )
        })}
      </div>

      {/* Abnormal Event Location */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '20px' }}>
        <div style={{ background: 'white', borderRadius: '8px', padding: '20px', flex: '1 1 0', minWidth: '300px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
          <h2 style={{ marginTop: 0, color: '#1e3a8a', fontSize: '18px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>Abnormal Event Location</h2>
          <div style={{ width: '100%', height: Math.max(locationChartData.length * 32, 380) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationChartData} layout="vertical" barCategoryGap={24} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} interval={0} />
                <Tooltip />
                <Bar isAnimationActive={animate} dataKey="fuelDecrease" name="Fuel Decrease" stackId="alerts" fill={getAlertCategoryColor('Fuel Decrease')} barSize={24}>
                  <LabelList dataKey="fuelDecrease" position="center" fill="#fff" formatter={(value) => value || ''} />
                </Bar>
                <Bar isAnimationActive={animate} dataKey="offTrack" name="Off Track" stackId="alerts" fill={getAlertCategoryColor('Off Track')} barSize={24}>
                  <LabelList dataKey="offTrack" position="center" fill="#fff" formatter={(value) => value || ''} />
                </Bar>
                <Bar isAnimationActive={animate} dataKey="overspeed" name="Overspeed" stackId="alerts" fill={getAlertCategoryColor('Overspeed')} barSize={24}>
                  <LabelList dataKey="overspeed" position="center" fill="#fff" formatter={(value) => value || ''} />
                </Bar>
                <Bar isAnimationActive={animate} dataKey="underspeed" name="Underspeed" stackId="alerts" fill={getAlertCategoryColor('Underspeed')} barSize={24} radius={[0, 4, 4, 0]}>
                  <LabelList dataKey="underspeed" position="center" fill="#fff" formatter={(value) => value || ''} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ flex: '1 1 0', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ marginTop: 0, color: '#1e3a8a', fontSize: '18px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>Hourly Abnormal Activity based on Event Frequency</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {hourlyChartData.map((group) => (
              <div key={group.category}>
                <div style={{ fontSize: 13, fontWeight: 700, color: getAlertCategoryColor(group.category) ?? '#1e3a8a', marginBottom: 8 }}>
                  {group.category}
                </div>
                <div style={{ width: '100%', height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={group.data} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" interval={0} tick={{ fontSize: 9 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar isAnimationActive={animate} dataKey="count" fill={getAlertCategoryColor(group.category) ?? '#1e3a8a'} barSize={24} radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
          </div>

          {/* Hourly Abnormal Activity based on Equipment Quantity */}
          <div style={{ background: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ marginTop: 0, color: '#1e3a8a', fontSize: '18px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>Hourly Abnormal Activity based on Equipment Quantity</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {equipmentQtyChartData.map((group) => (
                <div key={group.category}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: getAlertCategoryColor(group.category) ?? '#1e3a8a', marginBottom: 8 }}>
                    {group.category}
                  </div>
                  <div style={{ width: '100%', height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={group.data} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" interval={0} tick={{ fontSize: 9 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar isAnimationActive={animate} dataKey="count" fill={getAlertCategoryColor(group.category) ?? '#1e3a8a'} barSize={24} radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default AlertSummaryReport
