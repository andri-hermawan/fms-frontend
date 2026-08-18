import { useEffect } from 'react'
import { Form, Input, Select } from 'antd'
import type { AlertCategory, AlertCategoryFormValues } from '@/types/alert-category.types'

interface Props {
  form: ReturnType<typeof Form.useForm<AlertCategoryFormValues>>[0]
  initialValues?: AlertCategory | null
}

const AlertCategoryForm = ({ form, initialValues }: Props) => {
  useEffect(() => {
    initialValues ? form.setFieldsValue({
      alert_category_code: initialValues.alert_category_code,
      alert_category_name: initialValues.alert_category_name,
      status:              initialValues.status,
    }) : form.resetFields()
  }, [initialValues, form])

  return (
    <Form form={form} layout="vertical" requiredMark={false}>
      <Form.Item name="alert_category_code" label="Alert Category Code"
        rules={[{ required: true, message: 'Wajib diisi' }]}>
        <Input placeholder="ALT-001" />
      </Form.Item>
      <Form.Item name="alert_category_name" label="Alert Category Name"
        rules={[{ required: true, message: 'Wajib diisi' }]}>
        <Input placeholder="Overspeed" />
      </Form.Item>
      <Form.Item name="status" label="Status"
        rules={[{ required: true, message: 'Wajib dipilih' }]}>
        <Select options={[
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ]} />
      </Form.Item>
    </Form>
  )
}
export default AlertCategoryForm
