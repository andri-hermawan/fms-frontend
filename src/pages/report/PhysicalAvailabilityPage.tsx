import { useCallback, useMemo, useState } from 'react';
import { Button, Card, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import PageHeader from '@/components/ui/PageHeader';
import ReportFilter from '@/components/report/ReportFilter';
import type { ReportFilterValues } from '@/components/report/ReportFilter';

const { Text } = Typography;

type PhysicalAvailabilityRow = {
  key: number;
  assetId: string;
  capacityTon: number;
  uom: string;
  daily: Record<string, number | undefined>;
  mtd: number;
};

// Dummy availability (%) per tanggal; hari tanpa data dibiarkan undefined.
const PHYSICAL_AVAILABILITY: PhysicalAvailabilityRow[] = [
  {
    key: 1,
    assetId: 'DT10138',
    capacityTon: 24,
    uom: 'ton',
    daily: {
      '01': 100, '02': 100, '03': 100, '04': 100, '05': 100, '06': 100,
      '07': 100, '08': 100, '09': 100, '10': 100, '11': 0, '12': 0,
      '13': 0, '14': 0, '15': 0, '16': 15, '17': 100, '18': 100,
      '19': 100, '20': 100, '21': 100, '22': 100, '23': 100, '24': 100,
    },
    mtd: 76,
  },
  {
    key: 2,
    assetId: 'DT10193',
    capacityTon: 24,
    uom: 'ton',
    daily: {
      '01': 97, '02': 40, '03': 64, '04': 87, '05': 22, '06': 67,
      '07': 100, '08': 75, '09': 0, '10': 0, '11': 0, '12': 21,
      '13': 100, '14': 100, '15': 100, '16': 100, '17': 100, '18': 100,
      '19': 100, '20': 100, '21': 100, '22': 100, '23': 100, '24': 100,
    },
    mtd: 74,
  },
];

const formatPercent = (value?: number) =>
  value === undefined ? '-' : `${value}%`;


const PhysicalAvailabilityPage = () => {
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(true);
  const [appliedValues, setAppliedValues] = useState<ReportFilterValues | null>(null);

  const month = useMemo(
    () => dayjs(appliedValues?.date ?? dayjs().format('YYYY-MM-DD')),
    [appliedValues],
  );
  const daysInMonth = month.daysInMonth();

  const dayKeys = useMemo(
    () =>
      Array.from({ length: daysInMonth }, (_, index) =>
        String(index + 1).padStart(2, '0'),
      ),
    [daysInMonth],
  );

  const columns = useMemo<ColumnsType<PhysicalAvailabilityRow>>(() => {
    const dayColumns: ColumnsType<PhysicalAvailabilityRow> = dayKeys.map((day) => ({
      title: `${day}-${month.format('MMM')}`,
      dataIndex: ['daily', day],
      width: 74,
      align: 'center',
      render: (value?: number) => (
        <Text
          style={{
            fontSize: 12,
            color: value === undefined ? '#bfbfbf' : value === 0 ? '#cf1322' : '#1f2937',
          }}
        >
          {formatPercent(value)}
        </Text>
      ),
    }));

    return [
      { title: 'No', key: 'index', width: 58, align: 'center', fixed: 'left', render: (_v, _r, index) => index + 1 },
      { title: 'Asset ID', dataIndex: 'assetId', width: 90, fixed: 'left' },
      {
        title: 'Capacity',
        dataIndex: 'capacityTon',
        width: 80,
        align: 'right',
        render: (value: number) => `${value} Ton`, fixed: 'left'
      },
      { title: 'UoM', dataIndex: 'uom', width: 70, align: 'center', fixed: 'left' },
      ...dayColumns,
      {
        title: `MTD ${month.format('DD-MMM')}`,
        dataIndex: 'mtd',
        width: 130,
        align: 'center',
        fixed: 'right',
        render: (value: number) => <Tag color="blue">{value}%</Tag>,
      },
    ];
  }, [dayKeys, month]);

  const rowList = useMemo(() => {
    const assetId = appliedValues?.equipmentId;
    if (!assetId) return PHYSICAL_AVAILABILITY;
    return PHYSICAL_AVAILABILITY.filter((row) => row.assetId === assetId);
  }, [appliedValues]);

  const handleApply = (values: ReportFilterValues) => {
    setAppliedValues(values);
    setFilterOpen(false);
  };

  const handleDownload = useCallback(() => {
    if (rowList.length === 0) return;

    const exportData = rowList.map((row, index) => {
      const record: Record<string, string | number> = {
        No: index + 1,
        'Asset ID': row.assetId,
        Capacity: `${row.capacityTon} Ton`,
        UoM: row.uom,
      };

      dayKeys.forEach((day) => {
        record[`${day}-${month.format('MMM')}`] = formatPercent(row.daily[day]);
      });

      record[`MTD ${month.format('DD-MMM')}`] = `${row.mtd}%`;
      return record;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Physical Availability');

    XLSX.writeFile(wb, `physical-availability_${month.format('YYYY-MM')}.xlsx`);
  }, [rowList, dayKeys, month]);

  return (
    <>
      <PageHeader
        title="Physical Availability Report (Dalam proses pengembangan)"
        extra={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/report')}>
              Back to Reports
            </Button>
            <Button icon={<FilterOutlined />} onClick={() => setFilterOpen(true)}>
              Filter
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleDownload}
              disabled={rowList.length === 0}
            >
              Download
            </Button>
          </Space>
        }
      />
      <Card>
        {rowList.length === 0 ? (
          <Text type="secondary">Terapkan filter untuk melihat data physical availability.</Text>
        ) : (
          <Table
            className="custom-table"
            rowKey="key"
            size="small"
            sticky
            pagination={false}
            columns={columns}
            dataSource={rowList}
            scroll={{ x: 'max-content', y: 'calc(100vh - 240px)' }}
          />
        )}
      </Card>
      <ReportFilter
        open={filterOpen}
        title="Physical Availability — Filter"
        dateMode="single"
        showShift={false}
        initialValues={appliedValues ?? undefined}
        onClose={() => setFilterOpen(false)}
        onApply={handleApply}
      />
    </>
  );
};

export default PhysicalAvailabilityPage;
