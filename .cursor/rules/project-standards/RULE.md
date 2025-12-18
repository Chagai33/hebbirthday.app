---
description: "Project-wide standards, architecture overview, clean architecture enforcement, and legacy file warnings."
globs: "**/*"
alwaysApply: true
---

# Project Standards & Architecture

## 🎯 Project Overview

Hebrew Birthday Management System with Google Calendar sync.

**Stack:** React + Firebase.

**Architecture:** Clean Architecture (v3.0.0).

---

## ⚠️ Critical Legacy Warnings

**DO NOT REFACTOR OR TOUCH WITHOUT EXTREME CAUTION:**

- `functions/src/guestPortal.ts` (Legacy)
- `functions/src/migration.ts` (Legacy)

**Why:** These files work in production and were not refactored during the v3.0 Clean Architecture migration. They contain complex logic that is difficult to test. Only modify if absolutely necessary and with extreme caution.

---

## 📁 Clean Architecture Structure

Strictly follow the dependency rule (Dependencies point inwards).

### File Locations:

- `domain/services/` → Pure business logic (No external deps).
- `application/use-cases/` → Orchestration logic.
- `infrastructure/` → External service wrappers (Firebase, Google APIs).
- `interfaces/` → Entry points (HTTP Triggers, UI adapters).

**Naming Conventions:**

- Services: `XxxService.ts` (e.g., `HebcalService.ts`)
- Use Cases: `XxxUseCase.ts` (e.g., `SyncBirthdayUseCase.ts`)
- Repositories: `XxxRepository.ts` (e.g., `BirthdayRepository.ts`)
- Clients: `XxxClient.ts` (e.g., `GoogleCalendarClient.ts`)

---

## 🎨 Code Style & Language

- **Comments:** Use **Hebrew** for implementation logic explanation. Use **English** for JSDoc/Interfaces.
- **Commit Messages:** Follow Conventional Commits (see Version Control section below).

---

## 🔴 CRITICAL: Project Versions

**Before suggesting ANY code changes, check these versions:**

### Backend (functions/):
- **Node.js:** 20 (NOT 18, NOT 22)
- **firebase-functions:** ^4.9.0 (Gen 1, NOT v5)
- **firebase-admin:** ^11.11.0
- **@hebcal/core:** ^5.10.1 (MUST match frontend)
- **TypeScript:** ^5.3.2
- **Module System:** CommonJS (NOT ESM)

### Frontend (src/):
- **React:** ^18.3.1 (React 18, NOT 17 or 19)
- **Vite:** ^5.4.2
- **firebase:** ^12.4.0 (v9+ modular syntax)
- **@hebcal/core:** ^5.10.1 (MUST match backend)
- **TypeScript:** ^5.5.3
- **Module System:** ESM

### ⚠️ NEVER suggest code for different versions!
- ❌ Don't use React 17 class components
- ❌ Don't use firebase v8 syntax
- ❌ Don't use firebase-functions v5 syntax
- ❌ Don't use Node 18 or 22
- ❌ Don't suggest ESM for backend

**ALWAYS check `DEPENDENCIES.md` before suggesting dependency changes!**

---

## 📚 Documentation

Before asking questions or making changes, reference:

1. **`DEPENDENCIES.md`** - **CHECK FIRST!** All versions & compatibility
2. `DEVELOPMENT_NOTES.md` - Known gotchas & solutions
3. `ARCHITECTURE.md` - Clean Architecture structure
4. `CHANGELOG.md` - History
5. `PROJECT_STATUS.md` - Current state

---

## 📖 Quick Reference

### Key Files (Backend):

