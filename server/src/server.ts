import app from "./app"
import dotenv from "dotenv"
import mongoose from "mongoose"

dotenv.config()

const port = process.env.PORT

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Connected to DB")
    app.listen(port, () => {
      console.log(`Server running on port: ${port}`)
    })
  })
  .catch(console.error)
