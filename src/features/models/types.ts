import type { postAudienceDataProps2 } from "@/types/Components";

export interface ModelSignUpData {
  firstname: string;
  lastname: string;
  dob: string;
  country: string;
  available: string;
  gender: string;
  audience?: string;
  referral_code?: string;
  reference?: string;
}

export interface FormErrors {
  firstname?: string;
  lastname?: string;
  dob?: string;
  country?: string;
  referral_code?: string;
  available?: string;
  audience?: string;
}

export const GENDER_OPTIONS: Omit<postAudienceDataProps2, "icon">[] = [
  {
    id: 1,
    name: "Male",
  },
  {
    id: 2,
    name: "Female",
  },
];

export const SIGNUP_FEE_KOBO = 10000 * 100; // 10,000 NGN in kobo
export const STORAGE_KEY = "modelSignupData";
