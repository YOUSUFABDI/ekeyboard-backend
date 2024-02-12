import { InferSchemaType, model, Schema } from "mongoose"

const userSchema = new Schema({
  fullName: { type: "string", required: true, minlength: 50 },
  username: { type: "string", required: true, minlength: 15 },
  address: { type: "string", required: true, minlength: 50 },
  phone: { type: "string", required: true, minlength: 50 },
  age: { type: "number", required: true, minlength: 100 },
  email: { type: "string", required: true },
  password: { type: "string", required: true },
})

type User = InferSchemaType<typeof userSchema>

export default model<User>("User", userSchema)
