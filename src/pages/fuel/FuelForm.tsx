import { useEffect } from 'react'
import { Form, InputNumber, Select, Input, Switch } from 'antd'
import type { Fuel, FuelFormValues } from '@/types/fuel.types'
import { useEquipments } from '@/pages/master/equipment/useEquipment'

interface Props {
  form: ReturnType<typeof Form.useForm<FuelFormValues>>[0]
  initialValues?: Fuel | null
}

const FuelForm = ({ form, initialValues }: Props) => {
  const { data: equipmentData, isLoading: loadingEquipment } = useEquipments({ page: 1, limit: 100 })

  const equipmentOptions =
    equipmentData?.data?.map((eq) => ({
      value: eq.id,
      label: eq.equipment_code,
    })) ?? []

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        equipment_id: initialValues.equipment_id,
        fuel_level: initialValues.fuel_level,
        fuel_volume: initialValues.fuel_volume,
        fuel_temperature: initialValues.fuel_temperature,
        description: initialValues.description ?? undefined,
        is_inside: initialValues.is_inside ?? undefined,
        location_category: initialValues.location_category ?? undefined,
        segment: initialValues.segment ?? undefined,
        speed: initialValues.speed,
        vessel_status: initialValues.vessel_status ?? undefined,
        engine_status: initialValues.engine_status ?? undefined,
        status: initialValues.status ?? undefined,
        shift: initialValues.shift ?? undefined,
        event_type: initialValues.event_type ?? undefined,
      })
    } else {
      form.resetFields()
    }
  }, [initialValues, form])

  return (
    <Form form={form} layout="vertical" requiredMark={false}>
      <Form.Item
        name="equipment_id"
        label="Equipment"
        rules={[{ required: true, message: 'Wajib dipilih' }]}
      >
        <Select
          placeholder="Pilih equipment"
          loading={loadingEquipment}
          options={equipmentOptions}
          showSearch
          filterOption={(input, opt) =>
            (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
        />
      </Form.Item>

      <Form.Item name="fuel_volume" label="Fuel Volume (liter)">
        <InputNumber placeholder="Volume" style={{ width: '100%' }} min={0} step={0.01} />
      </Form.Item>

      <Form.Item name="fuel_level" label="Fuel Level (sensor)">
        <InputNumber placeholder="Level" style={{ width: '100%' }} min={0} step={0.01} />
      </Form.Item>

      <Form.Item name="fuel_temperature" label="Fuel Temperature">
        <InputNumber placeholder="Suhu" style={{ width: '100%' }} step={0.01} />
      </Form.Item>

      <Form.Item name="speed" label="Speed (km/h)">
        <InputNumber placeholder="Kecepatan" style={{ width: '100%' }} min={0} step={0.01} />
      </Form.Item>

      <Form.Item name="vessel_status" label="Vessel Status">
        <Input placeholder="Contoh: EMPTY / LOADED" />
      </Form.Item>

      <Form.Item name="status" label="Status">
        <Input placeholder="Contoh: FUEL DECREASE" />
      </Form.Item>

      <Form.Item name="event_type" label="Event Type">
        <Input placeholder="Contoh: FUEL DECREASE" />
      </Form.Item>

      <Form.Item name="shift" label="Shift">
        <Input placeholder="Contoh: Shift 1" />
      </Form.Item>

      <Form.Item name="location_category" label="Location Category">
        <Input placeholder="Contoh: Trase Utama" />
      </Form.Item>

      <Form.Item name="segment" label="Segment">
        <Input placeholder="Contoh: Km 05+000 - 06+000" />
      </Form.Item>

      <Form.Item name="description" label="Description">
        <Input.TextArea rows={2} placeholder="Deskripsi" />
      </Form.Item>

      <Form.Item name="is_inside" label="Is Inside" valuePropName="checked">
        <Switch />
      </Form.Item>

      <Form.Item name="engine_status" label="Engine Status" valuePropName="checked">
        <Switch />
      </Form.Item>
    </Form>
  )
}
export default FuelForm