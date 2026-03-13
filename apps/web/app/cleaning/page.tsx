"use client";

import { useEffect, useState } from 'react';

type CleaningArea = 'dining' | 'living' | 'kitchen';

type CleaningRecord = {
  area: CleaningArea;
  assignedRoom: string;
  completed: boolean;
  completedAt?: string | null;
};

type FamilyMember = {
  _id: string;
  name: string;
  room: string;
};

const ROOM_ORDER = [
  { id: 'Room 1', label: 'Living room' },
  { id: 'Room 2', label: 'Kitchen' },
  { id: 'Room 3', label: 'Dinning room' },
] as const;

const AREA_LABELS: Record<CleaningArea, string> = {
  living: 'Living room',
  kitchen: 'Kitchen',
  dining: 'Dinning room',
};

function getISOWeekId(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayOfWeek = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayOfWeek);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

function normalizeRoom(room: string): string {
  const value = (room || '').trim().toLowerCase();
  if (value === 'room 1' || value === '1' || value === 'living room') return 'Room 1';
  if (value === 'room 2' || value === '2' || value === 'kitchen') return 'Room 2';
  if (value === 'room 3' || value === '3' || value === 'dinning room' || value === 'dining room') return 'Room 3';
  return room;
}

export default function CleaningPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [schedule, setSchedule] = useState<CleaningRecord[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        const week = getISOWeekId(new Date());
        const [cleaningRes, familyRes] = await Promise.all([
          fetch(`/api/cleaning?week=${week}`, { cache: 'no-store' }),
          fetch('/api/family', { cache: 'no-store' }),
        ]);

        const cleaningData = await cleaningRes.json();
        const familyData = await familyRes.json();

        if (!cleaningRes.ok || !cleaningData.ok) {
          throw new Error(cleaningData.error || 'Failed to load cleaning schedule');
        }

        if (!familyRes.ok || !familyData.ok) {
          throw new Error(familyData.error || 'Failed to load family members');
        }

        if (isMounted) {
          setSchedule(cleaningData.schedule || []);
          setMembers(familyData.members || []);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load cleaning data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div style={{ padding: 20, maxWidth: 760, margin: '0 auto', width: '100%' }}>
      <h2 style={{ marginTop: 0 }}>Cleaning</h2>
      <p style={{ color: '#9ca3af', marginTop: 0 }}>
        Room 1 - Living room, Room 2 - Kitchen, Room 3 - Dinning room
      </p>

      {loading && <p>Loading cleaning data...</p>}
      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      {!loading && !error && (
        <div style={{ display: 'grid', gap: 12 }}>
          {ROOM_ORDER.map((room) => {
            const roomMembers = members.filter((m) => normalizeRoom(m.room) === room.id);
            const assignedTask = schedule.find((item) => item.assignedRoom === room.id);

            return (
              <section
                key={room.id}
                style={{
                  border: '1px solid #374151',
                  borderRadius: 12,
                  padding: 14,
                  background: '#0b0b0b',
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: 6 }}>
                  {room.id} - {room.label}
                </h3>
                <p style={{ marginTop: 0, color: '#9ca3af' }}>
                  This week: {assignedTask ? AREA_LABELS[assignedTask.area] : 'No assigned area'}
                </p>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
