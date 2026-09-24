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
import { useWeighbridges, useCreateWeighbridge, useUpdateWeighbridge, useDeleteWeighbridge, useImportWeighbridge } from './useWeighbridge'
import WeighbridgeForm from './WeighbridgeForm'
import usePermission from '@/hooks/usePermission'
import usePagination from '@/hooks/usePagination'
import { useShifts } from '@/pages/master/shift/useShift'
import { formatDate, formatNumber } from '@/utils/format'
import type { Weighbridge, WeighbridgeFormValues } from '@/types/weighbridge.types'

const WeighbridgePage = () => {
  const [form] = Form.useForm<WeighbridgeFormValues>()
  const [open, setOpen]         = useState(false)
  const [selected, setSelected] = useState<Weighbridge | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [importFile, setImportFile] = useState<UploadFile | null>(null)
  const [filterOpen, setFilterOpen] = useState(true)
  const { params, setSearch, setPage, setLimit, setDateAt, setShift } = usePagination({ date_at: dayjs().format('YYYY-MM-DD') })

  const { data, isLoading } = useWeighbridges(params)
  const { data: shiftData } = useShifts({ limit: 100 })
  const shiftOptions = (shiftData?.data ?? []).map((s) => ({ label: s.shift_name, value: s.shift_name }))
  const createM = useCreateWeighbridge()
  const updateM = useUpdateWeighbridge()
  const deleteM = useDeleteWeighbridge()
  const importM = useImportWeighbridge()

  const canCreate = usePermission('project', 'create')
  const canUpdate = usePermission('project', 'update')
  const canDelete = usePermission('project', 'delete')

  const isEdit       = !!selected
  const isSubmitting = createM.isPending || updateM.isPending

  const openCreate  = () => { setSelected(null); form.resetFields(); setOpen(true) }
  const openEdit    = (r: Weighbridge) => { setSelected(r); setOpen(true) }
  const closeDrawer = () => { setOpen(false); setSelected(null); form.resetFields() }

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const payload: WeighbridgeFormValues = {
        ...values,
        date_at: dayjs(values.date_at as unknown as string).toISOString(),
        gross_time: values.gross_time ? dayjs(values.gross_time as unknown as string).toISOString() : null,
        tare_time: values.tare_time ? dayjs(values.tare_time as unknown as string).toISOString() : null,
      }
      if (isEdit) {
        updateM.mutate({ id: selected.id, payload }, { onSuccess: closeDrawer })
      } else {
        createM.mutate(payload, { onSuccess: closeDrawer })
      }
    })
  }

  const handleDelete = (r: Weighbridge) => {
    showConfirm({
      title: 'Delete Weighbridge',
      content: `Yakin delete data "${r.ticket_no}"?`,
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
      'Ticket No': item.ticket_no ?? '-',
      'Asset ID': item.equipment_code ?? '-',
      Product: item.product ?? '-',
      Gross: item.gross,
      Tare: item.tare,
      Net: item.net,
      Recipient: item.recipient ?? '-',
      Customer: item.customer ?? '-',
      Transporter: item.transporter ?? '-',
      'Gross Time': item.gross_time ? formatDate(item.gross_time, 'HH:mm') : '-',
      'Tare Time': item.tare_time ? formatDate(item.tare_time, 'HH:mm') : '-',
      'Gross Operator': item.gross_operator ?? '-',
      'Tare Operator': item.tare_operator ?? '-',
      Description: item.description ?? '-',
      Location: item.location ?? '-',
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Weighbridge')
    XLSX.writeFile(
      wb,
      `weighbridge_${params.date_at ?? dayjs().format('YYYY-MM-DD')}.xlsx`,
    )
  }

  const downloadTemplate = () => {
    const rows = [
      ['Date', 'Shift', 'Ticket No', 'Asset ID', 'Product', 'Gross', 'Tare', 'Net', 'Recipient', 'Customer', 'Transporter', 'Gross Time', 'Tare Time', 'Gross Operator', 'Tare Operator', 'Description', 'Location'],
      ['11-08-2026', 'Shift 1', 'A2026081200198', '10419', 'BATUBARA', 46200, 14680, 31520, 'PT. RMKO', 'PT. DBU', 'PT. RMKO', '13:09', '13:20', 'Yulius', 'Tegar', 'DBU', ''],
    ]
    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [
      { wch: 12 }, { wch: 10 }, { wch: 18 }, { wch: 14 }, { wch: 12 },
      { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 14 }, { wch: 12 },
      { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
      { wch: 24 }, { wch: 16 },
    ]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Template')
    XLSX.writeFile(wb, 'template_weighbridge.xlsx')
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

  const columns: ColumnsType<Weighbridge> = [
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
      render: (value) => <Tag color="blue">{value}</Tag>,
    },
    {
      title: 'Ticket No',
      dataIndex: 'ticket_no',
      width: 170,
      align: 'left',
      render: (value) => <span style={{ fontWeight: 600 }}>{value}</span>,
    },
    {
      title: 'Asset ID',
      dataIndex: 'equipment_code',
      width: 120,
      align: 'left',
    },
    {
      title: 'Product',
      dataIndex: 'product',
      width: 120,
      align: 'left',
    },
    {
      title: 'Gross',
      dataIndex: 'gross',
      width: 100,
      align: 'right',
      render: (value) => formatNumber(value),
    },
    {
      title: 'Tare',
      dataIndex: 'tare',
      width: 100,
      align: 'right',
      render: (value) => formatNumber(value),
    },
    {
      title: 'Net',
      dataIndex: 'net',
      width: 100,
      align: 'right',
      render: (value) => formatNumber(value),
    },
    {
      title: 'Recipient',
      dataIndex: 'recipient',
      width: 140,
      align: 'left',
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      width: 120,
      align: 'left',
    },
    {
      title: 'Transporter',
      dataIndex: 'transporter',
      width: 130,
      align: 'left',
    },
    {
      title: 'Gross Time',
      dataIndex: 'gross_time',
      width: 110,
      align: 'center',
      render: (value) => value ? formatDate(value, 'HH:mm') : '—',
    },
    {
      title: 'Tare Time',
      dataIndex: 'tare_time',
      width: 110,
      align: 'center',
      render: (value) => value ? formatDate(value, 'HH:mm') : '—',
    },
    {
      title: 'Gross Operator',
      dataIndex: 'gross_operator',
      width: 130,
      align: 'left',
    },
    {
      title: 'Tare Operator',
      dataIndex: 'tare_operator',
      width: 130,
      align: 'left',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      width: 200,
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
        title="Weighbridge"
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
      <DataTable<Weighbridge>
        rowKey="id" columns={columns}
        dataSource={data?.data ?? []}
        loading={isLoading}
        scroll={{ x: 'max-content' }}
        pagination={{ current: params.page, pageSize: params.limit, total: data?.meta?.total ?? 0, onChange: (p, s) => { setPage(p); setLimit(s) }, showSizeChanger: true, showTotal: (t, r) => `${r[0]}–${r[1]} dari ${t} data` }}
      />
      <FormDrawer open={open} title={isEdit ? 'Edit Weighbridge' : 'Add Weighbridge'} onClose={closeDrawer} onSubmit={handleSubmit} isSubmitting={isSubmitting} submitText={isEdit ? 'Simpan' : 'Add'} width={560}>
        <WeighbridgeForm form={form} initialValues={selected} />
      </FormDrawer>

      <ReportFilter
        open={filterOpen}
        title="Weighbridge — Filter"
        dateMode="single"
        showSearch
        searchPlaceholder="Cari ticket, equipment, atau customer..."
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
        title="Import Data Weighbridge"
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
export default WeighbridgePage
