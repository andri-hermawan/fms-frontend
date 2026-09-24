import { useState } from 'react'
import * as XLSX from 'xlsx'
import { Form, Button, Space, Tooltip, Upload, Modal, Typography, Select, Dropdown } from 'antd'
import type { MenuProps, UploadFile } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, InboxOutlined, FilterOutlined, DownOutlined, ImportOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'
import FormDrawer from '@/components/ui/FormDrawer'
import ReportFilter, { type ReportFilterValues } from '@/components/report/ReportFilter'
import { showConfirm } from '@/components/ui/ConfirmModal'
import { useDailySettingOperators, useCreateDailySettingOperator, useUpdateDailySettingOperator, useDeleteDailySettingOperator, useImportDailySettingOperator } from './useDailySettingOperator'
import DailySettingOperatorForm from './DailySettingOperatorForm'
import usePermission from '@/hooks/usePermission'
import usePagination from '@/hooks/usePagination'
import { useShifts } from '@/pages/master/shift/useShift'
import { formatDate } from '@/utils/format'
import type { DailySettingOperator, DailySettingOperatorFormValues } from '@/types/daily-setting-operator.types'

const DailySettingOperatorPage = () => {
  const [form] = Form.useForm<DailySettingOperatorFormValues>()
  const [open, setOpen]         = useState(false)
  const [selected, setSelected] = useState<DailySettingOperator | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [importFile, setImportFile] = useState<UploadFile | null>(null)
  const [filterOpen, setFilterOpen] = useState(true)
  const { params, setSearch, setPage, setLimit, setDateAt, setShift } = usePagination({ date_at: dayjs().format('YYYY-MM-DD') })

  const { data, isLoading } = useDailySettingOperators(params)
  const { data: shiftData } = useShifts({ limit: 100 })
  const shiftOptions = (shiftData?.data ?? []).map((s) => ({ label: s.shift_name, value: s.shift_name }))
  const createM = useCreateDailySettingOperator()
  const updateM = useUpdateDailySettingOperator()
  const deleteM = useDeleteDailySettingOperator()
  const importM = useImportDailySettingOperator()

  const canCreate = usePermission('project', 'create')
  const canUpdate = usePermission('project', 'update')
  const canDelete = usePermission('project', 'delete')

  const isEdit       = !!selected
  const isSubmitting = createM.isPending || updateM.isPending

  const openCreate  = () => { setSelected(null); form.resetFields(); setOpen(true) }
  const openEdit    = (r: DailySettingOperator) => { setSelected(r); setOpen(true) }
  const closeDrawer = () => { setOpen(false); setSelected(null); form.resetFields() }

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const payload: DailySettingOperatorFormValues = {
        ...values,
        date_at: dayjs(values.date_at as unknown as string).format('YYYY-MM-DD'),
      }
      if (isEdit) {
        updateM.mutate({ id: selected.id, payload }, { onSuccess: closeDrawer })
      } else {
        createM.mutate(payload, { onSuccess: closeDrawer })
      }
    })
  }

  const handleDelete = (r: DailySettingOperator) => {
    showConfirm({
      title: 'Delete Setting Operator',
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
      'Operator Name': item.operator_name ?? '-',
      Description: item.description ?? '-',
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    ws['!cols'] = [{ wch: 6 }, { wch: 14 }, { wch: 12 }, { wch: 18 }, { wch: 20 }, { wch: 28 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Setting Operator')
    XLSX.writeFile(
      wb,
      `daily-setting-operator_${params.date_at ?? dayjs().format('YYYY-MM-DD')}.xlsx`,
    )
  }

  const downloadTemplate = () => {
    const rows = [
      ['Tanggal', 'Shift', 'Asset ID', 'Operator Name', 'Description'],
      ['11-08-2026', 'Shift 1', 'EQ-001', 'John Doe', ''],
    ]
    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [{ wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 24 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Template')
    XLSX.writeFile(wb, 'template_setting_operator.xlsx')
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

  const columns: ColumnsType<DailySettingOperator> = [
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
      width: 130,
      align: 'center',
      render: (value) => formatDate(value),
    },
    {
      title: 'Shift',
      dataIndex: 'shift',
      width: 120,
      align: 'center',
    },
    {
      title: 'Asset ID',
      dataIndex: 'equipment_code',
      width: 160,
      align: 'left',
      render: (value) => (
        <span style={{ fontWeight: 600 }}>{value}</span>
      ),
    },
    {
      title: 'Operator Name',
      dataIndex: 'operator_name',
      width: 180,
      align: 'left',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      width: 220,
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
        title="Daily Setting Operator"
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
      <DataTable<DailySettingOperator>
        rowKey="id" columns={columns}
        dataSource={data?.data ?? []}
        loading={isLoading}
        pagination={{ current: params.page, pageSize: params.limit, total: data?.meta?.total ?? 0, onChange: (p, s) => { setPage(p); setLimit(s) }, showSizeChanger: true, showTotal: (t, r) => `${r[0]}–${r[1]} dari ${t} data` }}
      />
      <FormDrawer open={open} title={isEdit ? 'Edit Daily Setting Operator' : 'Add Daily Setting Operator'} onClose={closeDrawer} onSubmit={handleSubmit} isSubmitting={isSubmitting} submitText={isEdit ? 'Simpan' : 'Add'}>
        <DailySettingOperatorForm form={form} initialValues={selected} />
      </FormDrawer>

      <ReportFilter
        open={filterOpen}
        title="Daily Setting Operator — Filter"
        dateMode="single"
        showSearch
        searchPlaceholder="Cari asset atau nama operator..."
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
        title="Import Data Setting Operator"
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
export default DailySettingOperatorPage
