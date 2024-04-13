import { InferSchemaType, model, Schema } from "mongoose"

const userSchema = new Schema(
  {
    fullName: { type: String, required: true },
    username: { type: String, required: true },
    photo: {
      type: String,
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6NYW3a3rRNPiE4LaF3IPYE3n23CFaNmHe8pvoPqyE9g&s",
    },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    age: { type: Number, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    active: { type: Boolean, default: true, select: false },
  },
  { timestamps: true }
)

type User = InferSchemaType<typeof userSchema>

export default model<User>("User", userSchema)
