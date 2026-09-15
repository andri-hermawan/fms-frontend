import dayjs, { type Dayjs } from 'dayjs'

type OperationalShift = {
  start_time?: string
  end_time?: string
}

const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export const getOperationalDate = (
  currentDate: Dayjs = dayjs(),
  shift?: OperationalShift,
): Dayjs => {
  if (!shift?.start_time || !shift.end_time) return currentDate

  const currentMinutes = currentDate.hour() * 60 + currentDate.minute()
  const startMinutes = toMinutes(shift.start_time)
  const endMinutes = toMinutes(shift.end_time)

  const isOvernightShift = startMinutes > endMinutes
  const isAfterMidnight = currentMinutes < endMinutes

  return isOvernightShift && isAfterMidnight
    ? currentDate.subtract(1, 'day')
    : currentDate
}