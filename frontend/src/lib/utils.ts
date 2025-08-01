import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function loadCdkConfig() {
  const res = await fetch('/cdk-config.json');
  return res.json();
}

export async function getApiBaseUrl() {
  let apiBaseUrl: string;

  if (import.meta.env.DEV) {
    // In dev mode, use Vite env variable
    apiBaseUrl = import.meta.env.VITE_KOMYUT_API_URL as string;
    if (!apiBaseUrl) {
      throw new Error("VITE_KOMYUT_API_URL is not set in .env.development");
    }
  } else {
    // In prod (CDK deployment), load from cdk.json or equivalent
    const cdkCfg = await loadCdkConfig();
    apiBaseUrl = cdkCfg.apiBaseUrl;
  }

  return apiBaseUrl;
}