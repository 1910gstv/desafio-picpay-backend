import * as nodemailer from "nodemailer";
import config from "../Config";
import { Interface } from "readline";

class Mail {
  constructor(
    public to?: string,
    public subject?: string,
    public message?: string
  ) {}

  async sendMail() {
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

    const auth = await fetch("https://util.devi.tools/api/v1/notify");
    const authResponse = (await auth.json()) as AuthResponse;

    if(authResponse.status === 'fail' ){
      return {
        status: false,
        message: authResponse.data.message

      }
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

interface AuthResponse {
  status: string,
  data: {
    message: string;
  };
}

export default new Mail();
