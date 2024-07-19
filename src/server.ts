import app from "./app"
import dotenv from "dotenv"

dotenv.config()

const port = process.env.PORT

app.listen(port, () => {
  console.log(`Server running on port:- ${port}`)
})
