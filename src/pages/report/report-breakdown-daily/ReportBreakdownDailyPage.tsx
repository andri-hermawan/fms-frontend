import { useCallback, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
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
import { useBreakdownStatusDaily } from '@/pages/upload-data/status-breakdown/useBreakdownStatus';
import type {
  BreakdownStatusDailyParams,
  BreakdownStatusDailyRow,
} from '@/types/breakdown-status.types';

const { Text } = Typography;

const formatHour = (value?: number) =>
  value === undefined ? '-' : value.toFixed(2);

// Warna sel saat breakdown melebihi batas jam (samakan dengan merah di Report PA Daily).
const OVER_LIMIT_STYLE: CSSProperties = { background: '#ffc7ce', color: '#9c0006' };

const totalBreakdown = (row: BreakdownStatusDailyRow) =>
  Object.values(row.values).reduce((sum, value) => sum + value, 0);

const ReportBreakdownDailyPage = () => {
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(true);
  const [appliedValues, setAppliedValues] = useState<ReportFilterValues | null>(null);

  const params = useMemo<BreakdownStatusDailyParams | null>(() => {
    const [start, end] = appliedValues?.dateRange ?? [];
    if (!start || !end) return null;
    return {
      start_date: start,
      end_date: end,
      shift: appliedValues?.shift ? [appliedValues.shift] : undefined,
      equipment_code: appliedValues?.equipmentId ? [appliedValues.equipmentId] : undefined,
      max_days: 366,
    };
  }, [appliedValues]);

  const { data: report, isFetching } = useBreakdownStatusDaily(params);

  const dayKeys = useMemo(() => report?.days ?? [], [report]);
  const rowList = useMemo(() => report?.data ?? [], [report]);

  // Batas jam per hari: 12 jam jika filter per shift, 24 jam jika all shift
  const hourLimit = params?.shift?.length ? 12 : 24;

  const columns = useMemo<ColumnsType<BreakdownStatusDailyRow>>(() => {
    const dayColumns: ColumnsType<BreakdownStatusDailyRow> = dayKeys.map((day) => ({
      title: dayjs(day).format('DD-MMM'),
      dataIndex: ['values', day],
      width: 74,
      align: 'center',
      onCell: (row) => ({
        style: (row.values[day] ?? 0) > hourLimit ? OVER_LIMIT_STYLE : undefined,
      }),
      render: (value?: number) => (
        <Text
          style={{
            fontSize: 12,
            color: (value ?? 0) > hourLimit ? OVER_LIMIT_STYLE.color : '#1f2937',
          }}
        >
          {value ? formatHour(value) : '-'}
        </Text>
      ),
    }));

    return [
      { title: 'No', key: 'index', width: 20, align: 'center', fixed: 'left', render: (_v, _r, index) => index + 1 },
      { title: 'Asset ID', dataIndex: 'equipment_code', width: 50, fixed: 'left',render: (value) => <span style={{ fontWeight: 600 }}>{value}</span> },
      { title: 'UoM', key: 'uom', width: 30, align: 'center', fixed: 'left', render: () => 'duration' },
      ...dayColumns,
      {
        title: 'Total',
        key: 'total',
        width: 110,
        align: 'center',
        fixed: 'right',
        render: (_v, row) => <Tag color="blue">{formatHour(totalBreakdown(row))}</Tag>,
      },
    ];
  }, [dayKeys, hourLimit]);

  const handleApply = (values: ReportFilterValues) => {
    setAppliedValues(values);
    setFilterOpen(false);
  };

  const handleDownload = useCallback(() => {
    if (rowList.length === 0) return;

    const exportData = rowList.map((row, index) => {
      const record: Record<string, string | number> = {
        No: index + 1,
        'Asset ID': row.equipment_code,
        UoM: 'duration',
      };

      dayKeys.forEach((day) => {
        record[dayjs(day).format('DD-MMM')] = row.values[day] ? formatHour(row.values[day]) : '-';
      });

      record.Total = formatHour(totalBreakdown(row));
      return record;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Breakdown Daily');

    XLSX.writeFile(wb, `breakdown-daily_${params?.start_date}_${params?.end_date}.xlsx`);
  }, [rowList, dayKeys, params]);

  return (
    <>
      <PageHeader
        title="Report Breakdown Daily"
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
        {!params ? (
          <Text type="secondary">Terapkan filter untuk melihat data report breakdown daily.</Text>
        ) : (
          <Table
            className="custom-table"
            rowKey="equipment_code"
            size="small"
            sticky
            loading={isFetching}
            pagination={false}
            columns={columns}
            dataSource={rowList}
            scroll={{ x: 'max-content', y: 'calc(100vh - 240px)' }}
          />
        )}
      </Card>
      <ReportFilter
        open={filterOpen}
        title="Report Breakdown Daily — Filter"
        dateMode="range"
        initialValues={appliedValues ?? undefined}
        onClose={() => setFilterOpen(false)}
        onApply={handleApply}
      />
    </>
  );
};

export default ReportBreakdownDailyPage;
