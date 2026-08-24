import { Drawer, Button, Flex, Form, DatePicker, Select, Space, Spin } from 'antd'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

const { RangePicker } = DatePicker

export interface ReportFilterValues {
  dateRange?: [string, string]
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
  /** Extra filter fields rendered inside the form */
  children?: ReactNode
}

const ReportFilter = ({
  open,
  title = 'Report Filter',
  onClose,
  onApply,
  isLoading = false,
  children,
}: ReportFilterProps) => {
  const [form] = Form.useForm<ReportFilterValues>()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
    }
  }, [open])

  const handleApply = () => {
    form.validateFields().then((values) => {
      const result: ReportFilterValues = {}
      if (values.dateRange && values.dateRange.length === 2) {
        result.dateRange = [
          values.dateRange[0]?.format('YYYY-MM-DD'),
          values.dateRange[1]?.format('YYYY-MM-DD'),
        ]
      }
      if (values.projectId) result.projectId = values.projectId
      if (values.equipmentId) result.equipmentId = values.equipmentId
      if (values.shift) result.shift = values.shift
      onApply(result)
    })
  }

  const handleClose = () => {
    form.resetFields()
    onClose()
    setTimeout(() => setMounted(false), 200)
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
        {mounted && (
          <Form form={form} layout="vertical">
            <Form.Item name="dateRange" label="Date Range">
              <RangePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name="equipmentId" label="Equipment">
              <Select
                placeholder="Pilih equipment"
                allowClear
                options={[]}
              />
            </Form.Item>

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

            {children}
          </Form>
        )}
      </Spin>
    </Drawer>
  )
}

export default ReportFilter