import { InferSchemaType, model, Schema } from "mongoose"

const userSchema = new Schema(
  {
    fullName: { type: String, required: true },
    username: { type: String, required: true },
    photo: { type: String, default: "default.jpj" },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    age: { type: Number, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
)

type User = InferSchemaType<typeof userSchema>

export default model<User>("User", userSchema)
