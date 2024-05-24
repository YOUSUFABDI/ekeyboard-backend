import mongoose, { InferSchemaType, Schema, model } from "mongoose"

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
    images: [
      {
        type: String,
        default:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaBqXPJxDAvLfz-d0uNwJtxUSGKexAZfWzkknNlUdU0A&s",
      },
    ],
    likes: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
    },
  },
  { timestamps: true }
)

type Product = InferSchemaType<typeof productSchema>

export default model<Product>("Product", productSchema)
