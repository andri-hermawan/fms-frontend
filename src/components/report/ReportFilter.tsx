import { Drawer, Button, Flex, Form, DatePicker, Select, Spin } from 'antd'
import type { ReactNode } from 'react'
import type { Dayjs } from 'dayjs'

const { RangePicker } = DatePicker

export interface ReportFilterValues {
  date?: string
  dateRange?: [string, string]
  projectId?: string
  equipmentId?: string
  shift?: string
}

export type ReportFilterDateMode = 'range' | 'single' | 'none'

interface ReportFilterFormValues {
  date?: Dayjs
  dateRange?: [Dayjs, Dayjs]
  projectId?: string
  equipmentId?: string
  shift?: string
}

interface ReportFilterProps {
  open: boolean
  title?: string
  onClose: () => void
  onApply: (values: ReportFilterValues) => void
  isLoading?: boolean
  dateMode?: ReportFilterDateMode
  showProject?: boolean
  showEquipment?: boolean
  showShift?: boolean
  /** Extra filter fields rendered inside the form */
  children?: ReactNode
}

const ReportFilter = ({
  open,
  title = 'Report Filter',
  onClose,
  onApply,
  isLoading = false,
  dateMode = 'range',
  showProject = false,
  showEquipment = true,
  showShift = true,
  children,
}: ReportFilterProps) => {
  const [form] = Form.useForm<ReportFilterFormValues>()

  const handleApply = () => {
    form.validateFields().then((values) => {
      const result: ReportFilterValues = {}
      if (values.dateRange && values.dateRange.length === 2) {
        result.dateRange = [
          values.dateRange[0]?.format('YYYY-MM-DD'),
          values.dateRange[1]?.format('YYYY-MM-DD'),
        ]
      }
      if (values.date) result.date = values.date.format('YYYY-MM-DD')
      if (values.projectId) result.projectId = values.projectId
      if (values.equipmentId) result.equipmentId = values.equipmentId
      if (values.shift) result.shift = values.shift
      onApply(result)
    })
  }

  const handleClose = () => {
    form.resetFields()
    onClose()
  }

  return (
    <Drawer
      open={open}
      title={title}
      size="default"
      onClose={handleClose}
      maskClosable={!isLoading}
      closable={!isLoading}
      footer={
        <Flex justify="flex-end" gap={8}>
          <Button onClick={handleClose} disabled={isLoading}>
            Batal
          </Button>
          <Button type="primary" onClick={handleApply} loading={isLoading}>
            Apply
          </Button>
        </Flex>
      }
    >
      <Spin spinning={isLoading}>
        <Form form={form} layout="vertical">
            {dateMode === 'range' && (
              <Form.Item name="dateRange" label="Date Range">
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            )}

            {dateMode === 'single' && (
              <Form.Item name="date" label="Date">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            )}

            {showProject && (
              <Form.Item name="projectId" label="Project">
                <Select placeholder="Pilih project" allowClear options={[]} />
              </Form.Item>
            )}

            {showEquipment && (
              <Form.Item name="equipmentId" label="Equipment">
                <Select placeholder="Pilih equipment" allowClear options={[]} />
              </Form.Item>
            )}

            {showShift && (
              <Form.Item name="shift" label="Shift">
                <Select
                  placeholder="Pilih shift"
                  allowClear
                  options={[
                    { label: 'Shift 1', value: 'Shift 1' },
                    { label: 'Shift 2', value: 'Shift 2' },
                  ]}
                />
              </Form.Item>
            )}

            {children}
        </Form>
      </Spin>
    </Drawer>
  )
}

export default ReportFilter