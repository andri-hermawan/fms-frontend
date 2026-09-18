import { Drawer, Button, Flex, Form, DatePicker, Input, Select, Spin } from 'antd'
import type { ReactNode } from 'react'
import dayjs, { type Dayjs } from 'dayjs'
import { useEquipments } from '@/pages/master/equipment/useEquipment'
import { useAlertCategories } from '@/pages/master/alert-category/useAlertCategory'

const { RangePicker } = DatePicker

export interface ReportFilterValues {
  search?: string
  date?: string
  dateRange?: [string, string]
  projectId?: string
  equipmentId?: string
  shift?: string
  alertCategory?: string
}

export type ReportFilterDateMode = 'range' | 'single' | 'none'

interface ReportFilterFormValues {
  search?: string
  date?: Dayjs
  dateRange?: [Dayjs, Dayjs]
  projectId?: string
  equipmentId?: string
  shift?: string
  alertCategory?: string
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
  showSearch?: boolean
  /** Tampilkan select Alert Category (selalu ada opsi ALL) */
  showAlertCategory?: boolean
  searchPlaceholder?: string
  initialValues?: ReportFilterValues
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
  showSearch = false,
  showAlertCategory = false,
  searchPlaceholder = 'Search',
  initialValues,
  children,
}: ReportFilterProps) => {
  const [form] = Form.useForm<ReportFilterFormValues>()

  // Ambil daftar equipment untuk pilihan Equipment Code
  const { data: equipmentsData, isLoading: equipmentsLoading } = useEquipments({
    limit: 999999,
  })
  const equipmentOptions = [
    { label: 'ALL', value: '' },
    ...(equipmentsData?.data ?? []).map((e) => ({
      label: e.equipment_code,
      value: e.equipment_code,
    })),
  ]

  // Ambil daftar alert category untuk pilihan Alert Category
  const { data: categoriesData, isLoading: categoriesLoading } = useAlertCategories({
    limit: 999999,
  })
  const alertCategoryOptions = [
    { label: 'ALL', value: '' },
    ...(categoriesData?.data ?? []).map((c) => ({
      label: c.alert_category_name,
      value: c.alert_category_name,
    })),
  ]

  const handleApply = () => {
    form.validateFields().then((values) => {
      const result: ReportFilterValues = {}
      if (values.search?.trim()) result.search = values.search.trim()
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
      if (values.alertCategory) result.alertCategory = values.alertCategory
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
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            search: initialValues?.search,
            date: initialValues?.date ? dayjs(initialValues.date) : undefined,
            dateRange: initialValues?.dateRange?.map((value) => dayjs(value)) as
              [Dayjs, Dayjs] | undefined,
            projectId: initialValues?.projectId,
            equipmentId: initialValues?.equipmentId,
            shift: initialValues?.shift,
            alertCategory: initialValues?.alertCategory,
          }}
        >
            {showSearch && (
              <Form.Item name="search" label="Search">
                <Input placeholder={searchPlaceholder} allowClear />
              </Form.Item>
            )}

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
              <Form.Item name="equipmentId" label="Asset Code">
                <Select
                  placeholder="Pilih asset code"
                  allowClear
                  loading={equipmentsLoading}
                  options={equipmentOptions}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
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

            {showAlertCategory && (
              <Form.Item name="alertCategory" label="Abnormal Alert Category">
                <Select
                  placeholder="Pilih alert category"
                  loading={categoriesLoading}
                  options={alertCategoryOptions}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
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