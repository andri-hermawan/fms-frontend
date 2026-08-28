import { useEffect } from 'react'
import { Form, Input, DatePicker, Select, TimePicker, Space } from 'antd'
import dayjs from 'dayjs'
import type { BreakdownStatus, BreakdownFormValues } from '@/types/breakdown-status.types'
import { useShifts } from '@/pages/master/shift/useShift'

interface Props {
  form: ReturnType<typeof Form.useForm<BreakdownFormValues>>[0]
  initialValues?: BreakdownStatus | null
}

const STATUSES = ['Breakdown', 'Standby', 'Running']
const CATEGORIES = [
  'Unsch Maintenance',
  'Sch Maintenance',
  'Operation',
  'Loading',
  'Waiting',
  'Other',
]
const REPAIR_STATUS = ['On Progress', 'Done', 'Pending']

const calcDuration = (start: dayjs.Dayjs, end: dayjs.Dayjs) => {
  // Bila end < start, dianggap melewati tengah malam (shift malam)
  const endAdj = end.isBefore(start) ? end.add(1, 'day') : end
  const minutes = endAdj.diff(start, 'minute')
  const hh = Math.floor(minutes / 60).toString().padStart(2, '0')
  const mm = (minutes % 60).toString().padStart(2, '0')
  return `${hh}:${mm}`
}

// Normalisasi duration dari backend ("00:30" atau ISO "1970-01-01T00:30:00.000Z") ke "HH:mm"
const normalizeDuration = (value: string | null | undefined): string | null => {
  if (!value) return null
  const trimmed = String(value).trim()
  if (/^\d{2}:\d{2}/.test(trimmed)) return trimmed.slice(0, 5)
  const parsed = dayjs(trimmed)
  return parsed.isValid() ? parsed.format('HH:mm') : null
}

const BreakdownStatusForm = ({ form, initialValues }: Props) => {
  const { data: shiftData, isLoading: loadingShift } = useShifts({ page: 1, limit: 100 })

  const syncDuration = (start?: dayjs.Dayjs | null, end?: dayjs.Dayjs | null) => {
    if (start && end) {
      form.setFieldValue('duration', calcDuration(start, end))
    }
  }

  const handleTimeChange =
    (pair: 'time_start' | 'time_end') => (value: dayjs.Dayjs | null) => {
      const other =
        pair === 'time_start'
          ? form.getFieldValue('time_end')
          : form.getFieldValue('time_start')
      if (pair === 'time_start') {
        syncDuration(value, other)
      } else {
        syncDuration(other, value)
      }
    }

  const shiftOptions =
    shiftData?.data?.map((s) => ({
      value: s.shift_name,
      label: s.shift_name,
    })) ?? []

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        date_at: dayjs(initialValues.date_at),
        shift: initialValues.shift,
        equipment_code: initialValues.equipment_code,
        status: initialValues.status,
        category: initialValues.category,
        time_start: initialValues.time_start ? dayjs(initialValues.time_start, 'HH:mm') : null,
        time_end: initialValues.time_end ? dayjs(initialValues.time_end, 'HH:mm') : null,
        duration: normalizeDuration(initialValues.duration),
        repair_status: initialValues.repair_status,
        description: initialValues.description ?? null,
        location: initialValues.location ?? null,
      })
    } else {
      form.resetFields()
    }
  }, [initialValues, form])

  return (
    <Form form={form} layout="vertical" requiredMark={false}>
      <Form.Item
        name="date_at"
        label="Tanggal"
        rules={[{ required: true, message: 'Wajib diisi' }]}
      >
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name="shift"
        label="Shift"
        rules={[{ required: true, message: 'Wajib dipilih' }]}
      >
        <Select
          placeholder="Pilih shift"
          loading={loadingShift}
          options={shiftOptions}
          showSearch
          filterOption={(input, opt) =>
            (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
        />
      </Form.Item>

      <Form.Item
        name="equipment_code"
        label="Equipment Code"
        rules={[{ required: true, message: 'Wajib diisi' }]}
      >
        <Input
          placeholder="10303"
          style={{ textTransform: 'uppercase' }}
          onChange={(e) =>
            form.setFieldValue('equipment_code', e.target.value.toUpperCase())
          }
        />
      </Form.Item>

      <Form.Item
        name="status"
        label="Status"
        rules={[{ required: true, message: 'Wajib dipilih' }]}
      >
        <Select placeholder="Pilih status" options={STATUSES.map((s) => ({ value: s, label: s }))} />
      </Form.Item>

      <Form.Item
        name="category"
        label="Category"
        rules={[{ required: true, message: 'Wajib dipilih' }]}
      >
        <Select placeholder="Pilih kategori" options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
      </Form.Item>

      <Form.Item label="Waktu (Start / End)">
        <Space.Compact block>
          <Form.Item name="time_start" noStyle>
            <TimePicker
              format="HH:mm"
              style={{ width: '50%' }}
              placeholder="Start"
              needConfirm={false}
              onChange={handleTimeChange('time_start')}
            />
          </Form.Item>
          <Form.Item name="time_end" noStyle>
            <TimePicker
              format="HH:mm"
              style={{ width: '50%' }}
              placeholder="End"
              needConfirm={false}
              onChange={handleTimeChange('time_end')}
            />
          </Form.Item>
        </Space.Compact>
      </Form.Item>

      <Form.Item
        name="duration"
        label="Duration"
      >
        <Input readOnly placeholder="Otomatis dari End - Start" />
      </Form.Item>

      <Form.Item
        name="repair_status"
        label="Repair Status"
        rules={[{ required: true, message: 'Wajib dipilih' }]}
      >
        <Select placeholder="Pilih repair status" options={REPAIR_STATUS.map((s) => ({ value: s, label: s }))} />
      </Form.Item>

      <Form.Item name="location" label="Location">
        <Input placeholder="STA 24" />
      </Form.Item>

      <Form.Item name="description" label="Description">
        <Input.TextArea rows={3} placeholder="Keterangan" />
      </Form.Item>
    </Form>
  )
}
export default BreakdownStatusForm