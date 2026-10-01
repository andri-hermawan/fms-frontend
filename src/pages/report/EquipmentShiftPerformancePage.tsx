import { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Flex,
  Progress,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  AimOutlined,
  ArrowLeftOutlined,
  EnvironmentOutlined,
  FireOutlined,
  ReloadOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import dayjs, { type Dayjs } from 'dayjs';
import PageHeader from '@/components/ui/PageHeader';
import rmkoLogo from '@/assets/rmko/RMKO_logo.png';

const { Text, Title } = Typography;

type StatusKey = 'RUNNING' | 'IDLE' | 'STOP';

type StatusSegment = {
  status: StatusKey;
  start: string;
  end: string;
  durationMin: number;
};

type AlertEvent = {
  time: string;
  type: string;
};

type GeofenceVisit = {
  key: number;
  location: string;
  category: string;
  firstEntry: string;
  lastExit: string;
  durationMin: number;
  visits: number;
};

type BreakdownEvent = {
  key: number;
  start: string;
  end: string;
  durationMin: number;
  issue: string;
  location: string;
  status: 'Resolved' | 'Waiting Part';
};

type DeviceInfo = {
  key: 'gps' | 'fuel';
  name: string;
  idPrefix: string;
  online: boolean;
  lastData: string;
  quality: string;
};

const EQUIPMENT_OPTIONS = [
  { label: 'DT10300 — Dump Truck', value: 'DT10300' },
  { label: 'DT10301 — Dump Truck', value: 'DT10301' },
  { label: 'DT10302 — Dump Truck', value: 'DT10302' },
  { label: 'DT10303 — Dump Truck', value: 'DT10303' },
];

const SHIFT_CONFIG: Record<string, { start: string; end: string; hours: number }> = {
  'Shift 1': { start: '07:00', end: '16:00', hours: 9 },
  'Shift 2': { start: '16:00', end: '01:00', hours: 9 },
  'Shift 3': { start: '01:00', end: '07:00', hours: 6 },
};

const SHIFT_OPTIONS = Object.entries(SHIFT_CONFIG).map(([value, cfg]) => ({
  value,
  label: `${value} (${cfg.start} – ${cfg.end})`,
}));

// Target & kapasitas (dummy)
const TARGET_RITASE = 20;
const TARGET_TONASE = 570;
const NOMINAL_PAYLOAD = 30;
const SPEED_LIMIT = 40;

// Produksi shift (dummy)
const RITASE = 18;
const TONASE = 513;

const FIRST_RUNNING = '07:02';
const FINAL_STOP = '15:56';

const STATUS_SEGMENTS: StatusSegment[] = [
  { status: 'STOP', start: '06:45', end: '07:01', durationMin: 16 },
  { status: 'RUNNING', start: '07:02', end: '07:18', durationMin: 16 },
  { status: 'IDLE', start: '07:19', end: '07:27', durationMin: 8 },
  { status: 'RUNNING', start: '07:28', end: '08:09', durationMin: 41 },
  { status: 'IDLE', start: '08:10', end: '08:21', durationMin: 11 },
  { status: 'RUNNING', start: '08:22', end: '10:04', durationMin: 102 },
  { status: 'STOP', start: '10:05', end: '10:16', durationMin: 11 },
  { status: 'RUNNING', start: '10:17', end: '12:21', durationMin: 124 },
  { status: 'IDLE', start: '12:22', end: '12:44', durationMin: 22 },
  { status: 'RUNNING', start: '12:45', end: '15:08', durationMin: 143 },
  { status: 'IDLE', start: '15:09', end: '15:18', durationMin: 9 },
  { status: 'RUNNING', start: '15:19', end: '15:55', durationMin: 36 },
  { status: 'STOP', start: '15:56', end: '16:10', durationMin: 14 },
];

const STATUS_META: { key: StatusKey; label: string; color: string; description: string }[] = [
  { key: 'RUNNING', label: 'Running', color: '#1677ff', description: 'Unit bergerak dan produktif' },
  { key: 'IDLE', label: 'Idle', color: '#f59e0b', description: 'Engine ON, tetapi speed 0 km/h' },
  { key: 'STOP', label: 'Stop', color: '#64748b', description: 'Unit berhenti, engine OFF' },
];

const BREAKDOWN_EVENTS: BreakdownEvent[] = [
  { key: 1, start: '08:10', end: '08:21', durationMin: 11, issue: 'Hydraulic hose leak', location: 'Hauling Road KM 07', status: 'Resolved' },
  { key: 2, start: '10:05', end: '10:16', durationMin: 11, issue: 'Engine overheat', location: 'Pit D', status: 'Resolved' },
  { key: 3, start: '12:22', end: '12:44', durationMin: 22, issue: 'Tire pressure low', location: 'Dump Area', status: 'Waiting Part' },
];

const ALERT_TYPES = ['Off Track', 'Overspeed', 'Underspeed', 'Fuel Decrease Engine ON', 'Fuel Decrease Engine OFF'];

const ALERT_EVENTS: AlertEvent[] = [
  { time: '07:30', type: 'Underspeed' },
  { time: '08:20', type: 'Fuel Decrease Engine OFF' },
  { time: '09:30', type: 'Overspeed' },
  { time: '09:34', type: 'Off Track' },
  { time: '11:28', type: 'Fuel Decrease Engine ON' },
  { time: '11:30', type: 'Overspeed' },
  { time: '12:30', type: 'Underspeed' },
  { time: '13:16', type: 'Fuel Decrease Engine OFF' },
  { time: '13:30', type: 'Overspeed' },
  { time: '14:05', type: 'Off Track' },
  { time: '14:30', type: 'Overspeed' },
  { time: '15:20', type: 'Underspeed' },
];

const ALERT_COLORS: Record<string, string> = {
  'Off Track': '#7c3aed',
  Overspeed: '#d97706',
  Underspeed: '#0ea5e9',
  'Fuel Decrease Engine ON': '#dc2626',
  'Fuel Decrease Engine OFF': '#b91c1c',
};

const DEVICES: DeviceInfo[] = [
  { key: 'gps', name: 'GPS Tracker', idPrefix: 'GPS', online: true, lastData: '15:59:12', quality: 'GNSS 99.4%' },
  { key: 'fuel', name: 'Fuel Sensor', idPrefix: 'FS', online: true, lastData: '15:59:10', quality: 'Kalibrasi valid' },
];

// Jumlah kunjungan Pit D & Dump Area = jumlah ritase (1 ritase = muat di Pit D, bongkar di Dump Area)
const GEOFENCE_VISITS: GeofenceVisit[] = [
  { key: 1, location: 'Workshop', category: 'Emplacement', firstEntry: '07:02', lastExit: '07:27', durationMin: 25, visits: 1 },
  { key: 2, location: 'Hauling Road', category: 'Hauling Road', firstEntry: '07:28', lastExit: '15:55', durationMin: 315, visits: RITASE },
  { key: 3, location: 'Pit D', category: 'Loading Area', firstEntry: '07:35', lastExit: '15:10', durationMin: 73, visits: RITASE },
  { key: 4, location: 'Dump Area', category: 'Dumping Area', firstEntry: '07:58', lastExit: '15:18', durationMin: 86, visits: RITASE },
];

const FUEL_HISTORY = [
  { time: '07:02', fuel: 200.0 },
  { time: '08:00', fuel: 195.3 },
  { time: '09:00', fuel: 190.7 },
  { time: '10:00', fuel: 187.5 },
  { time: '11:00', fuel: 184.2 },
  { time: '12:00', fuel: 180.0 },
  { time: '13:00', fuel: 176.6 },
  { time: '14:00', fuel: 173.1 },
  { time: '15:00', fuel: 171.8 },
  { time: '15:55', fuel: 171.8 },
];

const SPEED_HISTORY = [
  { time: '07:02', speed: 0 },
  { time: '07:30', speed: 24 },
  { time: '08:00', speed: 38 },
  { time: '08:30', speed: 43 },
  { time: '09:00', speed: 35 },
  { time: '09:30', speed: 46 },
  { time: '10:00', speed: 31 },
  { time: '10:30', speed: 42 },
  { time: '11:00', speed: 39 },
  { time: '11:30', speed: 45 },
  { time: '12:00', speed: 0 },
  { time: '12:30', speed: 28 },
  { time: '13:00', speed: 41 },
  { time: '13:30', speed: 47 },
  { time: '14:00', speed: 36 },
  { time: '14:30', speed: 44 },
  { time: '15:00', speed: 32 },
  { time: '15:55', speed: 0 },
];

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}h ${String(m).padStart(2, '0')}m`;
};

const cardTitle = (title: string, hint: string) => (
  <div style={{ padding: '6px 0' }}>
    <div style={{ color: '#1e3a8a', fontWeight: 700 }}>{title}</div>
    <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>
      {hint}
    </Text>
  </div>
);

type MetricProps = {
  title: string;
  value: string | number;
  suffix?: string;
  hint?: string;
  hintColor?: string;
};

const Metric = ({ title, value, suffix, hint, hintColor }: MetricProps) => (
  <div>
    <Text type="secondary" style={{ fontSize: 12 }}>{title}</Text>
    <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.25, color: '#1e3a8a' }}>
      {value}
      {suffix && <span style={{ fontSize: 13, fontWeight: 500, color: '#6b7280', marginLeft: 4 }}>{suffix}</span>}
    </div>
    {hint && <Text style={{ fontSize: 12, color: hintColor ?? '#6b7280' }}>{hint}</Text>}
  </div>
);

const EquipmentShiftPerformancePage = () => {
  const navigate = useNavigate();
  const [equipmentId, setEquipmentId] = useState('DT10300');
  const [date, setDate] = useState<Dayjs>(dayjs('2026-09-07'));
  const [shift, setShift] = useState('Shift 1');

  const shiftCfg = SHIFT_CONFIG[shift];

  const totalRecordedMinutes = STATUS_SEGMENTS.reduce((sum, s) => sum + s.durationMin, 0);

  // Total Running / Idle / Stop — hanya ditampilkan pada tiga kartu status.
  const statusSummary = useMemo(
    () =>
      STATUS_META.map((meta) => {
        const segments = STATUS_SEGMENTS.filter((s) => s.status === meta.key);
        const minutes = segments.reduce((sum, s) => sum + s.durationMin, 0);
        return {
          ...meta,
          minutes,
          periods: segments.length,
          percent: Number(((minutes / totalRecordedMinutes) * 100).toFixed(1)),
        };
      }),
    [totalRecordedMinutes],
  );

  const runningMinutes = statusSummary.find((s) => s.key === 'RUNNING')!.minutes;
  const idleMinutes = statusSummary.find((s) => s.key === 'IDLE')!.minutes;
  const operatingMinutes = toMinutes(FINAL_STOP) - toMinutes(FIRST_RUNNING);

  // Produksi
  const ritaseAchievement = Math.round((RITASE / TARGET_RITASE) * 100);
  const tonaseAchievement = Math.round((TONASE / TARGET_TONASE) * 100);
  const avgPayload = TONASE / RITASE;
  const payloadPercent = Math.round((avgPayload / NOMINAL_PAYLOAD) * 100);
  const productivity = TONASE / (runningMinutes / 60); // ton per jam Running
  const cycleTime = (runningMinutes + idleMinutes) / RITASE; // menit per ritase

  // Efisiensi
  const distanceKm = 124.8;
  const totalConsumption = 28.2;
  const fuelPerKm = distanceKm / totalConsumption;
  const fuelPerTon = totalConsumption / TONASE;
  const maxSpeed = 47;
  const averageMovingSpeed = 34.6;

  const totalBreakdownMinutes = BREAKDOWN_EVENTS.reduce((sum, e) => sum + e.durationMin, 0);

  const alertChartData = useMemo(
    () =>
      ALERT_TYPES.map((type) => ({
        name: type,
        value: ALERT_EVENTS.filter((e) => e.type === type).length,
        fill: ALERT_COLORS[type] ?? '#1677ff',
      })),
    [],
  );

  const breakdownColumns: ColumnsType<BreakdownEvent> = [
    {
      title: 'Time',
      width: 110,
      render: (_: unknown, record) => `${record.start} – ${record.end}`,
    },
    {
      title: 'Duration',
      dataIndex: 'durationMin',
      width: 80,
      render: (value: number) => `${value} min`,
    },
    {
      title: 'Issue',
      dataIndex: 'issue',
      render: (value: string, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{value}</div>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {record.location}
          </Text>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 120,
      render: (value: string) => <Tag color={value === 'Resolved' ? 'green' : 'orange'}>{value}</Tag>,
    },
  ];

  const geofenceColumns: ColumnsType<GeofenceVisit> = [
    {
      title: 'Location',
      dataIndex: 'location',
      width: 190,
      render: (value: string, record) => (
        <Space size={6}>
          <EnvironmentOutlined style={{ color: '#1677ff' }} />
          <div>
            <div style={{ fontWeight: 600 }}>{value}</div>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {record.category}
            </Text>
          </div>
        </Space>
      ),
    },
    { title: 'First Entry', dataIndex: 'firstEntry', width: 110 },
    { title: 'Last Exit', dataIndex: 'lastExit', width: 110 },
    {
      title: 'Duration',
      dataIndex: 'durationMin',
      width: 110,
      render: (value: number) => formatDuration(value),
    },
    {
      title: 'Visits',
      dataIndex: 'visits',
      width: 90,
      render: (value: number) => <Tag>{value}x</Tag>,
    },
  ];

  const resetFilter = () => {
    setEquipmentId('DT10300');
    setDate(dayjs('2026-09-07'));
    setShift('Shift 1');
  };

  const cardStyle = { borderRadius: 10, height: '100%' } as const;
  const achievementColor = (percent: number) => (percent >= 100 ? '#16a34a' : percent >= 85 ? '#d97706' : '#dc2626');

  return (
    <>
      <PageHeader
        title="Equipment Shift Performance"
        extra={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/report')}>
              Back to Reports
            </Button>
          </Space>
        }
      />

      <div
        style={{
          fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
          background: '#f0f2f5',
          minHeight: '100vh',
          padding: 20,
          color: '#1f2937',
        }}
      >
        {/* Filter */}
        <Card bordered={false} style={{ marginBottom: 16, borderRadius: 10 }} bodyStyle={{ padding: 18 }}>
          <Row gutter={[18, 16]} align="middle">
            <Col flex="0 0 auto">
              <img src={rmkoLogo} alt="PT Royaltama Mulia Kontraktorindo Tbk" style={{ height: 52, width: 'auto' }} />
            </Col>
            <Col flex="1 1 220px">
              <Title level={4} style={{ margin: 0, color: '#1e3a8a' }}>
                Equipment Shift Performance
              </Title>
              <Text type="secondary">
                Rekap produksi hauling dan aktivitas unit selama satu shift.
              </Text>
            </Col>
            <Col>
              <Space wrap>
                <Select value={equipmentId} onChange={setEquipmentId} options={EQUIPMENT_OPTIONS} style={{ width: 190 }} />
                <DatePicker value={date} onChange={(value) => value && setDate(value)} format="DD/MM/YYYY" allowClear={false} />
                <Select value={shift} onChange={setShift} options={SHIFT_OPTIONS} style={{ width: 210 }} />
                <Button type="primary" icon={<ReloadOutlined />} onClick={() => {}}>Load</Button>
                <Button onClick={resetFilter}>Reset</Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Baris 1 — kiri: unit & shift; kanan: kartu Running / Idle / Stop, di bawahnya GPS & Fuel Sensor */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} xl={10}>
            <Card bordered={false} title={cardTitle('Unit & Shift', 'Identitas unit dan jam shift')} style={cardStyle}>
              <Descriptions
                column={1}
                size="small"
                labelStyle={{ color: '#6b7280', width: 110 }}
                items={[
                  { key: 'unit', label: 'Unit', children: <Text strong>{equipmentId} · Dump Truck</Text> },
                  { key: 'model', label: 'Model', children: 'Hino FM 260 JD' },
                  { key: 'operator', label: 'Operator', children: 'Budi Santoso' },
                  { key: 'route', label: 'Rute', children: 'Pit D → Dump Area' },
                  { key: 'shift', label: 'Jam shift', children: `${shiftCfg.start} – ${shiftCfg.end} (${shiftCfg.hours} jam)` },
                  {
                    key: 'ops',
                    label: 'Waktu operasi',
                    children: `${FIRST_RUNNING} – ${FINAL_STOP} (${formatDuration(operatingMinutes)})`,
                  },
                ]}
              />
            </Card>
          </Col>

          <Col xs={24} xl={14}>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>

              <Row gutter={[16, 16]}>
                {DEVICES.map((device) => (
                  <Col xs={24} md={12} key={device.key}>
                    <Card bordered={false} style={{ borderRadius: 10 }} bodyStyle={{ padding: '12px 16px' }}>
                      <Flex justify="space-between" align="center" gap={8}>
                        <Space size={10} align="center">
                          {device.key === 'gps' ? (
                            <AimOutlined style={{ color: '#1677ff', fontSize: 20 }} />
                          ) : (
                            <FireOutlined style={{ color: '#10b981', fontSize: 20 }} />
                          )}
                          <div>
                            <div style={{ fontWeight: 700, lineHeight: 1.3 }}>{device.name}</div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {device.idPrefix}-{equipmentId} · {device.quality}
                            </Text>
                            <div>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                Data terakhir {device.lastData}
                              </Text>
                            </div>
                          </div>
                        </Space>
                        <Tag color={device.online ? 'green' : 'red'} style={{ marginRight: 0 }}>
                          {device.online ? 'ONLINE' : 'OFFLINE'}
                        </Tag>
                      </Flex>
                    </Card>
                  </Col>
                ))}
              </Row>
              
              <Row gutter={[16, 16]}>
                {statusSummary.map((item) => (
                  <Col xs={24} md={8} key={item.key}>
                    <Card bordered={false} style={cardStyle} bodyStyle={{ padding: 18 }}>
                      <Flex align="center" gap={8} style={{ marginBottom: 6 }}>
                        <span style={{ width: 10, height: 10, borderRadius: 3, background: item.color, display: 'inline-block' }} />
                        <Text strong style={{ fontSize: 15 }}>{item.label}</Text>
                      </Flex>
                      <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.2, color: item.color }}>
                        {formatDuration(item.minutes)}
                      </div>
                      <Progress percent={item.percent} showInfo={false} strokeColor={item.color} style={{ margin: '8px 0 4px' }} />
                      <Text style={{ fontSize: 13 }}>
                        <b>{item.percent}%</b> dari waktu tercatat
                      </Text>
                      <div style={{ marginTop: 10 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {item.description}
                        </Text>
                      </div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {item.periods} periode selama shift
                      </Text>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Space>
          </Col>
        </Row>

        {/* Baris 2 — produksi & efisiensi */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} xl={10}>
            <Card bordered={false} title={cardTitle('Produksi Shift', 'Hasil hauling dibanding target')} style={cardStyle}>
              <Row gutter={[16, 20]}>
                <Col span={12}>
                  <Metric
                    title="Ritase"
                    value={RITASE}
                    suffix="trip"
                    hint={`Target ${TARGET_RITASE} · ${ritaseAchievement}%`}
                    hintColor={achievementColor(ritaseAchievement)}
                  />
                </Col>
                <Col span={12}>
                  <Metric
                    title="Tonase"
                    value={TONASE.toLocaleString('id-ID')}
                    suffix="ton"
                    hint={`Target ${TARGET_TONASE} · ${tonaseAchievement}%`}
                    hintColor={achievementColor(tonaseAchievement)}
                  />
                </Col>
                <Col span={12}>
                  <Metric
                    title="Muatan rata-rata"
                    value={avgPayload.toFixed(1)}
                    suffix="t/trip"
                    hint={`Kapasitas ${NOMINAL_PAYLOAD} t · ${payloadPercent}%`}
                    hintColor={achievementColor(payloadPercent)}
                  />
                </Col>
                <Col span={12}>
                  <Metric title="Produktivitas" value={productivity.toFixed(1)} suffix="t/jam" hint="Per jam Running" />
                </Col>
              </Row>
            </Card>
          </Col>
          <Col xs={24} xl={14}>
            <Card bordered={false} title={cardTitle('Efisiensi Unit', 'Seberapa efisien unit memakai waktu, BBM, dan jarak')} style={cardStyle}>
              <Row gutter={[16, 20]}>
                <Col xs={12} md={8}>
                  <Metric title="Cycle time" value={cycleTime.toFixed(1)} suffix="menit" hint="Rata-rata per ritase" />
                </Col>
                <Col xs={12} md={8}>
                  <Metric title="Jarak tempuh" value={distanceKm.toFixed(1)} suffix="km" hint="Total satu shift" />
                </Col>
                <Col xs={12} md={8}>
                  <Metric title="Pemakaian BBM" value={totalConsumption.toFixed(1)} suffix="L" hint={`${fuelPerKm.toFixed(2)} km/L`} />
                </Col>
                <Col xs={12} md={8}>
                  <Metric title="Rasio BBM" value={fuelPerTon.toFixed(3)} suffix="L/ton" hint="BBM per ton material" />
                </Col>
                <Col xs={12} md={8}>
                  <Metric
                    title="Kecepatan maks"
                    value={maxSpeed}
                    suffix="km/h"
                    hint={`Batas site ${SPEED_LIMIT} km/h`}
                    hintColor={maxSpeed > SPEED_LIMIT ? '#dc2626' : undefined}
                  />
                </Col>
                <Col xs={12} md={8}>
                  <Metric title="Kecepatan rata-rata" value={averageMovingSpeed.toFixed(1)} suffix="km/h" hint="Saat bergerak" />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Baris 3 — tren kecepatan & BBM */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} xl={12}>
            <Card bordered={false} title={cardTitle('Speed Trend', `Garis merah putus-putus = batas kecepatan site (${SPEED_LIMIT} km/h)`)} style={cardStyle}>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={SPEED_HISTORY} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" interval={1} tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} label={{ value: 'km/h', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                    <Tooltip />
                    <ReferenceLine y={SPEED_LIMIT} stroke="#dc2626" strokeDasharray="4 4" label={{ value: `Limit ${SPEED_LIMIT}`, fontSize: 10, fill: '#dc2626', position: 'insideTopRight' }} />
                    <Line type="monotone" dataKey="speed" name="Speed (km/h)" stroke="#1677ff" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
          <Col xs={24} xl={12}>
            <Card bordered={false} title={cardTitle('Fuel Level', 'Turun bertahap = pemakaian normal, turun tajam = perlu dicek')} style={cardStyle}>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={FUEL_HISTORY} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" interval={1} tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} domain={['dataMin - 2', 'dataMax + 2']} label={{ value: 'Liter', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="fuel" name="Fuel Level (L)" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Baris 4 — breakdown & alert */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} xl={12}>
            <Card
              bordered={false}
              title={
                <Space size={8} align="start">
                  <ToolOutlined style={{ color: '#dc2626', marginTop: 8 }} />
                  {cardTitle('Breakdown Events', 'Kerusakan yang menghentikan unit selama shift')}
                </Space>
              }
              extra={<Tag color="red">{BREAKDOWN_EVENTS.length} kejadian · {totalBreakdownMinutes} min</Tag>}
              style={cardStyle}
            >
              <Table
                rowKey="key"
                size="small"
                pagination={false}
                columns={breakdownColumns}
                dataSource={BREAKDOWN_EVENTS}
                scroll={{ x: 420 }}
              />
            </Card>
          </Col>
          <Col xs={24} xl={12}>
            <Card bordered={false} title={cardTitle('Abnormal Alerts', 'Jumlah kejadian anomali per kategori')} style={cardStyle}>
              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={alertChartData} layout="vertical" margin={{ top: 8, right: 28, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="value" name="Events" radius={[0, 4, 4, 0]} barSize={20} label={{ position: 'right', fontSize: 11 }}>
                      {alertChartData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Baris 5 — geofence, penuh */}
        <Card
          bordered={false}
          title={cardTitle('Geofencing — Visited Locations', 'Lokasi yang dikunjungi unit; kunjungan Pit D dan Dump Area = jumlah ritase')}
          extra={<Tag color="blue">{GEOFENCE_VISITS.length} locations</Tag>}
          style={{ borderRadius: 10 }}
        >
          <Table rowKey="key" size="small" pagination={false} columns={geofenceColumns} dataSource={GEOFENCE_VISITS} scroll={{ x: 600 }} />
        </Card>

        <div style={{ marginTop: 12, textAlign: 'right' }}>
          <Text type="secondary">Dummy data untuk UI/flow testing — seluruh nilai belum terhubung ke API.</Text>
        </div>
      </div>
    </>
  );
};

export default EquipmentShiftPerformancePage;
