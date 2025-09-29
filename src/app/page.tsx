'use client'

import { useMemo, useState } from 'react'
import { ThemeProvider, createTheme, useMediaQuery } from '@mui/material'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import TimeSeriesChart from '@/components/TimeSeriesChart'
import DateRangePicker from '@/components/DateRangePicker'
import StatsTable from '@/components/StatsTable'
import { getDateFormatters, getNumberFormatter } from '@/utils/formatters'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

interface TimeSeriesData {
	timestamp: string
	value: number
}

function HomePage() {
	const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
	
	const theme = useMemo(
		() =>
			createTheme({
				palette: {
					mode: prefersDarkMode ? 'dark' : 'light',
				},
			}),
		[prefersDarkMode]
	)

	const initialStartDate = new Date(Date.now() - 24 * 3600000)
	const initialEndDate = new Date()
	
	const [dateRange, setDateRange] = useState<[Date, Date]>([initialStartDate, initialEndDate])
	
	const { data, isLoading, error } = useQuery({
		queryKey: ['timeseries', dateRange[0], dateRange[1]],
		queryFn: async () => {
			const params = new URLSearchParams()
			params.append('startDate', dateRange[0].toISOString())
			params.append('endDate', dateRange[1].toISOString())

			const response = await fetch(`/api/timeseries?${params.toString()}`)
			if (!response.ok) {
				throw new Error('Failed to fetch data')
			}
			return response.json()
		},
	})

	const { data: todayData, isLoading: isTodayLoading, error: todayError } = useQuery({
		queryKey: ['today'],
		queryFn: async () => {
			const params = new URLSearchParams()
			const startOfDay = new Date()
			startOfDay.setHours(0, 0, 0, 0)
			params.append('startDate', startOfDay.toISOString())

			const response = await fetch(`/api/timeseries?${params.toString()}`)
			if (!response.ok) {
				throw new Error('Failed to fetch data')
			}
			return response.json()
		},
	})

	const handleDateRangeChange = (
		startDate: Date | null,
		endDate: Date | null
	) => {
		if (startDate && endDate) {
			setDateRange([startDate, endDate])
		}
	}

	const { dateFormatter } = getDateFormatters()

	return (
		<ThemeProvider theme={theme}>
			<main className="flex min-h-screen flex-col items-center p-8">
				<h1 className="text-3xl font-bold mb-8">Odtok Novákova</h1>
				{isTodayLoading && <p className="text-xl font-bold mb-8">Načítám poslední měření...</p>}
				{!todayError && todayData?.length > 0 && <h2 className="text-xl font-bold mb-8">{todayData.at(-1).value}cm v {dateFormatter.format(new Date(todayData.at(-1).timestamp))}</h2>}
				<DateRangePicker onDateRangeChange={handleDateRangeChange} />
				{isLoading && <p>Načítám vývoj v čase...</p>}
				{error && (
					<p className="text-red-500">
						Error: {error instanceof Error ? error.message : 'An error occurred'}
					</p>
				)}
				{!isLoading && !error && data && (
					<div className="w-full max-w-6xl">
						<TimeSeriesChart data={data} />
						<StatsTable 
							data={data}
							tooltipFormatter={getDateFormatters().dateFormatter}
							numberFormatter={getNumberFormatter()}
						/>
					</div>
				)}
			</main>
		</ThemeProvider>
	)
}

export default function Home() {
	return (
		<QueryClientProvider client={queryClient}>
			<HomePage />
		</QueryClientProvider>
	)
}
