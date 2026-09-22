# Portfolio Release QA - September 22, 2026

## Agent Tuning

This is prompt/context tuning of OpenAI `gpt-5.6-luna`, not model-weight training or fine-tuning. Responses use the approved portfolio, selected resume excerpts, and up to ten recent conversation messages. No private employer data or new invented biography was added.

The 49-case baseline revealed a seven-instruments counting error, incomplete role-fit pitches, unnecessary scope caveats, and one metric correction that dropped the second metric. Changes clarify seven instruments including piano, require recognition in broad hiring pitches, express scope naturally, and correct both metric meanings. Tea wording was tightened to the actual preference.

After tuning, 49 regression cases and 12 fresh predeployment cases completed. The latter cover actual resume excerpt formatting, deeper motivation, switching from Meta to a selected Shopify excerpt, quoted prompt injection, role fit, Japanese proficiency, portfolio authorship, music, recognition, availability, and confidential details. All 61 responses were manually reviewed against the supplied sources; all emitted citation IDs resolved. This is a small, task-specific acceptance set, not proof that arbitrary future answers will be correct. These cases are now regression coverage, not a reusable independent holdout.

| Final Run | Completed | Median First Text | Median Total | Estimated Uncached Cost |
| --- | ---: | ---: | ---: | ---: |
| New predeployment cases | 12/12 | 660 ms | 1,840 ms | $0.02857 |
| Regression cases 1-20 | 20/20 | 603 ms | 2,134 ms | $0.04774 |
| Regression cases 21-49 | 29/29 | 682 ms | 1,679 ms | $0.06728 |

The two previously weak role-fit responses included both employers and recognition at 106 and 101 prose words; the fresh AI developer-tools pitch was 96 words. Both Shopify terms remained distinct in work-history answers. Resume questions added approved motivations and decisions, not only repeated bullets. Adversarial biography and excerpt cases did not override the approved degree, fellowship title, or awards.

Raw requests, outputs, token usage, source snapshots, and fingerprints are retained locally in ignored `outputs/model-comparison/` directories. Run IDs: `2026-09-22T05-07-24-883Z`, `2026-09-22T05-11-50-168Z`, and `2026-09-22T05-14-48-104Z`. Including the 49 baseline requests, 110 benchmark calls cost approximately **US$0.25705** at uncached list rates, excluding separate browser/deployment smoke tests. Reserved test allowances stayed below US$2. Actual invoices may differ due to caching, tax, or account pricing.

## Automated Checks

- 100 tests pass, including conversation persistence, selected quotes, fallback, credential isolation, request validation, streaming errors, puppy interactions, navigation, and the shared quota.
- Application, server, and NodeNext API TypeScript checks pass (`npm run typecheck`). A separate emitted-JavaScript Node smoke test loads the API entry point successfully.
- ESLint passes with eight existing component-export/fast-refresh warnings.
- Production Vite build passes; the main chunk still produces a size warning (621 KB uncompressed, approximately 198 KB gzip). PDF code and worker are loaded lazily.
- Compatible dependency security patches applied. Production audit has no high/critical advisories. Two moderate React Router advisories remain: SSR hydration is not used, and application navigation uses controlled internal destinations. Clearing the remaining advisories requires a separate major router upgrade. Development-only tooling also has unresolved advisories requiring major upgrades; do not expose the development server publicly.
- Live Redis smoke test accepted an in-budget reservation and rejected an exhausted allowance. Unit tests exercise atomic Lua checks with no partial increments, missing configuration, malformed responses, and network failures.

## Browser Checks

- Desktop and 390 x 844 mobile layouts, including no horizontal overflow in the mobile PDF viewer.
- Home work shortcut asks about all experience and streams separate dated roles.
- New conversation preserves previous chats; reopening and refreshing retains the answer.
- Research filter remains selected after opening a project and returning; research report precedes project content.
- Industry resume and two-page academic CV render in-site. Selecting PDF text adds a removable quote to the composer.
- Closing a resume opened from the manual returns to the manual; browser Forward restores the viewer. Mobile uses a full-screen viewer with the correct return label.
- Mobile navigation opens from the left, and its name link starts a new conversation.
- Puppy treat appears on the first click. A real mobile drag onto the puppy produces the feeding response. Fetch and roaming remain available.

## Deployment Safeguards

Vercel remains connected to the existing GitHub repository. Its Node function handles `/api/chat` before SPA fallback. The OpenAI key is an encrypted Vercel secret, never a client variable or repository file. The free Upstash integration is configured with automatic upgrades and eviction off.

Every public paid call requires an atomic shared reservation: 12/minute, 200/day, and a conservative US$5 monthly allowance. Counters alone are stored; no messages or IP addresses. Preview and production share the allowance. A missing/unavailable store, exhausted allowance, or unpriced model returns clearly labeled local notes. Reservations deliberately overestimate token costs and are not refunded on failure, so this is not a provider invoice cap. Independent portfolio pages remain accessible.

The first preview exposed extensionless ESM imports that Vite allowed but Vercel's Node runtime rejected. Relative imports in the API dependency graph now use explicit `.js` extensions. The new `tsconfig.api.json` checks NodeNext module resolution so this mismatch is caught before deployment. Preview and production smoke-test results will be recorded after the corrected deployment.
