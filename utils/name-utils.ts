export const getFullName = (first_name: string, last_name: string) => {
  if (!first_name || !last_name) return "??";

  return first_name + " " + last_name;
};

export const getInitials = (first_name: string, last_name: string) => {
  if (!first_name || !last_name) return "??";
  return `${first_name.charAt(0)}${last_name.charAt(0)}`.toUpperCase();
};