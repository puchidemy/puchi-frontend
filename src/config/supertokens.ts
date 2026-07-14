"use client";

import SuperTokens from "supertokens-web-js";
import Session from "supertokens-web-js/recipe/session";
import EmailPassword from "supertokens-web-js/recipe/emailpassword";
import ThirdParty from "supertokens-web-js/recipe/thirdparty";

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
      EmailPassword.init(),
      ThirdParty.init(),
      Session.init(),
    ],
  });
}

export function signOut() {
  return import("supertokens-web-js/recipe/session").then(({ signOut }) =>
    signOut()
  );
}