- `functions/src/index.ts` - Entry point (exports only, ~60 lines)
- `functions/src/interfaces/dependencies.ts` - DI Container (Dependency Injection)
- `functions/src/domain/entities/types.ts` - All TypeScript types
- `functions/src/guestPortal.ts` - **Legacy** (don't refactor)
- `functions/src/migration.ts` - **Legacy** (don't refactor)

### Key Files (Frontend):

- `src/main.tsx` - Entry point
- `src/App.tsx` - Root component with routing
- `src/types/index.ts` - All TypeScript types
- `src/config/firebase.ts` - Firebase configuration
- `src/contexts/` - React Contexts (Auth, Tenant, etc.)

### Commands:

```bash
# Development
firebase emulators:start    # Backend (Functions, Firestore, Auth)
npm run dev                 # Frontend (Vite dev server)

# Build
npm run build               # Frontend
cd functions && npm run build  # Backend

# Deploy
firebase deploy --only functions:functionName  # Specific function
firebase deploy --only functions               # All functions
firebase deploy --only hosting                 # Frontend only
firebase deploy                                # Everything

# Logs
firebase functions:log                         # All logs
firebase functions:log --only functionName     # Specific function
```

---

## 💡 Pro Tips for AI Assistants

### 0. CHECK VERSIONS FIRST! 🔴

**Before suggesting ANY code, verify you're using the correct versions:**

- React 18 (NOT 17 or 19)
- firebase-functions v4.9 (NOT v5)
- firebase v12 (modular syntax, NOT v8)
- @hebcal/core v5.10.1 (NOT v4 or v6)
- Node 20 (NOT 18 or 22)

**If unsure, check `DEPENDENCIES.md` or ask the user!**

### 1. Context is Everything

**Frontend = ESM:**
- Modern `import/export` syntax
- React 18 with functional components
- Vite as build tool
- `package.json` has `"type": "module"`

**Backend = TypeScript → CommonJS:**
- TypeScript source with `import/export`
- Compiles to CommonJS (`require`/`module.exports`)
- Firebase Functions Gen 1
- `tsconfig.json` has `"module": "commonjs"`

### 2. When User Reports "It Doesn't Work"

**Ask for logs:**
- Emulator: Check terminal output
- Production: `firebase functions:log`
- Frontend: Browser Console (F12)

**Check environment:**
- Is it Emulator or Production?
- Emulator has workarounds (see `DEVELOPMENT_NOTES.md`)
- Before deployment, replace workarounds

**Look for similar issues:**
- Search `DEVELOPMENT_NOTES.md` - most issues are documented
- Check Git history - might have been fixed before

### 3. Before Suggesting Changes

**Understand the architecture:**
- Don't bypass Clean Architecture layers
- Use DI Container (`createDependencies()`)
- Don't create dependencies inline
- Follow the dependency rule (inward only)

**Check documentation:**
- Is this a known gotcha? (DEVELOPMENT_NOTES.md)
- Does it break existing patterns? (ARCHITECTURE.md)
- Will it affect dependencies? (DEPENDENCIES.md)

### 4. Testing is Coming (v3.1)

**Write testable code now:**
- Use Dependency Injection
- Pure functions where possible
- Separate business logic from infrastructure
- No hard-coded values

**Why:** Unit tests will be added in v3.1. Code written now should be easy to test.

### 5. Legacy Code - Handle with Care

**Files not refactored:**
- `functions/src/guestPortal.ts` - Guest Portal logic
- `functions/src/migration.ts` - Data migration tools

**If you must modify:**
- Read the entire file first
- Understand what it does
- Test thoroughly in emulator
- Add comprehensive logging
- Document your changes in DEVELOPMENT_NOTES.md

**Why not refactored?**
- They work in production
- Complex logic, hard to test
- Low priority for refactoring
- Risk > Benefit

---

## 📊 Current Status (Quick Overview)

### ✅ Working (Production Ready):

- All features deployed and operational
- Google Calendar sync (with idempotency)
- Hebrew date conversion (Hebcal)
- Guest Portal
- Multi-tenant support
- Wishlist management
- Gelt (חנוכה gelt) calculator
- Groups & filtering

### ⚠️ Known Issues (Non-Blocking):

1. **functions.config() deprecated** - Works until March 2026
   - Action: Migrate to .env files (firebase-functions v5)
   
2. **Emulator workarounds** - `new Date().toISOString()` vs `serverTimestamp()`
   - Action: Replace before deployment (documented in DEVELOPMENT_NOTES.md)
   
3. **Old records with after_sunset** - Need re-edit to recalculate
   - Impact: Only affects old data
   - Fix: Users need to edit once

### ❌ Not Implemented (Planned for v3.1):

- Unit tests (Jest)
- Integration tests
- CI/CD pipeline
- Automated deployments
- Error tracking (Sentry)

**See `PROJECT_STATUS.md` for detailed status.**

---

## 🔄 Version Control

### Commit Messages (Conventional Commits):

Follow this format: `<type>(<scope>): <description>`

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `style:` Code style (formatting, missing semicolons, etc.)
- `refactor:` Code change that neither fixes a bug nor adds a feature
- `test:` Adding or updating tests
- `chore:` Maintenance (dependencies, build config, etc.)

**Examples:**
```
feat(calendar): add bulk sync with idempotency
fix(auth): resolve timeout in onUserCreate trigger
docs(readme): update deployment instructions
chore(deps): update @hebcal/core to 5.10.1
refactor(birthday): extract EventBuilder to service
test(hebcal): add unit tests for HebcalService
```

**With scope (optional but recommended):**
```
feat(gelt): add template import/export functionality
fix(sync): prevent infinite loop in onBirthdayWrite
```

### Branch Naming:

- `main` - Production (protected, requires PR)
- `develop` - Development (integration branch)
- `feature/xxx` - New features (e.g., `feature/bulk-sync`)
- `fix/xxx` - Bug fixes (e.g., `fix/timestamp-issue`)
- `docs/xxx` - Documentation (e.g., `docs/update-architecture`)
- `chore/xxx` - Maintenance (e.g., `chore/update-deps`)

**Examples:**
```bash
git checkout -b feature/add-sms-notifications
git checkout -b fix/hebcal-immutability-bug
git checkout -b docs/update-development-notes
```

### Workflow:

```bash
# 1. Create branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/my-feature

# 2. Make changes and commit
git add .
git commit -m "feat(scope): description"

# 3. Push to remote
git push -u origin feature/my-feature

# 4. Create Pull Request to develop
# 5. After review, merge to develop
# 6. When ready, merge develop to main
```

---

## 🎯 Remember

### For All Developers:

> **"If it's not in DEVELOPMENT_NOTES.md, it's likely to happen again."**

**Always document:**
- New gotchas or unexpected behaviors
- Solutions to non-obvious problems
- Workarounds for known issues
- Breaking changes in dependencies
- Migration steps for major updates

### For AI Assistants:

1. **Read DEVELOPMENT_NOTES.md first** - Most issues are documented
2. **Follow Clean Architecture** - Don't bypass the layers
3. **Use Dependency Injection** - Don't create dependencies inline
4. **Ask about Legacy Files** - Before touching guestPortal.ts or migration.ts
5. **Document Everything** - Add new gotchas to DEVELOPMENT_NOTES.md
6. **NEVER run commands** - Only suggest commands with brief explanation. User runs them.

---

**Last Updated:** December 2024  
**Version:** 3.0.1  
**Architecture:** Clean Architecture (Uncle Bob)
