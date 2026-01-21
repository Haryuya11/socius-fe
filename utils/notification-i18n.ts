/**
 * Notification i18n utility for translating notification messages
 * with parameter interpolation support.
 */

type NotificationTranslations = {
  notifications: {
    [category: string]: {
      [key: string]: string;
    };
  };
};

// Import notification translations
import notificationsEn from "@/messages/notifications-en.json";
import notificationsVi from "@/messages/notifications-vi.json";

const translations: Record<string, NotificationTranslations> = {
  "en-US": notificationsEn as NotificationTranslations,
  vi: notificationsVi as NotificationTranslations,
};

/**
 * Gets the current locale from the cookie or defaults to 'vi'
 */
function getCurrentLocale(): string {
  if (typeof document === "undefined") return "vi";
  
  const cookies = document.cookie.split("; ");
  const localeCookie = cookies.find((c) => c.startsWith("NEXT_LOCALE="));
  
  if (localeCookie) {
    return localeCookie.split("=")[1];
  }
  
  return "vi";
}

/**
 * Translates a notification key with parameter interpolation
 * @param key - The translation key (e.g., "S_TASK_TITLE_002")
 * @param parameters - Object with parameters to interpolate (e.g., {TASK_ID: "54"})
 * @param locale - Optional locale override
 * @returns Translated and interpolated string
 */
export function translateNotification(
  key: string,
  parameters?: Record<string, string>,
  locale?: string
): string {
  const currentLocale = locale || getCurrentLocale();
  const notificationData = translations[currentLocale];

  if (!notificationData) {
    console.warn(`No translations found for locale: ${currentLocale}`);
    return key;
  }

  // Search for the key in all categories
  for (const category of Object.values(notificationData.notifications)) {
    if (category[key]) {
      let translated = category[key];

      // Replace parameters if provided
      if (parameters) {
        Object.entries(parameters).forEach(([paramKey, paramValue]) => {
          const regex = new RegExp(`{{${paramKey}}}`, "g");
          translated = translated.replace(regex, paramValue);
        });
      }

      return translated;
    }
  }

  // Fallback: return the key if not found
  console.warn(`Translation key not found: ${key} in locale: ${currentLocale}`);
  return key;
}

/**
 * Translates notification title and content in one call
 * @param titleKey - The title translation key
 * @param contentKey - The content translation key
 * @param parameters - Parameters to interpolate
 * @param locale - Optional locale override
 * @returns Object with translated title and content
 */
export function translateNotificationMessage(
  titleKey: string,
  contentKey: string,
  parameters?: Record<string, string>,
  locale?: string
): { title: string; content: string } {
  return {
    title: translateNotification(titleKey, parameters, locale),
    content: translateNotification(contentKey, parameters, locale),
  };
}
