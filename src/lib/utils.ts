import type { ClassValue } from "clsx"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function validateEmail(email: string) {
  if (!email) {
    return "Email is required.";
  } else if (!email.includes("@")) {
    return "Please enter a valid email address.";
  }
}

export function validatePassword(password: string) {
  if (!password) {
    return "Password is required.";
  } else if (password.length < 6) {
    return "Password must be at least 6 characters.";
  }
}