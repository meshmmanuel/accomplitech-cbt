"use client";

import { useState } from "react";

export function useExamNavigation(total: number) {
  const [current, setCurrent] = useState(0);

  return {
    current,
    setCurrent,
    goNext: () => setCurrent((c) => Math.min(c + 1, total - 1)),
    goPrev: () => setCurrent((c) => Math.max(c - 1, 0)),
  };
}
