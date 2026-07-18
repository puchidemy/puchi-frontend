### Task 5: Wire settings pages + guest access

**Files:**
- Modify: `src/app/[locale]/(protected)/(nav)/settings/preferences/page.tsx` — controlled Switches + theme
- Modify: `src/app/[locale]/(protected)/(nav)/settings/language/page.tsx` — locale → store + next-intl navigate
- Modify: `src/app/[locale]/(protected)/(nav)/settings/privacy/page.tsx` — minimal toggles → `privacy_json`
- Modify: `src/app/[locale]/(protected)/(nav)/settings/notifications/page.tsx` — P0: stub message or wire notification prefs if quick
- Modify: settings layout / proxy if needed so guest can open settings (profile still auth CTA)
- Modify: `SelectTheme` / preferences to call store

- [ ] **Step 1: Preferences switches bound to store**

- [ ] **Step 2: Language writes `locale` + navigates**

- [ ] **Step 3: Privacy minimal keys in JSON**

- [ ] **Step 4: Smoke UI guest + authed**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(settings): wire preferences language privacy to store"
```

---


