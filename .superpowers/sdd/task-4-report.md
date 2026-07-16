Status: DONE
Commits: 17813d9
Tests: N/A
Self-review: All 5 files modified/created as specified in the brief. BasicInfoStep component created with first name, last name, and age range form. WelcomeFlow refactored to support 2 scenarios (not logged in vs just logged in) with basic-info stage, login state detection via /api/auth/session, and backend sync on complete. Callback page updated to check onboarding_completed from /v1/profile and redirect to /welcome with pre-fill params. Welcome page wrapped in Suspense for useSearchParams. Index updated with BasicInfoStep export.
Concerns: The pre-fill params from social callback use placeholders (empty firstName/lastName) since Supertokens social login doesn't expose first/last name in a standard way — users will fill these manually in BasicInfoStep.
