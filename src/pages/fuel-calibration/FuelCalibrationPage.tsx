import { useState } from 'react'
import { Form, Button, Space, Tooltip } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'
import FormDrawer from '@/components/ui/FormDrawer'
import { showConfirm } from '@/components/ui/ConfirmModal'
import { useFuelCalibrations, useCreateFuelCalibration, useUpdateFuelCalibration, useDeleteFuelCalibration } from './useFuelCalibration'
import FuelCalibrationForm from './FuelCalibrationForm'
import usePermission from '@/hooks/usePermission'
import usePagination from '@/hooks/usePagination'
import type { FuelCalibration, FuelCalibrationFormValues } from '@/types/fuel-calibration.types'

const FuelCalibrationPage = () => {
  const [form] = Form.useForm<FuelCalibrationFormValues>()
  const [open, setOpen]         = useState(false)
  const [selected, setSelected] = useState<FuelCalibration | null>(null)
  const { params, setSearch, setPage, setLimit } = usePagination()

  const { data, isLoading, refetch } = useFuelCalibrations(params)
  const createM = useCreateFuelCalibration()
  const updateM = useUpdateFuelCalibration()
  const deleteM = useDeleteFuelCalibration()

  const canCreate = usePermission('project', 'create')
  const canUpdate = usePermission('project', 'update')
  const canDelete = usePermission('project', 'delete')

  const isEdit       = !!selected
  const isSubmitting = createM.isPending || updateM.isPending

  const openCreate  = () => { setSelected(null); form.resetFields(); setOpen(true) }
  const openEdit    = (r: FuelCalibration) => { setSelected(r); setOpen(true) }
  const closeDrawer = () => { setOpen(false); setSelected(null); form.resetFields() }

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (isEdit) {
        updateM.mutate({ equipmentId: selected.equipment_id, payload: values }, { onSuccess: closeDrawer })
      } else {
        createM.mutate(values, { onSuccess: closeDrawer })
      }
    })
  }

  const handleDelete = (r: FuelCalibration) => {
    const code = r.equipment_id ?? r.equipment_id
    showConfirm({
      title: 'Delete Fuel Calibration',
      content: `Yakin delete fuel calibration "${code}"?`,
      danger: true,
      okText: 'Ya, Delete',
      onConfirm: () => deleteM.mutate(r.equipment_id),
    })
  }

  const columns: ColumnsType<FuelCalibration> = [
    {
      title: 'Equipment Code',
      key: 'equipment_code',
      width: 160,
      align: 'left',
      render: (_, record) => (
        <span style={{ fontWeight: 600 }}>
          {record.equipment_code ?? '—'}
        </span>
      ),
    },
    {
      title: 'Max Fuel Volume (liter)',
      dataIndex: 'fuel_volume',
      width: 140,
      align: 'center',
      render: (value) => value ?? '—',
    },
    {
      title: 'Max Fuel Level (sensor)',
      dataIndex: 'fuel_level',
      width: 140,
      align: 'center',
      render: (value) => value ?? '—',
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
        title="Fuel Calibration"
        extra={
          <Space>
            <Tooltip title="Refresh"><Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading} /></Tooltip>
            {canCreate && <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add</Button>}
          </Space>
        }
      />
      <DataTable<FuelCalibration>
        rowKey={(record) => `${record.id}-${record.equipment_code}`}
        columns={columns}
        dataSource={data?.data ?? []}
        loading={isLoading} searchable
        searchPlaceholder="Cari equipment..."
        onSearch={setSearch}
        pagination={{ current: params.page, pageSize: params.limit, total: data?.meta?.total ?? 0, onChange: (p, s) => { setPage(p); setLimit(s) }, showSizeChanger: true, showTotal: (t, r) => `${r[0]}–${r[1]} dari ${t} data` }}
      />
      <FormDrawer open={open} title={isEdit ? 'Edit Fuel Calibration' : 'Add Fuel Calibration'} onClose={closeDrawer} onSubmit={handleSubmit} isSubmitting={isSubmitting} submitText={isEdit ? 'Simpan' : 'Add'}>
        <FuelCalibrationForm form={form} initialValues={selected} />
      </FormDrawer>
    </>
  )
}
export default FuelCalibrationPage
