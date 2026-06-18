import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function runAction<T>(actionPromise: Promise<T>): Promise<T> {
  const result = await actionPromise;
  if (result && typeof result === 'object' && '__error' in result) {
    throw new Error(result.__error as string);
  }
  return result;
}
