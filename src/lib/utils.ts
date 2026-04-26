import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, country = "AU"): string {
  const currency = country === "NZ" ? "NZD" : "AUD";
  return new Intl.NumberFormat(country === "NZ" ? "en-NZ" : "en-AU", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function generateQuoteNumber(count: number): string {
  return `Q-${String(count + 1).padStart(4, "0")}`;
}

export function generateInvoiceNumber(count: number): string {
  return `INV-${String(count + 1).padStart(4, "0")}`;
}

export function calcGST(subtotal: number): number {
  return Math.round(subtotal * 0.1 * 100) / 100;
}

export function daysUntil(date: Date | string): number {
  const target = new Date(date);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export const TRADE_TYPES = [
  "Electrician",
  "Plumber",
  "Builder / Carpenter",
  "Painter",
  "Roofer",
  "HVAC / Air Conditioning",
  "Tiler",
  "Landscaper",
  "Concreter",
  "Plasterer",
  "Bricklayer",
  "Glazier",
  "Locksmith",
  "Pest Control",
  "Other",
];

export const JOB_STATUSES = ["LEAD", "QUOTED", "WON", "IN_PROGRESS", "COMPLETED", "LOST"];
export const QUOTE_STATUSES = ["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"];
export const INVOICE_STATUSES = ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"];
export const LICENSE_STATUSES = ["ACTIVE", "EXPIRING_SOON", "EXPIRED"];
