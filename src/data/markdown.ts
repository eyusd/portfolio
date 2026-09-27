/** MDX → plain Markdown: interactive components become a sentence pointing to the page. */
export function toMarkdown(body: string) {
  return body
    .replace(/<Callout[^>]*label="([^"]*)"[^>]*>\s*([\s\S]*?)\s*<\/Callout>/g, (_, label: string, text: string) => `> **${label}.** ${text.trim()}`)
    .replace(/<Glyph>(.*?)<\/Glyph>/g, '$1')
    .replace(/<LabImage[^>]*alt="([^"]*)"[^>]*\/>/g, '')
    .replace(/<ArchitectureDiagram\s*\/>/g, '*(Diagram: keystrokes → rope buffer → CoreML toxicity classifier → either a continuous EMA mood score driving the sprite, or, on Enter, a synchronous block/allow decision with an Opt+Enter override.)*')
    .replace(/<Make10List\s*\/>/g, '*(The full interactive list of 10,000 solutions is on the web page.)*')
    .replace(/<LifePercentageCalculator\s*\/>/g, '*(An interactive calculator is on the web page. The formula: T = (S − p·D) / (1 − p), with D the birth date, S the start date and p the share of life.)*')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
