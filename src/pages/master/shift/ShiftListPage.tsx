import { useState } from 'react'
import { Form, Button, Space, Tooltip, Tag, Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, FilterOutlined, DownOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'
import ReportFilter, { type ReportFilterValues } from '@/components/report/ReportFilter'
import FormDrawer from '@/components/ui/FormDrawer'
import { showConfirm } from '@/components/ui/ConfirmModal'
import { useShifts, useCreateShift, useUpdateShift, useDeleteShift } from './useShift'
import ShiftForm from './ShiftForm'
import usePermission from '@/hooks/usePermission'
import usePagination from '@/hooks/usePagination'
import { formatDate } from '@/utils/format'
import type { Shift, ShiftFormValues } from '@/types/shift.types'

const ShiftListPage = () => {
  const [form] = Form.useForm<ShiftFormValues>()
  const [open, setOpen]         = useState(false)
  const [selected, setSelected] = useState<Shift | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const { params, setSearch, setPage, setLimit } = usePagination()

  const { data, isLoading } = useShifts(params)
  const createM = useCreateShift()
  const updateM = useUpdateShift()
  const deleteM = useDeleteShift()

  const canCreate = usePermission('shift', 'create')
  const canUpdate = usePermission('shift', 'update')
  const canDelete = usePermission('shift', 'delete')

  const isEdit       = !!selected
  const isSubmitting = createM.isPending || updateM.isPending

  const openCreate  = () => { setSelected(null); form.resetFields(); setOpen(true) }
  const openEdit    = (r: Shift) => { setSelected(r); setOpen(true) }
  const closeDrawer = () => { setOpen(false); setSelected(null); form.resetFields() }



  const handleApplyFilter = (values: ReportFilterValues) => {
    setSearch(values.search ?? '')
    setFilterOpen(false)
  }

  const actionMenu: MenuProps['items'] = [
    ...(canCreate
      ? [{ key: 'add', icon: <PlusOutlined />, label: 'Add', onClick: openCreate }]
      : []),
  ]

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (isEdit) {
        updateM.mutate({ id: selected.id, payload: values }, { onSuccess: closeDrawer })
      } else {
        createM.mutate(values, { onSuccess: closeDrawer })
      }
    })
  }

  const handleDelete = (r: Shift) => {
    showConfirm({
      title: 'Delete Shift',
      content: `Yakin delete shift "${r.shift_name}"?`,
      danger: true,
      okText: 'Ya, Delete',
      onConfirm: () => deleteM.mutate(r.id),
    })
  }

  const columns: ColumnsType<Shift> = [
    {
      title: 'Shift Code',
      dataIndex: 'shift_code',
      width: 120,
      align: 'left',
      render: (value) => (
        <span style={{ fontWeight: 600 }}>
          {value}
        </span>
      ),
    },
    {
      title: 'Shift Name',
      dataIndex: 'shift_name',
      width: 200,
      align: 'left',
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
      title: 'Created At',
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
          {canUpdate && (
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
        title="Shift"
        // subtitle={`Total ${data?.meta?.total ?? 0} shift`}
        extra={
          <Space>
            <Button icon={<FilterOutlined />} onClick={() => setFilterOpen(true)}>Filter</Button>
            <Dropdown menu={{ items: actionMenu }} trigger={['click']} placement="bottomRight">
              <Button type="primary">Actions <DownOutlined /></Button>
            </Dropdown>
          </Space>
        }
      />
      <DataTable<Shift>
        rowKey="id" columns={columns}
        dataSource={data?.data ?? []}
        loading={isLoading}
        searchable={false}
        pagination={{ current: params.page, pageSize: params.limit, total: data?.meta?.total ?? 0, onChange: (p, s) => { setPage(p); setLimit(s) }, showSizeChanger: true, showTotal: (t, r) => `${r[0]}–${r[1]} dari ${t} data` }}
      />
      <ReportFilter
        open={filterOpen}
        title="Shift ? Filter"
        dateMode="none"
        showSearch
        searchPlaceholder="Cari kode atau nama..."
        showEquipment={false}
        showShift={false}
        initialValues={{ search: params.search }}
        onClose={() => setFilterOpen(false)}
        onApply={handleApplyFilter}
        isLoading={isLoading}
      />
      <FormDrawer open={open} title={isEdit ? 'Edit Shift' : 'Add Shift'} onClose={closeDrawer} onSubmit={handleSubmit} isSubmitting={isSubmitting} submitText={isEdit ? 'Save' : 'Add'}>
        <ShiftForm form={form} initialValues={selected} />
      </FormDrawer>
    </>
  )
}
export default ShiftListPage
