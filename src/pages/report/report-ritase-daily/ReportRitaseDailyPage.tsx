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
import { useWeighbridgeRitaseDaily } from '@/pages/upload-data/weighbridge/useWeighbridge';
import type {
  WeighbridgeRitaseDailyParams,
  WeighbridgeRitaseDailyRow,
} from '@/types/weighbridge.types';

const { Text } = Typography;

const formatRitase = (value?: number) => (value ? String(value) : '-');

// Warna sel (sama dengan palet Report PA Daily): kosong/0 tanpa warna.
const ritaseCellStyle = (value?: number): CSSProperties => {
  if (!value || value <= 0) return {};
  if (value < 2) return { background: '#ffc7ce', color: '#9c0006' };
  if (value <= 3) return { background: '#ffeb9c', color: '#9c5700' };
  return { background: '#c6efce', color: '#006100' };
};

const ReportRitaseDailyPage = () => {
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(true);
  const [appliedValues, setAppliedValues] = useState<ReportFilterValues | null>(null);

  const params = useMemo<WeighbridgeRitaseDailyParams | null>(() => {
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

  const { data: report, isFetching } = useWeighbridgeRitaseDaily(params);

  const dayKeys = useMemo(() => report?.days ?? [], [report]);
  const rowList = useMemo(() => report?.data ?? [], [report]);

  const columns = useMemo<ColumnsType<WeighbridgeRitaseDailyRow>>(() => {
    const dayColumns: ColumnsType<WeighbridgeRitaseDailyRow> = dayKeys.map((day) => ({
      title: dayjs(day).format('DD-MMM'),
      dataIndex: ['values', day],
      width: 74,
      align: 'center',
      onCell: (row) => ({ style: ritaseCellStyle(row.values[day]) }),
      render: (value?: number) => (
        <Text style={{ fontSize: 12, color: 'inherit' }}>{formatRitase(value)}</Text>
      ),
    }));

    return [
      { title: 'No', key: 'index', width: 58, align: 'center', fixed: 'left', render: (_v, _r, index) => index + 1 },
      { title: 'Asset ID', dataIndex: 'equipment_code', width: 100, fixed: 'left' },
      ...dayColumns,
      {
        title: 'Total Ritase',
        dataIndex: 'ritase',
        width: 110,
        align: 'center',
        fixed: 'right',
        render: (value: number) => <Tag color="blue">{value}</Tag>,
      },
      {
        title: 'Total Net',
        dataIndex: 'total_net',
        width: 120,
        align: 'right',
        fixed: 'right',
        render: (value: number) => value.toLocaleString('id-ID'),
      },
    ];
  }, [dayKeys]);

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
      };

      dayKeys.forEach((day) => {
        record[dayjs(day).format('DD-MMM')] = formatRitase(row.values[day]);
      });

      record['Total Ritase'] = row.ritase;
      record['Total Net'] = row.total_net;
      return record;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ritase Daily');

    XLSX.writeFile(wb, `ritase-daily_${params?.start_date}_${params?.end_date}.xlsx`);
  }, [rowList, dayKeys, params]);

  return (
    <>
      <PageHeader
        title="Report Ritase Daily"
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
          <Text type="secondary">Terapkan filter untuk melihat data report ritase daily.</Text>
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
        title="Report Ritase Daily — Filter"
        dateMode="range"
        initialValues={appliedValues ?? undefined}
        onClose={() => setFilterOpen(false)}
        onApply={handleApply}
      />
    </>
  );
};

export default ReportRitaseDailyPage;
