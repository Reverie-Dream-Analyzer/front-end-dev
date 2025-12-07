"use client";

import React from "react";
import { useRouter } from "next/navigation";
import LandingPage from "./landing-page";
import { useAuth } from "./auth-provider";

export default function LandingPageWrapper({ dreamCount = 0 }: { dreamCount?: number }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  function handleGetStarted() {
    if (isAuthenticated) {
      // Already logged in - go straight to dashboard or profile setup
      router.push(user?.hasProfile ? "/dashboard" : "/auth/profile-setup");
    } else {
      router.push("/auth/signin");
    }
  }

  return (
    <LandingPage
      onGetStarted={handleGetStarted}
      dreamCount={dreamCount}
      buttonText={isAuthenticated ? "Continue to Dashboard" : "Start Your Journey"}
    />
  );
}
