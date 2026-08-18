import { useEffect } from 'react'
import { Form, Input, Select } from 'antd'
import type { User, UserFormValues } from '@/types/user.types'
import { useProjects } from '@/pages/master/project/useProject'

interface Props {
  form: ReturnType<typeof Form.useForm<UserFormValues>>[0]
  initialValues?: User | null
  isEdit?: boolean
}

const UserForm = ({ form, initialValues, isEdit = false }: Props) => {
  const { data: projectData, isLoading: loadingProject } = useProjects()

  const projectOptions = projectData?.data?.map((p) => ({
    value: p.id,
    label: `${p.project_code} — ${p.project_name}`,
  })) ?? []

  useEffect(() => {
    initialValues ? form.setFieldsValue({
      name:       initialValues.name,
      email:      initialValues.email,
      role:       initialValues.role,
      status:     initialValues.status,
      project_id: initialValues.project_id,
    }) : form.resetFields()
  }, [initialValues, form])

  return (
    <Form form={form} layout="vertical" requiredMark={false}>
      <Form.Item name="name" label="Name"
        rules={[{ required: true, message: 'Wajib diisi' }]}>
        <Input placeholder="Budi Santoso" />
      </Form.Item>
      <Form.Item name="email" label="Email"
        rules={[
          { required: true, message: 'Wajib diisi' },
          { type: 'email', message: 'Format email tidak valid' },
        ]}>
        <Input placeholder="budi@perusahaan.com" />
      </Form.Item>
      {!isEdit && (
        <Form.Item name="password" label="Password"
          rules={[
            { required: true, message: 'Wajib diisi' },
            { min: 8, message: 'Minimal 8 karakter' },
          ]}>
          <Input.Password placeholder="••••••••" />
        </Form.Item>
      )}
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
      <Form.Item name="role" label="Role"
        rules={[{ required: true, message: 'Wajib dipilih' }]}>
        <Select options={[
          { value: 'superadmin', label: 'Super Admin' },
          { value: 'admin',      label: 'Admin' },
          { value: 'viewer',     label: 'Viewer' },
        ]} />
      </Form.Item>
      <Form.Item name="status" label="Status"
        rules={[{ required: true, message: 'Wajib dipilih' }]}>
        <Select options={[
          { value: 'active',   label: 'Aktif' },
          { value: 'inactive', label: 'Nonaktif' },
        ]} />
      </Form.Item>
    </Form>
  )
}
export default UserForm
