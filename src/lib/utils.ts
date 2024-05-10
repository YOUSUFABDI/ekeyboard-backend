import jwt, { JwtPayload } from "jsonwebtoken"

export function assertIsDefined<T>(val: T): asserts val is NonNullable<T> {
  if (!val) {
    throw Error("Expected 'val' to be defined, but received " + val)
  }
}

export function generateToken(id: any) {
  return jwt.sign({ id }, process.env.SECRET_KEY, {
    expiresIn: "30d",
  })
}
