interface StatsTableProps {
	data: Array<{ timestamp: string; value: number }>
	tooltipFormatter: Intl.DateTimeFormat
	numberFormatter: Intl.NumberFormat
}

export default function StatsTable({ 
	data, 
	tooltipFormatter, 
	numberFormatter 
}: StatsTableProps) {
	const maxValue = data.length > 0 ? Math.max(...data.map(item => item.value)) : undefined
	const maxTimestamps = data
		.filter(item => item.value === maxValue)
		.map(item => new Date(item.timestamp))
	
	const sortedValues = [...data].sort((a, b) => a.value - b.value)
	const medianValue = data.length > 0 
		? data.length % 2 === 0
			? (sortedValues[data.length / 2 - 1].value + sortedValues[data.length / 2].value) / 2
			: sortedValues[Math.floor(data.length / 2)].value
		: undefined

	const formattedMax = maxValue !== undefined ? numberFormatter.format(maxValue) : 'N/A'
	const formattedMedian = medianValue !== undefined ? numberFormatter.format(medianValue) : 'N/A'

	return (
		<div className="mt-4">
			<table className="w-full border-collapse">
				<thead>
					<tr className="border-b">
						<th className="text-left p-2"></th>
						<th className="text-left p-2">Hladina [cm]</th>
						<th className="text-left p-2">Čas(y)</th>
					</tr>
				</thead>
				<tbody>
					<tr className="border-b">
						<td className="p-2 font-semibold">Maximum</td>
						<td className="p-2">{formattedMax}</td>
						<td className="p-2">
							{maxTimestamps.map(timestamp => 
								<div key={timestamp.toISOString()}>
									{tooltipFormatter.format(timestamp)}
								</div>
							)}
						</td>
					</tr>
					<tr className="border-b">
						<td className="p-2 font-semibold">Median</td>
						<td className="p-2">{formattedMedian}</td>
						<td className="p-2">-</td>
					</tr>
				</tbody>
			</table>
		</div>
	)
}