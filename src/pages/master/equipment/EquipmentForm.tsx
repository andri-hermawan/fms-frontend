import { useEffect } from 'react'
import { Form, Input, Select, Row, Col } from 'antd'
import type { EquipmentStatus, EquipmentType, Equipment, EquipmentFormValues, EquipmentBrand } from '@/types/equipment.types'
import { useProjects } from '../project/useProject'

const { Option } = Select

interface EquipmentFormProps {
  form: ReturnType<typeof Form.useForm<EquipmentFormValues>>[0]
  initialValues?: Equipment | null
}

const EQUIPMENT_TYPES: { value: EquipmentType; label: string }[] = [
  { value: 'Dump Truck',           label: 'Dump Truck' },
  { value: 'LV',             label: 'Light Vehicle' },
]

const EQUIPMENT_BRANDS: { value: EquipmentBrand; label: string }[] = [
  { value: 'Hino',      label: 'Hino' },
  { value: 'Renault',   label: 'Renault' },
  { value: 'Mitsubishi', label: 'Mitsubishi' },
  { value: 'Isuzu',     label: 'Isuzu' },
  { value: 'Fuso',      label: 'Fuso' },
  { value: 'Volvo',     label: 'Volvo' },
]

const STATUS_OPTIONS: { value: EquipmentStatus; label: string }[] = [
  { value: 'active',      label: 'Aktif' },
  { value: 'inactive',    label: 'Nonaktif' },
]

// const currentYear = new Date().getFullYear()

const EquipmentForm = ({ form, initialValues }: EquipmentFormProps) => {
  const { data: projectData, isLoading: loadingProject } = useProjects()
  const projectOptions = projectData?.data?.map((c) => ({
    value: c.id,
    label: `${c.project_name}`,
  })) ?? []
  
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        equipment_code: initialValues.equipment_code,
        equipment_alias: initialValues.equipment_alias,
        type:         initialValues.type,
        brand:        initialValues.brand,
        model:        initialValues.model,
        class:         initialValues.class,
        status:       initialValues.status,
        project_id: initialValues.project_id ?? null,
      })
    } else {
      form.resetFields()
    }
  }, [initialValues, form])

  return (
    <Form form={form} layout="vertical" requiredMark={false}>

      <Form.Item
        name="equipment_code"
        label="Cn Unit"
        rules={[{ required: true, message: 'Wajib diisi' }]}
      >
        <Input
          placeholder="DT10001"
          style={{ textTransform: 'uppercase' }}
          onChange={(e) =>
            form.setFieldValue('equipment_code', e.target.value.toUpperCase())
          }
        />
      </Form.Item>

      <Row gutter={12}>
        <Col span={12}>
          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Wajib dipilih' }]}
          >
            <Select placeholder="Pilih Type">
              {EQUIPMENT_TYPES.map((t) => (
                <Option key={t.value} value={t.value}>{t.label}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col><Col span={12}>
          <Form.Item
            name="brand"
            label="Brand"
            rules={[{ required: true, message: 'Wajib diisi' }]}
          >
            <Select placeholder="Pilih Brand">
              {EQUIPMENT_BRANDS.map((b) => (
                <Option key={b.value} value={b.value}>{b.label}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={12}>
        <Col span={12}>
          <Form.Item
            name="model"
            label="Model"
            rules={[{ required: true, message: 'Wajib diisi' }]}
          >
            <Input placeholder="FM260JD" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="class"
            label="Class"
            rules={[{ required: true, message: 'Wajib diisi' }]}
          >
            <Input placeholder="30" />
          </Form.Item>
        </Col>
      </Row>

      
      <Form.Item name="project_id" label="Project"
        rules={[{ required: true, message: 'Wajib dipilih' }]}>
        <Select
          placeholder="Pilih project"
          loading={loadingProject}
          options={projectOptions}
          showSearch
          filterOption={(input, opt) =>
            (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
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
            <Option key={s.value} value={s.value}>{s.label}</Option>
          ))}
        </Select>
      </Form.Item>

    </Form>
  )
}

export default EquipmentForm
