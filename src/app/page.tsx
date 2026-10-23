'use client'

import { useMemo, useState } from 'react'
import { ThemeProvider, createTheme, useMediaQuery } from '@mui/material'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { cs } from 'date-fns/locale'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat'
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
					primary: { main: '#0ea5e9' },
				},
			}),
		[prefersDarkMode],
	)

	const [dateRange, setDateRange] = useState<[Date, Date]>(() => [
		new Date(Date.now() - 24 * 3600000),
		new Date(),
	])

	const { data, isLoading, error } = useQuery({
		queryKey: ['timeseries', dateRange[0], dateRange[1]],
		queryFn: async (): Promise<TimeSeriesData[]> => {
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

	const {
		data: todayData,
		isLoading: isTodayLoading,
		error: todayError,
	} = useQuery({
		queryKey: ['today'],
		refetchInterval: 5 * 60000,
		queryFn: async (): Promise<TimeSeriesData[]> => {
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

	const handleDateRangeChange = (startDate: Date | null, endDate: Date | null) => {
		if (startDate && endDate) {
			setDateRange([startDate, endDate])
		}
	}

	const { dateFormatter } = getDateFormatters()
	const numberFormatter = getNumberFormatter()
	const latest = todayData?.at(-1)
	const previous = todayData?.at(-2)
	const change = latest && previous ? latest.value - previous.value : 0
	const TrendIcon = change > 0 ? TrendingUpIcon : change < 0 ? TrendingDownIcon : TrendingFlatIcon
	const trendColor = change > 0 ? 'text-amber-500' : change < 0 ? 'text-emerald-500' : 'text-muted'

	return (
		<ThemeProvider theme={theme}>
			<main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-8 sm:px-8">
				<header>
					<h1 className="text-3xl font-bold tracking-tight">Odtok Novákova</h1>
					<p className="text-muted">Hladina vody v odtokovém příkopu, Dobřany</p>
				</header>

				<section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
					<p className="text-sm font-medium uppercase tracking-wide text-muted">Aktuální hladina</p>
					{isTodayLoading && <p className="mt-2 text-xl">Načítám poslední měření...</p>}
					{todayError && <p className="mt-2 text-red-500">Poslední měření se nepodařilo načíst</p>}
					{!isTodayLoading && !todayError && !latest && (
						<p className="mt-2 text-xl">Dnes zatím žádné měření</p>
					)}
					{latest && (
						<>
							<div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-2">
								<p className="text-6xl font-bold tabular-nums">
									{numberFormatter.format(latest.value)}
									<span className="text-2xl font-medium text-muted"> cm</span>
								</p>
								{previous && (
									<p className={`flex items-center gap-1 font-medium ${trendColor}`}>
										<TrendIcon fontSize="small" />
										{change > 0 && '+'}
										{numberFormatter.format(change)} cm od předchozího měření
									</p>
								)}
							</div>
							<p className="mt-2 text-sm text-muted">
								{formatDistanceToNow(new Date(latest.timestamp), { addSuffix: true, locale: cs })} ·{' '}
								{dateFormatter.format(new Date(latest.timestamp))}
							</p>
						</>
					)}
				</section>

				<section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
					<h2 className="mb-4 text-lg font-semibold">Vývoj v čase</h2>
					<DateRangePicker onDateRangeChange={handleDateRangeChange} />
					{isLoading && <p>Načítám vývoj v čase...</p>}
					{error && (
						<p className="text-red-500">
							Data se nepodařilo načíst: {error instanceof Error ? error.message : 'neznámá chyba'}
						</p>
					)}
					{!isLoading && !error && data && (
						<>
							<TimeSeriesChart data={data} />
							<StatsTable
								data={data}
								tooltipFormatter={dateFormatter}
								numberFormatter={numberFormatter}
							/>
						</>
					)}
				</section>
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
