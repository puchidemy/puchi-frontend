Status: DONE

## Task 7: Frontend — Account Linking API Routes

### Created
- `src/app/api/auth/link-account/[provider]/route.ts` — GET route that generates Supertokens OAuth URL with `?mode=link` for third-party account linking
- `src/app/api/auth/unlink-account/route.ts` — POST route that removes account linking via `supertokens.removeAccountLinking()`

### Commit
- `c1e7821` — `feat(auth): add link/unlink account API routes`
