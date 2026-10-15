import { useEffect } from 'react'
import { Form, Input, Select, TimePicker } from 'antd'
import dayjs from 'dayjs'
import type { ReportSchedule, ReportScheduleFormValues } from '@/types/report-schedule.types'
import { useShifts } from '@/pages/master/shift/useShift'
import { useUsers } from '@/pages/master/user/useUser'
import { useReportTypes } from './useReportSchedule'

// Form menyimpan jam sebagai dayjs (TimePicker); diubah ke 'HH:mm' saat submit.
export type ReportScheduleFormState = Omit<ReportScheduleFormValues, 'send_time'> & {
  send_time: dayjs.Dayjs
}

interface Props {
  form: ReturnType<typeof Form.useForm<ReportScheduleFormState>>[0]
  initialValues?: ReportSchedule | null
}

const DATE_OFFSET_OPTIONS = [
  { value: -1, label: 'H-1 (data kemarin)' },
  { value: 0, label: 'Hari ini' },
]

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const ReportScheduleForm = ({ form, initialValues }: Props) => {
  const { data: reportTypes, isLoading: loadingTypes } = useReportTypes()
  const { data: shiftData, isLoading: loadingShift } = useShifts({ page: 1, limit: 100 })
  const { data: userData, isLoading: loadingUser } = useUsers({ page: 1, limit: 999999 })

  const typeOptions = (reportTypes ?? []).map((t) => ({ value: t.value, label: t.label }))
  const shiftOptions = (shiftData?.data ?? []).map((s) => ({ value: s.shift_name, label: s.shift_name }))
  const userOptions = (userData?.data ?? [])
    .filter((u) => u.status === 'active')
    .map((u) => ({ value: u.id, label: `${u.name} (${u.email})` }))

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
        report_type: initialValues.report_type,
        shift: initialValues.shift,
        date_offset: initialValues.date_offset,
        send_time: dayjs(initialValues.send_time, 'HH:mm'),
        user_ids: initialValues.user_ids,
        status: initialValues.status ?? 'active',
      })
    } else {
      form.resetFields()
      form.setFieldsValue({ date_offset: -1, send_time: dayjs('09:00', 'HH:mm'), status: 'active' })
    }
  }, [initialValues, form])

  return (
    <Form form={form} layout="vertical" requiredMark={false}>
      <Form.Item name="name" label="Nama Jadwal" rules={[{ required: true, message: 'Wajib diisi' }]}>
        <Input placeholder="Alert Summary Shift 1" />
      </Form.Item>

      <Form.Item name="report_type" label="Report" rules={[{ required: true, message: 'Wajib dipilih' }]}>
        <Select placeholder="Pilih report" loading={loadingTypes} options={typeOptions} />
      </Form.Item>

      <Form.Item name="shift" label="Shift" rules={[{ required: true, message: 'Wajib dipilih' }]}>
        <Select placeholder="Pilih shift" loading={loadingShift} options={shiftOptions} />
      </Form.Item>

      <Form.Item name="date_offset" label="Data Tanggal" rules={[{ required: true, message: 'Wajib dipilih' }]}>
        <Select options={DATE_OFFSET_OPTIONS} />
      </Form.Item>

      <Form.Item name="send_time" label="Jam Kirim (WIB)" rules={[{ required: true, message: 'Wajib diisi' }]}>
        <TimePicker format="HH:mm" minuteStep={5} allowClear={false} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name="user_ids"
        label="Penerima"
        rules={[{ required: true, type: 'array', min: 1, message: 'Pilih minimal satu penerima' }]}
      >
        <Select
          mode="multiple"
          placeholder="Pilih user penerima"
          loading={loadingUser}
          options={userOptions}
          optionFilterProp="label"
        />
      </Form.Item>

      <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Wajib dipilih' }]}>
        <Select options={STATUS_OPTIONS} />
      </Form.Item>
    </Form>
  )
}
export default ReportScheduleForm
