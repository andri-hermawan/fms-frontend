import { useState } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { Form, Button, Space, Tooltip, Tag, Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, FilterOutlined, DownOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'
import FormDrawer from '@/components/ui/FormDrawer'
import ReportFilter, { type ReportFilterValues } from '@/components/report/ReportFilter'
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
  const [filterOpen, setFilterOpen] = useState(false)
  const currentUser = useAuthStore((s) => s.user)
  const isRestrictedRole = currentUser?.role === 'admin' || currentUser?.role === 'viewer'
  const { params, setSearch, setPage, setLimit } = usePagination(
    isRestrictedRole ? { search: currentUser.email } : undefined,
  )

  const { data, isLoading } = useUsers(params)
  const visibleUsers = isRestrictedRole
    ? (data?.data ?? []).filter((user) => user.id === currentUser?.id || user.email === currentUser?.email)
    : data?.data ?? []
  const createM = useCreateUser()
  const updateM = useUpdateUser()
  const deleteM = useDeleteUser()

  const canCreate = usePermission('user', 'create')
  const canUpdate = usePermission('user', 'update')
  const canDelete = usePermission('user', 'delete')

  const isEdit       = !!selected
  const isSubmitting = createM.isPending || updateM.isPending
  const canEditOwnProfile = (user: User) =>
    isRestrictedRole &&
    (user.id === currentUser?.id || user.email === currentUser?.email)

  const openCreate  = () => { setSelected(null); form.resetFields(); setOpen(true) }
  const openEdit    = (r: User) => { setSelected(r); setOpen(true) }
  const closeDrawer = () => { setOpen(false); setSelected(null); form.resetFields() }

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (isEdit) {
        const { password, ...rest } = values as UserFormValues & { password?: string }
        const payload = password ? { ...rest, password } : rest
        console.debug('[USER UPDATE] form submit', {
          id: selected.id,
          fields: Object.keys(payload),
          hasPassword: Boolean(password),
        })
        updateM.mutate({ id: selected.id, payload }, { onSuccess: closeDrawer })
      } else {
        createM.mutate(values, { onSuccess: closeDrawer })
      }
    })
  }

  const handleApplyFilter = (values: ReportFilterValues) => {
    if (!isRestrictedRole) setSearch(values.search ?? '')
    setFilterOpen(false)
  }

  const actionMenu: MenuProps['items'] = [
    ...(canCreate
      ? [{ key: 'add', icon: <PlusOutlined />, label: 'Add', onClick: openCreate }]
      : []),
  ]

  const handleDelete = (r: User) => {
    showConfirm({
      title: 'Delete User',
      content: `Yakin delete user "${r.name}"?`,
      danger: true,
      okText: 'Ya, Delete',
      onConfirm: () => deleteM.mutate(r.id),
    })
  }

  const columns: ColumnsType<User> = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: 180,
      align: 'left',
      render: (value) => (
        <span style={{ fontWeight: 500 }}>{value}</span>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      width: 220,
      align: 'left',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      width: 120,
      align: 'center',
      render: (value) => (
        <Tag color={ROLE_COLOR[value] ?? 'default'}>
          {value}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 120,
      align: 'center',
      render: (value) => (
        <Tag color={value === 'active' ? 'success' : 'default'}>
          {value === 'active' ? 'Aktif' : 'Nonaktif'}
        </Tag>
      ),
    },
    {
      title: 'Create At',
      dataIndex: 'created_at',
      width: 140,
      align: 'center',
      render: (value) => formatDate(value),
    },
    {
      title: 'Actions',
      key: 'action',
      width: 100,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space size={4}>
          {(canUpdate || canEditOwnProfile(record)) && (
            <Tooltip title="Edit">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => openEdit(record)}
              />
            </Tooltip>
          )}

          {canDelete && (
            <Tooltip title="Hapus">
              <Button
                type="text"
                size="small"
                danger
                loading={deleteM.isPending}
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="User Management"
        // subtitle={`Total ${data?.meta?.total ?? 0} user`}
        extra={
          <Space>
            {!isRestrictedRole && (
              <Button icon={<FilterOutlined />} onClick={() => setFilterOpen(true)}>
                Filter
              </Button>
            )}
            {!isRestrictedRole && actionMenu.length > 0 && (
              <Dropdown menu={{ items: actionMenu }} trigger={['click']} placement="bottomRight">
                <Button type="primary">
                  Actions <DownOutlined />
                </Button>
              </Dropdown>
            )}
          </Space>
        }
      />
      <DataTable<User>
        rowKey="id" columns={columns}
        dataSource={visibleUsers}
        loading={isLoading}
        searchable={false}
        pagination={{
          current: params.page, pageSize: params.limit,
          total: isRestrictedRole ? visibleUsers.length : data?.meta?.total ?? 0,
          onChange: (p, s) => { setPage(p); setLimit(s) },
          showSizeChanger: true,
          showTotal: (t, r) => `${r[0]}–${r[1]} dari ${t} data`,
        }}
      />
      <ReportFilter
        open={filterOpen}
        title="User Management — Filter"
        dateMode="none"
        showSearch={!isRestrictedRole}
        searchPlaceholder="Cari nama atau email..."
        showEquipment={false}
        showShift={false}
        initialValues={{ search: isRestrictedRole ? currentUser?.email : params.search }}
        onClose={() => setFilterOpen(false)}
        onApply={handleApplyFilter}
        isLoading={isLoading}
      />
      <FormDrawer
        open={open}
        title={isEdit ? 'Edit User' : 'Add User'}
        onClose={closeDrawer}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitText={isEdit ? 'Save' : 'Add'}
      >
        <UserForm form={form} initialValues={selected} isEdit={isEdit} />
      </FormDrawer>
    </>
  )
}
export default UserListPage
