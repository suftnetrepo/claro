# Claro Production Rollout: Executive Summary

**Prepared:** 18 April 2026  
**Target:** Production-ready shipping v1.0 by end of April  
**Status:** 📋 Ready to begin implementation

---

## TL;DR: What's Happening

Claro is a strong beta product. To ship production-ready, we're adopting two architectural patterns from Vela (our proven health tracking app):

1. **Vela's centralized Typography system** — Replaces 50+ instances of raw text styling with semantic variants
2. **Vela's RevenueCat integration** — Replaces mock billing with real App Store/Play Store payments

Everything else stays Claro. The goal is polish + professionalism, not a redesign.

**Effort:** 12–14 hours engineering (mostly implementation, straightforward changes)  
**Risk:** Low (Vela code is production-tested, changes are isolated)  
**Timeline:** 2–3 weeks (includes App Store review cycles)

---

## Three Documents to Read

### 1. **PRODUCTION_READINESS_AUDIT.md** ← Start here
- Executive summary of all 5 phases
- Critical blockers identified
- Testing checklist
- 500+ lines comprehensive audit

**Read time:** 20–30 minutes  
**Why:** Understand the full scope and strategy

### 2. **DETAILED_IMPLEMENTATION_GUIDE.md** ← Technical reference
- Step-by-step code changes for each phase
- Exact file locations and line numbers
- Code snippets (copy-paste ready)
- Effort estimates per task

**Read time:** 15–20 minutes (skim), then reference during implementation  
**Why:** Know exactly what to change and where

### 3. **ARCHITECTURE_TRANSFORMATION.md** ← Visual guide
- Before/after diagrams for each system
- Architecture stacks (current vs. target)
- Data flow diagrams
- Timeline visualization

**Read time:** 10–15 minutes  
**Why:** Understand WHY each change matters

---

## Five-Phase Implementation Plan

### Phase 1: Typography System (3–3.5 hours)
**Goal:** Centralized Text component with 13 semantic variants

**Work:**
- Create `src/components/Text.tsx` (copy from Vela)
- Replace `StyledText` + props with `<Text variant="...">` across 50+ instances
- Focus on: PremiumScreen, PremiumGate, ModalHeader (high impact)
- Then other screens

**Files:** 1 create, 1 update exports, 10+ bulk replace

**Outcome:** App is visually more polished, consistent typography across all screens

---

### Phase 2: RevenueCat Integration (2.5–3 hours)
**Goal:** Real App Store/Play Store billing (no mock)

**Work:**
- Install `react-native-purchases`
- Rewrite `src/services/premiumService.ts` (copy structure from Vela)
- Add `initializeRevenueCat()` call to app bootstrap
- Simplify PremiumScreen (remove MockPaymentSheet)
- Delete `MockPaymentSheet.tsx`

**Files:** 4 update, 1 delete, 1 refactor

**Outcome:** Real payments work, app passes store review, users can restore purchases

---

### Phase 3: Quality Audit (1.5–2 hours)
**Goal:** Ensure all screens are visually consistent post-Phase 1

**Work:**
- Manually audit 8–10 major screens
- Check typography hierarchy, color usage, spacing
- Document findings

**Files:** 1 create (`TYPOGRAPHY_AUDIT_RESULTS.md`)

**Outcome:** Design system compliance documented, any issues recorded

---

### Phase 4: Release Configuration (3–3.5 hours)
**Goal:** App Store Connect / Play Console / RevenueCat setup

**Work:**
- Fix EAS project ID in `app.json`
- Create app records on App Store Connect + Play Console
- Create subscription products (monthly, yearly, lifetime)
- Link to RevenueCat

**Files:** 1 update (`app.json`), 1 create (`RELEASE_CONFIG_CHECKLIST.md`)

**Outcome:** Ready for TestFlight/Play Store internal testing

---

### Phase 5: Production Cleanup (2 hours)
**Goal:** Remove dev-only code, archive reference materials

