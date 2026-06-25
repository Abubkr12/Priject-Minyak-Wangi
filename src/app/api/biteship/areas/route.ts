import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    try {
        const response = await fetch(`https://api.biteship.com/v1/maps/areas?countries=ID&input=${encodeURIComponent(query)}`, {
            headers: {
                'Authorization': process.env.BITESHIP_API_KEY || ''
            }
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch areas from Biteship' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data.areas || []);
    } catch (error) {
        console.error('Error fetching Biteship areas:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
