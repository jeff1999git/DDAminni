import connectToDatabase from '../../../../packages/db/mongodb';

export async function GET() {
	try {
		await connectToDatabase();
		return new Response(JSON.stringify({ ok: true, route: 'cleaning', message: 'DB connected' }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (err: any) {
		return new Response(JSON.stringify({ ok: false, error: err.message || String(err) }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}

export async function POST(request: Request) {
	try {
		await connectToDatabase();
		const body = await request.json().catch(() => ({}));
		return new Response(JSON.stringify({ ok: true, route: 'cleaning', body }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (err: any) {
		return new Response(JSON.stringify({ ok: false, error: err.message || String(err) }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}
