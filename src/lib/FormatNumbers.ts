function formatNumber(number: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 2,
  }).format(number);
}

export default formatNumber;
// This function formats a number into a more readable format using the Intl.NumberFormat API.
