'use client'

import { useEffect, useState, useMemo } from 'react'
import { ThemeProvider, createTheme, useMediaQuery } from '@mui/material'
import TimeSeriesChart from '@/components/TimeSeriesChart'
import DateRangePicker from '@/components/DateRangePicker'
import StatsTable from '@/components/StatsTable'
import { getDateFormatters, getNumberFormatter } from '@/utils/formatters'

interface TimeSeriesData {
	timestamp: string
	value: number
}

export default function Home() {
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

	const [data, setData] = useState<TimeSeriesData[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const fetchData = async (startDate: Date | null, endDate: Date | null) => {
		setLoading(true)
		try {
			const params = new URLSearchParams()
			if (startDate) params.append('startDate', startDate.toISOString())
			if (endDate) params.append('endDate', endDate.toISOString())

			const response = await fetch(`/api/timeseries?${params.toString()}`)
			if (!response.ok) {
				throw new Error('Failed to fetch data')
			}
			const timeSeriesData = await response.json()
			setData(timeSeriesData)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred')
		} finally {
			setLoading(false)
		}
	}

	// Initial data fetch
	useEffect(() => {
		const startDate = new Date(Date.now() - 24 * 3600000)
		const endDate = new Date()
		fetchData(startDate, endDate)
	}, [])

	const handleDateRangeChange = (
		startDate: Date | null,
		endDate: Date | null
	) => {
		if (startDate && endDate) {
			fetchData(startDate, endDate)
		}
	}

	return (
		<ThemeProvider theme={theme}>
			<main className="flex min-h-screen flex-col items-center p-8">
				<h1 className="text-3xl font-bold mb-8">Odtok Novákova</h1>
				<DateRangePicker onDateRangeChange={handleDateRangeChange} />
				{loading && <p>Loading...</p>}
				{error && <p className="text-red-500">Error: {error}</p>}
				{!loading && !error && (
					<div className="w-full max-w-6xl">
						<TimeSeriesChart data={data} />
						<StatsTable 
							data={data}
							tooltipFormatter={getDateFormatters().tooltipFormatter}
							numberFormatter={getNumberFormatter()}
						/>
					</div>
				)}
			</main>
		</ThemeProvider>
	)
}
