import { InferSchemaType, model, Schema } from "mongoose"

const userSchema = new Schema({
  fullName: { type: "string", required: true },
  username: { type: "string", required: true },
  photo: { type: "string", default: "default.jpj" },
  address: { type: "string", required: true },
  phone: { type: "string", required: true },
  age: { type: "number", required: true },
  email: { type: "string", required: true },
  password: { type: "string", required: true },
})

type User = InferSchemaType<typeof userSchema>

export default model<User>("User", userSchema)
