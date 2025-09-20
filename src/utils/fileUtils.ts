// File utility functions for handling attachments in group chat

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

const IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

/**
 * Format file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / k ** i).toFixed(2)) + " " + sizes[i];
};

/**
 * Check if file type is allowed
 */
const isFileTypeAllowed = (fileType: string): boolean => {
  return ALLOWED_FILE_TYPES.includes(fileType);
};

/**
 * Check if file size is within limit
 */
const isFileSizeValid = (fileSize: number): boolean => {
  return fileSize <= MAX_FILE_SIZE;
};

/**
 * Get file category based on MIME type
 */
export const getFileCategory = (
  fileType: string,
): "image" | "video" | "document" | "archive" | "other" => {
  if (IMAGE_TYPES.includes(fileType)) return "image";
  return "other";
};

/**
 * Check if file is an image
 */
export const isImage = (fileType: string): boolean => {
  return IMAGE_TYPES.includes(fileType);
};

/**
 * Get file extension from filename
 */
const getFileExtension = (filename: string): string => {
  return filename.split(".").pop()?.toLowerCase() || "";
};

/**
 * Generate a unique filename with timestamp and random string
 */
const generateUniqueFilename = (originalFilename: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = getFileExtension(originalFilename);

  return `${timestamp}-${randomString}${extension ? `.${extension}` : ""}`;
};

/**
 * Validate file before upload
 */
export const validateFile = (
  file: File,
): { isValid: boolean; error?: string } => {
  if (!isFileTypeAllowed(file.type)) {
    return {
      isValid: false,
      error: `File type not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(", ")}`,
    };
  }

  if (!isFileSizeValid(file.size)) {
    return {
      isValid: false,
      error: `File size too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}`,
    };
  }

  return { isValid: true };
};

/**
 * Create a preview URL for file (mainly for images)
 */
export const createFilePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!isImage(file.type)) {
      reject(new Error("File is not an image"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = () => {
      reject(new Error("Failed to create file preview"));
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Download file from URL
 */
const downloadFile = (fileUrl: string, fileName: string): void => {
  const link = document.createElement("a");
  link.href = fileUrl;
  link.download = fileName;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Get accept attribute string for file input
 */
export const getFileInputAccept = (): string => {
  return ALLOWED_FILE_TYPES.join(",");
};

/**
 * Truncate filename for display
 */
export const truncateFilename = (
  filename: string,
  maxLength: number = 30,
): string => {
  if (filename.length <= maxLength) return filename;

  const extension = getFileExtension(filename);
  const nameWithoutExt = filename.substring(0, filename.lastIndexOf("."));
  const truncatedName = nameWithoutExt.substring(
    0,
    maxLength - extension.length - 4,
  );

  return `${truncatedName}...${extension ? `.${extension}` : ""}`;
};
