# Task 5 Report — Wire settings pages + guest access

**Status:** complete  
**Branch:** `feat/guest-settings-sync`  
**Commit:** `feat(settings): wire preferences language privacy to store`

## Done

1. **Preferences** — controlled Switches bound to `useSettingsStore` (`soundEffects`, `animations`, `motivationalMessages`, `listeningExercises`); theme via `SelectTheme`.
2. **Language** — `SelectLanguage` writes `locale` to store and navigates with next-intl `router.replace(..., { locale })`.
3. **Privacy** — minimal toggles (`profilePublic`, `findableByUsername`, `shareActivity`) serialized into `privacyJson`.
4. **Notifications** — P0 stub “coming soon” (notification prefs API deferred).
5. **Guest access** — proxy already allows guests; Profile shows sign-in/sign-up CTA; `/settings` redirects to Preferences (guest-friendly). ThemeToggle also syncs store so header toggle stays consistent.

## i18n

Added `Settings.preferences|language|privacy|notifications|guestProfile` keys in `messages/en.json` and `messages/vi.json`.

## Notes

- Guest settings persist via existing store (`puchi-settings`); auth path still debounced PATCH from Task 4.
- No proxy/layout auth gate changes required beyond Profile CTA.
