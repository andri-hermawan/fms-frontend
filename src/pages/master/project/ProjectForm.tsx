import { useEffect } from 'react'
import { Form, Input, Select } from 'antd'
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
      project_code: initialValues.project_code,
      project_name: initialValues.project_name,
      status:       initialValues.status,
      company_id:   initialValues.company_id,
    }) : form.resetFields()
  }, [initialValues, form])

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
    </Form>
  )
}
export default ProjectForm
