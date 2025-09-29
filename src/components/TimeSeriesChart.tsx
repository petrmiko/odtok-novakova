import {
	LineChart,
	Line,
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

const getTranslations = () => {
	const browserLocale = navigator.language.toLowerCase()
	return {
		label: browserLocale.startsWith('cs') ? 'Hladina (cm)' : 'Height (cm)',
		tooltip: browserLocale.startsWith('cs') ? 'Hladina' : 'Height',
	}
}

export default function TimeSeriesChart({ data }: TimeSeriesChartProps) {
	const translations = getTranslations()
	const { xAxisFormatter, tooltipFormatter } = getDateFormatters()
	const numberFormatter = getNumberFormatter()

	const formattedData = data.map((item) => {
		const date = new Date(item.timestamp)
		return {
			...item,
			originalTimestamp: item.timestamp,
			timestamp: xAxisFormatter.format(date),
		}
	})

	interface TooltipProps {
		active?: boolean
		payload?: Array<{
			value: number
			payload: TimeSeriesData & { originalTimestamp: string }
		}>
	}
	const CustomTooltip = ({ active, payload }: TooltipProps) => {
		if (active && payload && payload.length) {
			const date = new Date(payload[0].payload.originalTimestamp)
			const formattedDate = tooltipFormatter.format(date)

			return (
				<div className="bg-background p-2 border rounded shadow text-foreground">
					<p className="text-sm opacity-90">{formattedDate}</p>
					<p className="text-sm font-bold">
						{translations.tooltip}: {numberFormatter.format(payload[0].value)} cm
					</p>
				</div>
			)
		}
		return null
	}

	return (
		<div className="w-full">
			<div className="h-[400px]">
				<ResponsiveContainer width="100%" height="100%">
					<LineChart
						data={formattedData}
						margin={{ left: 10, right: 10, top: 10, bottom: 10 }}
					>
					<CartesianGrid strokeDasharray="3 3" stroke="#444"/>
					<XAxis
						dataKey="timestamp"
						angle={-45}
						textAnchor="end"
						height={70}
						interval="preserveStartEnd"
					/>
					<YAxis
						width={80}
						tickFormatter={(value) => `${numberFormatter.format(value)} cm`}
					>
						<Label
							value={translations.label}
							angle={-90}
							position="left"
						/>
					</YAxis>
					<Tooltip content={<CustomTooltip />} />
					<Line
						type="monotone"
						dataKey="value"
						strokeWidth={2}
						dot={{ r: 2 }}
					/>
				</LineChart>
			</ResponsiveContainer>
			</div>
		</div>
	)
}
