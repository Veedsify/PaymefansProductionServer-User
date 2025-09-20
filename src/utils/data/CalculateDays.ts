function getFormattedStringFromDays(numberOfDays: number): string {
  const years = Math.floor(numberOfDays / 365);
  const months = Math.floor((numberOfDays % 365) / 28); // Consider months as 28 days
  const days = numberOfDays % 28; // Remaining days after computing months

  const parts = [
    years && `${years} year${years === 1 ? "" : "s"}`,
    months && `${months} month${months === 1 ? "" : "s"}`,
    days && `${days} day${days === 1 ? "" : "s"}`,
  ];

  // Filter out falsy values and join with ', '
  return parts.filter(Boolean).join(", ") || "0 days";
}

export default getFormattedStringFromDays;
