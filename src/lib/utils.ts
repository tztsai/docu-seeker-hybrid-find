import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Highlight } from "@/types/document"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Highlight text based on document highlights array with score-based opacity
 * @param text - Original text to highlight
 * @param highlights - Array of highlight objects with score and content
 * @returns HTML string with highlighted content
 */
export function highlightTextWithScores(text: string, highlights: Highlight[] = []): string {
  if (!text || !highlights || highlights.length === 0) return text;
  
  let result = text;
  
  // Process each highlight, starting with highest scores for better overlapping
  highlights
    .sort((a, b) => b.score - a.score) // Process higher scores first
    .forEach(highlight => {
      // Get the appropriate CSS class based on score
      const getCssClass = (score: number) => {
        console.log('Highlight score:', score);
        if (score >= 9) return 'highlight-score-4';
        if (score >= 6) return 'highlight-score-3';
        if (score >= 3) return 'highlight-score-2';
        return 'highlight-score-1';
      };
      
      const highlightClass = getCssClass(highlight.score);
      
      // Escape special regex characters in the highlight content
      const escapeRegExp = (string: string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      };
      
      // Only process if highlight content is not empty
      if (highlight.content && highlight.content.trim()) {
        const regex = new RegExp(`(${escapeRegExp(highlight.content)})`, 'gi');
        result = result.replace(
          regex, 
          `<span class="${highlightClass}">$1</span>`
        );
      }
    });
  
  return result;
}
