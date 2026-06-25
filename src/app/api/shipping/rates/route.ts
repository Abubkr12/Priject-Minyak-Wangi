import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        if (!body.destination_area_id) {
            return NextResponse.json({ error: 'destination_area_id is required' }, { status: 400 });
        }

        const payload = {
            "origin_area_id": "IDNP31IDNC3171IDND317104IDNV3171041001",
            "destination_area_id": body.destination_area_id,
            "couriers": "jne,jnt,sicepat,gojek,grab,shopee",
            "items": [
                {
                    "name": "Parfum",
                    "description": "Parfum",
                    "value": 50000,
                    "length": 10,
                    "width": 10,
                    "height": 10,
                    "weight": 200,
                    "quantity": 1
                }
            ]
        };

        const response = await fetch(`https://api.biteship.com/v1/rates/couriers`, {
            method: 'POST',
            headers: {
                'Authorization': process.env.BITESHIP_API_KEY || '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const pickupOption = {
            courier_name: "Toko Ela Parfum",
            courier_service_name: "Ambil di Tempat",
            courier_service_code: "pickup",
            price: 0,
            duration: "Tersedia Sekarang"
        };

        if (!response.ok) {
            const errData = await response.json();
            console.error('Biteship Error:', errData);
            
            // Fallback for testing when Biteship balance is empty
            return NextResponse.json({
                pricing: [
                    pickupOption,
                    { courier_name: "JNE", courier_service_name: "REG", courier_service_code: "reg", price: 15000, duration: "1-2 Hari" },
                    { courier_name: "J&T", courier_service_name: "EZ", courier_service_code: "ez", price: 16000, duration: "1-2 Hari" },
                    { courier_name: "Sicepat", courier_service_name: "REG", courier_service_code: "reg", price: 15000, duration: "1-2 Hari" },
                    { courier_name: "Pos Indonesia", courier_service_name: "Kilat Khusus", courier_service_code: "pos", price: 14000, duration: "2-3 Hari" },
                    { courier_name: "Anteraja", courier_service_name: "Reguler", courier_service_code: "reg", price: 15500, duration: "1-2 Hari" },
                    { courier_name: "Gojek", courier_service_name: "Same Day", courier_service_code: "sameday", price: 25000, duration: "6-8 Jam" },
                    { courier_name: "Grab", courier_service_name: "Same Day", courier_service_code: "sameday", price: 25000, duration: "6-8 Jam" }
                ]
            });
        }

        const data = await response.json();
        
        // Append Ambil di Tempat
        if (data && data.pricing) {
            data.pricing.unshift(pickupOption);
        } else {
            data.pricing = [pickupOption];
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching Biteship rates:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
