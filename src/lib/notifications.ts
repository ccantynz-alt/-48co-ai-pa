import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export type NotificationType =
  | "BID_RECEIVED"
  | "JOB_AWARDED"
  | "BID_REJECTED"
  | "REVIEW_REQUEST"
  | "REVIEW_RECEIVED"
  | "LICENSE_EXPIRING"
  | "PAYMENT_RECEIVED"
  | "INVOICE_DUE"
  | "ASSOCIATION_INVITE";

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  email?: { subject: string; html: string; to: string };
}

export async function notify(input: CreateNotificationInput) {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link,
    },
  });

  if (input.email) {
    sendEmail({
      to: input.email.to,
      subject: input.email.subject,
      html: input.email.html,
    }).catch((err) => console.error("Email send failed", err));
  }

  return notification;
}

export const emailTemplates = {
  bidReceived: (jobTitle: string, tradieName: string, amount: string, link: string) => ({
    subject: `New bid on "${jobTitle}"`,
    html: `<p>Hi,</p><p><strong>${tradieName}</strong> has submitted a bid of <strong>${amount}</strong> on your job "${jobTitle}".</p><p><a href="${link}">View bid</a></p><p>— 48co</p>`,
  }),
  jobAwarded: (jobTitle: string, link: string) => ({
    subject: `You won the job: "${jobTitle}"`,
    html: `<p>Congrats — you've been awarded the job "${jobTitle}".</p><p><a href="${link}">View job details</a></p><p>— 48co</p>`,
  }),
  reviewRequest: (jobTitle: string, link: string) => ({
    subject: `How was the work on "${jobTitle}"?`,
    html: `<p>Your job "${jobTitle}" is marked complete. Please leave a review for your tradie — it helps others find great trades.</p><p><a href="${link}">Leave a review</a></p><p>— 48co</p>`,
  }),
  licenseExpiring: (licenseName: string, daysLeft: number, link: string) => ({
    subject: `Licence expiring soon: ${licenseName}`,
    html: `<p>Your <strong>${licenseName}</strong> expires in <strong>${daysLeft} days</strong>.</p><p>Renew now to keep your verified badge and stay compliant.</p><p><a href="${link}">View licence</a></p><p>— 48co</p>`,
  }),
  paymentReceived: (amount: string, jobTitle: string, link: string) => ({
    subject: `Payment received: ${amount}`,
    html: `<p>You've been paid <strong>${amount}</strong> for "${jobTitle}".</p><p><a href="${link}">View payment</a></p><p>— 48co</p>`,
  }),
};
