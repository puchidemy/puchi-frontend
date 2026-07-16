Status: DONE
Commits: 67c924a
Tests: N/A
Self-review: Created ProfilePageView.tsx by extracting UI from old profile/page.tsx, making it accept profile/isLoading/isOwnProfile props. Created get-public-profile.ts server action. Added onboardingCompleted?: boolean to FullProfile.user. Created /in/page.tsx (own profile) and /in/[username]/page.tsx (public profile). Deleted old profile route. The new /in pages use mock data for gamification/stats/achievements fields since the backend endpoints return only basic user info.
Concerns: None
