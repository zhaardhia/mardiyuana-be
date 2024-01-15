const nodemailer = require("nodemailer")

exports.sendEmailUser = (options) => {

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    service: 'gmail',
    secure: false,
    auth: {
      user : process.env.NODEMAILER_EMAIL,
      pass : process.env.NODEMAILER_PASS
    }
  })

  try {
    transporter.sendMail(options, (err, info) => {
      if(err) console.error(err);
      console.log("MESSAGE ID: ", info.messageId);
      console.log(`Email Sent to: ${options.to}`)
    })
    return { succeed: true, message: "Success send email to user" }
  } catch (error) {
    console.error(error)
    return { succeed: false, message: "Failed send email to user" }
  }
}
