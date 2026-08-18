import { useEffect } from 'react'
import { Form, InputNumber, Select } from 'antd'
import type { FuelCalibration, FuelCalibrationFormValues } from '@/types/fuel-calibration.types'
import { useEquipments } from '@/pages/master/equipment/useEquipment'
import { useFuelCalibrations } from './useFuelCalibration'

interface Props {
  form: ReturnType<typeof Form.useForm<FuelCalibrationFormValues>>[0]
  initialValues?: FuelCalibration | null
}

const FuelCalibrationForm = ({ form, initialValues }: Props) => {
  const { data: equipmentData, isLoading: loadingEquipment } = useEquipments({ page: 1, limit: 100 })
  const { data: existingData } = useFuelCalibrations({ page: 1, limit: 100 })

  const isEdit = !!initialValues

  // Kumpulkan equipment yang sudah punya kalibrasi (kecuali saat edit)
  const calibratedIds = new Set(
    (existingData?.data ?? [])
      .filter((fc) => fc.equipment_id !== initialValues?.equipment_id)
      .map((fc) => fc.equipment_id),
  )

  // Equipment yang tersedia: belum punya kalibrasi (untuk add)
  const availableEquipmentOptions =
    equipmentData?.data
      ?.filter((eq) => !calibratedIds.has(eq.id))
      .map((eq) => ({
        value: eq.id,
        label: `${eq.equipment_code}`,
      })) ?? []

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        equipment_id: initialValues.equipment_id,
        equipment_code: initialValues.equipment_code,
        fuel_volume: initialValues.fuel_volume,
        fuel_level: initialValues.fuel_level,
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
          options={availableEquipmentOptions}
          showSearch
          disabled={isEdit}
          filterOption={(input, opt) =>
            (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          notFoundContent="Tidak ada equipment tersedia"
        />
      </Form.Item>

      <Form.Item
        name="fuel_volume"
        label="Max Fuel Volume (liter)"
        rules={[{ required: true, message: 'Wajib diisi' }]}
      >
        <InputNumber
          placeholder="Masukkan nilai Fuel Volume (liter)"
          style={{ width: '100%' }}
          min={0}
          step={0.01}
        />
      </Form.Item>

      <Form.Item
        name="fuel_level"
        label="Max Fuel Level (sensor)"
        rules={[{ required: true, message: 'Wajib diisi' }]}
      >
        <InputNumber
          placeholder="Masukkan nilai Fuel Level (sensor)"
          style={{ width: '100%' }}
          min={0}
          step={0.01}
        />
      </Form.Item>
    </Form>
  )
}
export default FuelCalibrationForm