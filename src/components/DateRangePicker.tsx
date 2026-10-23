import { useState, useMemo } from 'react'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { Chip, Stack } from '@mui/material'
import { cs, enUS, Locale } from 'date-fns/locale'
import { startOfDay, endOfDay, subWeeks, subMonths, subYears } from 'date-fns'

const presets: { label: string; start: (now: Date) => Date }[] = [
	{ label: 'Dnes', start: (now) => now },
	{ label: 'Poslední týden', start: (now) => subWeeks(now, 1) },
	{ label: 'Poslední měsíc', start: (now) => subMonths(now, 1) },
	{ label: 'Posledních 6 měsíců', start: (now) => subMonths(now, 6) },
	{ label: 'Poslední rok', start: (now) => subYears(now, 1) },
]

const localeMap: { [key: string]: Locale } = {
	cs: cs,
	en: enUS,
}

interface DateRangePickerProps {
	onDateRangeChange: (startDate: Date | null, endDate: Date | null) => void
}

export default function DateRangePicker({ onDateRangeChange }: DateRangePickerProps) {
	const userLocale = useMemo(() => {
		const browserLocale = navigator.language.toLowerCase()
		const languageCode = browserLocale.split('-')[0]
		return languageCode in localeMap ? browserLocale : 'en'
	}, [])

	const [dateRange, setDateRange] = useState<[Date | null, Date | null]>(() => [
		startOfDay(new Date(Date.now() - 24 * 3600000)),
		endOfDay(new Date()),
	])
	const [startDate, endDate] = dateRange
	const [activePreset, setActivePreset] = useState<string | null>(null)

	const handleDateChange = (update: [Date | null, Date | null]) => {
		setDateRange(update)
		setActivePreset(null)
		onDateRangeChange(update[0], update[1])
	}

	const labels = useMemo(() => {
		const translations: { [key: string]: { start: string; end: string } } = {
			cs: {
				start: 'Od',
				end: 'Do',
			},
			en: {
				start: 'From',
				end: 'To',
			},
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
			<div className="flex flex-col gap-4 mb-6">
				<Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
					{presets.map(({ label, start }) => (
						<Chip
							key={label}
							label={label}
							color={activePreset === label ? 'primary' : 'default'}
							variant={activePreset === label ? 'filled' : 'outlined'}
							onClick={() => {
								const now = new Date()
								handleDateChange([startOfDay(start(now)), endOfDay(now)])
								setActivePreset(label)
							}}
						/>
					))}
				</Stack>
				<Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
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
