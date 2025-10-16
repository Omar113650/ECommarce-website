import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.APP_EMAIL_ADDRESS, 
    pass: process.env.APP_EMAIL_PASSWORD, 
  },
    tls: {
    rejectUnauthorized: false, // السماح بالشهادات غير الموثوقة
  },
});

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    await transporter.sendMail({
      from: `"Ecommerce APP 🛒" <${process.env.APP_EMAIL_ADDRESS}>`, 
      to,
      subject: subject || "E-commerce Notification",
      text: text || "You have a new notification from E-commerce APP.",
      html:
        html ||
        `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #0070f3;">E-commerce APP 🛒</h2>
            <p>Hello,</p>
            <p>You have received a new notification from <strong>E-commerce APP</strong>.</p>
            <p style="margin-top: 20px;">Check your account for more details: <a href="https://your-ecommerce-site.com" target="_blank" style="color:#0070f3;">Go to your account</a></p>
            <hr style="margin: 20px 0; border:none; border-top:1px solid #eee;" />
            <p style="font-size: 12px; color: #777;">If you did not expect this email, please ignore it.</p>
          </div>
        `,
    });

    console.log("Email sent successfully to:", to);
  } catch (error) {
    console.error("Error sending email:", error.message, error.response || "");
    throw error;
  }
};
