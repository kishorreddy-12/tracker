export interface Suborganizer {
  id: string;
  name: string;
  phone: string;
  village: string;
  crop_type: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  suborganizer_id: string;
  date: string;
  amount: number;
  purpose: string;
  payment_mode: string;
  bill_receipt_url?: string;
  payment_screenshot_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // For joined queries
  suborganizer?: {
    name: string;
    village: string;
  };
}

export const PAYMENT_PURPOSES = [
  "Pesticides",
  "Sowing Advance", 
  "Labor Cost",
  "Rouging",
  "Detaching", // only for Maize
  "Seed Lifting",
  "Gunny Bags",
  "Transportation"
] as const;

export const PAYMENT_MODES = [
  "Cash",
  "Cheque", 
  "PhonePe",
  "Google Pay",
  "Bank Transfer",
  "Other"
] as const;

export const CROP_TYPES = [
  "Maize",
  "Wheat",
  "Rice",
  "Cotton",
  "Soybean",
  "Other"
] as const;

export type PaymentPurpose = typeof PAYMENT_PURPOSES[number];
export type PaymentMode = typeof PAYMENT_MODES[number];
export type CropType = typeof CROP_TYPES[number];