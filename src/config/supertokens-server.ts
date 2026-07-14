import SuperTokens from "supertokens-node";
import SessionNode from "supertokens-node/recipe/session";
import ThirdPartyEmailPasswordNode from "supertokens-node/recipe/thirdpartyemailpassword";
import { TypeInput } from "supertokens-node/types";
import { Google, Facebook } from "supertokens-node/recipe/thirdpartyemailpassword";

export const supertokensConfig: TypeInput = {
  framework: "custom",
  supertokens: {
    connectionURI: process.env.SUPERTOKENS_CONNECTION_URI || "http://localhost:30567",
    apiKey: process.env.SUPERTOKENS_API_KEY || "change-in-production-please",
  },
  appInfo: {
    appName: "Puchi",
    apiDomain: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
    websiteDomain: process.env.NEXT_PUBLIC_WEBSITE_DOMAIN || "http://localhost:3000",
    apiBasePath: "/api/auth",
    websiteBasePath: "/auth",
  },
  recipeList: [
    ThirdPartyEmailPasswordNode.init({
      providers: [
        Google({
          clientId: process.env.GOOGLE_CLIENT_ID || "",
          clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        Facebook({
          clientId: process.env.FACEBOOK_CLIENT_ID || "",
          clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
        }),
        {
          id: "tiktok",
          name: "TikTok",
          get: (redirectURI: string, authCodeFromRequest: string | undefined) => {
            return {
              accessTokenAPI: {
                url: "https://open.tiktokapis.com/v2/oauth/token/",
                params: {
                  client_id: process.env.TIKTOK_CLIENT_KEY || "",
                  client_secret: process.env.TIKTOK_CLIENT_SECRET || "",
                  code: authCodeFromRequest || "",
                  grant_type: "authorization_code",
                  redirect_uri: redirectURI,
                },
              },
              authorisationRedirect: {
                url: "https://www.tiktok.com/v2/auth/authorize/",
                params: {
                  client_key: process.env.TIKTOK_CLIENT_KEY || "",
                  scope: "user.info.basic",
                  response_type: "code",
                  redirect_uri: redirectURI,
                },
              },
              getClientId: () => process.env.TIKTOK_CLIENT_KEY || "",
            };
          },
        },
      ],
    }),
    SessionNode.init(),
  ],
};

let initialized = false;

export function ensureSupertokensInit() {
  if (!initialized) {
    SuperTokens.init(supertokensConfig);
    initialized = true;
  }
}
