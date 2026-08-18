import { useEffect } from 'react'
import { Form, Input, Row, Col, Select } from 'antd'
import type { Device, DeviceFormValues } from '@/types/device.types'
import { useEquipments } from '../equipment/useEquipment'
import { EquipmentStatus } from '@/types/equipment.types'

interface DeviceFormProps {
  form: ReturnType<typeof Form.useForm<DeviceFormValues>>[0]
  initialValues?: Device | null
}

const STATUS_OPTIONS: { value: EquipmentStatus; label: string }[] = [
  { value: 'active',      label: 'Aktif' },
  { value: 'inactive',    label: 'Nonaktif' },
]

const DeviceForm = ({ form, initialValues }: DeviceFormProps) => {
  const { data: equipmentData, isLoading: loadingEquipment } = useEquipments()
  const equipmentOptions = equipmentData?.data?.map((c) => ({
    value: c.id,
    label: `${c.equipment_code}`,
  })) ?? []

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        device_code:      initialValues.device_code,
        device_name:     initialValues.device_name,
        provider_name: initialValues.provider_name,
        sim_number: initialValues.sim_number,
        device_model: initialValues.device_model,
        equipment_id: initialValues.equipment_id ?? undefined,
      })
    } else {
      form.resetFields()
    }
  }, [initialValues, form])

  return (
    <Form form={form} layout="vertical" requiredMark={false}>
      <Form.Item
        name="device_code"
        label="Imei"
        rules={[
          { required: true, message: 'Wajib diisi' },
          { len: 15, message: 'Code / Imei harus 15 digit' },
          { pattern: /^\d+$/, message: 'Code / Imei hanya berisi angka' },
        ]}
        tooltip="Nomor identifikasi unik perangkat GPS (15 digit)"
      >
        <Input
          placeholder="123456789012345"
          maxLength={15}
          style={{ fontFamily: 'monospace' }}
        />
      </Form.Item>

      <Row gutter={12}>
        <Col span={12}>
          <Form.Item
            name="device_name"
            label="Device Name"
            rules={[{ required: true, message: 'Wajib diisi' }]}
          >
            <Input placeholder="Teltonika" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="provider_name"
            label="Provider"
            rules={[{ required: true, message: 'Wajib diisi' }]}
          >
            <Input placeholder="Telkomsel" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="sim_number"
            label="No. SIM Card"
            rules={[{ required: true, message: 'Wajib diisi' }]}
          >
            <Input placeholder="08xxxxxxxxxx" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="device_model"
            label="Device Model"
            rules={[{ required: true, message: 'Wajib diisi' }]}
          >
            <Input placeholder="FMB920" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="equipment_id" label="Equipment">
        <Select
          placeholder="Pilih equipment"
          loading={loadingEquipment}
          options={equipmentOptions}
          showSearch
          filterOption={(input, opt) =>
            String(opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
        />
      </Form.Item>
            
      <Form.Item
        name="status"
        label="Status"
        rules={[{ required: true, message: 'Wajib dipilih' }]}
      >
        <Select placeholder="Pilih status">
          {STATUS_OPTIONS.map((s) => (
            <Select.Option key={s.value} value={s.value}>{s.label}</Select.Option>
          ))}
        </Select>
      </Form.Item>

    </Form>
  )
}

export default DeviceForm
