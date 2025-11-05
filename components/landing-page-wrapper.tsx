"use client";

import React from "react";
import { useRouter } from "next/navigation";
import LandingPage from "./landing-page";

export default function LandingPageWrapper({ dreamCount = 0 }: { dreamCount?: number }) {
  const router = useRouter();

  function handleGetStarted() {
    router.push("/auth/signin");
  }

  return <LandingPage onGetStarted={handleGetStarted} dreamCount={dreamCount} />;
}
