import { useEffect } from 'react'
import { Form, Input, Select } from 'antd'
import type { Shift, ShiftFormValues } from '@/types/shift.types'

interface Props {
  form: ReturnType<typeof Form.useForm<ShiftFormValues>>[0]
  initialValues?: Shift | null
}

const ShiftForm = ({ form, initialValues }: Props) => {
  useEffect(() => {
    initialValues ? form.setFieldsValue({
      shift_code: initialValues.shift_code,
      shift_name: initialValues.shift_name,
      status:     initialValues.status,
    }) : form.resetFields()
  }, [initialValues, form])

  return (
    <Form form={form} layout="vertical" requiredMark={false}>
      <Form.Item name="shift_code" label="Shift Code"
        rules={[{ required: true, message: 'Wajib diisi' }]}>
        <Input placeholder="SHIFT-A" />
      </Form.Item>
      <Form.Item name="shift_name" label="Shift Name"
        rules={[{ required: true, message: 'Wajib diisi' }]}>
        <Input placeholder="Shift Pagi" />
      </Form.Item>
      <Form.Item name="status" label="Status"
        rules={[{ required: true, message: 'Wajib dipilih' }]}>
        <Select options={[
          { value: 'active', label: 'Aktif' },
          { value: 'inactive', label: 'Nonaktif' },
        ]} />
      </Form.Item>
    </Form>
  )
}
export default ShiftForm
