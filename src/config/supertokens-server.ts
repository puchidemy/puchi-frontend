import SuperTokens from "supertokens-node";
import SessionNode from "supertokens-node/recipe/session";
import EmailPasswordNode from "supertokens-node/recipe/emailpassword";
import ThirdPartyNode from "supertokens-node/recipe/thirdparty";
import { TypeInput } from "supertokens-node/types";

export const supertokensConfig: TypeInput = {
  framework: "custom",
  supertokens: {
    connectionURI:
      process.env.SUPERTOKENS_CONNECTION_URI || "http://localhost:30567",
    apiKey: process.env.SUPERTOKENS_API_KEY || "change-in-production-please",
  },
  appInfo: {
    appName: "Puchi",
    apiDomain:
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    websiteDomain:
      process.env.NEXT_PUBLIC_WEBSITE_DOMAIN || "http://localhost:3000",
    apiBasePath: "/api/auth",
    websiteBasePath: "/auth",
  },
  recipeList: [
    EmailPasswordNode.init(),
    ThirdPartyNode.init({
      signInAndUpFeature: {
        providers: [
          {
            config: {
              thirdPartyId: "google",
              name: "Google",
              clients: [
                {
                  clientId: process.env.GOOGLE_CLIENT_ID || "",
                  clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
                  scope: ["openid", "email"],
                },
              ],
              oidcDiscoveryEndpoint:
                "https://accounts.google.com/.well-known/openid-configuration",
              authorizationEndpointQueryParams: {
                included_grant_scopes: "true",
                access_type: "offline",
              },
            },
          },
          {
            config: {
              thirdPartyId: "facebook",
              name: "Facebook",
              clients: [
                {
                  clientId: process.env.FACEBOOK_CLIENT_ID || "",
                  clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
                  scope: ["email"],
                },
              ],
              authorizationEndpoint:
                "https://www.facebook.com/v25.0/dialog/oauth",
              tokenEndpoint:
                "https://graph.facebook.com/v25.0/oauth/access_token",
              userInfoEndpoint: "https://graph.facebook.com/me",
            },
          },
          {
            config: {
              thirdPartyId: "tiktok",
              name: "TikTok",
              clients: [
                {
                  clientId: process.env.TIKTOK_CLIENT_KEY || "",
                  clientSecret: process.env.TIKTOK_CLIENT_SECRET || "",
                  scope: ["user.info.basic"],
                },
              ],
              authorizationEndpoint:
                "https://www.tiktok.com/v2/auth/authorize/",
              authorizationEndpointQueryParams: {
                client_key: process.env.TIKTOK_CLIENT_KEY || "",
              },
              tokenEndpoint: "https://open.tiktokapis.com/v2/oauth/token/",
              tokenEndpointBodyParams: {
                client_key: process.env.TIKTOK_CLIENT_KEY || "",
              },
              userInfoEndpoint: "https://open.tiktokapis.com/v2/user/info/",
              userInfoEndpointQueryParams: {
                fields: "open_id,union_id,avatar_url,avatar_large_url,display_name",
              },
            },
          },
        ],
      },
    }),
    SessionNode.init(),
  ],
};

let initialized = false;

export function ensureSupertokensInit() {
  if (initialized) return;
  SuperTokens.init(supertokensConfig);
  initialized = true;
}
