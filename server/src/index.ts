import express, { Request, Response } from "express"

const app = express()

const PORT = 9393

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World")
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
