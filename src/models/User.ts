import mongoose, { Schema, Document, models } from "mongoose";

export interface IDietaryProfile {
  allergies: string[];
  calorieGoal: number;
  preferOrganic: boolean;
}

export interface IUser extends Document {
  email: string;
  name: string;
  image?: string;
  oauthProvider?: string;
  oauthId?: string;
  healthPreferences: string[];
  dietaryProfile: IDietaryProfile;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  oauthProvider: {
    type: String,
  },
  oauthId: {
    type: String,
  },
  healthPreferences: {
    type: [String],
    default: [],
    enum: ["Low Sugar", "Vegan", "Gluten-Free", "Keto", "Nut-Free", "Low Sodium", "High Protein", "Organic Only"],
  },
  dietaryProfile: {
    allergies: { type: [String], default: [] },
    calorieGoal: { type: Number, default: 2000 },
    preferOrganic: { type: Boolean, default: false },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
