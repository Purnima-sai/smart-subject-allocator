const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    // If no email config, create a preview/test account
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('No email credentials configured, emails will be logged only');
      transporter = {
        sendMail: async (opts) => {
          console.log('Would send email:', {
            to: opts.to,
            subject: opts.subject,
            text: opts.text
          });
          return { messageId: 'preview-' + Date.now() };
        }
      };
    } else {
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    }
  }
  return transporter;
};

// Basic send with retries queuing (in-memory). For production use a persistent queue.
const sendWithRetry = async (opts, retries = 2) => {
  let lastErr = null;
  const transport = getTransporter();

  for (let i = 0; i <= retries; i++) {
    try {
      const info = await transport.sendMail(opts);
      return info;
    } catch (err) {
      lastErr = err;
      console.error('Email send error (attempt ' + (i + 1) + '):', err.message);
      if (i < retries) {
        // Exponential backoff
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
      }
    }
  }
  throw lastErr;
};

exports.sendMail = async (opts) => {
  return sendWithRetry(opts, 2);
};

// send allocation notification email (simple template)
exports.sendAllocationNotification = async (to, name, allocation) => {
  const subject = 'SSAEMS - Allocation Result';
  const text = `Hello ${name},\nYou have been allocated to subject ID ${allocation.subject}.\nSection: ${allocation.section || 'N/A'}\nPriority: ${allocation.priority || ''}\n\nRegards.`;
  return exports.sendMail({ from: process.env.EMAIL_FROM || 'no-reply@example.com', to, subject, text });
};

