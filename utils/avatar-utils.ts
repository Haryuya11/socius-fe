import { UserProfile } from "@/types/user";
import { getInitials, getFullName } from "./name-utils";

const PLACEHOLDER_AVATARS = [
  "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png",
  "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-2.png",
  "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png",
  "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-4.png",
  "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png",
  "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png",
  "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-7.png",
  "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-8.png",
  "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-9.png",
  "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-10.png",
];

export function getPlaceholderAvatar(userId: string | undefined | null) {
  if (!userId) return PLACEHOLDER_AVATARS[0];

  const sum = userId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return PLACEHOLDER_AVATARS[sum % PLACEHOLDER_AVATARS.length];
}

export function getDisplayAvatar(user: UserProfile | null | undefined) {
  if (!user) return "";

  if (user.imageUrl) return user.imageUrl;

  return getPlaceholderAvatar(user.userId);
}

export function getAvatarInfo(user: UserProfile | null | undefined) {
  if (!user) {
    return {
      fullName: "",
      initials: "",
      avatarUrl: "",
    };
  }

  const fullName = getFullName(user.firstName, user.lastName);
  const initials = getInitials(user.firstName, user.lastName);
  const avatarUrl = getDisplayAvatar(user);

  return { fullName, initials, avatarUrl };
}
