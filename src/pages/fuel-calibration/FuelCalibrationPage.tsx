import { useEffect, useState } from 'react'
import { Form, Button, Space, Tooltip, Dropdown, Modal, Progress, Empty, Typography } from 'antd'
import type { MenuProps } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, FilterOutlined, DownOutlined, ExperimentOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'
import ReportFilter, { type ReportFilterValues } from '@/components/report/ReportFilter'
import FormDrawer from '@/components/ui/FormDrawer'
import { showConfirm } from '@/components/ui/ConfirmModal'
import { useFuelCalibrations, useFuelCalibrationsByEquipment, useCreateFuelCalibration, useUpdateFuelCalibration, useDeleteFuelCalibration } from './useFuelCalibration'
import FuelCalibrationForm from './FuelCalibrationForm'
import usePermission from '@/hooks/usePermission'
import usePagination from '@/hooks/usePagination'
import type { FuelCalibration, FuelCalibrationFormValues } from '@/types/fuel-calibration.types'

const FuelCalibrationPage = () => {
  const [form] = Form.useForm<FuelCalibrationFormValues>()
  const [open, setOpen]         = useState(false)
  const [selected, setSelected] = useState<FuelCalibration | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [animationOpen, setAnimationOpen] = useState(false)
  const [animationEquipment, setAnimationEquipment] = useState<FuelCalibration | null>(null)
  const [animationLevel, setAnimationLevel] = useState(0)
  const { params, setSearch, setPage, setLimit } = usePagination()

  const { data, isLoading } = useFuelCalibrations(params)
  const { data: animationData, isLoading: animationLoading } =
    useFuelCalibrationsByEquipment(animationEquipment?.equipment_id)
  const animationCalibrations = (animationData?.data?.length
    ? animationData.data
    : animationEquipment
      ? [animationEquipment]
      : []
  ).sort((a, b) => (a.fuel_volume ?? 0) - (b.fuel_volume ?? 0))
  const animationCalibration = animationCalibrations[animationCalibrations.length - 1]
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

  const openAnimation = (record: FuelCalibration) => {
    setAnimationEquipment(record)
    setAnimationLevel(0)
    setAnimationOpen(true)
  }

  useEffect(() => {
    if (!animationOpen || !animationEquipment) return

    const maxFuel = Math.max(animationCalibration?.fuel_volume || 0, 1)
    const step = maxFuel / 50
    const timer = window.setInterval(() => {
      setAnimationLevel((current) => {
        const next = Math.min(current + step, maxFuel)
        if (next >= maxFuel) window.clearInterval(timer)
        return next
      })
    }, 40)

    return () => window.clearInterval(timer)
  }, [animationOpen, animationCalibration])

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
          <Tooltip title="Fuel Calibration Animation">
            <Button
              type="text"
              size="small"
              icon={<ExperimentOutlined />}
              onClick={() => openAnimation(record)}
            />
          </Tooltip>

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
            <Button icon={<FilterOutlined />} onClick={() => setFilterOpen(true)}>Filter</Button>
            <Dropdown menu={{ items: actionMenu }} trigger={['click']} placement="bottomRight">
              <Button type="primary">Actions <DownOutlined /></Button>
            </Dropdown>
          </Space>
        }
      />
      <DataTable<FuelCalibration>
        rowKey={(record) => `${record.id}-${record.equipment_code}`}
        columns={columns}
        dataSource={data?.data ?? []}
        loading={isLoading}
        searchable={false}
        pagination={{ current: params.page, pageSize: params.limit, total: data?.meta?.total ?? 0, onChange: (p, s) => { setPage(p); setLimit(s) }, showSizeChanger: true, showTotal: (t, r) => `${r[0]}–${r[1]} dari ${t} data` }}
      />
      <ReportFilter
        open={filterOpen}
        title="Fuel Calibration ? Filter"
        dateMode="none"
        showSearch
        searchPlaceholder="Cari equipment..."
        showEquipment={false}
        showShift={false}
        initialValues={{ search: params.search }}
        onClose={() => setFilterOpen(false)}
        onApply={handleApplyFilter}
        isLoading={isLoading}
      />
      <Modal
        open={animationOpen}
        title={`Fuel Calibration Animation — ${animationEquipment?.equipment_code ?? 'Equipment'}`}
        footer={null}
        onCancel={() => {
          setAnimationOpen(false)
          setAnimationEquipment(null)
        }}
      >
        {animationLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Typography.Text>Memuat data calibration...</Typography.Text></div>
        ) : animationCalibration ? (
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flex: '0 0 150px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <Typography.Text type="secondary">Tank Animation</Typography.Text>
              <div
                style={{
                  position: 'relative',
                  width: 120,
                  height: 280,
                  border: '4px solid #8c8c8c',
                  borderRadius: '16px 16px 24px 24px',
                  overflow: 'hidden',
                  background: '#f5f5f5',
                }}
              >
                <div
                  style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    height: `${(animationLevel / Math.max(animationCalibration.fuel_volume || 0, 1)) * 100}%`,
                    background: 'linear-gradient(180deg, #ffc53d 0%, #fa8c16 100%)',
                    transition: 'height 40ms linear',
                  }}
                />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography.Title level={3} style={{ color: '#fff', textShadow: '0 1px 3px #595959', margin: 0 }}>
                    {animationLevel.toFixed(1)} L
                  </Typography.Title>
                </div>
              </div>
              <Progress
                percent={Math.round((animationLevel / Math.max(animationCalibration.fuel_volume || 0, 1)) * 100)}
                status="active"
                showInfo={false}
                style={{ width: 140 }}
              />
            </div>
            <div style={{ flex: '1 1 280px', minWidth: 260 }}>
              <Typography.Text type="secondary">
                Kapasitas maksimum {animationCalibration.fuel_volume ?? 0} liter
              </Typography.Text>
              <Typography.Title level={5}>Tahapan Kalibrasi</Typography.Title>
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                {animationCalibrations.map((calibration) => {
                  const maxFuel = Math.max(animationCalibration.fuel_volume || 0, 1)
                  const reached = animationLevel >= (calibration.fuel_volume ?? 0)
                  return (
                    <div key={calibration.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, color: reached ? '#1677ff' : '#8c8c8c', fontWeight: reached ? 600 : 400 }}>
                      <span>{calibration.fuel_volume ?? 0} liter</span>
                      <span>Sensor: {calibration.fuel_level ?? 0}</span>
                      <span>{Math.round(((calibration.fuel_volume ?? 0) / maxFuel) * 100)}%</span>
                    </div>
                  )
                })}
              </Space>
            </div>
          </div>
        ) : (
          <Empty description="Data calibration tidak tersedia" />
        )}
      </Modal>
      <FormDrawer open={open} title={isEdit ? 'Edit Fuel Calibration' : 'Add Fuel Calibration'} onClose={closeDrawer} onSubmit={handleSubmit} isSubmitting={isSubmitting} submitText={isEdit ? 'Simpan' : 'Add'}>
        <FuelCalibrationForm form={form} initialValues={selected} />
      </FormDrawer>
    </>
  )
}
export default FuelCalibrationPage
