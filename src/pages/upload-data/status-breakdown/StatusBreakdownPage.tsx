import { useState } from 'react'
import * as XLSX from 'xlsx'
import { Form, Button, Space, Tooltip, Upload, Tag, Modal, Typography } from 'antd'
import type { UploadFile } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, UploadOutlined, DownloadOutlined, InboxOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'
import FormDrawer from '@/components/ui/FormDrawer'
import { showConfirm } from '@/components/ui/ConfirmModal'
import { useBreakdownStatuses, useCreateBreakdownStatus, useUpdateBreakdownStatus, useDeleteBreakdownStatus, useImportBreakdownStatus } from './useBreakdownStatus'
import BreakdownStatusForm from './BreakdownStatusForm'
import usePermission from '@/hooks/usePermission'
import usePagination from '@/hooks/usePagination'
import { formatDate, formatTime } from '@/utils/format'
import type { BreakdownStatus, BreakdownStatusFormValues } from '@/types/breakdown-status.types'

const BreakdownStatusPage = () => {
  const [form] = Form.useForm<BreakdownStatusFormValues>()
  const [open, setOpen]         = useState(false)
  const [selected, setSelected] = useState<BreakdownStatus | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [importFile, setImportFile] = useState<UploadFile | null>(null)
  const { params, setSearch, setPage, setLimit } = usePagination()

  const { data, isLoading, refetch } = useBreakdownStatuses(params)
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
        duration: values.duration ? dayjs(values.duration).format('HH:mm') : null,
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

  const downloadTemplate = () => {
    const rows = [
      ['Tanggal', 'Shift', 'Equipment Code', 'Class', 'Status', 'Category', 'Time Start', 'Time End', 'Duration', 'Repair Status', 'Description', 'Location'],
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

  const formatTimeDisplay = (value: string | null | undefined) => {
    if (!value) return '—'

    const normalized = String(value).trim()
    if (!normalized) return '—'

    if (/^\d{2}:\d{2}(:\d{2})?$/.test(normalized)) {
      return normalized.slice(0, 5)
    }

    const parsed = new Date(normalized)
    if (!Number.isNaN(parsed.getTime())) {
      return formatTime(parsed)
    }

    return normalized
  }

  const columns: ColumnsType<BreakdownStatus> = [
    {
      title: 'Tanggal',
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
      render: (value) => <Tag color="blue">{value}</Tag>,
    },
    {
      title: 'Equipment',
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
      render: (value) => (
        <Tag color={value === 'Breakdown' ? 'red' : 'green'}>{value}</Tag>
      ),
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
      render: (value) => formatTimeDisplay(value),
    },
    {
      title: 'End',
      dataIndex: 'time_end',
      width: 100,
      align: 'center',
      render: (value) => formatTimeDisplay(value),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      width: 100,
      align: 'center',
      render: (value) => formatTimeDisplay(value),
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
        extra={
          <Space>
            <Tooltip title="Import Excel">
              <Button icon={<UploadOutlined />} onClick={() => {
                setImportFile(null)
                setImportOpen(true)
              }}>
                Import
              </Button>
            </Tooltip>
            <Tooltip title="Refresh"><Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading} /></Tooltip>
            {canCreate && <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add</Button>}
          </Space>
        }
      />
      <DataTable<BreakdownStatus>
        rowKey="id" columns={columns}
        dataSource={data?.data ?? []}
        loading={isLoading} searchable
        searchPlaceholder="Cari equipment, class, atau kategori..."
        onSearch={setSearch}
        scroll={{ x: 'max-content' }}
        pagination={{ current: params.page, pageSize: params.limit, total: data?.meta?.total ?? 0, onChange: (p, s) => { setPage(p); setLimit(s) }, showSizeChanger: true, showTotal: (t, r) => `${r[0]}–${r[1]} dari ${t} data` }}
      />
      <FormDrawer open={open} title={isEdit ? 'Edit Breakdown Status' : 'Add Breakdown Status'} onClose={closeDrawer} onSubmit={handleSubmit} isSubmitting={isSubmitting} submitText={isEdit ? 'Simpan' : 'Add'} width={560}>
        <BreakdownStatusForm form={form} initialValues={selected} />
      </FormDrawer>

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
