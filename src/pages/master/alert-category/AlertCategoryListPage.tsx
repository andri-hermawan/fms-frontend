import { useState } from 'react'
import { Form, Button, Space, Tooltip, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'
import FormDrawer from '@/components/ui/FormDrawer'
import { showConfirm } from '@/components/ui/ConfirmModal'
import { useAlertCategories, useCreateAlertCategory, useUpdateAlertCategory, useDeleteAlertCategory } from './useAlertCategory'
import AlertCategoryForm from './AlertCategoryForm'
import usePermission from '@/hooks/usePermission'
import usePagination from '@/hooks/usePagination'
import { formatDate } from '@/utils/format'
import type { AlertCategory, AlertCategoryFormValues } from '@/types/alert-category.types'

const AlertCategoryListPage = () => {
  const [form] = Form.useForm<AlertCategoryFormValues>()
  const [open, setOpen]         = useState(false)
  const [selected, setSelected] = useState<AlertCategory | null>(null)
  const { params, setSearch, setPage, setLimit } = usePagination()

  const { data, isLoading, refetch } = useAlertCategories(params)
  const createM = useCreateAlertCategory()
  const updateM = useUpdateAlertCategory()
  const deleteM = useDeleteAlertCategory()

  const canCreate = usePermission('alert_category', 'create')
  const canUpdate = usePermission('alert_category', 'update')
  const canDelete = usePermission('alert_category', 'delete')

  const isEdit       = !!selected
  const isSubmitting = createM.isPending || updateM.isPending

  const openCreate  = () => { setSelected(null); form.resetFields(); setOpen(true) }
  const openEdit    = (r: AlertCategory) => { setSelected(r); setOpen(true) }
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

  const handleDelete = (r: AlertCategory) => {
    showConfirm({
      title: 'Hapus Alert Category',
      content: `Yakin hapus kategori "${r.alert_category_name}"?`,
      danger: true,
      okText: 'Ya, Hapus',
      onConfirm: () => deleteM.mutate(r.id),
    })
  }

  const columns: ColumnsType<AlertCategory> = [
    {
      title: 'Code', dataIndex: 'alert_category_code', width: 140,
      render: (v) => <span style={{ fontWeight: 'bold', color: '#000' }}>{v}</span>,
    },
    { title: 'Category Name', dataIndex: 'alert_category_name', width: 220 },
    {
      title: 'Status', dataIndex: 'status', width: 100,
      render: (v) => <Tag color={v === 'active' ? 'success' : 'default'}>{v === 'active' ? 'Active' : 'Inactive'}</Tag>,
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
        title="Alert Category"
        subtitle={`Total ${data?.meta?.total ?? 0} alert categories`}
        extra={
          <Space>
            <Tooltip title="Refresh"><Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading} /></Tooltip>
            {canCreate && <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>NEW</Button>}
          </Space>
        }
      />
      <DataTable<AlertCategory>
        rowKey="id" columns={columns}
        dataSource={data?.data ?? []}
        loading={isLoading} searchable
        searchPlaceholder="Cari kode atau nama..."
        onSearch={setSearch}
        pagination={{ current: params.page, pageSize: params.limit, total: data?.meta?.total ?? 0, onChange: (p, s) => { setPage(p); setLimit(s) }, showSizeChanger: true, showTotal: (t, r) => `${r[0]}–${r[1]} dari ${t} data` }}
      />
      <FormDrawer open={open} title={isEdit ? 'Edit Alert Category' : 'Add Alert Category'} onClose={closeDrawer} onSubmit={handleSubmit} isSubmitting={isSubmitting} submitText={isEdit ? 'Simpan' : 'Add'}>
        <AlertCategoryForm form={form} initialValues={selected} />
      </FormDrawer>
    </>
  )
}
export default AlertCategoryListPage
