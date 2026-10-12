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
import { useWeighbridgeProductionDaily } from '@/pages/upload-data/weighbridge/useWeighbridge';
import type {
  WeighbridgeProductionDailyParams,
  WeighbridgeProductionDailyRow,
} from '@/types/weighbridge.types';

const { Text } = Typography;

const formatTon = (value?: number) =>
  value === undefined ? '-' : value.toFixed(2);

const totalProduction = (row: WeighbridgeProductionDailyRow) =>
  Object.values(row.values).reduce((sum, value) => sum + value, 0);

const ReportProductionDailyPage = () => {
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(true);
  const [appliedValues, setAppliedValues] = useState<ReportFilterValues | null>(null);

  const params = useMemo<WeighbridgeProductionDailyParams | null>(() => {
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

  const { data: report, isFetching } = useWeighbridgeProductionDaily(params);

  const dayKeys = useMemo(() => report?.days ?? [], [report]);
  const rowList = useMemo(() => report?.data ?? [], [report]);

  const columns = useMemo<ColumnsType<WeighbridgeProductionDailyRow>>(() => {
    const dayColumns: ColumnsType<WeighbridgeProductionDailyRow> = dayKeys.map((day) => ({
      title: dayjs(day).format('DD-MMM'),
      dataIndex: ['values', day],
      width: 74,
      align: 'center',
      onCell: (row) =>
        (row.values[day] ?? 0) > 0
          ? { style: { background: '#c6efce', color: '#006100' } }
          : {},
      render: (value?: number) => (
        <Text style={{ fontSize: 12, color: 'inherit' }}>
          {value ? formatTon(value) : '-'}
        </Text>
      ),
    }));

    return [
      { title: 'No', key: 'index', width: 58, align: 'center', fixed: 'left', render: (_v, _r, index) => index + 1 },
      { title: 'Asset ID', dataIndex: 'equipment_code', width: 100, fixed: 'left' },
      { title: 'UoM', key: 'uom', width: 70, align: 'center', fixed: 'left', render: () => 'ton' },
      ...dayColumns,
      {
        title: 'Total',
        key: 'total',
        width: 110,
        align: 'center',
        fixed: 'right',
        render: (_v, row) => <Tag color="blue">{formatTon(totalProduction(row))}</Tag>,
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
        UoM: 'ton',
      };

      dayKeys.forEach((day) => {
        record[dayjs(day).format('DD-MMM')] = row.values[day] ? formatTon(row.values[day]) : '-';
      });

      record.Total = formatTon(totalProduction(row));
      return record;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Production Daily');

    XLSX.writeFile(wb, `production-daily_${params?.start_date}_${params?.end_date}.xlsx`);
  }, [rowList, dayKeys, params]);

  return (
    <>
      <PageHeader
        title="Report Production Daily"
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
          <Text type="secondary">Terapkan filter untuk melihat data report production daily.</Text>
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
        title="Report Production Daily — Filter"
        dateMode="range"
        initialValues={appliedValues ?? undefined}
        onClose={() => setFilterOpen(false)}
        onApply={handleApply}
      />
    </>
  );
};

export default ReportProductionDailyPage;
