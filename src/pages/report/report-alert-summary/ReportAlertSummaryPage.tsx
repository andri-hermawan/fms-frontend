import { useState } from 'react';
import { Button, Card, Space, Typography } from 'antd';
import { ArrowLeftOutlined, FilterOutlined } from '@ant-design/icons';
import PageHeader from '@/components/ui/PageHeader';
import ReportFilter, { type ReportFilterValues } from '@/components/report/ReportFilter';
import { useNavigate } from 'react-router-dom';
import AlertSummaryReport from './AlertSummaryReport';

const { Text } = Typography;

const ReportAlertSummaryPage = () => {
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(true);
  const [filterValues, setFilterValues] = useState<ReportFilterValues>({});

  const hasFilter = Boolean(filterValues.date && filterValues.shift);

  const handleApplyFilter = (values: ReportFilterValues) => {
    setFilterValues(values);
    setFilterOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Report Alert Summary"
        extra={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/report')}>
              Back to Reports
            </Button>
            <Button icon={<FilterOutlined />} onClick={() => setFilterOpen(true)}>
              Filter
            </Button>
          </Space>
        }
      />

      {!hasFilter ? (
        <Card>
          <Space direction="vertical">
            <Text type="secondary">Terapkan filter tanggal dan shift untuk melihat report alert summary.</Text>
          </Space>
        </Card>
      ) : (
        <AlertSummaryReport date={filterValues.date!} shift={filterValues.shift!} />
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
