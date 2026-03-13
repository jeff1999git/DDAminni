import connectToDatabase from '../../../../../packages/db/mongodb';
import CleaningLogModel from '../../../../../packages/db/models/CleaningLog';

const AREAS = ['living', 'kitchen', 'dining'] as const;
type CleaningArea = typeof AREAS[number];
const ROOMS = ['Room 1', 'Room 2', 'Room 3'];
const CLEANING_WEEK_LIMIT = 4;

function getISOWeekId(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayOfWeek = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayOfWeek);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

function getWeekStartDate(weekId: string) {
  const [yearStr, weekStr] = weekId.split('-W');
  const year = parseInt(yearStr);
  const week = parseInt(weekStr);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOfJan4 = jan4.getUTCDay() || 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - dayOfJan4 + 1 + (week - 1) * 7);
  return monday;
}

function getWeekDistance(baseWeekId: string, targetWeekId: string) {
  const base = getWeekStartDate(baseWeekId);
  const target = getWeekStartDate(targetWeekId);
  return Math.round((target.getTime() - base.getTime()) / (7 * 24 * 60 * 60 * 1000));
}

function isWeekInAllowedWindow(weekId: string) {
  const currentWeekId = getISOWeekId(new Date());
  const distance = getWeekDistance(currentWeekId, weekId);
  return distance >= -CLEANING_WEEK_LIMIT && distance <= CLEANING_WEEK_LIMIT;
}

async function cleanupOutOfWindowLogs() {
  const logs = await CleaningLogModel.find({}, { _id: 1, weekId: 1 }).lean();
  const staleIds = logs.filter((log) => !isWeekInAllowedWindow(log.weekId)).map((log) => log._id);

  if (staleIds.length > 0) {
    await CleaningLogModel.deleteMany({ _id: { $in: staleIds } });
  }
}

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
    await cleanupOutOfWindowLogs();

    if (!isWeekInAllowedWindow(weekId)) {
      return Response.json(
        { ok: false, error: 'Cleaning logs are available only for the current week plus or minus 4 weeks' },
        { status: 400 }
      );
    }

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
    await cleanupOutOfWindowLogs();

    if (!isWeekInAllowedWindow(weekId)) {
      return Response.json(
        { ok: false, error: 'Cleaning logs can be updated only for the current week plus or minus 4 weeks' },
        { status: 400 }
      );
    }

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
