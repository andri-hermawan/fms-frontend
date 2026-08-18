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
      title: 'Delete Perangkat',
      content: `Yakin ingin menghapus "${equipment.equipment_code} (${equipment.equipment_code})"? Tindakan ini tidak bisa dibatalkan.`,
      danger: true,
      okText: 'Ya, Delete',
      onConfirm: () => deleteMutation.mutate(equipment.id),
    })
  }

  // ─── Columns ──────────────────────────────────────────────

  const columns: ColumnsType<Equipment> = [
    {
      title: 'Unit Code',
      dataIndex: 'equipment_code',
      key: 'equipment_code',
      width: 130,
      fixed: 'left',
      align: 'left',
      render: (value: string) => (
        <span style={{ fontWeight: 600 }}>
          {value}
        </span>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      align: 'left',
      render: (value: string) => {
        const map: Record<string, string> = {
          truck: 'Truk',
          car: 'Mobil',
          motorcycle: 'Motor',
          heavy_equipment: 'Alat Berat',
        }

        return map[value] ?? value
      },
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      key: 'brand',
      width: 160,
      align: 'left',
    },
    {
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
      width: 160,
      align: 'left',
    },
    {
      title: 'Class',
      dataIndex: 'class',
      key: 'class',
      width: 160,
      align: 'left',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (value) => <StatusBadge status={value} />,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      align: 'center',
      render: (value: string) => formatDate(value),
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
        // subtitle={`Total ${data?.meta.total ?? 0} Equipment`}
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
                Add
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
        submitText={isEditMode ? 'Save' : 'Add'}
        width={540}
      >
        <EquipmentForm form={form} initialValues={selectedEquipment} />
      </FormDrawer>
    </>
  )
}

export default EquipmentListPage
