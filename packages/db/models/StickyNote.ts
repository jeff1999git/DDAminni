import { Model, Schema, model, models } from 'mongoose';

export interface StickyNoteDoc {
  _id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const StickyNoteSchema = new Schema<StickyNoteDoc>(
  {
    name: { type: String, required: true, maxlength: 50 },
    description: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true }
);

// TTL index: auto-delete documents 30 days (2592000 seconds) after creation
StickyNoteSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

const StickyNoteModel =
  (models.StickyNote as Model<StickyNoteDoc>) ||
  model<StickyNoteDoc>('StickyNote', StickyNoteSchema);

export default StickyNoteModel;
