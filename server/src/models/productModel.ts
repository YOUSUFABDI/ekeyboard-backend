import { InferSchemaType, Schema, model } from "mongoose"

const productSchema = new Schema(
  {
    name: {
      type: String,
    },
    price: {
      type: Number,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
    },
    likes: {
      type: Number,
    },
    stock: {
      type: Number,
    },
  },
  { timestamps: true }
)

type Product = InferSchemaType<typeof productSchema>

export default model<Product>("Product", productSchema)
