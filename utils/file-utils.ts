/**
 * Format file size in bytes to human-readable format
 * @param bytes - Size in bytes
 * @returns Formatted size string (e.g., "1.5 MB", "256 KB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const base = 1024;
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(base)),
    units.length - 1,
  );
  const size = (bytes / Math.pow(base, exponent)).toFixed(1);

  return `${size} ${units[exponent]}`;
}


//  Check if file is an image

export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}


// Check if file is a video
export function isVideoFile(mimeType: string): boolean {
  return mimeType.startsWith("video/");
}


// Check if file is media (image or video)
export function isMediaFile(mimeType: string): boolean {
  return isImageFile(mimeType) || isVideoFile(mimeType);
}
