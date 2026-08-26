import { useEffect } from 'react'
import { Form, Input, DatePicker, Select } from 'antd'
import dayjs from 'dayjs'
import type { DailySettingOperator, DailySettingOperatorFormValues } from '@/types/daily-setting-operator.types'
import { useShifts } from '@/pages/master/shift/useShift'

interface Props {
  form: ReturnType<typeof Form.useForm<DailySettingOperatorFormValues>>[0]
  initialValues?: DailySettingOperator | null
}

const DailySettingOperatorForm = ({ form, initialValues }: Props) => {
  const { data: shiftData, isLoading: loadingShift } = useShifts({ page: 1, limit: 100 })

  const shiftOptions =
    shiftData?.data?.map((s) => ({
      value: s.shift_name,
      label: s.shift_name,
    })) ?? []

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        date_at: initialValues.date_at ? dayjs(initialValues.date_at) : null,
        shift: initialValues.shift,
        equipment_code: initialValues.equipment_code,
        operator_name: initialValues.operator_name,
        description: initialValues.description ?? null,
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
        name="shift"
        label="Shift"
        rules={[{ required: true, message: 'Wajib dipilih' }]}
      >
        <Select
          placeholder="Pilih shift"
          loading={loadingShift}
          options={shiftOptions}
          showSearch
          filterOption={(input, opt) =>
            (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
        />
      </Form.Item>

      <Form.Item
        name="equipment_code"
        label="Equipment Code"
        rules={[{ required: true, message: 'Wajib diisi' }]}
      >
        <Input
          placeholder="DT10203"
          style={{ textTransform: 'uppercase' }}
          onChange={(e) =>
            form.setFieldValue('equipment_code', e.target.value.toUpperCase())
          }
        />
      </Form.Item>

      <Form.Item
        name="operator_name"
        label="Operator Name"
        rules={[{ required: true, message: 'Wajib diisi' }]}
      >
        <Input placeholder="Nama operator" />
      </Form.Item>

      <Form.Item name="description" label="Description">
        <Input.TextArea rows={3} placeholder="Keterangan (opsional)" />
      </Form.Item>
    </Form>
  )
}
export default DailySettingOperatorForm