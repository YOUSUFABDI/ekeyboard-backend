import { InferSchemaType, Schema, model } from "mongoose"

const orderModel = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.ObjectId,
      ref: "User",
      required: [true, "Order must belong to a user"],
    },
  },
  { timestamps: true }
)

type Order = InferSchemaType<typeof orderModel>

export default model<Order>("Order", orderModel)
