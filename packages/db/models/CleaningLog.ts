import { Model, Schema, model, models } from 'mongoose';

export type CleaningArea = 'dining' | 'living' | 'kitchen';

export interface CleaningLogDoc {
  _id: string;
  weekId: string;
  area: CleaningArea;
  assignedRoom: string;
  completed: boolean;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const CleaningLogSchema = new Schema<CleaningLogDoc>(
  {
    weekId: { type: String, required: true },
    area: { type: String, enum: ['dining', 'living', 'kitchen'], required: true },
    assignedRoom: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

CleaningLogSchema.index({ weekId: 1, area: 1 }, { unique: true });

const CleaningLogModel =
  (models.CleaningLog as Model<CleaningLogDoc>) ||
  model<CleaningLogDoc>('CleaningLog', CleaningLogSchema);

export default CleaningLogModel;
