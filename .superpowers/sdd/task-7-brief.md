### Task 7: Frontend — Account Linking API Routes

**Files:**
- Create: `src/app/api/auth/link-account/[provider]/route.ts`
- Create: `src/app/api/auth/unlink-account/route.ts`

**Context:** Create API routes for linking and unlinking third-party accounts (Google, Facebook, TikTok). These are used by the Settings/Profile page.

- [ ] **Step 1: Create link-account route**

```typescript
// src/app/api/auth/link-account/[provider]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { ensureSupertokensInit } from "@/config/supertokens-server";
import { getSession } from "supertokens-node/recipe/session";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  ensureSupertokensInit();
  const { provider } = await params;

  try {
    // Get Supertokens OAuth URL for this provider
    const { getAuthorisationURL } = await import("supertokens-node/recipe/thirdparty");
    const url = await getAuthorisationURL({
      thirdPartyId: provider,
      redirectURIOnProviderDashboard: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback/${provider}?mode=link`,
    });

    return NextResponse.redirect(url);
  } catch (err) {
    console.error("Failed to generate link URL:", err);
    return NextResponse.json(
      { error: "Failed to initiate account linking" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Create unlink-account route**

```typescript
// src/app/api/auth/unlink-account/route.ts

import { NextRequest, NextResponse } from "next/server";
import { ensureSupertokensInit } from "@/config/supertokens-server";
import supertokens from "supertokens-node";
import { getSession } from "supertokens-node/recipe/session";

export async function POST(request: NextRequest) {
  ensureSupertokensInit();

  try {
    const session = await getSession(request, NextResponse.next());
    const userId = session.getUserId();
    const { providerUserId } = await request.json();

    if (!providerUserId) {
      return NextResponse.json(
        { error: "providerUserId is required" },
        { status: 400 }
      );
    }

    // Unlink the account
    await supertokens.removeAccountLinking(userId, providerUserId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to unlink account:", err);
    return NextResponse.json(
      { error: "Failed to unlink account" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/auth/link-account/
git add src/app/api/auth/unlink-account/
git commit -m "feat(auth): add link/unlink account API routes"
```
