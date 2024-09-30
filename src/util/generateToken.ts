import jwt from "jsonwebtoken"

export function generateToken(id: any) {
  return jwt.sign({ id }, process.env.SECRET_KEY, {
    expiresIn: "30d",
  })
}
