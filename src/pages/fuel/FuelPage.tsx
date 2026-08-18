import { useState } from 'react'
import { Form, Button, Space, Tooltip, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'
import FormDrawer from '@/components/ui/FormDrawer'
import { showConfirm } from '@/components/ui/ConfirmModal'
import { useFuels, useCreateFuel, useUpdateFuel, useDeleteFuel } from './useFuel'
import FuelForm from './FuelForm'
import usePermission from '@/hooks/usePermission'
import usePagination from '@/hooks/usePagination'
// import { formatDate } from '@/utils/format'
import type { Fuel, FuelFormValues } from '@/types/fuel.types'

const FuelPage = () => {
  const [form] = Form.useForm<FuelFormValues>()
  const [open, setOpen]         = useState(false)
  const [selected, setSelected] = useState<Fuel | null>(null)
  const { params, setSearch, setPage, setLimit } = usePagination()

  const { data, isLoading, refetch } = useFuels(params)
  const createM = useCreateFuel()
  const updateM = useUpdateFuel()
  const deleteM = useDeleteFuel()

  const canCreate = usePermission('project', 'create')
  const canUpdate = usePermission('project', 'update')
  const canDelete = usePermission('project', 'delete')

  const isEdit       = !!selected
  const isSubmitting = createM.isPending || updateM.isPending

  const openCreate  = () => { setSelected(null); form.resetFields(); setOpen(true) }
  const openEdit    = (r: Fuel) => { setSelected(r); setOpen(true) }
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

  const handleDelete = (r: Fuel) => {
    showConfirm({
      title: 'Delete Fuel',
      content: `Yakin delete data "${r.equipments?.equipment_code ?? r.equipment_id}"?`,
      danger: true,
      okText: 'Ya, Delete',
      onConfirm: () => deleteM.mutate(r.id),
    })
  }

  const columns: ColumnsType<Fuel> = [
    {
      title: 'Equipment',
      dataIndex: 'equipments',
      width: 130,
      align: 'left',
      render: (value) => (
        <span style={{ fontWeight: 600 }}>{value?.equipment_code ?? '—'}</span>
      ),
    },
    {
      title: 'Fuel Volume',
      dataIndex: 'fuel_volume',
      width: 120,
      align: 'right',
      render: (value) => (value != null ? `${value} L` : '—'),
    },
    {
      title: 'Fuel Level',
      dataIndex: 'fuel_level',
      width: 120,
      align: 'right',
      render: (value) => (value != null ? value : '—'),
    },
    {
      title: 'Fuel %',
      dataIndex: 'fuel_percentage',
      width: 100,
      align: 'right',
      render: (value) => (value != null ? `${value}%` : '—'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 150,
      align: 'center',
      render: (value) => (
        <Tag color={value?.toLowerCase().includes('decrease') ? 'red' : 'green'}>
          {value ?? '—'}
        </Tag>
      ),
    },
    {
      title: 'Vessel Status',
      dataIndex: 'vessel_status',
      width: 120,
      align: 'center',
      render: (value) => <Tag color="blue">{value ?? '—'}</Tag>,
    },
    // {
    //   title: 'Shift',
    //   dataIndex: 'shift',
    //   width: 100,
    //   align: 'center',
    //   render: (value) => value ?? '—',
    // },
    // {
    //   title: 'Created At',
    //   dataIndex: 'created_at',
    //   width: 150,
    //   align: 'center',
    //   render: (value) => formatDate(value, 'DD MMM YYYY HH:mm'),
    // },
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
        title="Fuel"
        extra={
          <Space>
            <Tooltip title="Refresh"><Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading} /></Tooltip>
            {canCreate && <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add</Button>}
          </Space>
        }
      />
      <DataTable<Fuel>
        rowKey="id" columns={columns}
        dataSource={data?.data ?? []}
        loading={isLoading} searchable
        searchPlaceholder="Cari equipment atau status..."
        onSearch={setSearch}
        pagination={{ current: params.page, pageSize: params.limit, total: data?.meta?.total ?? 0, onChange: (p, s) => { setPage(p); setLimit(s) }, showSizeChanger: true, showTotal: (t, r) => `${r[0]}–${r[1]} dari ${t} data` }}
      />
      <FormDrawer open={open} title={isEdit ? 'Edit Fuel' : 'Add Fuel'} onClose={closeDrawer} onSubmit={handleSubmit} isSubmitting={isSubmitting} submitText={isEdit ? 'Simpan' : 'Add'} width={560}>
        <FuelForm form={form} initialValues={selected} />
      </FormDrawer>
    </>
  )
}
export default FuelPage
