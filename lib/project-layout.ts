// Short stories fit the sidebar; longer ones get a full-width, readable section.
export function shouldExpandProjectDetails(content: string): boolean {
  const text = content.replace(/<[^>]*>/g, ' ').trim()
  return text ? text.split(/\s+/).length > 180 : false
}
