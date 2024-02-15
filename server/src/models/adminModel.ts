import { InferSchemaType, Schema, model } from "mongoose";

const adminSchema = new Schema({
  adminFullName: {
    type: String,
    required: true,
  },
  adminEmail: {
    type: String,
    required: true,
  },
  adminPassword: {
    type: String,
    required: true,
  },
  adminPhone: {
    type: Number,
    required: true,
  },
  adminAddress: {
    type: String,
    required: true,
  },
  adminUserName: {
    type: String,
    required: true,
  },
});

type Admin = InferSchemaType<typeof adminSchema>;
export default model<Admin>("Admin", adminSchema);
