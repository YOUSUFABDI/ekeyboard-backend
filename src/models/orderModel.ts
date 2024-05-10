import { InferSchemaType, Schema, model } from "mongoose"

const orderModel = new Schema(
  {
    user: {
      type: Schema.ObjectId,
      ref: "User",
      required: [true, "Order must belong to a user"],
    },
    product: {
      type: Schema.ObjectId,
      ref: "Product",
      required: [true, "Order must belong to a product"],
    },
    quantity: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

type Order = InferSchemaType<typeof orderModel>

export default model<Order>("Order", orderModel)
