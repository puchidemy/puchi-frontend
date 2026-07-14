"use client";

import SuperTokens from "supertokens-web-js";
import Session from "supertokens-web-js/recipe/session";
import ThirdPartyEmailPassword from "supertokens-web-js/recipe/thirdpartyemailpassword";
import { Google, Facebook } from "supertokens-web-js/recipe/thirdpartyemailpassword";

export function initSupertokens() {
  if (typeof window === "undefined") return;

  SuperTokens.init({
    appInfo: {
      appName: "Puchi",
      apiDomain: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
      websiteDomain:
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_WEBSITE_DOMAIN || "http://localhost:3000",
      apiBasePath: "/api/auth",
      websiteBasePath: "/auth",
    },
    recipeList: [
      ThirdPartyEmailPassword.init({
        signInAndUpFeature: {
          providers: [
            Google.init(),
            Facebook.init(),
            { id: "tiktok", name: "TikTok" },
          ],
        },
      }),
      Session.init(),
    ],
  });
}

export function signOut() {
  return import("supertokens-web-js/recipe/session").then(({ signOut }) =>
    signOut()
  );
}
