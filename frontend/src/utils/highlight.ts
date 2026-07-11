const KEYWORDS = [
  { pattern: /бронюванн\w*/gi },
  { pattern: /\bEnglish\b/gi },
  { pattern: /\bupper-intermediate\b/gi },
  { pattern: /\bIntermediate\b/gi },
  { pattern: /\bAdvanced\b/gi },
  { pattern: /\bFluent\b/gi },
  { pattern: /\b(B[12]|C[12]|A2)\b/g },
];

export function highlightKeywords(html: string): string {
  let result = html;
  for (const { pattern } of KEYWORDS) {
    result = result.replace(pattern, '<span class="bg-red-200 text-red-900 font-semibold px-0.5 rounded">$&</span>');
  }
  return result;
}
