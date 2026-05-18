import { useState } from 'react'
import { Form, Button, Space, Tooltip } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'
import FormDrawer from '@/components/ui/FormDrawer'
import StatusBadge from '@/components/ui/StatusBadge'
import { showConfirm } from '@/components/ui/ConfirmModal'

import {
  useEquipments,
  useCreateEquipment,
  useUpdateEquipment,
  useDeleteEquipment,
} from './useEquipment'
import EquipmentForm from './EquipmentForm'
import usePermission from '@/hooks/usePermission'
import usePagination from '@/hooks/usePagination'
import { formatDate } from '@/utils/format'
import type { Equipment, EquipmentFormValues, } from '@/types/equipment.types'

const EquipmentListPage = () => {
  const [form] = Form.useForm<EquipmentFormValues>()
  const [drawerOpen, setDrawerOpen]           = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)

  const { params, setSearch, setPage, setLimit } = usePagination()

  const { data, isLoading, refetch } = useEquipments(params)
  const createMutation = useCreateEquipment()
  const updateMutation = useUpdateEquipment()
  const deleteMutation = useDeleteEquipment()

  const canCreate = usePermission('equipment', 'create')
  const canUpdate = usePermission('equipment', 'update')
  const canDelete = usePermission('equipment', 'delete')

  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const isEditMode   = !!selectedEquipment

  // ─── Handlers ─────────────────────────────────────────────

  const openCreate = () => {
    setSelectedEquipment(null)
    form.resetFields()
    setDrawerOpen(true)
  }

  const openEdit = (equipment: Equipment) => {
    setSelectedEquipment(equipment)
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setSelectedEquipment(null)
    form.resetFields()
  }

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (isEditMode) {
        updateMutation.mutate(
          { id: selectedEquipment.id, payload: values },
          { onSuccess: closeDrawer }
        )
      } else {
        createMutation.mutate(values, { onSuccess: closeDrawer })
      }
    })
  }

  const handleDelete = (equipment: Equipment) => {
    showConfirm({
      title: 'Hapus Perangkat',
      content: `Yakin ingin menghapus "${equipment.equipment_code} (${equipment.equipment_code})"? Tindakan ini tidak bisa dibatalkan.`,
      danger: true,
      okText: 'Ya, Hapus',
      onConfirm: () => deleteMutation.mutate(equipment.id),
    })
  }

  // ─── Columns ──────────────────────────────────────────────

  const columns: ColumnsType<Equipment> = [
    {
      title: 'Cn Unit',
      dataIndex: 'equipment_code',
      key: 'equipment_code',
      width: 130,
      fixed: 'left',
      render: (val: string) => (
        <span style={{ fontWeight: 'bold', color: '#000' }}>
          {val}
        </span>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (val: string) => {
        const map: Record<string, string> = {
          truck: 'Truk', car: 'Mobil',
          motorcycle: 'Motor', heavy_equipment: 'Alat Berat',
        }
        return map[val] ?? val
      },
    },
    {
      title: 'Brand',
      key: 'brand',
      width: 160,
      render: (_, r) => `${r.brand} `,
    },
    {
      title: 'Model',
      key: 'model',
      width: 160,
      render: (_, r) => `${r.model} `,
    },
    {
      title: 'Class',
      key: 'class',
      width: 160,
      render: (_, r) => `${r.class} `,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (val) => <StatusBadge status={val} />,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (val: string) => formatDate(val),
    },
    {
      title: 'Actions',
      key: 'action',
      fixed: 'right',
      width: 90,
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
                icon={<DeleteOutlined />}
                loading={deleteMutation.isPending}
                onClick={() => handleDelete(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ]

  // ─── Render ───────────────────────────────────────────────

  return (
    <>
      <PageHeader
        title="Equipment"
        subtitle={`Total ${data?.meta.total ?? 0} Equipment terdaftar`}
        extra={
          <Space>
            <Tooltip title="Refresh">
              <Button
                icon={<ReloadOutlined />}
                onClick={() => refetch()}
                loading={isLoading}
              />
            </Tooltip>
            {canCreate && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreate}
              >
                NEW
              </Button>
            )}
          </Space>
        }
      />

      <DataTable<Equipment>
        rowKey="id"
        columns={columns}
        dataSource={data?.data ?? []}
        loading={isLoading}
        searchable
        searchPlaceholder="Cari plat nomor atau nama..."
        onSearch={setSearch}
        pagination={{
          current: params.page,
          pageSize: params.limit,
          total: data?.meta.total ?? 0,
          onChange: (page, size) => {
            setPage(page)
            setLimit(size)
          },
          showSizeChanger: true,
          showTotal: (total, range) =>
            `${range[0]}–${range[1]} dari ${total} data`,
        }}
      />

      <FormDrawer
        open={drawerOpen}
        title={isEditMode ? 'Edit Equipment' : 'Add Equipment'}
        onClose={closeDrawer}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitText={isEditMode ? 'Simpan Perubahan' : 'Add'}
        width={540}
      >
        <EquipmentForm form={form} initialValues={selectedEquipment} />
      </FormDrawer>
    </>
  )
}

export default EquipmentListPage
