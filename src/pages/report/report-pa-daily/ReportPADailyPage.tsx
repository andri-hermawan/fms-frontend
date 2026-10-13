import { useCallback, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { Button, Card, Space, Table, Typography } from 'antd';
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

const HOURS_PER_DAY = 24;
const HOURS_PER_SHIFT = 12;

const formatPercent = (value?: number) =>
  value === undefined ? '-' : `${Math.round(value)}`; //kalo mau pake persen tambahkan saja

// PA (%) = (jam tersedia - durasi breakdown) / jam tersedia. Boleh negatif
// bila breakdown melebihi jam tersedia (ditandai hitam).
const calcPA = (breakdownHours: number, availableHours: number) =>
  ((availableHours - breakdownHours) / availableHours) * 100;

// Warna sel mengikuti legend conditional formatting (nilai = PA / 100).
const paCellStyle = (pa: number): CSSProperties => {
  const ratio = pa / 100;
  if (ratio < 0) return { background: '#000000', color: '#ffffff' };
  if (ratio >= 0.9) return { background: '#c6efce', color: '#006100' };
  if (ratio >= 0.75) return { background: '#dce9f5', color: '#1f7ac4' };
  if (ratio >= 0.6) return { background: '#ffeb9c', color: '#9c5700' };
  return { background: '#ffc7ce', color: '#9c0006' };
};

const ReportPADailyPage = () => {
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(true);
  const [appliedValues, setAppliedValues] = useState<ReportFilterValues | null>(null);

  // Tanpa filter shift: basis 24 jam/hari; dengan filter shift: 12 jam/shift.
  const availableHours = appliedValues?.shift ? HOURS_PER_SHIFT : HOURS_PER_DAY;

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

  const averagePA = useCallback(
    (row: BreakdownStatusDailyRow) => {
      if (dayKeys.length === 0) return 0;
      const total = dayKeys.reduce(
        (sum, day) => sum + calcPA(row.values[day] ?? 0, availableHours),
        0,
      );
      return total / dayKeys.length;
    },
    [dayKeys, availableHours],
  );

  const columns = useMemo<ColumnsType<BreakdownStatusDailyRow>>(() => {
    const dayColumns: ColumnsType<BreakdownStatusDailyRow> = dayKeys.map((day) => ({
      title: dayjs(day).format('DD-MMM'),
      key: day,
      width: 74,
      align: 'center',
      onCell: (row) => ({
        style: paCellStyle(calcPA(row.values[day] ?? 0, availableHours)),
      }),
      render: (_v, row) => (
        <span style={{ fontSize: 12 }}>
          {formatPercent(calcPA(row.values[day] ?? 0, availableHours))}
        </span>
      ),
    }));

    return [
      { title: 'No', key: 'index', width: 20, align: 'center', fixed: 'left', render: (_v, _r, index) => index + 1 },
      { title: 'Asset ID', dataIndex: 'equipment_code', width: 50, fixed: 'left',render: (value) => <span style={{ fontWeight: 600 }}>{value}</span> },
      { title: 'UoM', key: 'uom', width: 30, align: 'center', fixed: 'left', render: () => '%' },
      ...dayColumns,
      {
        title: 'Average',
        key: 'average',
        width: 110,
        align: 'center',
        fixed: 'right',
        onCell: (row) => ({ style: paCellStyle(averagePA(row)) }),
        render: (_v, row) => formatPercent(averagePA(row)),
      },
    ];
  }, [dayKeys, availableHours, averagePA]);

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
        UoM: '%',
      };

      dayKeys.forEach((day) => {
        record[dayjs(day).format('DD-MMM')] = formatPercent(
          calcPA(row.values[day] ?? 0, availableHours),
        );
      });

      record.Average = formatPercent(averagePA(row));
      return record;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Physical Availability');

    XLSX.writeFile(wb, `pa-daily_${params?.start_date}_${params?.end_date}.xlsx`);
  }, [rowList, dayKeys, params, availableHours, averagePA]);

  return (
    <>
      <PageHeader
        title="Report PA Daily"
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
          <Text type="secondary">Terapkan filter untuk melihat data report PA daily.</Text>
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
        title="Report PA Daily — Filter"
        dateMode="range"
        initialValues={appliedValues ?? undefined}
        onClose={() => setFilterOpen(false)}
        onApply={handleApply}
      />
    </>
  );
};

export default ReportPADailyPage;
