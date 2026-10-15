import { useState } from 'react'
import * as XLSX from 'xlsx'
import {
  App,
  Button,
  Dropdown,
  Form,
  Modal,
  Space,
  Tag,
  Tooltip,
  Typography,
  Upload,
} from 'antd'
import type { MenuProps, UploadFile } from 'antd'
import {
  DeleteOutlined,
  DownloadOutlined,
  DownOutlined,
  EditOutlined,
  FilterOutlined,
  ImportOutlined,
  InboxOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'
import FormDrawer from '@/components/ui/FormDrawer'
import ReportFilter, { type ReportFilterValues } from '@/components/report/ReportFilter'
import { showConfirm } from '@/components/ui/ConfirmModal'
import usePermission from '@/hooks/usePermission'
import usePagination from '@/hooks/usePagination'
import { formatDate } from '@/utils/format'
import { useAuthStore } from '@/stores/auth.store'
import equipmentActivationApi from '@/services/api/equipment-activation.api'
import type {
  EquipmentActivation,
  EquipmentActivationFormValues,
} from '@/types/equipment-activation.types'
import {
  useCreateEquipmentActivation,
  useDeleteEquipmentActivation,
  useEquipmentActivations,
  useImportEquipmentActivation,
  useUpdateEquipmentActivation,
} from './useEquipmentActivation'
import EquipmentActivationForm from './EquipmentActivationForm'

const EquipmentActivationPage = () => {
  const { message } = App.useApp()
  const userName = useAuthStore((state) => state.user?.name)
  const [form] = Form.useForm<EquipmentActivationFormValues>()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<EquipmentActivation | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [importFile, setImportFile] = useState<UploadFile | null>(null)
  const [filterOpen, setFilterOpen] = useState(true)
  const { params, setSearch, setPage, setLimit, setDateAt } = usePagination({
    date_at: dayjs().format('YYYY-MM-DD'),
  })

  const { data, isLoading } = useEquipmentActivations(params)
  const createMutation = useCreateEquipmentActivation()
  const updateMutation = useUpdateEquipmentActivation()
  const deleteMutation = useDeleteEquipmentActivation()
  const importMutation = useImportEquipmentActivation()

  const canCreate = usePermission('project', 'create')
  const canUpdate = usePermission('project', 'update')
  const canDelete = usePermission('project', 'delete')
  const isEdit = !!selected
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const openCreate = () => {
    setSelected(null)
    form.resetFields()
    setOpen(true)
  }
  const openEdit = (record: EquipmentActivation) => {
    setSelected(record)
    setOpen(true)
  }
  const closeDrawer = () => {
    setOpen(false)
    setSelected(null)
    form.resetFields()
  }

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (!userName) {
        message.error('Nama user tidak tersedia. Silakan login kembali.')
        return
      }
      const payload: EquipmentActivationFormValues = {
        ...values,
        date_at: dayjs(values.date_at as unknown as string).format('YYYY-MM-DD'),
      }
      if (isEdit) {
        updateMutation.mutate(
          { id: selected.id, payload },
          { onSuccess: closeDrawer },
        )
      } else {
        createMutation.mutate(payload, { onSuccess: closeDrawer })
      }
    })
  }

  const handleDelete = (record: EquipmentActivation) => {
    showConfirm({
      title: 'Delete Equipment Activation',
      content: `Yakin delete data "${record.equipment_code}"?`,
      danger: true,
      okText: 'Ya, Delete',
      onConfirm: () => deleteMutation.mutate(record.id),
    })
  }

  const handleApplyFilter = (values: ReportFilterValues) => {
    setSearch(values.search ?? '')
    setDateAt(values.date)
    setFilterOpen(false)
  }

  const handleDownload = async () => {
    const pageSize = params.limit ?? 25
    const firstPage = await equipmentActivationApi.getAll({
      ...params,
      page: 1,
      limit: pageSize,
    })
    const firstResult = firstPage.data
    const totalPages = firstResult.meta?.totalPages ?? 1
    const remainingPages = await Promise.all(
      Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) =>
        equipmentActivationApi.getAll({ ...params, page: index + 2, limit: pageSize }),
      ),
    )
    const list = [firstResult, ...remainingPages.map((result) => result.data)]
      .flatMap((result) => result.data ?? [])
    if (list.length === 0) return

    const exportData = list.map((item, index) => ({
      No: index + 1,
      Date: item.date_at
        ? dayjs.utc(item.date_at).startOf('day').valueOf() / 86_400_000 + 25_569
        : '-',
      'Equipment Code': item.equipment_code ?? '-',
      Status: item.status ?? '-',
      Description: item.description ?? '-',
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    exportData.forEach((item, index) => {
      const dateCell = worksheet[XLSX.utils.encode_cell({ r: index + 1, c: 1 })]
      if (typeof item.Date === 'number' && dateCell) dateCell.z = 'dd-mm-yyyy'
    })
    worksheet['!cols'] = [{ wch: 6 }, { wch: 14 }, { wch: 20 }, { wch: 14 }, { wch: 32 }]
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Equipment Activation')
    XLSX.writeFile(
      workbook,
      `equipment-activation_${params.date_at ?? dayjs().format('YYYY-MM-DD')}.xlsx`,
    )
  }

  const downloadTemplate = () => {
    const rows = [
      ['Date', 'Equipment Code', 'Status', 'Description'],
      ['11-08-2026', 'TR-001', 'Active', 'Equipment aktif untuk operasional'],
    ]
    const worksheet = XLSX.utils.aoa_to_sheet(rows)
    worksheet['!cols'] = [{ wch: 14 }, { wch: 20 }, { wch: 14 }, { wch: 36 }]
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template')
    XLSX.writeFile(workbook, 'template_equipment_activation.xlsx')
  }

  const handleImport = () => {
    if (!importFile?.originFileObj) return
    if (!userName) {
      message.error('Nama user tidak tersedia. Silakan login kembali.')
      return
    }
    importMutation.mutate(
      { file: importFile.originFileObj, createdBy: userName },
      { onSuccess: () => setImportOpen(false) },
    )
    setImportFile(null)
  }

  const actionMenu: MenuProps['items'] = [
    ...(canCreate
      ? [
          { key: 'add', icon: <PlusOutlined />, label: 'Add', onClick: openCreate },
          {
            key: 'import',
            icon: <ImportOutlined />,
            label: 'Upload Excel',
            onClick: () => {
              setImportFile(null)
              setImportOpen(true)
            },
          },
        ]
      : []),
    {
      key: 'download',
      icon: <DownloadOutlined />,
      label: 'Download Raw Data',
      disabled: !(data?.data?.length),
      onClick: handleDownload,
    },
  ]

  const columns: ColumnsType<EquipmentActivation> = [
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
      width: 140,
      align: 'center',
      render: (value) => formatDate(value),
    },
    {
      title: 'Equipment Code',
      dataIndex: 'equipment_code',
      width: 180,
      render: (value) => <span style={{ fontWeight: 600 }}>{value}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 140,
      align: 'center',
      render: (value: EquipmentActivation['status']) => (
        <Tag color={value === 'Active' ? 'green' : 'default'}>{value}</Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      width: 260,
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
                loading={deleteMutation.isPending}
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
        title="Equipment Activation"
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
      <DataTable<EquipmentActivation>
        rowKey="id"
        columns={columns}
        dataSource={data?.data ?? []}
        loading={isLoading}
        pagination={{
          current: params.page,
          pageSize: params.limit,
          total: data?.meta?.total ?? 0,
          onChange: (page, pageSize) => {
            if (pageSize !== params.limit) setLimit(pageSize)
            else setPage(page)
          },
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}–${range[1]} dari ${total} data`,
        }}
      />
      <FormDrawer
        open={open}
        title={isEdit ? 'Edit Equipment Activation' : 'Add Equipment Activation'}
        onClose={closeDrawer}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitText={isEdit ? 'Simpan' : 'Add'}
      >
        <EquipmentActivationForm form={form} initialValues={selected} />
      </FormDrawer>

      <ReportFilter
        open={filterOpen}
        title="Equipment Activation — Filter"
        dateMode="single"
        showSearch
        searchPlaceholder="Cari equipment code..."
        showEquipment={false}
        showShift={false}
        initialValues={{ date: params.date_at }}
        onClose={() => setFilterOpen(false)}
        onApply={handleApplyFilter}
        isLoading={isLoading}
      />

      <Modal
        title="Import Data Equipment Activation"
        open={importOpen}
        onCancel={() => setImportOpen(false)}
        onOk={handleImport}
        okText="Import"
        okButtonProps={{ disabled: !importFile, loading: importMutation.isPending }}
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
              setImportFile({
                uid: file.uid,
                name: file.name,
                size: file.size,
                type: file.type,
                originFileObj: file,
              })
              return false
            }}
            onRemove={() => setImportFile(null)}
            fileList={importFile ? [importFile] : []}
          >
            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
            <p className="ant-upload-text">Klik atau seret file ke area ini</p>
            <p className="ant-upload-hint">Hanya file Excel (.xlsx / .xls)</p>
          </Upload.Dragger>
        </Space>
      </Modal>
    </>
  )
}

export default EquipmentActivationPage
