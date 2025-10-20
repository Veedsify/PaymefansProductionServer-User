// Main components

// Hooks
export { useUserPoints } from "@/features/user/hooks/useUserPoints";
export { default as PointsCount } from "./PointCount";
export { default as PointsDisplay } from "./PointsDisplay";

// Usage guidelines:
// - PointsCount: Use for main points display that needs real-time updates
// - PointsDisplay: Use for lightweight display in navigation, lists, etc.
// - useUserPoints: Use when you need custom points logic or additional data
