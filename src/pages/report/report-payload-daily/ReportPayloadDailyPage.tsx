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
import { useWeighbridgePayloadDaily } from '@/pages/upload-data/weighbridge/useWeighbridge';
import type {
  WeighbridgePayloadDailyParams,
  WeighbridgePayloadDailyRow,
} from '@/types/weighbridge.types';

const { Text } = Typography;

const formatPayload = (value?: number) =>
  value === undefined ? '-' : value.toFixed(2);

// Rata-rata payload hanya dari hari yang ada transaksi (nilai > 0).
const averagePayload = (row: WeighbridgePayloadDailyRow) => {
  const filled = Object.values(row.values).filter((value) => value > 0);
  if (filled.length === 0) return 0;
  return filled.reduce((sum, value) => sum + value, 0) / filled.length;
};

const ReportPayloadDailyPage = () => {
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(true);
  const [appliedValues, setAppliedValues] = useState<ReportFilterValues | null>(null);

  const params = useMemo<WeighbridgePayloadDailyParams | null>(() => {
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

  const { data: report, isFetching } = useWeighbridgePayloadDaily(params);

  const dayKeys = useMemo(() => report?.days ?? [], [report]);
  const rowList = useMemo(() => report?.data ?? [], [report]);

  const columns = useMemo<ColumnsType<WeighbridgePayloadDailyRow>>(() => {
    const dayColumns: ColumnsType<WeighbridgePayloadDailyRow> = dayKeys.map((day) => ({
      title: dayjs(day).format('DD-MMM'),
      dataIndex: ['values', day],
      width: 74,
      align: 'center',
      render: (value?: number) => (
        <Text style={{ fontSize: 12, color: '#1f2937' }}>
          {value ? formatPayload(value) : '-'}
        </Text>
      ),
    }));

    return [
      { title: 'No', key: 'index', width: 20, align: 'center', fixed: 'left', render: (_v, _r, index) => index + 1 },
      { title: 'Asset ID', dataIndex: 'equipment_code', width: 50, fixed: 'left',render: (value) => <span style={{ fontWeight: 600 }}>{value}</span> },
      { title: 'UoM', key: 'uom', width: 30, align: 'center', fixed: 'left', render: () => 'ton/rit' },
      ...dayColumns,
      {
        title: 'Average',
        key: 'average',
        width: 110,
        align: 'center',
        fixed: 'right',
        render: (_v, row) => <Tag color="blue">{formatPayload(averagePayload(row))}</Tag>,
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
        UoM: 'ton/rit',
      };

      dayKeys.forEach((day) => {
        record[dayjs(day).format('DD-MMM')] = row.values[day] ? formatPayload(row.values[day]) : '-';
      });

      record.Average = formatPayload(averagePayload(row));
      return record;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payload Daily');

    XLSX.writeFile(wb, `payload-daily_${params?.start_date}_${params?.end_date}.xlsx`);
  }, [rowList, dayKeys, params]);

  return (
    <>
      <PageHeader
        title="Report Payload Daily"
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
          <Text type="secondary">Terapkan filter untuk melihat data report payload daily.</Text>
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
        title="Report Payload Daily — Filter"
        dateMode="range"
        initialValues={appliedValues ?? undefined}
        onClose={() => setFilterOpen(false)}
        onApply={handleApply}
      />
    </>
  );
};

export default ReportPayloadDailyPage;
