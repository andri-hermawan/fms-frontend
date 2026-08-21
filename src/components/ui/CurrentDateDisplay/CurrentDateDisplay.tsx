import { DatePicker } from 'antd'
import type { Dayjs } from 'dayjs'

type CurrentDateDisplayProps = {
  value: Dayjs | null
  disabled?: boolean
  onChange?: (date: Dayjs | null) => void
}

const CurrentDateDisplay = ({
  value,
  disabled = false,
  onChange,
}: CurrentDateDisplayProps) => (
  <DatePicker
    aria-label="Tanggal hari ini"
    value={value}
    onChange={onChange}
    format="DD/MM/YYYY"
    disabled={disabled}
    size="large"
    style={{ width: '100%' }}
  />
)

export default CurrentDateDisplay
