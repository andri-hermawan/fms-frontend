import { useState } from 'react'
import { Form, Button, Space, Tooltip, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'
import FormDrawer from '@/components/ui/FormDrawer'
import { showConfirm } from '@/components/ui/ConfirmModal'
import { useCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany } from './useCompany'
import CompanyForm from './CompanyForm'
import usePermission from '@/hooks/usePermission'
import usePagination from '@/hooks/usePagination'
import { formatDate } from '@/utils/format'
import type { Company, CompanyFormValues } from '@/types/company.types'

const CompanyListPage = () => {
  const [form] = Form.useForm<CompanyFormValues>()
  const [open, setOpen]         = useState(false)
  const [selected, setSelected] = useState<Company | null>(null)
  const { params, setSearch, setPage, setLimit } = usePagination()

  const { data, isLoading, refetch } = useCompanies(params)
  const createM = useCreateCompany()
  const updateM = useUpdateCompany()
  const deleteM = useDeleteCompany()

  const canCreate = usePermission('company', 'create')
  const canUpdate = usePermission('company', 'update')
  const canDelete = usePermission('company', 'delete')

  const isEdit       = !!selected
  const isSubmitting = createM.isPending || updateM.isPending

  const openCreate = () => { setSelected(null); form.resetFields(); setOpen(true) }
  const openEdit   = (r: Company) => { setSelected(r); setOpen(true) }
  const closeDrawer = () => { setOpen(false); setSelected(null); form.resetFields() }

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (isEdit) {
        updateM.mutate({ id: selected.id, payload: values }, { onSuccess: closeDrawer })
      } else {
        createM.mutate(values, { onSuccess: closeDrawer })
      }
    })
  }

  const handleDelete = (r: Company) => {
    showConfirm({
      title: 'Hapus Company',
      content: `Yakin hapus company "${r.company_name}"?`,
      danger: true,
      okText: 'Ya, Hapus',
      onConfirm: () => deleteM.mutate(r.id),
    })
  }

  const columns: ColumnsType<Company> = [
    {
      title: 'Code', dataIndex: 'company_code', width: 120,
      render: (v) => <span style={{ fontWeight: 'bold', color: '#000' }}>{v}</span>,
    },
    { title: 'Company Name', dataIndex: 'company_name', width: 220 },
    {
      title: 'Status', dataIndex: 'status', width: 100,
      render: (v) => <Tag color={v === 'active' ? 'success' : 'default'}>{v === 'active' ? 'Aktif' : 'Nonaktif'}</Tag>,
    },
    { title: 'Created At', dataIndex: 'created_at', width: 130, render: (v) => formatDate(v) },
    {
      title: 'Actions', key: 'action', fixed: 'right', width: 90,
      render: (_, r) => (
        <Space size={4}>
          {canUpdate && <Tooltip title="Edit"><Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} /></Tooltip>}
          {canDelete && <Tooltip title="Hapus"><Button type="text" size="small" danger icon={<DeleteOutlined />} loading={deleteM.isPending} onClick={() => handleDelete(r)} /></Tooltip>}
        </Space>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Company"
        subtitle={`Total ${data?.meta?.total ?? 0} company`}
        extra={
          <Space>
            <Tooltip title="Refresh"><Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading} /></Tooltip>
            {canCreate && <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>NEW</Button>}
          </Space>
        }
      />
      <DataTable<Company>
        rowKey="id" columns={columns}
        dataSource={data?.data ?? []}
        loading={isLoading} searchable
        searchPlaceholder="Cari kode atau nama..."
        onSearch={setSearch}
        pagination={{ current: params.page, pageSize: params.limit, total: data?.meta?.total ?? 0, onChange: (p, s) => { setPage(p); setLimit(s) }, showSizeChanger: true, showTotal: (t, r) => `${r[0]}–${r[1]} dari ${t} data` }}
      />
      <FormDrawer open={open} title={isEdit ? 'Edit Company' : 'Add Company'} onClose={closeDrawer} onSubmit={handleSubmit} isSubmitting={isSubmitting} submitText={isEdit ? 'Simpan' : 'Add'}>
        <CompanyForm form={form} initialValues={selected} />
      </FormDrawer>
    </>
  )
}
export default CompanyListPage
