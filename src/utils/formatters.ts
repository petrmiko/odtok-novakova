export const getDateFormatters = () => {
	const xAxisFormatter = new Intl.DateTimeFormat(undefined, {
		month: 'numeric',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
	})

	const tooltipFormatter = new Intl.DateTimeFormat(undefined, {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
		weekday: 'short',
	})

	return { xAxisFormatter, tooltipFormatter }
}

export const getNumberFormatter = () => {
	return new Intl.NumberFormat(undefined, {
		minimumFractionDigits: 1,
		maximumFractionDigits: 1,
	})

}