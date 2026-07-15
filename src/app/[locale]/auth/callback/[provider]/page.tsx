"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { signInAndUp } from "supertokens-web-js/recipe/thirdparty";
import { initSupertokens } from "@/config/supertokens";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

function CallbackContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const provider = params?.provider as string;

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    initSupertokens();

    async function handleCallback() {
      const code = searchParams.get("code");
      if (!code || !provider) {
        setStatus("error");
        setErrorMessage("Missing authentication parameters");
        return;
      }

      try {
        const response = await signInAndUp();

        if (response.status === "OK") {
          setStatus("success");
          setTimeout(() => router.replace("/learn"), 1000);
        } else if (response.status === "NO_EMAIL_GIVEN_BY_PROVIDER") {
          setStatus("error");
          setErrorMessage("The provider didn't provide an email address. Please try a different login method.");
        } else if (response.status === "SIGN_IN_UP_NOT_ALLOWED") {
          setStatus("error");
          setErrorMessage(response.reason || "Sign in not allowed.");
        } else {
          setStatus("error");
          setErrorMessage("Authentication failed. Please try again.");
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        setStatus("error");
        setErrorMessage("An error occurred during authentication. Please try again.");
      }
    }

    handleCallback();
  }, [provider, searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <h1 className="text-xl font-display font-bold">Signing you in...</h1>
            <p className="text-muted-foreground">Please wait while we complete the authentication.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="h-12 w-12 mx-auto text-[var(--unit-1)]" />
            <h1 className="text-xl font-display font-bold">Signed in successfully!</h1>
            <p className="text-muted-foreground">Redirecting you to the learning page...</p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="h-12 w-12 mx-auto text-destructive" />
            <h1 className="text-xl font-display font-bold">Authentication failed</h1>
            <p className="text-muted-foreground">{errorMessage}</p>
            <button
              onClick={() => router.replace("/auth/sign-in")}
              className="mt-4 text-primary hover:underline text-sm"
            >
              Back to sign in
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
