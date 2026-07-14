"use client";

import SuperTokens from "supertokens-web-js";
import Session from "supertokens-web-js/recipe/session";
import EmailPassword from "supertokens-web-js/recipe/emailpassword";
import ThirdParty from "supertokens-web-js/recipe/thirdparty";

let initialized = false;

export function initSupertokens() {
  if (typeof window === "undefined") return;
  if (initialized) return;
  initialized = true;

  SuperTokens.init({
    appInfo: {
      appName: "Puchi",
      apiDomain: process.env.NEXT_PUBLIC_AUTH_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
      apiBasePath: "/api/auth",
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
