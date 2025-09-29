import { useState, useMemo } from 'react'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { Stack } from '@mui/material'
import { cs, enUS, Locale } from 'date-fns/locale'
import { startOfDay, endOfDay } from 'date-fns'

const localeMap: { [key: string]: Locale } = {
	cs: cs,
	en: enUS,
}

interface DateRangePickerProps {
	onDateRangeChange: (startDate: Date | null, endDate: Date | null) => void
}

export default function DateRangePicker({
	onDateRangeChange,
}: DateRangePickerProps) {
	const userLocale = useMemo(() => {
		const browserLocale = navigator.language.toLowerCase()
		const languageCode = browserLocale.split('-')[0]
		return languageCode in localeMap ? browserLocale : 'en'
	}, [])

	const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
		startOfDay(new Date(Date.now() - 24 * 3600000)),
		endOfDay(new Date()),
	])
	const [startDate, endDate] = dateRange

	const handleDateChange = (update: [Date | null, Date | null]) => {
		setDateRange(update)
		onDateRangeChange(update[0], update[1])
	}

	const labels = useMemo(() => {
		const translations: { [key: string]: { start: string, end: string } } = {
			cs: {
				start: 'Od',
				end: 'Do'
			},
			en: {
				start: 'From',
				end: 'To'
			}
		}

		const languageCode = userLocale.split('-')[0]
		return translations[languageCode] || translations['en']
	}, [userLocale])

	const handleStartDateChange = (date: Date | null) => {
		const startDateWithTime = date ? startOfDay(date) : null
		const newRange: [Date | null, Date | null] = [startDateWithTime, dateRange[1]]
		handleDateChange(newRange)
	}

	const handleEndDateChange = (date: Date | null) => {
		const endDateWithTime = date ? endOfDay(date) : null
		const newRange: [Date | null, Date | null] = [dateRange[0], endDateWithTime]
		handleDateChange(newRange)
	}

	return (
		<LocalizationProvider 
			dateAdapter={AdapterDateFns} 
			adapterLocale={localeMap[userLocale.split('-')[0]]}
		>
			<div className="flex items-center gap-4 mb-6">
				<Stack direction="row" spacing={2} flexWrap={"wrap"} useFlexGap>
					<DatePicker
						label={labels.start}
						value={startDate}
						onChange={handleStartDateChange}
						maxDate={endDate || undefined}
						closeOnSelect
					/>
					<DatePicker
						label={labels.end}
						value={endDate}
						onChange={handleEndDateChange}
						minDate={startDate || undefined}
						closeOnSelect
						disableFuture
					/>
				</Stack>
			</div>
		</LocalizationProvider>
	)
}
