import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Flex,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowLeftOutlined,
  EnvironmentOutlined,
  PauseOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import PageHeader from '@/components/ui/PageHeader';
import rmkoLogo from '@/assets/rmko/RMKO_logo.png';

const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

type PlaybackPoint = {
  time: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  speed: number;
  fuelLevel: number;
  fuelVolume: number;
  engineStatus: 'ON' | 'OFF';
  ignition: boolean;
  location: string;
  segment: string;
  event?: string;
};

type PlaybackEvent = {
  key: number;
  time: string;
  type: string;
  location: string;
  speed: number;
  description: string;
};

const EQUIPMENT_OPTIONS = [
  { label: 'DT10300', value: 'DT10300' },
  { label: 'DT10301', value: 'DT10301' },
  { label: 'DT10302', value: 'DT10302' },
  { label: 'DT10303', value: 'DT10303' },
];

const DUMMY_PLAYBACK: PlaybackPoint[] = [
  {
    time: '07:02',
    timestamp: '2026-09-07 07:02:00',
    latitude: -2.18758,
    longitude: 115.10734,
    speed: 0,
    fuelLevel: 4094,
    fuelVolume: 200,
    engineStatus: 'ON',
    ignition: true,
    location: 'Workshop',
    segment: 'Emplacement',
  },
  {
    time: '07:08',
    timestamp: '2026-09-07 07:08:00',
    latitude: -2.18812,
    longitude: 115.10911,
    speed: 12,
    fuelLevel: 4086,
    fuelVolume: 199.6,
    engineStatus: 'ON',
    ignition: true,
    location: 'Workshop Access',
    segment: 'Hauling Road',
  },
  {
    time: '07:14',
    timestamp: '2026-09-07 07:14:00',
    latitude: -2.18914,
    longitude: 115.11276,
    speed: 28,
    fuelLevel: 4078,
    fuelVolume: 199.2,
    engineStatus: 'ON',
    ignition: true,
    location: 'Hauling Road KM 01',
    segment: 'Hauling Road',
  },
  {
    time: '07:21',
    timestamp: '2026-09-07 07:21:00',
    latitude: -2.19144,
    longitude: 115.11698,
    speed: 36,
    fuelLevel: 4066,
    fuelVolume: 198.6,
    engineStatus: 'ON',
    ignition: true,
    location: 'Hauling Road KM 02',
    segment: 'Hauling Road',
  },
  {
    time: '07:29',
    timestamp: '2026-09-07 07:29:00',
    latitude: -2.19472,
    longitude: 115.12138,
    speed: 44,
    fuelLevel: 4051,
    fuelVolume: 197.9,
    engineStatus: 'ON',
    ignition: true,
    location: 'Hauling Road KM 03',
    segment: 'Hauling Road',
  },
  {
    time: '07:36',
    timestamp: '2026-09-07 07:36:00',
    latitude: -2.19818,
    longitude: 115.12596,
    speed: 47,
    fuelLevel: 4038,
    fuelVolume: 197.2,
    engineStatus: 'ON',
    ignition: true,
    location: 'Hauling Road KM 04',
    segment: 'Hauling Road',
  },
  {
    time: '07:44',
    timestamp: '2026-09-07 07:44:00',
    latitude: -2.20094,
    longitude: 115.13145,
    speed: 41,
    fuelLevel: 4023,
    fuelVolume: 196.4,
    engineStatus: 'ON',
    ignition: true,
    location: 'Junction A',
    segment: 'Hauling Road',
  },
  {
    time: '07:51',
    timestamp: '2026-09-07 07:51:00',
    latitude: -2.19958,
    longitude: 115.13732,
    speed: 33,
    fuelLevel: 4012,
    fuelVolume: 195.9,
    engineStatus: 'ON',
    ignition: true,
    location: 'Loading Point',
    segment: 'Pit D',
  },
  {
    time: '08:00',
    timestamp: '2026-09-07 08:00:00',
    latitude: -2.19632,
    longitude: 115.14164,
    speed: 7,
    fuelLevel: 4004,
    fuelVolume: 195.5,
    engineStatus: 'ON',
    ignition: true,
    location: 'Loading Point',
    segment: 'Pit D',
  },
  {
    time: '08:08',
    timestamp: '2026-09-07 08:08:00',
    latitude: -2.19327,
    longitude: 115.14394,
    speed: 0,
    fuelLevel: 4002,
    fuelVolume: 195.4,
    engineStatus: 'OFF',
    ignition: false,
    location: 'Loading Point',
    segment: 'Pit D',
    event: 'Stop',
  },
  {
    time: '08:22',
    timestamp: '2026-09-07 08:22:00',
    latitude: -2.19327,
    longitude: 115.14394,
    speed: 0,
    fuelLevel: 3988,
    fuelVolume: 194.7,
    engineStatus: 'OFF',
    ignition: false,
    location: 'Loading Point',
    segment: 'Pit D',
    event: 'Fuel Decrease',
  },
  {
    time: '08:31',
    timestamp: '2026-09-07 08:31:00',
    latitude: -2.19177,
    longitude: 115.13956,
    speed: 18,
    fuelLevel: 3984,
    fuelVolume: 194.5,
    engineStatus: 'ON',
    ignition: true,
    location: 'Exit Pit D',
    segment: 'Hauling Road',
  },
  {
    time: '08:39',
    timestamp: '2026-09-07 08:39:00',
    latitude: -2.18874,
    longitude: 115.13524,
    speed: 31,
    fuelLevel: 3976,
    fuelVolume: 194.1,
    engineStatus: 'ON',
    ignition: true,
    location: 'Hauling Road KM 06',
    segment: 'Hauling Road',
  },
  {
    time: '08:47',
    timestamp: '2026-09-07 08:47:00',
    latitude: -2.18647,
    longitude: 115.12916,
    speed: 39,
    fuelLevel: 3964,
    fuelVolume: 193.5,
    engineStatus: 'ON',
    ignition: true,
    location: 'Hauling Road KM 05',
    segment: 'Hauling Road',
  },
  {
    time: '08:55',
    timestamp: '2026-09-07 08:55:00',
    latitude: -2.18471,
    longitude: 115.12378,
    speed: 43,
    fuelLevel: 3956,
    fuelVolume: 193.1,
    engineStatus: 'ON',
    ignition: true,
    location: 'Junction B',
    segment: 'Hauling Road',
  },
  {
    time: '09:04',
    timestamp: '2026-09-07 09:04:00',
    latitude: -2.18294,
    longitude: 115.11852,
    speed: 38,
    fuelLevel: 3948,
    fuelVolume: 192.7,
    engineStatus: 'ON',
    ignition: true,
    location: 'Dumping Point',
    segment: 'Dump Area',
  },
  {
    time: '09:11',
    timestamp: '2026-09-07 09:11:00',
    latitude: -2.18136,
    longitude: 115.11347,
    speed: 9,
    fuelLevel: 3944,
    fuelVolume: 192.5,
    engineStatus: 'ON',
    ignition: true,
    location: 'Dumping Point',
    segment: 'Dump Area',
  },
  {
    time: '09:18',
    timestamp: '2026-09-07 09:18:00',
    latitude: -2.18136,
    longitude: 115.11347,
    speed: 0,
    fuelLevel: 3943,
    fuelVolume: 192.5,
    engineStatus: 'OFF',
    ignition: false,
    location: 'Dumping Point',
    segment: 'Dump Area',
    event: 'Stop',
  },
];

