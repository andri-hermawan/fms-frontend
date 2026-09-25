import { useState } from 'react'
import * as XLSX from 'xlsx'
import { Form, Button, Space, Tooltip, Upload, Tag, Modal, Typography, Select, Dropdown } from 'antd'
import type { MenuProps, UploadFile } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, InboxOutlined, FilterOutlined, DownOutlined, ImportOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'
import FormDrawer from '@/components/ui/FormDrawer'
import ReportFilter, { type ReportFilterValues } from '@/components/report/ReportFilter'
import { showConfirm } from '@/components/ui/ConfirmModal'
import { useBreakdownStatuses, useCreateBreakdownStatus, useUpdateBreakdownStatus, useDeleteBreakdownStatus, useImportBreakdownStatus } from './useBreakdownStatus'
import BreakdownStatusForm from './BreakdownStatusForm'
import usePermission from '@/hooks/usePermission'
import usePagination from '@/hooks/usePagination'
import { useShifts } from '@/pages/master/shift/useShift'
import { formatDate, formatTimeUtc } from '@/utils/format'
import type { BreakdownStatus, BreakdownFormValues, BreakdownStatusFormValues } from '@/types/breakdown-status.types'

const BreakdownStatusPage = () => {
  const [form] = Form.useForm<BreakdownFormValues>()
  const [open, setOpen]         = useState(false)
  const [selected, setSelected] = useState<BreakdownStatus | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [importFile, setImportFile] = useState<UploadFile | null>(null)
  const [filterOpen, setFilterOpen] = useState(true)
  const { params, setSearch, setPage, setLimit, setDateAt, setShift } = usePagination({ date_at: dayjs().format('YYYY-MM-DD') })

  const { data, isLoading } = useBreakdownStatuses(params)
  const { data: shiftData } = useShifts({ limit: 100 })
  const shiftOptions = (shiftData?.data ?? []).map((s) => ({ label: s.shift_name, value: s.shift_name }))
  const createM = useCreateBreakdownStatus()
  const updateM = useUpdateBreakdownStatus()
  const deleteM = useDeleteBreakdownStatus()
  const importM = useImportBreakdownStatus()

  const canCreate = usePermission('project', 'create')
  const canUpdate = usePermission('project', 'update')
  const canDelete = usePermission('project', 'delete')

  const isEdit       = !!selected
  const isSubmitting = createM.isPending || updateM.isPending

  const openCreate  = () => { setSelected(null); form.resetFields(); setOpen(true) }
  const openEdit    = (r: BreakdownStatus) => { setSelected(r); setOpen(true) }
  const closeDrawer = () => { setOpen(false); setSelected(null); form.resetFields() }

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const payload: BreakdownStatusFormValues = {
        ...values,
        date_at: dayjs(values.date_at as unknown as string).toISOString(),
        time_start: values.time_start ? dayjs(values.time_start).format('HH:mm') : null,
        time_end: values.time_end ? dayjs(values.time_end).format('HH:mm') : null,
        duration: values.duration ?? null,
      }
      if (isEdit) {
        updateM.mutate({ id: selected.id, payload }, { onSuccess: closeDrawer })
      } else {
        createM.mutate(payload, { onSuccess: closeDrawer })
      }
    })
  }

  const handleDelete = (r: BreakdownStatus) => {
    showConfirm({
      title: 'Delete Breakdown Status',
      content: `Yakin delete data "${r.equipment_code}"?`,
      danger: true,
      okText: 'Ya, Delete',
      onConfirm: () => deleteM.mutate(r.id),
    })
  }

  const handleApplyFilter = (values: ReportFilterValues) => {
    setSearch(values.search ?? '')
    setDateAt(values.date)
    setShift(values.shift)
    setFilterOpen(false)
  }

  const handleDownload = () => {
    const list = data?.data ?? []
    if (list.length === 0) return

    const exportData = list.map((item, index) => ({
      No: ((params.page ?? 1) - 1) * (params.limit ?? 25) + index + 1,
      Date: formatDate(item.date_at),
      Shift: item.shift ?? '-',
      'Asset ID': item.equipment_code ?? '-',
      Status: item.status ?? '-',
      Category: item.category ?? '-',
      'Time Start': item.time_start ?? '-',
      'Time End': item.time_end ?? '-',
      Duration: item.duration ?? '-',
      'Repair Status': item.repair_status ?? '-',
      Description: item.description ?? '-',
      Location: item.location ?? '-',
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    ws['!cols'] = [
      { wch: 6 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 12 },
      { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 },
      { wch: 30 }, { wch: 16 },
    ]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Status Breakdown')
    XLSX.writeFile(
      wb,
      `status-breakdown_${params.date_at ?? dayjs().format('YYYY-MM-DD')}.xlsx`,
    )
  }

  const downloadTemplate = () => {
    const rows = [
      ['Date', 'Shift', 'Asset ID', 'Class', 'Status', 'Category', 'Time Start', 'Time End', 'Duration', 'Repair Status', 'Description', 'Location'],
      ['11-08-2026', 'Shift 1', '10303', 'DUMP TRUCK', 'Breakdown', 'Unsch Maintenance', '07:00', '', '', 'On Progress', 'BATTERY BERMASALAH', 'STA 24'],
    ]
    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [
      { wch: 12 }, { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 12 },
      { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 },
      { wch: 30 }, { wch: 16 },
    ]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Template')
    XLSX.writeFile(wb, 'template_breakdown_status.xlsx')
  }

  const handleImportOk = () => {
    if (!importFile?.originFileObj) return
    importM.mutate(importFile.originFileObj, { onSuccess: () => setImportOpen(false) })
    setImportFile(null)
  }

  const openImport = () => {
    setImportFile(null)
    setImportOpen(true)
  }

  const actionMenu: MenuProps['items'] = [
    ...(canCreate
      ? [
          {
            key: 'add',
            icon: <PlusOutlined />,
            label: 'Add',
            onClick: openCreate,
          },
        ]
      : []),
    {
      key: 'import',
      icon: <ImportOutlined />,
      label: 'Upload Excel',
      onClick: openImport,
    },
    {
      key: 'download',
      icon: <DownloadOutlined />,
      label: 'Download Raw Data',
      disabled: !(data?.data?.length),
      onClick: handleDownload,
    },
  ]

  const columns: ColumnsType<BreakdownStatus> = [
    {
      title: 'No',
      key: 'index',
      width: 60,
      align: 'center',
      fixed: 'left',
      render: (_, __, index) =>
        ((params.page ?? 1) - 1) * (params.limit ?? 25) + index + 1,
    },
    {
      title: 'Date',
      dataIndex: 'date_at',
      width: 120,
      align: 'center',
      render: (value) => formatDate(value),
    },
    {
      title: 'Shift',
      dataIndex: 'shift',
      width: 100,
      align: 'center',
    },
    {
      title: 'Asset ID',
      dataIndex: 'equipment_code',
      width: 120,
      align: 'left',
      render: (value) => <span style={{ fontWeight: 600 }}>{value}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 120,
      align: 'center',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      width: 180,
      align: 'left',
    },
    {
      title: 'Start',
      dataIndex: 'time_start',
      width: 100,
      align: 'center',
      render: (value) => formatTimeUtc(value),
    },
    {
      title: 'End',
      dataIndex: 'time_end',
      width: 100,
      align: 'center',
      render: (value) => formatTimeUtc(value),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      width: 100,
      align: 'center',
      render: (value) => formatTimeUtc(value),
    },
    {
      title: 'Repair Status',
      dataIndex: 'repair_status',
      width: 130,
      align: 'center',
      render: (value) => <Tag color={value === 'Done' ? 'green' : 'orange'}>{value}</Tag>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      width: 220,
      align: 'left',
      render: (value) => value ?? '—',
    },
    {
      title: 'Location',
      dataIndex: 'location',
      width: 120,
      align: 'left',
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
        title="Status Breakdown"
        subtitle={`Total ${data?.meta?.total ?? 0} data`}
        extra={
          <Space>
            <Button icon={<FilterOutlined />} onClick={() => setFilterOpen(true)}>
              Filter
            </Button>
            <Dropdown menu={{ items: actionMenu }} trigger={['click']} placement="bottomRight">
              <Button type="primary">
                Actions <DownOutlined />
              </Button>
            </Dropdown>
          </Space>
        }
      />
      <DataTable<BreakdownStatus>
        rowKey="id" columns={columns}
        dataSource={data?.data ?? []}
        loading={isLoading}
        scroll={{ x: 'max-content' }}
        pagination={{ current: params.page, pageSize: params.limit, total: data?.meta?.total ?? 0, onChange: (p, s) => { setPage(p); setLimit(s) }, showSizeChanger: true, showTotal: (t, r) => `${r[0]}–${r[1]} dari ${t} data` }}
      />
      <FormDrawer open={open} title={isEdit ? 'Edit Breakdown Status' : 'Add Breakdown Status'} onClose={closeDrawer} onSubmit={handleSubmit} isSubmitting={isSubmitting} submitText={isEdit ? 'Simpan' : 'Add'} width={560}>
        <BreakdownStatusForm form={form} initialValues={selected} />
      </FormDrawer>

      <ReportFilter
        open={filterOpen}
        title="Status Breakdown — Filter"
        dateMode="single"
        showSearch
        searchPlaceholder="Cari equipment, class, atau kategori..."
        showEquipment={false}
        showShift={false}
        initialValues={{ date: params.date_at, shift: params.shift }}
        onClose={() => setFilterOpen(false)}
        onApply={handleApplyFilter}
        isLoading={isLoading}
      >
        <Form.Item name="shift" label="Shift">
          <Select placeholder="Pilih shift" allowClear options={shiftOptions} />
        </Form.Item>
      </ReportFilter>

      <Modal
        title="Import Data Breakdown Status"
        open={importOpen}
        onCancel={() => setImportOpen(false)}
        onOk={handleImportOk}
        okText="Import"
        okButtonProps={{ disabled: !importFile, loading: importM.isPending }}
      >
        <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
          Download template terlebih dahulu, isi sesuai format, lalu upload file Excel (format .xlsx / .xls).
        </Typography.Paragraph>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button icon={<DownloadOutlined />} onClick={downloadTemplate}>
            Download Template
          </Button>
          <Upload.Dragger
            accept=".xlsx,.xls"
            maxCount={1}
            beforeUpload={(file) => {
              const uploadFile: UploadFile = {
                uid: file.uid,
                name: file.name,
                size: file.size,
                type: file.type,
                originFileObj: file,
              }
              setImportFile(uploadFile)
              return false
            }}
            onRemove={() => setImportFile(null)}
            fileList={importFile ? [importFile] : []}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Klik atau seret file ke area ini</p>
            <p className="ant-upload-hint">Hanya file Excel (.xlsx / .xls)</p>
          </Upload.Dragger>
        </Space>
      </Modal>
    </>
  )
}
export default BreakdownStatusPage
