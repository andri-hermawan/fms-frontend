import { useState } from 'react'
import { Form, Button, Space, Tooltip, Badge } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'
import FormDrawer from '@/components/ui/FormDrawer'
import StatusBadge from '@/components/ui/StatusBadge'
import { showConfirm } from '@/components/ui/ConfirmModal'

import { useDevices, useCreateDevice, useUpdateDevice, useDeleteDevice } from './useDevice'
import DeviceForm from './DeviceForm'
import usePermission from '@/hooks/usePermission'
import usePagination from '@/hooks/usePagination'
import { formatDate, formatDateTime } from '@/utils/format'
import type { Device, DeviceFormValues } from '@/types/device.types'

const DeviceListPage = () => {
  const [form] = Form.useForm<DeviceFormValues>()
  const [drawerOpen, setDrawerOpen]         = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)

  const { params, setSearch, setPage, setLimit } = usePagination()

  const { data, isLoading, refetch } = useDevices(params)
  const createMutation = useCreateDevice()
  const updateMutation = useUpdateDevice()
  const deleteMutation = useDeleteDevice()

  const canCreate = usePermission('device', 'create')
  const canUpdate = usePermission('device', 'update')
  const canDelete = usePermission('device', 'delete')

  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const isEditMode   = !!selectedDevice

  const openCreate = () => {
    setSelectedDevice(null)
    form.resetFields()
    setDrawerOpen(true)
  }

  const openEdit = (device: Device) => {
    setSelectedDevice(device)
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setSelectedDevice(null)
    form.resetFields()
  }

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (isEditMode) {
        updateMutation.mutate(
          { id: selectedDevice.id, payload: values },
          { onSuccess: closeDrawer }
        )
      } else {
        createMutation.mutate(values, { onSuccess: closeDrawer })
      }
    })
  }

  const handleDelete = (device: Device) => {
    showConfirm({
      title: 'Hapus Device',
      content: `Yakin ingin menghapus device IMEI "${device.device_code}"?`,
      danger: true,
      okText: 'Ya, Hapus',
      onConfirm: () => deleteMutation.mutate(device.id),
    })
  }

  const columns: ColumnsType<Device> = [
    {
      title: 'Code / Imei',
      dataIndex: 'device_code',
      key: 'device_code',
      width: 160,
      fixed: 'left',
      render: (val: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{val}</span>
      ),
    },
    {
      title: 'Device Name',
      dataIndex: 'device_name',
      key: 'device_name',
      width: 160,
    },
    {
      title: 'Provider',
      dataIndex: 'provider_name',
      key: 'provider_name',
      width: 140,
    },
    {
      title: 'Sim Number',
      dataIndex: 'sim_number',
      key: 'sim_number',
      width: 140,
    },
    {
      title: 'Device Model',
      dataIndex: 'device_model',
      key: 'device_model',
      width: 140,
    },
    {
      title: 'Equipment',
      key: 'equipments',
      width: 160,
      render: (_, r) =>
        r.equipments
          ? `${r.equipments.equipment_code}`
          : <span style={{ color: '#ccc' }}>Belum dipasang</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (val) => <StatusBadge status={val} />,
    },
    {
      title: 'Aksi',
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

  // Summary badges
  const onlineCount     = data?.data.filter((d) => d.status === 'online').length ?? 0
  const offlineCount    = data?.data.filter((d) => d.status === 'offline').length ?? 0
  const unassignedCount = data?.data.filter((d) => d.status === 'unassigned').length ?? 0

  return (
    <>
      <PageHeader
        title="GPS Device"
        subtitle={
          <Space size={12}>
            <Badge status="success" text={`${onlineCount} Online`} />
            <Badge status="error"   text={`${offlineCount} Offline`} />
            <Badge status="default" text={`${unassignedCount} Belum Dipasang`} />
          </Space>
        }
        extra={
          <Space>
            <Tooltip title="Refresh">
              <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading} />
            </Tooltip>
            {canCreate && (
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                NEW
              </Button>
            )}
          </Space>
        }
      />

      <DataTable<Device>
        rowKey="id"
        columns={columns}
        dataSource={data?.data ?? []}
        loading={isLoading}
        searchable
        searchPlaceholder="Cari IMEI atau model..."
        onSearch={setSearch}
        pagination={{
          current: params.page,
          pageSize: params.limit,
          total: data?.meta.total ?? 0,
          onChange: (page, size) => { setPage(page); setLimit(size) },
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}–${range[1]} dari ${total} data`,
        }}
      />

      <FormDrawer
        open={drawerOpen}
        title={isEditMode ? 'Edit Device' : 'Add Device'}
        onClose={closeDrawer}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitText={isEditMode ? 'Simpan Perubahan' : 'Add'}
      >
        <DeviceForm form={form} initialValues={selectedDevice} />
      </FormDrawer>
    </>
  )
}

export default DeviceListPage
