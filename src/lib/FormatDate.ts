// Format date string for chat bubble
export const formatDate = (date: string) => {
  const now = new Date();
  const inputDate = new Date(date);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (inputDate < yesterday) {
    // Older than 1 day: full date + time
    return inputDate.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  }
  // Within the last 1 day: only time
  return inputDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};
