import { useEffect } from 'react'
import { Form, Input, Select } from 'antd'
import type { Company, CompanyFormValues } from '@/types/company.types'

interface Props {
  form: ReturnType<typeof Form.useForm<CompanyFormValues>>[0]
  initialValues?: Company | null
}

const CompanyForm = ({ form, initialValues }: Props) => {
  useEffect(() => {
    initialValues ? form.setFieldsValue({
      company_code: initialValues.company_code,
      company_name: initialValues.company_name,
      status: initialValues.status,
    }) : form.resetFields()
  }, [initialValues, form])

  return (
    <Form form={form} layout="vertical" requiredMark={false}>
      <Form.Item name="company_code" label="Company Code"
        rules={[{ required: true, message: 'Wajib diisi' }]}>
        <Input placeholder="RMK" />
      </Form.Item>
      <Form.Item name="company_name" label="Company Name"
        rules={[{ required: true, message: 'Wajib diisi' }]}>
        <Input placeholder="PT. Contoh" />
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
export default CompanyForm
