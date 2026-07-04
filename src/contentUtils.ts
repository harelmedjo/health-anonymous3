export function canSubmitContent(content: string, imageUrl?: string | null) {
  return content.trim().length > 0 || Boolean(imageUrl);
}
