import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';

const transporter = nodemailer.createTransport({
  service: process.env.MAIL_SERVICE,
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_SENDER,
    pass: process.env.MAIL_PASSWORD,
  },
});
transporter.use(
  'compile',
  hbs({
    viewEngine: {
      extname: '.hbs',
      partialsDir: path.resolve('./templates'),
      layoutsDir: path.resolve('./templates'),
      defaultLayout: '',
    },
    viewPath: path.resolve('./templates'),
    extName: '.hbs',
  })
);
export const sendEmail = async (to, subject, template, context) => {
  try {
    const mailOptions = {
      from: process.env.MAIL_SENDER || 'no-reply@example.com',
      to,
      subject,
      template,
      context,
    };
    console.log('📨 Sending email to:', to);
    console.log('📌 Email Subject:', subject);
    console.log('📩 Email Context:', context);
    const data = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', data.messageId);
    return data;
  } catch (error) {
    console.error(
      '❌ Error sending email:',
      error instanceof Error ? error.message : error
    );
    return null;
  }
};
