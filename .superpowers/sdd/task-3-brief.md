### Task 3: Frontend — Supertokens Account Linking Config

**Files:**
- Modify: `src/config/supertokens-server.ts`

**Context:** Enable Supertokens AccountLinking recipe with auto-link when the same email is used across providers (Google, Facebook, TikTok).

- [ ] **Step 1: Add AccountLinking recipe to server config**

```typescript
// src/config/supertokens-server.ts

import AccountLinking from "supertokens-node/recipe/accountlinking";

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
    AccountLinking.init(),             // NEW — add this line
    ThirdPartyNode.init({
      signInAndUpFeature: {
        providers: [
          // ... existing providers unchanged (google, facebook, tiktok) ...
        ],
        shouldAutoLink: async (input) => {
            // Auto-link nếu cùng email
            return { allowed: true };
        },
      },
    }),
    SessionNode.init(),
  ],
};
```

- [ ] **Step 2: Verify supertokens-node version**

Check `package.json` for `"supertokens-node"` version — should be `^24.x.x` for AccountLinking support. If not, update:
```bash
cd D:\Github\puchidemy\puchi-frontend && bun add supertokens-node@latest
```

- [ ] **Step 3: Commit**

```bash
git add src/config/supertokens-server.ts
git commit -m "feat(auth): enable AccountLinking recipe with auto-link"
```
