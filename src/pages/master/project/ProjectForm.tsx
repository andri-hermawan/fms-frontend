import { useEffect } from 'react'
import { Form, Input, Select, Upload, Button, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import type { UploadFile } from 'antd'
import type { Project, ProjectFormValues } from '@/types/project.types'
import { useCompanies } from '@/pages/master/company/useCompany'

interface Props {
  form: ReturnType<typeof Form.useForm<ProjectFormValues>>[0]
  initialValues?: Project | null
}

const ProjectForm = ({ form, initialValues }: Props) => {
  const { data: companyData, isLoading: loadingCompany } = useCompanies()

  const companyOptions = companyData?.data?.map((c) => ({
    value: c.id,
    label: `${c.company_name}`,
  })) ?? []

  useEffect(() => {
    initialValues ? form.setFieldsValue({
      project_code:   initialValues.project_code,
      project_name:   initialValues.project_name,
      status:         initialValues.status,
      company_id:     initialValues.company_id,
      geojson_origin: initialValues.geojson_origin,
    }) : form.resetFields()
  }, [initialValues, form])

  const handleBeforeUpload = (file: UploadFile) => {
    const isGeoJSON = file.name?.toLowerCase().endsWith('.geojson') || file.name?.toLowerCase().endsWith('.json')
    if (!isGeoJSON) {
      message.error('Hanya file .geojson atau .json yang diperbolehkan')
      return Upload.LIST_IGNORE
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string)
        form.setFieldValue('geojson_origin', json)
        message.success(`File "${file.name}" berhasil dibaca`)
      } catch {
        message.error('File tidak valid — bukan format JSON/GeoJSON')
      }
    }
    reader.readAsText(file as unknown as Blob)
    return false // prevent actual upload
  }

  return (
    <Form form={form} layout="vertical" requiredMark={false}>
      <Form.Item name="project_code" label="Project Code"
        rules={[{ required: true, message: 'Wajib diisi' }]}>
        <Input placeholder="PRJ-001" />
      </Form.Item>
      <Form.Item name="project_name" label="Project Name"
        rules={[{ required: true, message: 'Wajib diisi' }]}>
        <Input placeholder="Project Tambang A" />
      </Form.Item>
      <Form.Item name="company_id" label="Company"
        rules={[{ required: true, message: 'Wajib dipilih' }]}>
        <Select
          placeholder="Pilih company"
          loading={loadingCompany}
          options={companyOptions}
          showSearch
          filterOption={(input, opt) =>
            (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
        />
      </Form.Item>
      <Form.Item name="status" label="Status"
        rules={[{ required: true, message: 'Wajib dipilih' }]}>
        <Select options={[
          { value: 'active', label: 'Aktif' },
          { value: 'inactive', label: 'Nonaktif' },
        ]} />
      </Form.Item>
      <Form.Item name="geojson_origin" label="GeoJSON Origin">
        <Upload
          accept=".geojson,.json"
          beforeUpload={handleBeforeUpload}
          maxCount={1}
          onRemove={() => form.setFieldValue('geojson_origin', null)}
        >
          <Button icon={<UploadOutlined />}>Pilih file .geojson</Button>
        </Upload>
      </Form.Item>
    </Form>
  )
}
export default ProjectForm
