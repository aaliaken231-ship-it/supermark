import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function formatCurrency(amount: number, currency: string = "FC"): string {
  return new Intl.NumberFormat("fr-FR").format(amount) + " " + currency;
}

export function generateId(prefix: string): string {
  const date = new Date();
  const timestamp = date.getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `${prefix}-${timestamp}${random}`;
}

export function generateCode(prefix: string): string {
  return generateId(prefix);
}

export function numberToWords(n: number): string {
  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
  
  if (n === 0) return 'zéro';
  
  let words = '';
  
  if (Math.floor(n / 1000000) > 0) {
    words += numberToWords(Math.floor(n / 1000000)) + ' million ';
    n %= 1000000;
  }
  
  if (Math.floor(n / 1000) > 0) {
    const thousands = Math.floor(n / 1000);
    if (thousands > 1) words += numberToWords(thousands) + ' ';
    words += 'mille ';
    n %= 1000;
  }
  
  if (Math.floor(n / 100) > 0) {
    const hundreds = Math.floor(n / 100);
    if (hundreds > 1) words += units[hundreds] + ' ';
    words += 'cent ';
    n %= 100;
  }
  
  if (n > 0) {
    if (n < 10) words += units[n];
    else if (n < 20) words += teens[n - 10];
    else {
      words += tens[Math.floor(n / 10)];
      if (n % 10 > 0) words += '-' + units[n % 10];
    }
  }
  
  return words.trim();
}
