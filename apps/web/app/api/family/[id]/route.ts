import connectToDatabase from '../../../../../../packages/db/mongodb';
import FamilyMemberModel from '../../../../../../packages/db/models/FamilyMember';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { name, room, status, phone } = body || {};

    if (!name || !status) {
      return Response.json({ ok: false, error: 'name and status are required' }, { status: 400 });
    }

    if (status === 'current' && !room) {
      return Response.json({ ok: false, error: 'room is required for current residents' }, { status: 400 });
    }

    const updated = await FamilyMemberModel.findByIdAndUpdate(
      params.id,
      { name, room: status === 'former' ? '' : room, status, phone: phone || '' },
      { new: true }
    ).lean();

    if (!updated) {
      return Response.json({ ok: false, error: 'member not found' }, { status: 404 });
    }

    return Response.json({ ok: true, member: updated }, { status: 200 });
  } catch (err: any) {
    return Response.json({ ok: false, error: err.message || String(err) }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const deleted = await FamilyMemberModel.findByIdAndDelete(params.id).lean();

    if (!deleted) {
      return Response.json({ ok: false, error: 'member not found' }, { status: 404 });
    }

    return Response.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    return Response.json({ ok: false, error: err.message || String(err) }, { status: 500 });
  }
}
