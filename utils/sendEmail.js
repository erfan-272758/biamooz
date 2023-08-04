const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');
const pug = require('pug');

const transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

class SendEmail {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.firstName;
    this.url = url;
    this.from = 'info@biamoooz.ir';
  }

  async send(tm, subject) {
    const html = pug.renderFile(`${__dirname}/../views/email/${tm}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    await transport.sendMail({
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html),
    });
  }

  async welcome() {
    await this.send('welcome', 'به خانواده بیاموز خوش آمدید');
  }

  async forgotPassword() {
    await this.send(
      'passwordReset',
      'در مدت کمتر از ده دقیقه اقدام به بازیابی رمز عبور کنید'
    );
  }
}

module.exports = SendEmail;
