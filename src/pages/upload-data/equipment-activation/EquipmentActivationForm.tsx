import { useEffect } from 'react'
import { DatePicker, Form, Input, Select } from 'antd'
import dayjs from 'dayjs'
import type {
  EquipmentActivation,
  EquipmentActivationFormValues,
} from '@/types/equipment-activation.types'

interface Props {
  form: ReturnType<typeof Form.useForm<EquipmentActivationFormValues>>[0]
  initialValues?: EquipmentActivation | null
}

const statusOptions = [
  { label: 'Active', value: 'Active' },
  { label: 'Non Active', value: 'Non Active' },
]

const EquipmentActivationForm = ({ form, initialValues }: Props) => {
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        date_at: (initialValues.date_at ? dayjs(initialValues.date_at) : null) as unknown as string,
        equipment_code: initialValues.equipment_code,
        status: initialValues.status,
        description: initialValues.description,
      })
    } else {
      form.resetFields()
    }
  }, [initialValues, form])

  return (
    <Form form={form} layout="vertical" requiredMark={false}>
      <Form.Item
        name="date_at"
        label="Tanggal"
        rules={[{ required: true, message: 'Wajib diisi' }]}
      >
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name="equipment_code"
        label="Equipment Code"
        rules={[{ required: true, message: 'Wajib diisi' }]}
      >
        <Input
          placeholder="TR-001"
          style={{ textTransform: 'uppercase' }}
          onChange={(event) =>
            form.setFieldValue('equipment_code', event.target.value.toUpperCase())
          }
        />
      </Form.Item>

      <Form.Item
        name="status"
        label="Status"
        rules={[{ required: true, message: 'Wajib dipilih' }]}
      >
        <Select placeholder="Pilih status" options={statusOptions} />
      </Form.Item>

      <Form.Item name="description" label="Description">
        <Input.TextArea rows={3} placeholder="Keterangan (opsional)" />
      </Form.Item>
    </Form>
  )
}

export default EquipmentActivationForm
