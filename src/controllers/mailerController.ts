import * as nodemailer from "nodemailer";
import config from "../Config";

class Mail {
  constructor(
    public to?: string,
    public subject?: string,
    public message?: string
  ) {}

  sendMail() {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: false,
      auth: {
        user: config.user,
        pass: config.password,
      },
      tls: { rejectUnauthorized: false },
    });

    const mailOptions = {
      from: config.user,
      to: this.to,
      subject: this.subject,
      html: this.message,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email enviado: ", info.response);
      }
    });
  }
}

export default new Mail();
