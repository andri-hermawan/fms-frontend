import { useState } from 'react'
import { Form, Button, Space, Tooltip, Tag, Modal, Table } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SendOutlined, HistoryOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'
import FormDrawer from '@/components/ui/FormDrawer'
import { showConfirm } from '@/components/ui/ConfirmModal'
import usePermission from '@/hooks/usePermission'
import { formatDate } from '@/utils/format'
import type {
  ReportSchedule,
  ReportScheduleLog,
  ReportScheduleQueryParams,
} from '@/types/report-schedule.types'
import ReportScheduleForm, { type ReportScheduleFormState } from './ReportScheduleForm'
import {
  useReportSchedules,
  useReportTypes,
  useReportScheduleLogs,
  useCreateReportSchedule,
  useUpdateReportSchedule,
  useDeleteReportSchedule,
  useSendReportNow,
} from './useReportSchedule'

const DATE_OFFSET_LABEL: Record<number, string> = { [-1]: 'H-1', 0: 'Hari ini' }

const logColumns: ColumnsType<ReportScheduleLog> = [
  { title: 'Waktu', dataIndex: 'created_at', width: 170, render: (v) => new Date(v).toLocaleString('id-ID') },
  { title: 'Data', dataIndex: 'report_date', width: 110, render: (v) => formatDate(v) },
  { title: 'Trigger', dataIndex: 'trigger', width: 90, render: (v) => (v === 'manual' ? 'Manual' : 'Jadwal') },
  {
    title: 'Status',
    dataIndex: 'status',
    width: 90,
    render: (v) => <Tag color={v === 'success' ? 'success' : 'error'}>{v === 'success' ? 'Sukses' : 'Gagal'}</Tag>,
  },
  { title: 'Penerima', dataIndex: 'recipients', width: 80, align: 'center' },
  { title: 'Error', dataIndex: 'error_message', render: (v) => v ?? '-' },
]

