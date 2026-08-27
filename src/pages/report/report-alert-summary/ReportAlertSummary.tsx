import { useState } from 'react';
import { Button, Card, Space, Typography } from 'antd';
import { ArrowLeftOutlined, FilterOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { getAlertCategoryColor } from '@/utils/alert-category';
import PageHeader from '@/components/ui/PageHeader';
import ReportFilter, { type ReportFilterValues } from '@/components/report/ReportFilter';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

// Dummy Data untuk Dashboard
const dummyApiResponse = {
  statusCode: 200,
  message: 'Hourly abnormal activity retrieved successfully',
  data: {
    timeRanges: [
      '07-08', '08-09', '09-10', '10-11', '11-12', '12-13',
      '13-14', '14-15', '15-16', '16-17', '17-18', '18-19',
    ],
    abnormalEventLocation: [
      { initialZone: 'Unknown', fuelDecrease: 0, offTrack: 5, overspeed: 0, underspeed: 0 },
      { initialZone: 'ROM TPB Baru', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'ROM TPB Lama', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'ROM SBL', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'ROM CPM', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'ROM UN', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'ROM SWE', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'ROM DBU', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Trs. TPB Selatan', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Trs. TPB Tengah', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Trs. TPB Utara', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Trs. UN', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Trs. CPM', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Trs. Selatan', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Trs. BTW Lama', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Trs. DBU Km 05', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Trs. DBU Km 04', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Trs. DBU Km 03', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Trs. DBU Km 02', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Trs. DBU Km 01', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Trs. DBU Km 00', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Km 33 - 34', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Km 32 - 33', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Km 31 - 32', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Km 30 - 31', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Km 29 - 30', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Km 28 - 29', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Km 27 - 28', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Km 26 - 27', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 2 },
      { initialZone: 'Km 25 - 26', fuelDecrease: 0, offTrack: 0, overspeed: 5, underspeed: 0 },
      { initialZone: 'Km 24 - 25', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Km 23 - 24', fuelDecrease: 3, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Km 22 - 23', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 6 },
      { initialZone: 'Km 21 - 22', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Km 20 - 21', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Km 19 - 20', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Km 18 - 19', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Km 17 - 18', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Km 16 - 17', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Km 15 - 16', fuelDecrease: 0, offTrack: 0, overspeed: 1, underspeed: 0 },
      { initialZone: 'Km 14 - 15', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Km 13 - 14', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Km 12 - 13', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Km 11 - 12', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Km 10 - 11', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Km 09 - 10', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Km 08 - 09', fuelDecrease: 1, offTrack: 0, overspeed: 2, underspeed: 4 },
      { initialZone: 'Km 07 - 08', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Km 06 - 07', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Km 05 - 06', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Km 04 - 05', fuelDecrease: 0, offTrack: 0, overspeed: 4, underspeed: 0 },
      { initialZone: 'Km 03 - 04', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Km 02 - 03', fuelDecrease: 0, offTrack: 0, overspeed: 2, underspeed: 0 },
      { initialZone: 'Km 01 - 02', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Km 00 - 01', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Jalan Emplas', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Jalan Sp. Sido', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'Emplas', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
      { initialZone: 'CSA Sp. Sido', fuelDecrease: 0, offTrack: 0, overspeed: 0, underspeed: 0 },
    ],
    hourlyFrequency: {
      'Fuel Decrease': [0, 0, 0, 0, 2, 0, 0, 0, 0, 1, 1, 0],
      'Off Track': [1, 1, 0, 2, 0, 0, 1, 0, 0, 0, 0, 0],
      Overspeed: [0, 0, 0, 3, 2, 0, 1, 1, 1, 4, 2, 0],
      Underspeed: [0, 1, 0, 3, 2, 0, 0, 2, 0, 3, 1, 0],
    },
    equipmentQuantity: {
      'Fuel Decrease': [0, 0, 0, 0, 2, 0, 0, 0, 0, 1, 1, 0],
      'Off Track': [1, 1, 0, 2, 0, 0, 1, 0, 0, 0, 0, 0],
      Overspeed: [0, 0, 0, 3, 2, 0, 1, 1, 1, 4, 2, 0],
      Underspeed: [0, 1, 0, 3, 2, 0, 0, 2, 0, 3, 1, 0],
    },
  },
}

const dummyData = {
  alerts: [
    {
      title: "Fuel Decrease",
      empty: { events: 4, dt: 4 },
      loaded: { events: 0, dt: 0 }
    },
    {
      title: "Off Track",
      empty: { events: 4, dt: 4 },
      loaded: { events: 1, dt: 1 }
    },
    {
      title: "Overspeed",
      empty: { events: 11, dt: 8 },
      loaded: { events: 3, dt: 2 }
    },
    {
      title: "Underspeed",
      empty: { events: 7, dt: 5 },
      loaded: { events: 5, dt: 3 }
    }
  ],
};

const ReportAlertSummaryPage = () => {
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(true);
  const [filterValues, setFilterValues] = useState<ReportFilterValues>({});

  const hasFilter = Boolean(filterValues.date && filterValues.shift);

  const handleApplyFilter = (values: ReportFilterValues) => {
    setFilterValues(values);
    setFilterOpen(false);
  };

  const locationChartData = dummyApiResponse.data.abnormalEventLocation.map((location) => ({
    name: location.initialZone,
    fuelDecrease: location.fuelDecrease,
    offTrack: location.offTrack,
    overspeed: location.overspeed,
    underspeed: location.underspeed,
  }))

  const hourlyCategories = ['Fuel Decrease', 'Off Track', 'Overspeed', 'Underspeed']

  const hourlyFrequencyValues = dummyApiResponse.data.hourlyFrequency

  const hourlyChartData = hourlyCategories.map((category) => ({
    category,
    data: hourlyFrequencyValues[category as keyof typeof hourlyFrequencyValues].map((count, i) => {
      return {
        name: dummyApiResponse.data.timeRanges[i],
        count,
      }
    }),
  }))

  const equipmentQuantityValues = dummyApiResponse.data.equipmentQuantity

  const equipmentQtyChartData = hourlyCategories.map((category) => ({
    category,
    data: equipmentQuantityValues[category as keyof typeof equipmentQuantityValues].map((count, i) => {
      return {
        name: dummyApiResponse.data.timeRanges[i],
        count,
      }
    }),
  }))

  return (
    <>
      <PageHeader
        title="Report Alert Summary"
        subtitle="Ringkasan alert dan aktivitas abnormal per periode"
        extra={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/report')}>
              Back to Reports
            </Button>
            {hasFilter && (
              <Button icon={<FilterOutlined />} onClick={() => setFilterOpen(true)}>
                Filter
              </Button>
            )}
          </Space>
        }
      />

      {!hasFilter ? (
        <Card>
          <Space direction="vertical">
            <Text type="secondary">Terapkan filter tanggal dan shift untuk melihat report alert summary.</Text>
            <Button type="primary" icon={<FilterOutlined />} onClick={() => setFilterOpen(true)}>
              Buka Filter
            </Button>
          </Space>
        </Card>
      ) : (
    <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', background: '#f0f2f5', margin: 0, padding: '20px', color: '#333', minHeight: '100vh' }}>
      
      {/* Header */}
      <div style={{color: 'black', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
        {/* Kiri: Logo */}
        <div style={{ flex: '0 0 auto' }}>
          <img src="/src/assets/rmko/RMKO_logo.png" alt="PT Royaltama Mulia Kontraktorindo Tbk" style={{ height: 64, width: 'auto' }} />
        </div>

        {/* Tengah: Judul + info */}
        <div style={{ textAlign: 'center', flex: 1 }}>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '26px', letterSpacing: 1, fontWeight: 700 }}>RMKO</h1>
          <p style={{ margin: '0 0 8px 0', fontSize: '13px', opacity: 0.9 }}>
            PT Royaltama Mulia Kontraktorindo Tbk
          </p>
          <p style={{ margin: '0', fontSize: '13px', opacity: 0.85 }}>
            <strong>Date:</strong> {new Date().toLocaleDateString('en-GB')} |{' '}
            <strong>Shift:</strong> 1 |{' '}
            <strong>Update Time:</strong> {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Kanan: Logo */}
        {/* <div style={{ flex: '0 0 auto' }}>
          <img src="/src/assets/logo.png" alt="HORSE" style={{ height: 64, width: 'auto' }} />
        </div> */}
      </div>

      {/* Alert Summary Cards */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
        {dummyData.alerts.map((alert, index) => {
          const color = getAlertCategoryColor(alert.title) ?? '#1e3a8a'

          return (
          <div key={index} style={{ background: color, borderRadius: '8px', padding: '20px', flex: 1, minWidth: '220px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0, color: '#fff', borderBottom: '2px solid rgba(255,255,255,0.3)', paddingBottom: '10px', fontSize: '16px' }}>{alert.title}</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', width: '48%', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Empty</h4>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 500 }}>{alert.empty.events} event</p>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 500 }}>{alert.empty.dt} DT</p>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', width: '48%', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Loaded</h4>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 500 }}>{alert.loaded.events} event</p>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 500 }}>{alert.loaded.dt} DT</p>
              </div>
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
                <Bar dataKey="fuelDecrease" name="Fuel Decrease" stackId="alerts" fill={getAlertCategoryColor('Fuel Decrease')} barSize={24}>
                  <LabelList dataKey="fuelDecrease" position="center" fill="#fff" formatter={(value) => value || ''} />
                </Bar>
                <Bar dataKey="offTrack" name="Off Track" stackId="alerts" fill={getAlertCategoryColor('Off Track')} barSize={24}>
                  <LabelList dataKey="offTrack" position="center" fill="#fff" formatter={(value) => value || ''} />
                </Bar>
                <Bar dataKey="overspeed" name="Overspeed" stackId="alerts" fill={getAlertCategoryColor('Overspeed')} barSize={24}>
                  <LabelList dataKey="overspeed" position="center" fill="#fff" formatter={(value) => value || ''} />
                </Bar>
                <Bar dataKey="underspeed" name="Underspeed" stackId="alerts" fill={getAlertCategoryColor('Underspeed')} barSize={24} radius={[0, 4, 4, 0]}>
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
                      <Bar dataKey="count" fill={getAlertCategoryColor(group.category) ?? '#1e3a8a'} barSize={24} radius={[3, 3, 0, 0]} />
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
                        <Bar dataKey="count" fill={getAlertCategoryColor(group.category) ?? '#1e3a8a'} barSize={24} radius={[3, 3, 0, 0]} />
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
      )}

      <ReportFilter
        open={filterOpen}
        title="Report Alert Summary — Filter"
        dateMode="single"
        showEquipment={false}
        onClose={() => setFilterOpen(false)}
        onApply={handleApplyFilter}
      />
    </>
  );
}

export default ReportAlertSummaryPage
