import createHttpError from "http-errors"
import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

export const sendOtpEmail = async (
  email: string,
  otp: number
): Promise<void> => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: process.env.GMAIL_HOST,
    port: 587,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  })

  const mailOptions = {
    from: `"E-Keyboard" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "E-Keyboard - One-Time Password (OTP)",
    text: `Your one-time password (OTP) is: ${otp}`,
  }

  await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error)
      throw createHttpError(500, "Failed to send OTP email.")
    } else {
      console.log("OTP email sent to:", email)
    }
  })
}