const DUMMY_EVENTS: PlaybackEvent[] = [
  {
    key: 1,
    time: '07:29',
    type: 'Overspeed',
    location: 'Hauling Road KM 03',
    speed: 44,
    description: 'Speed above site limit 40 km/h',
  },
  {
    key: 2,
    time: '08:22',
    type: 'Fuel Decrease',
    location: 'Loading Point',
    speed: 0,
    description: 'Fuel level decreased while unit stopped',
  },
  {
    key: 3,
    time: '08:31',
    type: 'Movement',
    location: 'Exit Pit D',
    speed: 18,
    description: 'Unit resumed movement',
  },
];

const getEventColor = (event?: string) => {
  if (event === 'Fuel Decrease') return '#dc2626';
  if (event === 'Overspeed') return '#f59e0b';
  if (event === 'Stop') return '#64748b';
  return '#1677ff';
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const PlaybackUnitHistoryPage = () => {
  const navigate = useNavigate();

  const [equipment, setEquipment] = useState('DT10300');
  const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs('2026-09-07 07:00'),
    dayjs('2026-09-07 10:00'),
  ]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentPoint = DUMMY_PLAYBACK[currentIndex];

  useEffect(() => {
    if (!isPlaying) return;

    const timer = window.setInterval(() => {
      setCurrentIndex((index) => {
        if (index >= DUMMY_PLAYBACK.length - 1) {
          setIsPlaying(false);
          return index;
        }
        return index + 1;
      });
    }, 850);

    return () => window.clearInterval(timer);
  }, [isPlaying]);

  const chartData = useMemo(
    () =>
      DUMMY_PLAYBACK.map((point, index) => ({
        ...point,
        index,
        fuel: point.fuelVolume,
      })),
    [],
  );

  const routePoints = useMemo(() => {
    const width = 880;
    const height = 360;
    const padding = 48;
    const lats = DUMMY_PLAYBACK.map((point) => point.latitude);
    const longs = DUMMY_PLAYBACK.map((point) => point.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLong = Math.min(...longs);
    const maxLong = Math.max(...longs);

    return DUMMY_PLAYBACK.map((point) => {
      const x =
        padding +
        ((point.longitude - minLong) / Math.max(maxLong - minLong, 0.0001)) *
          (width - padding * 2);
      const y =
        height -
        padding -
        ((point.latitude - minLat) / Math.max(maxLat - minLat, 0.0001)) *
          (height - padding * 2);

      return { x, y };
    });
  }, []);

  const routePolyline = routePoints.map((point) => `${point.x},${point.y}`).join(' ');
  const completedPolyline = routePoints
    .slice(0, currentIndex + 1)
    .map((point) => `${point.x},${point.y}`)
    .join(' ');

  const startPoint = routePoints[0];
  const playbackPoint = routePoints[currentIndex];

  const distanceKm = 12.6;
  const movingMinutes = 72;
  const stoppedMinutes = 28;
  const maxSpeed = Math.max(...DUMMY_PLAYBACK.map((point) => point.speed));
  const avgSpeed = Math.round(
    DUMMY_PLAYBACK.reduce((sum, point) => sum + point.speed, 0) /
      DUMMY_PLAYBACK.length,
  );
  const startFuel = DUMMY_PLAYBACK[0].fuelVolume;
  const currentFuel = currentPoint.fuelVolume;
  const fuelUsed = Math.max(startFuel - currentFuel, 0);

  const resetPlayback = () => {
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  const handleFilter = () => {
    resetPlayback();
  };

  return (
    <>
      <PageHeader
        title="Playback Unit History"
        extra={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/report')}
            >
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
        <Card
          bordered={false}
          style={{
            marginBottom: 16,
            borderRadius: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
          bodyStyle={{ padding: 18 }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col flex="0 0 auto">
              <img
                src={rmkoLogo}
                alt="PT Royaltama Mulia Kontraktorindo Tbk"
                style={{ height: 54, width: 'auto' }}
              />
            </Col>

            <Col flex="1 1 260px">
              <Title level={4} style={{ margin: 0, color: '#1e3a8a' }}>
                Unit History Playback
              </Title>
              <Text type="secondary">
                Simulasi histori perjalanan unit berdasarkan data GPS, engine,
                fuel, dan event.
              </Text>
            </Col>

            <Col>
              <Space wrap>
                <Select
                  value={equipment}
                  onChange={setEquipment}
                  options={EQUIPMENT_OPTIONS}
                  style={{ width: 150 }}
                  placeholder="Select unit"
                />

                <RangePicker
                  value={range}
                  showTime={{ format: 'HH:mm' }}
                  format="DD/MM/YYYY HH:mm"
                  onChange={(values) => {
                    if (values?.[0] && values?.[1]) {
                      setRange([values[0], values[1]]);
                    }
                  }}
                  allowClear={false}
                />

                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={handleFilter}
                >
                  Load History
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card bordered={false} style={{ borderRadius: 10 }}>
              <Statistic
                title="Distance"
                value={distanceKm}
                precision={1}
                suffix="km"
                prefix={<EnvironmentOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card bordered={false} style={{ borderRadius: 10 }}>
              <Statistic title="Moving Time" value={movingMinutes} suffix="min" />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card bordered={false} style={{ borderRadius: 10 }}>
              <Statistic title="Stopped Time" value={stoppedMinutes} suffix="min" />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card bordered={false} style={{ borderRadius: 10 }}>
              <Statistic
                title="Avg. Speed"
                value={avgSpeed}
                suffix="km/h"
                prefix={<ThunderboltOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card bordered={false} style={{ borderRadius: 10 }}>
              <Statistic title="Max Speed" value={maxSpeed} suffix="km/h" />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card bordered={false} style={{ borderRadius: 10 }}>
              <Statistic
                title="Fuel Used"
                value={fuelUsed}
                precision={1}
                suffix="L"
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} xl={15}>
            <Card
              bordered={false}
              title={
                <Flex align="center" justify="space-between">
                  <span style={{ color: '#1e3a8a', fontWeight: 700 }}>
                    Route Playback
                  </span>
                  <Space size={8}>
                    <Tag color={currentPoint.engineStatus === 'ON' ? 'green' : 'default'}>
                      Engine {currentPoint.engineStatus}
                    </Tag>
                    <Tag>{currentPoint.speed} km/h</Tag>
                  </Space>
                </Flex>
              }
              style={{ borderRadius: 10, height: '100%' }}
              bodyStyle={{ padding: 0 }}
            >
              <div
                style={{
                  position: 'relative',
                  height: 420,
                  background:
                    'linear-gradient(rgba(255,255,255,0.84), rgba(255,255,255,0.84)), repeating-linear-gradient(0deg, transparent, transparent 39px, #dfe6ee 40px), repeating-linear-gradient(90deg, transparent, transparent 79px, #dfe6ee 80px)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: 16,
                    top: 16,
                    zIndex: 2,
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    padding: '8px 12px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
                  }}
                >
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Current Position</div>
                  <div style={{ fontWeight: 700, color: '#1f2937' }}>
                    {currentPoint.latitude.toFixed(5)}, {currentPoint.longitude.toFixed(5)}
                  </div>
                </div>

                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 880 360"
                  preserveAspectRatio="none"
                  style={{ position: 'absolute', inset: 0 }}
                >
                  <polyline
                    points={routePolyline}
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.35"
                  />
                  <polyline
                    points={routePolyline}
                    fill="none"
                    stroke="#64748b"
                    strokeWidth="3"
                    strokeDasharray="7 7"
                    opacity="0.7"
                  />
                  {currentIndex > 0 && (
                    <polyline
                      points={completedPolyline}
                      fill="none"
                      stroke="#1677ff"
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {startPoint && (
                    <g>
                      <circle cx={startPoint.x} cy={startPoint.y} r="12" fill="#22c55e" />
                      <circle cx={startPoint.x} cy={startPoint.y} r="5" fill="#fff" />
                    </g>
                  )}

                  {playbackPoint && (
                    <g>
                      <circle
                        cx={playbackPoint.x}
                        cy={playbackPoint.y}
                        r="17"
                        fill="#1677ff"
                        opacity="0.18"
                      />
                      <circle
                        cx={playbackPoint.x}
                        cy={playbackPoint.y}
                        r="8"
                        fill="#1677ff"
                        stroke="#fff"
                        strokeWidth="3"
                      />
                    </g>
                  )}

                  {routePoints.map((point, index) => {
                    const item = DUMMY_PLAYBACK[index];
                    if (!item.event) return null;

                    return (
                      <g key={`${item.time}-${item.event}`}>
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r="7"
                          fill={getEventColor(item.event)}
                          stroke="#fff"
                          strokeWidth="2"
                        />
                      </g>
                    );
                  })}
                </svg>

                <div
                  style={{
                    position: 'absolute',
                    left: 18,
                    right: 18,
                    bottom: 18,
                    display: 'flex',
                    justifyContent: 'space-between',
                    pointerEvents: 'none',
                  }}
                >
                  <Tag color="green">START · {DUMMY_PLAYBACK[0].time}</Tag>
                  <Tag color="blue">END · {DUMMY_PLAYBACK[DUMMY_PLAYBACK.length - 1].time}</Tag>
                </div>
              </div>

              <div style={{ padding: '14px 18px 18px' }}>
                <Flex justify="space-between" align="center" style={{ marginBottom: 10 }}>
                  <Space>
                    <Button
                      type="primary"
                      icon={isPlaying ? <PauseOutlined /> : <PlayCircleOutlined />}
                      onClick={() => setIsPlaying((value) => !value)}
                    >
                      {isPlaying ? 'Pause' : 'Play'}
                    </Button>
                    <Button onClick={resetPlayback}>Reset</Button>
                  </Space>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>Playback Time</div>
                    <div style={{ fontSize: 17, fontWeight: 700 }}>{currentPoint.timestamp}</div>
                  </div>
                </Flex>

                <input
                  aria-label="Playback timeline"
                  type="range"
                  min={0}
                  max={DUMMY_PLAYBACK.length - 1}
                  value={currentIndex}
                  onChange={(event) =>
                    setCurrentIndex(
                      clamp(Number(event.target.value), 0, DUMMY_PLAYBACK.length - 1),
                    )
                  }
                  style={{ width: '100%', accentColor: '#1677ff', cursor: 'pointer' }}
                />

                <Flex justify="space-between" style={{ marginTop: 4 }}>
                  <Text type="secondary">{DUMMY_PLAYBACK[0].time}</Text>
                  <Text strong>{currentPoint.time}</Text>
                  <Text type="secondary">
                    {DUMMY_PLAYBACK[DUMMY_PLAYBACK.length - 1].time}
                  </Text>
                </Flex>
              </div>
            </Card>
          </Col>

          <Col xs={24} xl={9}>
            <Card
              bordered={false}
              title="Current Unit Information"
              style={{ borderRadius: 10, marginBottom: 16 }}
            >
              <Row gutter={[12, 18]}>
                <Col span={12}>
                  <Text type="secondary">Equipment</Text>
                  <div style={{ fontSize: 19, fontWeight: 700 }}>{equipment}</div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Segment</Text>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{currentPoint.segment}</div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Location</Text>
                  <div style={{ fontWeight: 600 }}>{currentPoint.location}</div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Ignition</Text>
                  <div>
                    <Tag color={currentPoint.ignition ? 'green' : 'default'}>
                      {currentPoint.ignition ? 'ON' : 'OFF'}
                    </Tag>
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Fuel Volume</Text>
                  <div style={{ fontSize: 21, fontWeight: 700 }}>
                    {currentFuel.toFixed(1)} L
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Fuel Level (LLS)</Text>
                  <div style={{ fontSize: 21, fontWeight: 700 }}>
                    {currentPoint.fuelLevel.toFixed(0)}
                  </div>
                </Col>
              </Row>

              <Divider style={{ margin: '18px 0 12px' }} />

              <Flex justify="space-between" align="center" style={{ marginBottom: 6 }}>
                <Text type="secondary">Fuel Capacity Utilization</Text>
                <Text strong>{((currentFuel / 200) * 100).toFixed(1)}%</Text>
              </Flex>
              <Progress
                percent={Number(((currentFuel / 200) * 100).toFixed(1))}
                showInfo={false}
                strokeColor="#1677ff"
              />
            </Card>

            <Card
              bordered={false}
              title="Playback Status"
              style={{ borderRadius: 10 }}
            >
              <Space direction="vertical" size={10} style={{ width: '100%' }}>
                <Flex justify="space-between">
                  <Text type="secondary">Status</Text>
                  <Tag color={currentPoint.speed > 0 ? 'green' : 'default'}>
                    {currentPoint.speed > 0 ? 'MOVING' : 'STOPPED'}
                  </Tag>
                </Flex>
                <Flex justify="space-between">
                  <Text type="secondary">Speed</Text>
                  <Text strong>{currentPoint.speed} km/h</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text type="secondary">Fuel Difference</Text>
                  <Text strong>{fuelUsed.toFixed(1)} L</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text type="secondary">GNSS</Text>
                  <Tag color="green">VALID</Tag>
                </Flex>
                <Flex justify="space-between">
                  <Text type="secondary">Last Update</Text>
                  <Text strong>{currentPoint.timestamp}</Text>
                </Flex>
              </Space>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} xl={14}>
            <Card
              bordered={false}
              title="Speed & Fuel History"
              style={{ borderRadius: 10 }}
            >
              <div style={{ width: '100%', height: 310 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 22, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="time"
                      interval={1}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis
                      yAxisId="speed"
                      width={42}
                      allowDecimals={false}
                      tick={{ fontSize: 10 }}
                      label={{
                        value: 'km/h',
                        angle: -90,
                        position: 'insideLeft',
                        fontSize: 10,
                      }}
                    />
                    <YAxis
                      yAxisId="fuel"
                      orientation="right"
                      width={44}
                      domain={['dataMin - 1', 'dataMax + 1']}
                      tick={{ fontSize: 10 }}
                      label={{
                        value: 'L',
                        angle: 90,
                        position: 'insideRight',
                        fontSize: 10,
                      }}
                    />
                    <Tooltip />
                    <Legend />
                    <ReferenceLine
                      yAxisId="speed"
                      y={40}
                      stroke="#f59e0b"
                      strokeDasharray="5 5"
                      label={{ value: 'Site Limit', fontSize: 10, position: 'insideTopRight' }}
                    />
                    <Line
                      yAxisId="speed"
                      type="monotone"
                      dataKey="speed"
                      name="Speed"
                      stroke="#1677ff"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      yAxisId="fuel"
                      type="monotone"
                      dataKey="fuel"
                      name="Fuel Volume"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>

          <Col xs={24} xl={10}>
            <Card
              bordered={false}
              title="Event Timeline"
              style={{ borderRadius: 10, height: '100%' }}
            >
              <Space direction="vertical" size={14} style={{ width: '100%' }}>
                {DUMMY_EVENTS.map((event) => (
                  <div
                    key={event.key}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '70px 110px 1fr',
                      gap: 10,
                      alignItems: 'start',
                    }}
                  >
                    <Text strong>{event.time}</Text>
                    <Tag color={getEventColor(event.type)}>{event.type}</Tag>
                    <div>
                      <div style={{ fontWeight: 600 }}>{event.location}</div>
                      <Text type="secondary">{event.description}</Text>
                    </div>
                  </div>
                ))}
              </Space>

              <Divider />

              <Flex justify="space-between">
                <Text type="secondary">Total Events</Text>
                <Text strong>{DUMMY_EVENTS.length}</Text>
              </Flex>
            </Card>
          </Col>
        </Row>

        <Card
          bordered={false}
          title="Unit Position History"
          style={{ marginTop: 16, borderRadius: 10 }}
        >
          <Table
            rowKey="timestamp"
            size="small"
            pagination={{ pageSize: 8, showSizeChanger: false }}
            columns={[
              {
                title: 'Time',
                dataIndex: 'timestamp',
                width: 170,
                render: (value: string) => value,
              },
              {
                title: 'Location',
                dataIndex: 'location',
                width: 180,
              },
              {
                title: 'Segment',
                dataIndex: 'segment',
                width: 140,
              },
              {
                title: 'Latitude',
                dataIndex: 'latitude',
                width: 120,
                render: (value: number) => value.toFixed(5),
              },
              {
                title: 'Longitude',
                dataIndex: 'longitude',
                width: 120,
                render: (value: number) => value.toFixed(5),
              },
              {
                title: 'Speed',
                dataIndex: 'speed',
                width: 95,
                render: (value: number) => `${value} km/h`,
              },
              {
                title: 'Fuel',
                dataIndex: 'fuelVolume',
                width: 90,
                render: (value: number) => `${value.toFixed(1)} L`,
              },
              {
                title: 'Engine',
                dataIndex: 'engineStatus',
                width: 90,
                render: (value: string) => (
                  <Tag color={value === 'ON' ? 'green' : 'default'}>{value}</Tag>
                ),
              },
              {
                title: 'Event',
                dataIndex: 'event',
                render: (value?: string) =>
                  value ? (
                    <Tag color={getEventColor(value)}>{value}</Tag>
                  ) : (
                    <Text type="secondary">-</Text>
                  ),
              },
            ] as ColumnsType<PlaybackPoint>}
            dataSource={DUMMY_PLAYBACK}
            onRow={(record) => ({
              onClick: () => {
                const index = DUMMY_PLAYBACK.findIndex(
                  (point) => point.timestamp === record.timestamp,
                );
                if (index >= 0) setCurrentIndex(index);
              },
              style: {
                cursor: 'pointer',
                background:
                  record.timestamp === currentPoint.timestamp ? '#eaf3ff' : undefined,
              },
            })}
          />
        </Card>

        <div style={{ marginTop: 12, textAlign: 'right' }}>
          <Text type="secondary">
            Dummy data untuk kebutuhan UI/flow testing — belum terhubung ke API playback.
          </Text>
        </div>
      </div>
    </>
  );
};

export default PlaybackUnitHistoryPage;
