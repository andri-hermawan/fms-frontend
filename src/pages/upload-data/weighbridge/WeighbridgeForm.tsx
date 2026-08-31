import { useEffect } from 'react'
import { Form, Input, DatePicker, Select, InputNumber, Space } from 'antd'
import dayjs from 'dayjs'
import type { Weighbridge, WeighbridgeFormValues } from '@/types/weighbridge.types'
import { useShifts } from '@/pages/master/shift/useShift'

interface Props {
  form: ReturnType<typeof Form.useForm<WeighbridgeFormValues>>[0]
  initialValues?: Weighbridge | null
}

const WeighbridgeForm = ({ form, initialValues }: Props) => {
  const { data: shiftData, isLoading: loadingShift } = useShifts({ page: 1, limit: 100 })

  const shiftOptions =
    shiftData?.data?.map((s) => ({
      value: s.shift_name,
      label: s.shift_name,
    })) ?? []

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        date_at: dayjs(initialValues.date_at) as unknown as string,
        shift: initialValues.shift,
        ticket_no: initialValues.ticket_no,
        equipment_code: initialValues.equipment_code,
        product: initialValues.product,
        gross: initialValues.gross,
        tare: initialValues.tare,
        net: initialValues.net,
        recipient: initialValues.recipient,
        customer: initialValues.customer,
        transporter: initialValues.transporter,
        gross_time: (initialValues.gross_time ? dayjs(initialValues.gross_time) : null) as unknown as string | null,
        tare_time: (initialValues.tare_time ? dayjs(initialValues.tare_time) : null) as unknown as string | null,
        gross_operator: initialValues.gross_operator,
        tare_operator: initialValues.tare_operator,
        description: initialValues.description ?? null,
        location: initialValues.location ?? null,
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
        name="ticket_no"
        label="Ticket No"
        rules={[{ required: true, message: 'Wajib diisi' }]}
      >
        <Input placeholder="A2026081200198" />
      </Form.Item>

      <Form.Item
        name="equipment_code"
        label="Equipment Code"
        rules={[{ required: true, message: 'Wajib diisi' }]}
      >
        <Input
          placeholder="10419"
          style={{ textTransform: 'uppercase' }}
          onChange={(e) =>
            form.setFieldValue('equipment_code', e.target.value.toUpperCase())
          }
        />
      </Form.Item>

      <Form.Item
        name="product"
        label="Product"
        rules={[{ required: true, message: 'Wajib diisi' }]}
      >
        <Input placeholder="BATUBARA" />
      </Form.Item>

      <Form.Item label="Berat (Gross / Tare / Net)">
        <Space.Compact block>
          <Form.Item
            name="gross"
            noStyle
            rules={[{ required: true, message: 'Wajib diisi' }]}
          >
            <InputNumber
              style={{ width: '33.33%' }}
              placeholder="Gross"
              min={0}
            />
          </Form.Item>
          <Form.Item
            name="tare"
            noStyle
            rules={[{ required: true, message: 'Wajib diisi' }]}
          >
            <InputNumber
              style={{ width: '33.33%' }}
              placeholder="Tare"
              min={0}
            />
          </Form.Item>
          <Form.Item
            name="net"
            noStyle
          >
            <InputNumber
              style={{ width: '33.33%' }}
              placeholder="Net"
              min={0}
              readOnly
            />
          </Form.Item>
        </Space.Compact>
      </Form.Item>

      <Form.Item
        name="recipient"
        label="Recipient"
        rules={[{ required: true, message: 'Wajib diisi' }]}
      >
        <Input placeholder="PT. RMKO" />
      </Form.Item>

      <Form.Item
        name="customer"
        label="Customer"
        rules={[{ required: true, message: 'Wajib diisi' }]}
      >
        <Input placeholder="PT. DBU" />
      </Form.Item>

      <Form.Item
        name="transporter"
        label="Transporter"
        rules={[{ required: true, message: 'Wajib diisi' }]}
      >
        <Input placeholder="PT. RMKO" />
      </Form.Item>

      <Form.Item label="Waktu Timbang (Gross / Tare)">
        <Space.Compact block>
          <Form.Item name="gross_time" noStyle>
            <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '50%' }} placeholder="Gross time" />
          </Form.Item>
          <Form.Item name="tare_time" noStyle>
            <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '50%' }} placeholder="Tare time" />
          </Form.Item>
        </Space.Compact>
      </Form.Item>

      <Form.Item label="Operator Timbang (Gross / Tare)">
        <Space.Compact block>
          <Form.Item
            name="gross_operator"
            noStyle
            rules={[{ required: true, message: 'Wajib diisi' }]}
          >
            <Input style={{ width: '50%' }} placeholder="Gross operator" />
          </Form.Item>
          <Form.Item
            name="tare_operator"
            noStyle
            rules={[{ required: true, message: 'Wajib diisi' }]}
          >
            <Input style={{ width: '50%' }} placeholder="Tare operator" />
          </Form.Item>
        </Space.Compact>
      </Form.Item>

      <Form.Item name="location" label="Location">
        <Input placeholder="Lokasi (opsional)" />
      </Form.Item>

      <Form.Item name="description" label="Description">
        <Input.TextArea rows={3} placeholder="Keterangan (opsional)" />
      </Form.Item>
    </Form>
  )
}
export default WeighbridgeForm