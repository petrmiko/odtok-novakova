import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Label,
} from 'recharts'
import { getDateFormatters, getNumberFormatter } from '@/utils/formatters'

interface TimeSeriesData {
	timestamp: string
	value: number
}

interface TimeSeriesChartProps {
	data: TimeSeriesData[]
}

interface CustomTooltipProps {
	active?: boolean
	payload?: Array<{
		value: number
		payload: TimeSeriesData & { originalTimestamp: string }
	}>
	tooltipLabel: string
	dateFormatter: Intl.DateTimeFormat
	numberFormatter: Intl.NumberFormat
}

function CustomTooltip({
	active,
	payload,
	tooltipLabel,
	dateFormatter,
	numberFormatter,
}: CustomTooltipProps) {
	if (active && payload && payload.length) {
		const date = new Date(payload[0].payload.originalTimestamp)
		const formattedDate = dateFormatter.format(date)

		return (
			<div className="rounded-lg border border-border bg-card p-2 text-foreground shadow-lg">
				<p className="text-sm opacity-90">{formattedDate}</p>
				<p className="text-sm font-bold">
					{tooltipLabel}: {numberFormatter.format(payload[0].value)} cm
				</p>
			</div>
		)
	}
	return null
}

const getTranslations = () => {
	const browserLocale = navigator.language.toLowerCase()
	return {
		label: browserLocale.startsWith('cs') ? 'Hladina (cm)' : 'Height (cm)',
		tooltip: browserLocale.startsWith('cs') ? 'Hladina' : 'Height',
	}
}

export default function TimeSeriesChart({ data }: TimeSeriesChartProps) {
	const translations = getTranslations()
	const { xAxisFormatter, dateFormatter } = getDateFormatters()
	const numberFormatter = getNumberFormatter()

	const formattedData = data.map((item) => {
		const date = new Date(item.timestamp)
		return {
			...item,
			originalTimestamp: item.timestamp,
			timestamp: xAxisFormatter.format(date),
		}
	})

	return (
		<div className="w-full">
			<div className="h-80 sm:h-100">
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart data={formattedData} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
						<defs>
							<linearGradient id="waterFill" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.4} />
								<stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.02} />
							</linearGradient>
						</defs>
						<CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.1} />
						<XAxis
							dataKey="timestamp"
							angle={-45}
							textAnchor="end"
							height={70}
							interval="preserveStartEnd"
						/>
						<YAxis width={80} tickFormatter={(value) => `${numberFormatter.format(value)} cm`}>
							<Label value={translations.label} angle={-90} position="left" />
						</YAxis>
						<Tooltip
							content={
								<CustomTooltip
									tooltipLabel={translations.tooltip}
									dateFormatter={dateFormatter}
									numberFormatter={numberFormatter}
								/>
							}
						/>
						<Area
							type="monotone"
							dataKey="value"
							stroke="#0ea5e9"
							strokeWidth={2}
							fill="url(#waterFill)"
							dot={false}
							activeDot={{ r: 4 }}
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</div>
	)
}
