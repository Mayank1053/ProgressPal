import resend from "../config/resend.js";

const getFromEmail = () =>
  process.env.NODE_ENV === "production"
    ? process.env.EMAIL_SENDER
    : "onboarding@resend.dev";
const getToEmail = (to) =>
  // NODE_ENV === "production" ? to : "deliverd@resend.dev";
  to;

export const sendMail = async ({ to, subject, text, html }) =>
  await resend.emails.send({
    to: getToEmail(to),
    from: getFromEmail(),
    subject,
    text,
    html,
  });
