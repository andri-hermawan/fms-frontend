import { useState } from 'react'
import { Form, Button, Space, Tooltip } from 'antd'
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
      title: 'Delete Device',
      content: `Yakin ingin menghapus device IMEI "${device.device_code}"?`,
      danger: true,
      okText: 'Ya, Delete',
      onConfirm: () => deleteMutation.mutate(device.id),
    })
  }

  const columns: ColumnsType<Device> = [
    {
      title: 'Imei',
      dataIndex: 'device_code',
      key: 'device_code',
      width: 160,
      fixed: 'left',
      align: 'left',
      render: (value: string) => (
        <span
          style={{
            fontFamily: 'monospace',
            fontWeight: 600,
          }}
        >
          {value}
        </span>
      ),
    },
    {
      title: 'Device Name',
      dataIndex: 'device_name',
      key: 'device_name',
      width: 180,
      align: 'left',
    },
    {
      title: 'Provider',
      dataIndex: 'provider_name',
      key: 'provider_name',
      width: 140,
      align: 'left',
    },
    {
      title: 'No. SIM Card',
      dataIndex: 'sim_number',
      key: 'sim_number',
      width: 160,
      align: 'left',
    },
    {
      title: 'Device Model',
      dataIndex: 'device_model',
      key: 'device_model',
      width: 160,
      align: 'left',
    },
    {
      title: 'Equipment',
      key: 'equipments',
      width: 160,
      align: 'left',
      render: (_, record) =>
        record.equipments ? (
          <span style={{ fontWeight: 600 }}>
            {record.equipments.equipment_code}
          </span>
        ) : (
          <span style={{ color: '#999' }}>
            Belum dipasang
          </span>
        ),
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



  return (
    <>
      <PageHeader
        title="Device"
        // subtitle={`Total ${data?.meta.total ?? 0} Device`}
        extra={
          <Space>
            <Tooltip title="Refresh">
              <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading} />
            </Tooltip>
            {canCreate && (
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                Add
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
        submitText={isEditMode ? 'Save' : 'Add'}
      >
        <DeviceForm form={form} initialValues={selectedDevice} />
      </FormDrawer>
    </>
  )
}

export default DeviceListPage
