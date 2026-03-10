import connectToDatabase from '../../../../../packages/db/mongodb';
import FamilyMemberModel from '../../../../../packages/db/models/FamilyMember';

export async function GET() {
  try {
    await connectToDatabase();
    const members = await FamilyMemberModel.find().sort({ createdAt: -1 }).lean();
    return Response.json({ ok: true, members }, { status: 200 });
  } catch (err: any) {
    return Response.json({ ok: false, error: err.message || String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { name, room, status, phone } = body || {};

    if (!name || !room || !status) {
      return Response.json({ ok: false, error: 'name, room, and status are required' }, { status: 400 });
    }

    const created = await FamilyMemberModel.create({
      name,
      room,
      status,
      phone: phone || '',
    });

    return Response.json({ ok: true, member: created }, { status: 201 });
  } catch (err: any) {
    return Response.json({ ok: false, error: err.message || String(err) }, { status: 500 });
  }
}
