import { useEffect } from "react";
import type { AppUser } from "@/lib/auth/use-current-user";

const REF_KEY = "taskearn.ref";

export function captureReferralFromUrl() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  const ref = url.searchParams.get("ref") ?? url.searchParams.get("start");
  if (ref) {
    try {
      sessionStorage.setItem(REF_KEY, ref.trim().toUpperCase());
    } catch {
      /* ignore */
    }
  }
}

export function readReferral(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(REF_KEY);
  } catch {
    return null;
  }
}

export function identityPayload(user: AppUser | null) {
  return {
    name: user?.displayName ?? null,
    email: user?.primaryEmail ?? null,
    image: user?.profileImageUrl ?? null,
    referralCode: readReferral(),
  };
}

export function useCaptureReferral() {
  useEffect(() => {
    captureReferralFromUrl();
  }, []);
}