**Work:**
- Remove dev-only premium reset from Settings
- Delete MockPaymentSheet leftover references
- Archive `/app/vela/` (don't ship reference code)
- Clean up comments

**Files:** 2 delete/archive, 2 update

**Outcome:** Production-clean codebase, smaller APK/IPA, ready to ship

---

## Critical Blockers (Fix Before Phase 2)

| Blocker | Current | Action | Effort |
|---------|---------|--------|--------|
| No real billing | Mock `grantEntitlement()` | Phase 2: RevenueCat | 2.5–3 hrs |
| `restorePurchases()` stubbed | Returns `false` | Phase 2: RevenueCat | Included above |
| MockPaymentSheet present | Fake Apple Pay UI | Phase 2: Simplify screen | Included above |
| No RevenueCat bootstrap | Missing init | Phase 2: Add to app/_layout | 15 min |
| EAS project ID placeholder | `YOUR_EAS_PROJECT_ID` | Phase 4: Fix app.json | 10 min |

**Blockers = 0 after Phase 2.** Everything else is polish.

---

## High-Priority Items

| Priority | Item | Reason | Impact |
|----------|------|--------|--------|
| 1 | Phase 1: Typography | Improves UI look immediately, enables Phase 3 | Visual polish |
| 2 | Phase 2: RevenueCat | Blocks real billing, passes app store review | Revenue enabler |
| 3 | Phase 4: Release config | Blocks TestFlight/Play submission | Ship blocker |

---

## Medium-Priority Items (v1.1 Post-Launch)

- Analytics integration (Mixpanel, Firebase)
- Crash reporting (Sentry)
- A/B testing framework
- First-run premium paywall optimization

These don't block shipping but would improve post-launch analytics.

---

## Testing Checklist

### Phase 1 Testing
- [ ] App boots without crash
- [ ] All screens render correctly
- [ ] Text is consistent across screens
- [ ] iOS simulator works
- [ ] Android simulator works
- [ ] Dark/light theme still works

### Phase 2 Testing
- [ ] RevenueCat initializes (check logs)
- [ ] Test store products load
- [ ] Purchase flow works (buy monthly)
- [ ] Entitlement caches in SecureStore
- [ ] Restore purchases works
- [ ] Premium features gate correctly

### Phase 3–5 Testing
- [ ] All major screens visually consistent
- [ ] No MockPaymentSheet references remain
- [ ] Dev buttons hidden
- [ ] No console.log() in prod code
- [ ] iOS + Android real device testing
- [ ] Full end-to-end payment flow works

---

## Timeline (Realistic)

```
Week 1 (Mon–Fri):
├─ Mon: Phase 1 (Typography)
├─ Tue: Phase 2 start (RevenueCat setup)
├─ Wed: Phase 2 end (integration + testing)
├─ Thu: Phase 3 (Audit) + Phase 5 (Cleanup)
└─ Fri: Full QA + documentation

Week 2 (Mon–Tue):
├─ Mon: Phase 4 (Release config)
└─ Tue: Final QA + ready for submission

Week 2+ (Wed onward):
├─ Wed: Submit TestFlight (iOS)
├─ Thu: Submit Play Store beta (Android)
├─ Fri+: App Store review (typically 1–2 days for approved devs)
└─ Monitor: Gather feedback during beta

Target Launch: End of April / Early May
```

---

## Key Files Referenced

### New Documents (Created Today)
- 📄 `PRODUCTION_READINESS_AUDIT.md` — Full strategy (500+ lines)
- 📄 `DETAILED_IMPLEMENTATION_GUIDE.md` — Step-by-step guide (400+ lines)
- 📄 `ARCHITECTURE_TRANSFORMATION.md` — Visual before/after (300+ lines)

### To Create (During Implementation)
- 📄 `TYPOGRAPHY_AUDIT_RESULTS.md` — After Phase 3
- 📄 `RELEASE_CONFIG_CHECKLIST.md` — After Phase 4
- 📄 `docs/VELA_LEARNINGS.md` — Optional reference doc

### To Create (Code)
- 📝 `src/components/Text.tsx` — Copy from Vela

### To Delete
- 🗑️ `src/screens/premium/MockPaymentSheet.tsx` — Phase 2
- 🗑️ `/app/vela/vela/` → Archive as reference → Phase 5

### To Update (20+ files across 5 phases)
- Typography: 10+ screens get replaced
- RevenueCat: 4 key files
- Release: 1 config file
- Cleanup: 2 files

---

## Success Metrics

### Phase 1: "Typography looks professional"
✅ All text sizes are consistent  
✅ No visual regressions from refactoring  
✅ App feels more polished

### Phase 2: "Billing works for real"
✅ Test store purchases succeed  
✅ Entitlements persist after app close/reopen  
✅ Premium features gate correctly

### Phase 3: "Design system is consistent"
✅ All major screens follow typography rules  
✅ Color usage is intentional  
✅ No visual inconsistencies

### Phase 4: "Ready for store submission"
✅ EAS builds succeed  
✅ App Store / Play Store records created  
✅ RevenueCat fully configured

### Phase 5: "Production clean"
✅ No dev-only code shipped  
✅ No dead code in repo  
✅ Ready to ship v1.0

---

## Risk Assessment

### What Could Go Wrong?

| Risk | Probability | Mitigation |
|------|-------------|-----------|
| RevenueCat API issues during dev | Low | Use test store mode, reference Vela's config |
| App Store takes >1 week to review | Medium | Submit early (day 5), have backup plan for delays |
| Typography replacements cause crashes | Low | Vela's Text is battle-tested, changes are mechanical |
| Missed edge cases in premium logic | Low | Comprehensive test on real devices before submission |
| EAS build fails | Very low | Standard expo tooling, EAS ID fix is trivial |

**Overall Risk:** 🟢 **LOW** — Most changes are straightforward adoptions of proven patterns.

---

## Success Definition

When does this project end?

**Claro v1.0 is production-ready when:**

✅ All Phase 1 done: Semantic typography across app  
✅ All Phase 2 done: Real RevenueCat integration working  
✅ All Phase 3 done: Design consistency audit passed  
✅ All Phase 4 done: App Store/Play Console ready  
✅ All Phase 5 done: Production code clean + shipped  
✅ All testing done: QA passed on real devices  
✅ Submitted: TestFlight (iOS) + Play Internal Testing (Android)  
✅ Approved: App Store approval received  
✅ Live: Available in iOS App Store + Google Play Store  

**Launch Date Target:** End of April 2026

---

## Questions to Answer Before Starting Phase 1

1. **Do you have RevenueCat credentials?** (Test store API key for dev)
   - Where: Check Vela's premiumService.ts comment block
   - Action: Use Vela's test credentials initially, request prod keys later

2. **Do you have an EAS project?** (For app builds)
   - Where: Run `eas init` or check `eas.json`
   - Action: Get real project ID from EAS dashboard

3. **Do you have App Store / Play Store dev accounts?** (For submission)
   - Action: Create if not present

4. **Any design changes planned?** (Before shipping)
   - Recommendation: Freeze design, ship v1.0, iterate in v1.1+

5. **Timeline flexibility?** (In case App Store review delays)
   - Target: End of April, but Plan B for May okay?

---

## Next Steps

### TODAY
1. ✅ Read: `PRODUCTION_READINESS_AUDIT.md` (understand strategy)
2. ✅ Read: `ARCHITECTURE_TRANSFORMATION.md` (visual overview)
3. ✅ Read: `DETAILED_IMPLEMENTATION_GUIDE.md` (technical details)
4. 🔜 Confirm: You have RevenueCat + EAS credentials ready

### MONDAY
5. 🔜 Start Phase 1 (create Text.tsx)
6. 🔜 Replace in high-priority screens (PremiumScreen, PremiumGate)
7. 🔜 Test on simulator

### TUESDAY–WEDNESDAY
8. 🔜 Phase 2 (RevenueCat integration)
9. 🔜 Test full payment flow

### THURSDAY–FRIDAY
10. 🔜 Phase 3 (Audit) + Phase 5 (Cleanup)
11. 🔜 Full device testing

### NEXT WEEK
12. 🔜 Phase 4 (Release config)
13. 🔜 Submit TestFlight/Play Store
14. 🔜 Monitor review + respond to feedback
15. 🔜 Launch! 🚀

---

## Reference: Vela Source Code

All reference code lives in: `/Users/appdev/dev/claro/app/vela/vela/`

**Key files to reference:**

| File | Purpose | Lines |
|------|---------|-------|
| `src/components/text/index.ts` | Text component (copy to Claro) | 170 |
| `src/services/premium.service.ts` | RevenueCat integration (copy structure) | 250+ |
| `src/hooks/usePremium.ts` | Premium hook pattern (reference) | 95 |
| `src/constants/premium.ts` | Premium config (adapt for Claro) | 50 |
| `TYPOGRAPHY_VARIANTS.md` | Typography system documentation | — |
| `VELA_PREMIUM_SYSTEM.md` | Premium architecture doc | — |

---

## Document Map

Use this as your navigation guide:

```
START HERE
    ↓
PRODUCTION_READINESS_AUDIT.md (understand scope)
    ↓
ARCHITECTURE_TRANSFORMATION.md (see visual before/after)
    ↓
DETAILED_IMPLEMENTATION_GUIDE.md (step-by-step code)
    ↓
BEGIN IMPLEMENTATION
    ↓
Phase 1: Create src/components/Text.tsx
Phase 2: Rewrite premiumService.ts
Phase 3: Audit screens
Phase 4: Fix app.json + store config
Phase 5: Delete MockPaymentSheet + cleanup
    ↓
QA & TESTING
    ↓
SHIP TO TESTFLIGHT / PLAY STORE
    ↓
LAUNCH 🚀
```

---

## Final Checklist Before You Start

- [ ] Read all three strategy documents
- [ ] Confirm RevenueCat test credentials available
- [ ] Confirm EAS project ID ready
- [ ] Backup current repo (git branch or backup)
- [ ] Block calendar for 12–14 hours this week
- [ ] Have iOS + Android device handy for testing
- [ ] Have App Store / Play Console credentials ready
- [ ] Prepare launch notes/changelog

---

## Contact / Questions

If stuck:
1. Check the `DETAILED_IMPLEMENTATION_GUIDE.md` for exact line numbers
2. Reference Vela source code (`/app/vela/vela/src/`)
3. Review session tracker for progress (`/memories/session/claro-production-rollout.md`)

---

**Ready to ship v1.0? Let's go.** 🚀

*Last Updated: 18 April 2026*
