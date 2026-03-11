import { Model, Schema, model, models } from 'mongoose';

export type FamilyMemberStatus = 'current' | 'former';

export interface FamilyMemberDoc {
  _id: string;
  name: string;
  room: string;
  status: FamilyMemberStatus;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FamilyMemberSchema = new Schema<FamilyMemberDoc>(
  {
    name: { type: String, required: true, trim: true },
    room: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['current', 'former'], required: true },
    phone: { type: String, trim: true, default: '' },
  },
  {
    timestamps: true,
  }
);

const FamilyMemberModel = (models.FamilyMember as Model<FamilyMemberDoc>) || model<FamilyMemberDoc>('FamilyMember', FamilyMemberSchema);

export default FamilyMemberModel;
