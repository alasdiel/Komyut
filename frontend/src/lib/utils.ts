import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function loadCdkConfig() {
  const res = await fetch('/cdk-config.json');
  return res.json();
}
