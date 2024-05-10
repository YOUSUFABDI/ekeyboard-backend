const nodemailer = require("nodemailer")

const sendEmail = async (subject, message, send_to, sent_form, reply_to) => {
  console.log(process.env.EMAIL_PASS)
  //create email transpoter
  const transporter = nodemailer.createTransport({
    // host: process.env.EMAIL_HOST,
    // port: 587,
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  })

  //options for sending email
  const options = {
    from: sent_form,
    to: send_to,
    replyTo: reply_to,
    subject: subject,
    html: message,
  }

  //send email
  transporter.sendMail(options, function (err, info) {
    if (err) {
      console.log(err)
    } else {
      console.log(info)
    }
  })
}

module.exports = sendEmail
