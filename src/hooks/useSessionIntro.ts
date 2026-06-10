"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "gizichain-intro-seen";

export function useSessionIntro() {
  const [showIntro, setShowIntro] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem(STORAGE_KEY);
    setShowIntro(!seen);
    setReady(true);
  }, []);

  const dismissIntro = useCallback(() => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setShowIntro(false);
  }, []);

  return { showIntro, dismissIntro, ready };
}