const ReportScheduleListPage = () => {
  const [form] = Form.useForm<ReportScheduleFormState>()
  const [open, setOpen]           = useState(false)
  const [selected, setSelected]   = useState<ReportSchedule | null>(null)
  const [logTarget, setLogTarget] = useState<ReportSchedule | null>(null)
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [params, setParams]       = useState<ReportScheduleQueryParams>({ page: 1, limit: 25 })

  const { data, isLoading } = useReportSchedules(params)
  const { data: reportTypes } = useReportTypes()
  const { data: logs, isLoading: loadingLogs } = useReportScheduleLogs(logTarget?.id)
  const createM = useCreateReportSchedule()
  const updateM = useUpdateReportSchedule()
  const deleteM = useDeleteReportSchedule()
  const sendM   = useSendReportNow()

  const canCreate = usePermission('report_schedule', 'create')
  const canUpdate = usePermission('report_schedule', 'update')
  const canDelete = usePermission('report_schedule', 'delete')

  const isEdit       = !!selected
  const isSubmitting = createM.isPending || updateM.isPending
  const typeLabel    = (value: string) => reportTypes?.find((t) => t.value === value)?.label ?? value

  const openCreate  = () => { setSelected(null); form.resetFields(); setOpen(true) }
  const openEdit    = (r: ReportSchedule) => { setSelected(r); setOpen(true) }
  const closeDrawer = () => { setOpen(false); setSelected(null); form.resetFields() }

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const payload = { ...values, send_time: values.send_time.format('HH:mm') }
      if (isEdit) {
        updateM.mutate({ id: selected.id, payload }, { onSuccess: closeDrawer })
      } else {
        createM.mutate(payload, { onSuccess: closeDrawer })
      }
    })
  }

  const handleDelete = (r: ReportSchedule) => {
    showConfirm({
      title: 'Delete Jadwal Report',
      content: `Yakin hapus jadwal "${r.name}"?`,
      danger: true,
      okText: 'Ya, Delete',
      onConfirm: () => deleteM.mutate(r.id),
    })
  }

  const handleSendNow = (r: ReportSchedule) => {
    showConfirm({
      title: 'Kirim Report Sekarang',
      content: `Report "${r.name}" akan dibuat dan dikirim ke ${r.user_ids.length} penerima sekarang. Lanjutkan?`,
      okText: 'Ya, Kirim',
      onConfirm: () => {
        setSendingId(r.id)
        sendM.mutate(r.id, { onSettled: () => setSendingId(null) })
      },
    })
  }

  const columns: ColumnsType<ReportSchedule> = [
    { title: 'Nama', dataIndex: 'name', width: 200, align: 'left' },
    { title: 'Report', dataIndex: 'report_type', width: 150, align: 'left', render: (v) => typeLabel(v) },
    { title: 'Shift', dataIndex: 'shift', width: 100, align: 'center' },
    { title: 'Data', dataIndex: 'date_offset', width: 100, align: 'center', render: (v) => DATE_OFFSET_LABEL[v] ?? `H${v}` },
    { title: 'Jam Kirim', dataIndex: 'send_time', width: 100, align: 'center' },
    {
      title: 'Penerima',
      key: 'recipients',
      width: 240,
      align: 'left',
      render: (_, r) =>
        r.recipients.length === 0
          ? '-'
          : r.recipients.map((u) => <Tag key={u.id}>{u.name ?? u.email}</Tag>),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 100,
      align: 'center',
      render: (v) => <Tag color={v === 'active' ? 'success' : 'default'}>{v === 'active' ? 'Active' : 'Inactive'}</Tag>,
    },
    {
      title: 'Terakhir Kirim',
      dataIndex: 'last_run_at',
      width: 160,
      align: 'center',
      render: (v) => (v ? new Date(v).toLocaleString('id-ID') : '-'),
    },
    {
      title: 'Actions',
      key: 'action',
      width: 140,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="Riwayat">
            <Button type="text" size="small" icon={<HistoryOutlined />} onClick={() => setLogTarget(record)} />
          </Tooltip>
          {canUpdate && (
            <Tooltip title="Kirim sekarang">
              <Button type="text" size="small" icon={<SendOutlined />} loading={sendingId === record.id} onClick={() => handleSendNow(record)} />
            </Tooltip>
          )}
          {canUpdate && (
            <Tooltip title="Edit">
              <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title="Hapus">
              <Button type="text" size="small" danger loading={deleteM.isPending} icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Report Schedule"
        subtitle={`Total ${data?.meta?.total ?? 0} jadwal`}
        extra={
          canCreate && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Add
            </Button>
          )
        }
      />
      <DataTable<ReportSchedule>
        rowKey="id" columns={columns}
        dataSource={data?.data ?? []}
        loading={isLoading}
        searchable={false}
        pagination={{ current: params.page, pageSize: params.limit, total: data?.meta?.total ?? 0, onChange: (p, s) => setParams((prev) => ({ ...prev, page: s !== prev.limit ? 1 : p, limit: s })), showSizeChanger: true, showTotal: (t, r) => `${r[0]}–${r[1]} dari ${t} data` }}
      />
      <FormDrawer open={open} title={isEdit ? 'Edit Report Schedule' : 'Add Report Schedule'} onClose={closeDrawer} onSubmit={handleSubmit} isSubmitting={isSubmitting} submitText={isEdit ? 'Simpan' : 'Add'}>
        <ReportScheduleForm form={form} initialValues={selected} />
      </FormDrawer>

      <Modal
        title={`Riwayat — ${logTarget?.name ?? ''}`}
        open={!!logTarget}
        onCancel={() => setLogTarget(null)}
        footer={null}
        width={820}
      >
        <Table<ReportScheduleLog>
          rowKey="id"
          size="small"
          columns={logColumns}
          dataSource={logs ?? []}
          loading={loadingLogs}
          pagination={false}
        />
      </Modal>
    </>
  )
}
export default ReportScheduleListPage
