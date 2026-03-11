import connectToDatabase from '../../../../../packages/db/mongodb';
import StickyNoteModel from '../../../../../packages/db/models/StickyNote';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const notes = await StickyNoteModel.find().sort({ createdAt: -1 }).lean();
    return Response.json({ ok: true, notes }, { status: 200 });
  } catch (err: any) {
    return Response.json({ ok: false, error: err.message || String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description } = body || {};

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return Response.json({ ok: false, error: 'Name is required' }, { status: 400 });
    }
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return Response.json({ ok: false, error: 'Description is required' }, { status: 400 });
    }
    if (name.length > 50) {
      return Response.json({ ok: false, error: 'Name must be <= 50 characters' }, { status: 400 });
    }
    if (description.length > 500) {
      return Response.json({ ok: false, error: 'Description must be <= 500 characters' }, { status: 400 });
    }

    await connectToDatabase();
    const note = await StickyNoteModel.create({ name, description });

    return Response.json({
      ok: true,
      note: {
        _id: note._id,
        name: note.name,
        description: note.description,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      },
    }, { status: 201 });
  } catch (err: any) {
    return Response.json({ ok: false, error: err.message || String(err) }, { status: 500 });
  }
}
