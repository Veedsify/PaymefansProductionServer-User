"use client";
import { create } from "zustand";

// Zustand store for points
interface PointsStore {
  points: number;
  updatePoints: (newPoints: number) => void;
}

export const usePointsStore = create<PointsStore>((set) => ({
  points: 0,
  updatePoints: (newPoints: number) => set({ points: newPoints }),
}));
