const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { Resend } = require('resend');

dotenv.config();

const {
  RESEND_API_KEY,
  ADMIN_EMAIL,
  FROM_EMAIL,
  SITE_NAME = 'Illyrian Cycling',
  PORT = 1000,
} = process.env;

if (!RESEND_API_KEY) {
  console.error('Missing RESEND_API_KEY in environment');
  process.exit(1);
}

if (!ADMIN_EMAIL) {
  console.error('Missing ADMIN_EMAIL in environment');
  process.exit(1);
}

const resend = new Resend(RESEND_API_KEY);
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

function sanitize(value) {
  return String(value || '').trim();
}

function buildClientEmail({ name, level }) {
  return {
    subject: `Thanks for reaching out to ${SITE_NAME}`,
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; color: #111; line-height: 1.5;">
        <h1 style="margin-bottom: 0.5rem;">Thank you, ${name}.</h1>
        <p>We received your request and will be in touch soon with a tailored cycling experience.</p>
        <p><strong>Level:</strong> ${level || 'Not specified'}</p>
        <p>Expect a reply within 24 hours.</p>
        <p>Ride safe,<br><strong>${SITE_NAME}</strong></p>
      </div>
    `,
  };
}

function buildAdminEmail({ name, email, level, message }) {
  return {
    subject: `New inquiry from ${name}`,
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; color: #111; line-height: 1.5;">
        <h1 style="margin-bottom: 0.5rem;">New ride inquiry</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Level:</strong> ${level || 'Not specified'}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${message || 'No message provided.'}</p>
      </div>
    `,
  };
}

app.post('/api/contact', async (req, res) => {
  const name = sanitize(req.body.name);
  const email = sanitize(req.body.email);
  const level = sanitize(req.body.level);
  const message = sanitize(req.body.message);

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  try {
    const clientEmail = buildClientEmail({ name, level });
    const adminEmail = buildAdminEmail({ name, email, level, message });

    await Promise.all([
      resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: clientEmail.subject,
        html: clientEmail.html,
      }),
      resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: adminEmail.subject,
        html: adminEmail.html,
      }),
    ]);

    return res.json({ success: true, message: 'Email sent successfully.' });
  } catch (error) {
    console.error('Resend email error:', error);
    return res.status(500).json({ error: 'Unable to send confirmation email. Please try again later.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`Back-end service listening on http://localhost:${PORT}`);
});
