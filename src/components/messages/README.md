# Automatic File Upload System for Messages

This README describes the automatic file upload system implemented for the messaging feature in PayMeFans.

## Overview

The system automatically uploads files as soon as they are selected by the user, providing real-time upload progress and status feedback. This improves user experience by eliminating the need to wait for uploads after clicking send.

## Key Components

### 1. Enhanced MediaFile Type (`/types/Components.d.ts`)

The `MediaFile` interface has been extended with upload-related properties:

```typescript
interface MediaFile {
  id: string;
  file: File;
  type: "image" | "video";
  previewUrl: string;
  posterUrl?: string;
  uploadStatus?: "idle" | "uploading" | "completed" | "error";
  uploadProgress?: number;
  attachment?: Attachment; // Result after successful upload
}
```

### 2. Upload Hook (`/hooks/useMediaUpload.ts`)

A custom hook that manages the automatic upload process:

- **Auto-upload**: Automatically starts uploading files when they're added to the media files array
- **Progress tracking**: Updates upload progress in real-time
- **Error handling**: Manages upload failures and retry logic
- **Cleanup**: Properly aborts ongoing uploads when files are removed
- **Status management**: Tracks upload states for each file

#### Key Functions:
- `uploadFile(file)`: Uploads a single file
- `areAllUploadsComplete()`: Checks if all uploads are finished
- `hasUploadErrors()`: Checks for any upload failures
- `getCompletedAttachments()`: Returns successfully uploaded attachments
- `getUploadProgress()`: Returns upload statistics

### 3. Updated Chat Context (`/contexts/ChatContext.tsx`)

Enhanced with upload status management:

```typescript
interface ChatState {
  // ... existing properties
  updateMediaFileStatus: (
    fileId: string,
    status: "idle" | "uploading" | "completed" | "error",
    progress?: number,
    attachment?: Attachment,
  ) => void;
}
```

### 4. Message Input Component (`/components/messages/MessageInputComponent.tsx`)

Key improvements:

- **Automatic upload trigger**: Files start uploading immediately upon selection
- **Smart send button**: Disabled while uploads are in progress
- **Upload progress indicator**: Visual feedback showing upload status
- **Error handling**: Prevents sending messages with failed uploads
- **Attachment integration**: Completed uploads are included in the message

#### Visual Features:
- Progress bar showing overall upload completion
- Disabled send button with visual feedback during uploads
- Error notifications for failed uploads

### 5. Media Preview Component (`/components/messages/MessageMediaPreview.tsx`)

Simplified and centralized:

- **Status display**: Shows upload progress, completion, or error states
- **Visual indicators**: Different overlays for uploading, completed, and error states
- **Removal handling**: Properly cleans up uploads when files are removed

## Upload Flow

1. **File Selection**: User selects files via file input
2. **Validation**: Files are validated for type and size
3. **Preview Generation**: Preview URLs and video posters are created
4. **Auto-upload Start**: Files are automatically queued for upload
5. **Progress Updates**: Real-time progress updates are displayed
6. **Completion**: Successful uploads generate attachment objects
7. **Message Send**: Send button is enabled only when all uploads complete

## File Type Handling

### Images
- Uploaded to Cloudflare Images
- Progress tracking via axios upload progress
- Preview generated from File object

### Videos
- Uploaded to Cloudflare Stream via TUS protocol
- Chunked upload with resume capability
- Video poster/thumbnail generation
- HLS streaming URL generation

## Error Handling

- **Network errors**: Automatic retry with backoff
- **File type validation**: Only images and videos allowed
- **Upload failures**: Clear error messaging to users
- **Cleanup**: Proper resource cleanup on errors

## Performance Optimizations

- **Parallel uploads**: Multiple files upload simultaneously
- **Progress batching**: Efficient progress updates
- **Memory management**: Proper cleanup of blob URLs and abort controllers
- **Upload deduplication**: Prevents duplicate uploads of the same file

## Usage Example

```typescript
// Files are automatically uploaded when added to mediaFiles
const { areAllUploadsComplete, hasUploadErrors, getCompletedAttachments } = useMediaUpload();

// Check if ready to send
if (areAllUploadsComplete() && !hasUploadErrors()) {
  const attachments = getCompletedAttachments();
  // Send message with attachments
}
```

## Configuration

Upload behavior can be configured through environment variables:

- `NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_SUBDOMAIN`: Stream playback domain
- `NEXT_PUBLIC_TS_EXPRESS_URL`: Backend API endpoint

## Dependencies

- `tus-js-client`: Resumable video uploads
- `axios`: Image uploads with progress tracking
- `zustand`: State management
- `uuid`: Unique file identifiers

## Future Enhancements

- Upload queue management with priority
- Bandwidth-aware upload speeds
- Offline upload support with queue persistence
- Advanced retry strategies with exponential backoff
- Compression options for large files