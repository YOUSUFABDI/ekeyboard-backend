import { InferSchemaType, Schema, model } from "mongoose"

const adminSchema = new Schema(
  {
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
    adminPhoto: {
      type: String,
      default:
        "https://cdn3d.iconscout.com/3d/premium/thumb/profile-5590850-4652486.png?f=webp",
    },
  },
  { timestamps: true }
)

type Admin = InferSchemaType<typeof adminSchema>
export default model<Admin>("Admin", adminSchema)
