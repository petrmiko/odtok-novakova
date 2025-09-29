import { useState, useMemo } from 'react'
import DatePicker from 'react-datepicker'
import { registerLocale, setDefaultLocale } from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import '@/app/datepicker.css'

import { cs, enUS, Locale } from 'date-fns/locale'

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
		if (languageCode in localeMap) {
			registerLocale(browserLocale, localeMap[languageCode])
			return browserLocale
		}
		return 'en'
	}, [])

	setDefaultLocale(userLocale)

	const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
		new Date(Date.now() - 24 * 3600000),
		new Date(),
	])
	const [startDate, endDate] = dateRange

	const handleDateChange = (update: [Date | null, Date | null]) => {
		setDateRange(update)
		onDateRangeChange(update[0], update[1])
	}

	const dateFormat = useMemo(() => {
		if (userLocale.startsWith('en')) {
			return 'MM/dd/yyyy h:mm aa'
		} else {
			return 'dd.MM.yyyy HH:mm'
		}
	}, [userLocale])

	const placeholderText = useMemo(() => {
		const translations: { [key: string]: string } = {
			cs: 'Vyberte časové rozmezí',
			en: 'Select date range',
		}

		const languageCode = userLocale.split('-')[0]
		return translations[languageCode] || translations['en']
	}, [userLocale])

	const label = useMemo(() => {
		const translations: { [key: string]: string } = {
			cs: 'Časové rozmezí:',
			en: 'Date Range:',
		}

		const languageCode = userLocale.split('-')[0]
		return translations[languageCode] || translations['en']
	}, [userLocale])

	const timeCaption = useMemo(() => {
		const translations: { [key: string]: string } = {
			cs: 'Čas',
			en: 'Time',
		}

		const languageCode = userLocale.split('-')[0]
		return translations[languageCode] || translations['en']
	}, [userLocale])

	return (
		<div className="flex items-center gap-4 mb-6">
			<label className="text-sm font-medium">{label}</label>
			<div className="relative">
				<DatePicker
					selectsRange={true}
					startDate={startDate}
					endDate={endDate}
					onChange={handleDateChange}
					className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					calendarClassName="datepicker-calendar"
					locale={userLocale}
					dateFormat={dateFormat}
					showTimeSelect
					timeIntervals={30}
					timeFormat={userLocale.startsWith('en') ? 'h:mm aa' : 'HH:mm'}
					placeholderText={placeholderText}
					timeCaption={timeCaption}
				/>
			</div>
		</div>
	)
}
