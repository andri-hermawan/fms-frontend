import { useState } from 'react'
import { Form, Button, Space, Tooltip, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'
import FormDrawer from '@/components/ui/FormDrawer'
import { showConfirm } from '@/components/ui/ConfirmModal'
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from './useUser'
import UserForm from './UserForm'
import usePermission from '@/hooks/usePermission'
import usePagination from '@/hooks/usePagination'
import { formatDate } from '@/utils/format'
import type { User, UserFormValues } from '@/types/user.types'

const ROLE_COLOR: Record<string, string> = {
  superadmin: 'red',
  admin: 'blue',
  viewer: 'default',
}

const UserListPage = () => {
  const [form] = Form.useForm<UserFormValues>()
  const [open, setOpen]         = useState(false)
  const [selected, setSelected] = useState<User | null>(null)
  const { params, setSearch, setPage, setLimit } = usePagination()

  const { data, isLoading, refetch } = useUsers(params)
  const createM = useCreateUser()
  const updateM = useUpdateUser()
  const deleteM = useDeleteUser()

  const canCreate = usePermission('user', 'create')
  const canUpdate = usePermission('user', 'update')
  const canDelete = usePermission('user', 'delete')

  const isEdit       = !!selected
  const isSubmitting = createM.isPending || updateM.isPending

  const openCreate  = () => { setSelected(null); form.resetFields(); setOpen(true) }
  const openEdit    = (r: User) => { setSelected(r); setOpen(true) }
  const closeDrawer = () => { setOpen(false); setSelected(null); form.resetFields() }

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (isEdit) {
        const { password: _, ...rest } = values as UserFormValues & { password?: string }
        updateM.mutate({ id: selected.id, payload: rest }, { onSuccess: closeDrawer })
      } else {
        createM.mutate(values, { onSuccess: closeDrawer })
      }
    })
  }

  const handleDelete = (r: User) => {
    showConfirm({
      title: 'Hapus User',
      content: `Yakin hapus user "${r.name}"?`,
      danger: true,
      okText: 'Ya, Hapus',
      onConfirm: () => deleteM.mutate(r.id),
    })
  }

  const columns: ColumnsType<User> = [
    {
      title: 'Nama', dataIndex: 'name', width: 180,
      render: (v) => <span style={{ fontWeight: 500 }}>{v}</span>,
    },
    { title: 'Email', dataIndex: 'email', width: 220 },
    {
      title: 'Role', dataIndex: 'role', width: 120,
      render: (v) => <Tag color={ROLE_COLOR[v] ?? 'default'}>{v}</Tag>,
    },
    {
      title: 'Status', dataIndex: 'status', width: 100,
      render: (v) => <Tag color={v === 'active' ? 'success' : 'default'}>{v === 'active' ? 'Aktif' : 'Nonaktif'}</Tag>,
    },
    { title: 'Dibuat', dataIndex: 'created_at', width: 130, render: (v) => formatDate(v) },
    {
      title: 'Aksi', key: 'action', fixed: 'right', width: 90,
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
        title="User Management"
        subtitle={`Total ${data?.meta?.total ?? 0} user`}
        extra={
          <Space>
            <Tooltip title="Refresh"><Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading} /></Tooltip>
            {canCreate && <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Tambah User</Button>}
          </Space>
        }
      />
      <DataTable<User>
        rowKey="id" columns={columns}
        dataSource={data?.data ?? []}
        loading={isLoading} searchable
        searchPlaceholder="Cari nama atau email..."
        onSearch={setSearch}
        pagination={{
          current: params.page, pageSize: params.limit,
          total: data?.meta?.total ?? 0,
          onChange: (p, s) => { setPage(p); setLimit(s) },
          showSizeChanger: true,
          showTotal: (t, r) => `${r[0]}–${r[1]} dari ${t} data`,
        }}
      />
      <FormDrawer
        open={open}
        title={isEdit ? 'Edit User' : 'Tambah User'}
        onClose={closeDrawer}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitText={isEdit ? 'Simpan' : 'Tambah'}
      >
        <UserForm form={form} initialValues={selected} isEdit={isEdit} />
      </FormDrawer>
    </>
  )
}
export default UserListPage
