"use client";

import { Suspense } from "react";
import { WelcomeFlow } from "@/components/welcome";

function WelcomePageContent() {
  return <WelcomeFlow />;
}

export default function WelcomePage() {
  return (
    <Suspense fallback={<div className="py-24 text-center">Loading...</div>}>
      <WelcomePageContent />
    </Suspense>
  );
}
