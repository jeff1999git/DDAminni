import connectToDatabase from '../../../../../packages/db/mongodb';
import CleaningLogModel from '../../../../../packages/db/models/CleaningLog';

const AREAS = ['living', 'kitchen', 'dining'] as const;
type CleaningArea = typeof AREAS[number];
const ROOMS = ['Room 1', 'Room 2', 'Room 3'];

function getRotation(weekId: string) {
  const weekNum = parseInt(weekId.split('-W')[1]);
  const offset = (weekNum - 1) % 3;
  return AREAS.map((area, i) => ({
    area,
    assignedRoom: ROOMS[(i + offset) % 3],
  }));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const weekId = searchParams.get('week');
    if (!weekId || !/^\d{4}-W\d{2}$/.test(weekId)) {
      return Response.json(
        { ok: false, error: 'Invalid or missing week param (expected YYYY-Wnn)' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const rotation = getRotation(weekId);
    const logs = await CleaningLogModel.find({ weekId }).lean();

    const schedule = rotation.map(({ area, assignedRoom }) => {
      const log = logs.find((l) => l.area === area);
      return {
        area,
        assignedRoom,
        completed: log?.completed ?? false,
        completedAt: log?.completedAt ?? null,
      };
    });

    return Response.json({ ok: true, schedule }, { status: 200 });
  } catch (err: any) {
    return Response.json({ ok: false, error: err.message || String(err) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { weekId, area, completed } = body || {};
    if (!weekId || !(AREAS as readonly string[]).includes(area)) {
      return Response.json(
        { ok: false, error: 'weekId and valid area are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const weekNum = parseInt(weekId.split('-W')[1]);
    const offset = (weekNum - 1) % 3;
    const areaIndex = (AREAS as readonly string[]).indexOf(area);
    const assignedRoom = ROOMS[(areaIndex + offset) % 3];

    const record = await CleaningLogModel.findOneAndUpdate(
      { weekId, area: area as CleaningArea },
      {
        weekId,
        area: area as CleaningArea,
        assignedRoom,
        completed: !!completed,
        completedAt: completed ? new Date() : null,
      },
      { upsert: true, new: true }
    ).lean();

    return Response.json({ ok: true, record }, { status: 200 });
  } catch (err: any) {
    return Response.json({ ok: false, error: err.message || String(err) }, { status: 500 });
  }
}
