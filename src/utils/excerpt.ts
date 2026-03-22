/**
 * Utility to generate a clean text excerpt from HTML content
 */
export function getCleanExcerpt(content: string, length: number = 280): string {
  if (!content) return "";
  
  // Remove HTML tags and replace with a space
  const stripped = content
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/\s+/g, ' ')
    .trim();
    
  if (stripped.length <= length) return stripped;
  
  // Cut at space to avoid cutting in the middle of a word
  const lastSpace = stripped.lastIndexOf(' ', length);
  const excerpt = lastSpace > 0 ? stripped.substring(0, lastSpace) : stripped.substring(0, length);
  
  return excerpt + "...";
}
