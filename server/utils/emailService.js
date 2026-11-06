const nodemailer = require('nodemailer');

const isEmailConfigured = () => {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
};

const sendEmail = async ({ to, subject, text, html }) => {
  if (!isEmailConfigured()) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Email Service Notice: SMTP not configured. Logged to console]`);
      console.log(`  To: ${to}`);
      console.log(`  Subject: ${subject}`);
      console.log(`  Content: ${text || html}`);
    }
    return { success: true, simulated: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const message = {
    from: `${process.env.FROM_NAME || 'BookLoop'} <${process.env.FROM_EMAIL || 'notifications@bookloop.org'}>`,
    to,
    subject,
    text,
    html: html || `<p>${text}</p>`
  };

  const info = await transporter.sendMail(message);
  return { success: true, messageId: info.messageId };
};

module.exports = {
  isEmailConfigured,
  sendEmail
};
