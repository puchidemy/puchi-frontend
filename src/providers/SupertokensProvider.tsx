"use client";

import { useEffect } from "react";
import { initSupertokens } from "@/config/supertokens";

export function SupertokensProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initSupertokens();
  }, []);

  return <>{children}</>;
}
