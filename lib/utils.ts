import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sortQuotesLatestFirst<T extends { createdAt?: string; updatedAt?: string; quoteNumber?: string }>(quotes: T[]): T[] {
  return [...quotes].sort((a, b) => {
    // 1. Primary: Compare createdAt date/time (descending)
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (timeB !== timeA) {
      return timeB - timeA;
    }

    // 2. Secondary: If dates/timestamps are identical, parse quote number sequence (e.g. PT/26-27/66 -> 66)
    const getSeq = (numStr?: string) => {
      if (!numStr) return -1;
      const parts = numStr.split('/');
      const last = parts[parts.length - 1];
      const num = parseInt(last, 10);
      return isNaN(num) ? -1 : num;
    };

    const seqA = getSeq(a.quoteNumber);
    const seqB = getSeq(b.quoteNumber);
    if (seqA !== -1 && seqB !== -1 && seqA !== seqB) {
      return seqB - seqA;
    }

    // 3. Fallback: Compare updatedAt timestamp (descending)
    const updateTimeA = a.updatedAt ? new Date(a.updatedAt).getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
    const updateTimeB = b.updatedAt ? new Date(b.updatedAt).getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
    return updateTimeB - updateTimeA;
  });
}

