let i18nMessages: Record<string, string> = {};

export function setClientTranslations(messages: Record<string, string>) {
  i18nMessages = messages;
}

export function t(key: string) {
  return i18nMessages[key] || key;
}
