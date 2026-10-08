import { useEffect } from 'react'
import { Drawer, Button, Flex, Form, Select } from 'antd'
import type { AlertRuleQueryParams } from '@/types/alert-rule.types'
import { useAlertCategories } from '../alert-category/useAlertCategory'
import { useProjects } from '../project/useProject'
import { STATUS_OPTIONS } from './alertRule.constants'

export type AlertRuleFilterValues = Pick<AlertRuleQueryParams, 'alert_category_id' | 'project_id' | 'status'>

interface Props {
  open: boolean
  initialValues?: AlertRuleFilterValues
  onClose: () => void
  onApply: (values: AlertRuleFilterValues) => void
  isLoading?: boolean
}

const AlertRuleFilter = ({ open, initialValues, onClose, onApply, isLoading = false }: Props) => {
  const [form] = Form.useForm<AlertRuleFilterValues>()

  const { data: categoryData, isLoading: loadingCategory } = useAlertCategories({ limit: 999999 })
  const { data: projectData, isLoading: loadingProject }   = useProjects({ limit: 999999 })

  const categoryOptions = (categoryData?.data ?? []).map((c) => ({
    value: c.id,
    label: `${c.alert_category_code} - ${c.alert_category_name}`,
  }))
  const projectOptions = (projectData?.data ?? []).map((p) => ({
    value: p.id,
    label: p.project_name,
  }))

  // Sinkron hanya saat drawer dibuka agar pilihan yang sedang diubah tidak tertimpa
  useEffect(() => {
    if (open) form.setFieldsValue({ ...initialValues })
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleApply = () => {
    const values = form.getFieldsValue()
    onApply({
      alert_category_id: values.alert_category_id || undefined,
      project_id:        values.project_id || undefined,
      status:            values.status || undefined,
    })
  }

  const handleClose = () => {
    form.resetFields()
    onClose()
  }

  return (
    <Drawer
      open={open}
      title="Alert Rule - Filter"
      size="default"
      onClose={handleClose}
      maskClosable={!isLoading}
      closable={!isLoading}
      footer={
        <Flex justify="flex-end" gap={8}>
          <Button onClick={handleClose} disabled={isLoading}>Batal</Button>
          <Button type="primary" onClick={handleApply} loading={isLoading}>Apply</Button>
        </Flex>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item name="alert_category_id" label="Alert Category">
          <Select
            placeholder="Semua kategori"
            allowClear
            loading={loadingCategory}
            options={categoryOptions}
            showSearch
            filterOption={(input, opt) =>
              (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>
        <Form.Item name="project_id" label="Project" extra="Rule global tetap ditampilkan sebagai acuan">
          <Select
            placeholder="Semua project"
            allowClear
            loading={loadingProject}
            options={projectOptions}
            showSearch
            filterOption={(input, opt) =>
              (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>
        <Form.Item name="status" label="Status">
          <Select placeholder="Semua status" allowClear options={STATUS_OPTIONS} />
        </Form.Item>
      </Form>
    </Drawer>
  )
}
export default AlertRuleFilter
