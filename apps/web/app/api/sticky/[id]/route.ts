import connectToDatabase from '../../../../../../packages/db/mongodb';
import StickyNoteModel from '../../../../../../packages/db/models/StickyNote';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return Response.json({ ok: false, error: 'ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    const result = await StickyNoteModel.findByIdAndDelete(id);

    if (!result) {
      return Response.json({ ok: false, error: 'Note not found' }, { status: 404 });
    }

    return Response.json({ ok: true, note: result }, { status: 200 });
  } catch (err: any) {
    return Response.json({ ok: false, error: err.message || String(err) }, { status: 500 });
  }
}
