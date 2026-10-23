interface StatsTableProps {
	data: Array<{ timestamp: string; value: number }>
	tooltipFormatter: Intl.DateTimeFormat
	numberFormatter: Intl.NumberFormat
}

export default function StatsTable({ data, tooltipFormatter, numberFormatter }: StatsTableProps) {
	const maxValue = data.length > 0 ? Math.max(...data.map((item) => item.value)) : undefined
	const maxTimestamps = data
		.filter((item) => item.value === maxValue)
		.map((item) => new Date(item.timestamp))

	const sortedValues = [...data].sort((a, b) => a.value - b.value)
	const medianValue =
		data.length > 0
			? data.length % 2 === 0
				? (sortedValues[data.length / 2 - 1].value + sortedValues[data.length / 2].value) / 2
				: sortedValues[Math.floor(data.length / 2)].value
			: undefined

	const formatCm = (value: number | undefined) =>
		value !== undefined ? `${numberFormatter.format(value)} cm` : 'N/A'

	return (
		<dl className="mt-6 grid gap-4 sm:grid-cols-2">
			<div className="rounded-xl border border-border bg-background p-4">
				<dt className="text-sm text-muted">Maximum</dt>
				<dd className="text-2xl font-semibold tabular-nums">{formatCm(maxValue)}</dd>
				{maxTimestamps.map((timestamp) => (
					<dd key={timestamp.toISOString()} className="text-sm text-muted">
						{tooltipFormatter.format(timestamp)}
					</dd>
				))}
			</div>
			<div className="rounded-xl border border-border bg-background p-4">
				<dt className="text-sm text-muted">Medián</dt>
				<dd className="text-2xl font-semibold tabular-nums">{formatCm(medianValue)}</dd>
			</div>
		</dl>
	)
}
