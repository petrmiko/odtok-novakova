import { NextResponse } from 'next/server'

interface DeviceData {
	mainPower: number
	waterHeight_P1: number
	waterHeight: number
	floodStage: number
	enableNotification: boolean
	loraSF: number
	loraSNR: number
	loraGWRssi: number
	loraGWName: string
	waterHeightAvg: number
	lastCommunicationTime: string
}

interface TimeSeriesItem {
	dataType: string
	sccID: number
	devID: string
	data: DeviceData
	created: {
		ts: string // provides time with Z UTC suffix but is NOT in UTC
		os: number
		by: string
		ep: number
	}
}

interface ApiResponse {
	status: string
	err_msg: string
	err_code: number
	data: TimeSeriesItem[]
}

async function provideTimeSeriesData(
	startDate?: string,
	endDate?: string
): Promise<ApiResponse> {
	const start = startDate
		? new Date(startDate)
		: new Date(Date.now() - 24 * 3600000)
	const end = endDate ? new Date(endDate) : new Date()

	const diffInDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
	const dataType = diffInDays > 31 ? 'dataD' : 'data'

	const url = new URL('https://api.chytrejsiobec.cz/api/device/data/log')
	url.searchParams.append('devID', 'SCC.IOT.CZ00256552OWN-6D6F555331FFFF58')
	url.searchParams.append('type', dataType)
	url.searchParams.append('dateFrom', start.toISOString())
	url.searchParams.append('dateTo', end.toISOString())

	try {
		const response = await fetch(url.toString(), {
			headers: {
				Authorization: 'dobrany.chytrejsimesto.cz',
			},
		})

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		const data = await response.json()
		return data
	} catch (error) {
		console.error('Error fetching data:', error)
		return {
			status: 'error',
			err_msg:
				error instanceof Error ? error.message : 'Unknown error occurred',
			err_code: 500,
			data: [],
		}
	}
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url)
	const startDate = searchParams.get('startDate')
	const endDate = searchParams.get('endDate')

	const response = await provideTimeSeriesData(
		startDate || undefined,
		endDate || undefined
	)

	if (response.status !== 'ok') {
		return NextResponse.json(response, { status: 500 })
	}

	console.log('Fetched data items:', response.data)

	const chartData = response.data.map((item: TimeSeriesItem) => ({
		timestamp: item.created.ts.replace('Z', ''),  // provides time with Z UTC suffix but is NOT in UTC
		value: item.data.waterHeight,
	}))

	return NextResponse.json(chartData)
}
