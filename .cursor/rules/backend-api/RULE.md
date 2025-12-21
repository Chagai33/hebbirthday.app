description: "Backend rules for Firebase Functions. Enforces CommonJS, DI patterns, and proper error handling."
globs: "functions/**/*.ts"
---
# Backend & Firebase Functions Rules

## 🔴 CRITICAL: Backend Versions

**This backend uses specific versions. DO NOT suggest code for other versions!**

- **firebase-functions:** `^4.9.0` (Gen 1) - NOT v5!
- **firebase-admin:** `^11.11.0`
- **Node.js:** `20` (NOT 18, NOT 22)
- **@hebcal/core:** `^5.10.1`
- **TypeScript:** `^5.3.2`
- **googleapis:** `^164.1.0`
- **p-limit:** `^3.1.0` (CommonJS version, NOT v7)
- **node-fetch:** `^2.7.0` (CommonJS version, NOT v3)

### ⚠️ Common Mistakes to Avoid:
- ❌ Don't suggest `firebase-functions` v5 syntax (`.env` files, new imports)
- ❌ Don't suggest ESM packages (p-limit v7, node-fetch v3)
- ❌ Don't suggest async/await patterns from newer Firebase versions
- ❌ Don't suggest Node 22 features

**Always check `DEPENDENCIES.md` before suggesting changes!**

---

## 🚫 Critical Constraints (Module System)
**The backend uses TypeScript compiled to CommonJS.**

### How It Works:
- ✅ **Write TypeScript** with `import/export` syntax (modern, readable)
- ✅ **TypeScript compiles** to CommonJS automatically
- ✅ **tsconfig.json MUST have:** `"module": "commonjs"`
- ❌ **NEVER change** `"module"` to `"esnext"`, `"es2020"`, or `"es2022"`!

### Example:
```typescript
// ✅ Source code (TypeScript) - functions/src/index.ts
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

export const myFunction = functions.https.onCall(async () => {
  // Your code
});

// ✅ Compiled output (auto-generated) - lib/index.js
const admin = require('firebase-admin');
const functions = require('firebase-functions');

exports.myFunction = functions.https.onCall(async () => {
  // Your code
});
```

### Why CommonJS?
**Firebase Functions Gen 1 only supports CommonJS.** TypeScript handles the conversion automatically via `tsconfig.json`.

### Critical tsconfig.json Setting:
```json
{
  "compilerOptions": {
    "module": "commonjs"  // ⚠️ DO NOT CHANGE!
  }
}
```

## 🔥 Firebase & Firestore Best Practices
1. **Initialization:** NEVER initialize `admin` or `config` at the module level. Always inside the function scope.
2. **Field Deletion:** NEVER use `undefined`. Use `admin.firestore.FieldValue.delete()`.
3. **Timestamps:**
   - In code: `admin.firestore.FieldValue.serverTimestamp()`.
   - **Emulator Workaround:** Check `functions/src/interfaces/triggers/user-triggers.ts` for `new Date().toISOString()` usage before deploying.
4. **Partial Updates with merge:true:**
   - **DON'T send empty strings** if you want to preserve existing values!
   - `{ merge: true }` only preserves fields you DON'T send.
   - Sending `field: ''` or `field: 0` WILL update the field to that value.
   
**Example:**
```typescript
// ❌ WRONG - Will delete accessToken!
await tokenRepo.save(userId, {
  syncStatus: 'IN_PROGRESS',
  accessToken: '',  // ← This UPDATES to empty string!
  expiresAt: 0      // ← This UPDATES to 0!
});

// ✅ CORRECT - Omit fields you want to preserve
await tokenRepo.save(userId, {
  syncStatus: 'IN_PROGRESS'
  // accessToken & expiresAt will remain unchanged
});
```

## 💉 Dependency Injection (DI)
When adding a new function:
1. Create Use Case in `application/use-cases/`.
2. Register in `interfaces/dependencies.ts`.
3. Use `createDependencies()` in the HTTP trigger.
4. Export in `functions/src/index.ts`.

## 🛡️ Error Handling & Logging
- **Logging:** Use `functions.logger.info()` / `functions.logger.error()`. NEVER use `console.log`.
- **Try/Catch:** Always wrap Use Case execution.
```typescript
try {
  await operation();
} catch (error) {
  functions.logger.error('❌ Failed:', error);
  throw new functions.https.HttpsError('internal', error.message);
}
```

---

## 🔧 Common Tasks

### Adding a New Function

Follow these 4 steps:

#### 1. Create Use Case (if needed)
```typescript
// application/use-cases/xxx/NewFeatureUseCase.ts
export class NewFeatureUseCase {
  constructor(
    private repo: XxxRepository,
    private service: XxxService
  ) {}
  
  async execute(...params): Promise<Result> {
    // 1. Validate input
    // 2. Get data from repositories
    // 3. Apply business logic (domain services)
    // 4. Save results
    // 5. Return result
  }
}
```

#### 2. Add to DI Container
```typescript
// interfaces/dependencies.ts
import { NewFeatureUseCase } from '../application/use-cases/xxx/NewFeatureUseCase';

export function createDependencies(): Dependencies {
  // ... existing code ...
  
  const newFeatureUseCase = new NewFeatureUseCase(repo, service);
  
  return {
    // ... existing dependencies ...
    newFeatureUseCase
  };
}
```

#### 3. Create Entry Point
```typescript
// interfaces/http/xxx-functions.ts
import * as functions from 'firebase-functions';
import { createDependencies } from '../dependencies';

export const newFeatureFn = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Auth required');
  }
  
  const deps = createDependencies();
  const result = await deps.newFeatureUseCase.execute(data);
  
  return { success: true, result };
});
```

#### 4. Export in index.ts
```typescript
// index.ts
export { newFeatureFn as newFeature } from './interfaces/http/xxx-functions';
```

---

### Fixing a Bug

Follow this systematic approach:

#### 1. Check Documentation First
- Read `DEVELOPMENT_NOTES.md` - Maybe it's already documented
- Check `ARCHITECTURE.md` - Understand the component structure
- Review `DEPENDENCIES.md` - Could be a version issue

#### 2. Add Logging
```typescript
functions.logger.info('🔍 Debug: Starting operation', { userId, data });
functions.logger.info('🔍 Debug: Retrieved data', { result });
```

#### 3. Fix Root Cause
- Don't just fix symptoms
- Understand WHY it happened
- Fix the underlying issue

#### 4. Document the Fix
Add to `DEVELOPMENT_NOTES.md`:
```markdown
### Bug #X: [Brief description]

**Symptoms:**
- [What users saw]

**Root Cause:**
- [Why it happened]

**Solution:**
- [How you fixed it]

**Files:**
- `path/to/file.ts:lineNumber`
```

#### 5. Update CHANGELOG.md
```markdown
### [3.0.2] - 2024-12-XX

#### Fixed
- Fixed [bug description] in [component]
```

---

## 🐛 Debugging Tips

### Function not loading?

Check for module-level function calls (causes timeout):

```bash
# In functions/ directory:
grep -r "functions.config()" src/
grep -r "admin.firestore()" src/ | grep -v "function\|class"
```

**Fix:** Move these calls inside `createDependencies()` or inside the function itself.

---

### Firestore error "Cannot use undefined"?

Check for undefined values:

```bash
grep -r ": undefined" src/
```

**Fix:** Use `admin.firestore.FieldValue.delete()` instead.

---

### Timestamp issues (Emulator vs Production)?

Check for emulator workarounds:

```bash
grep -r "new Date().toISOString()" src/
grep -r "Workaround" src/
```

**Fix Before Deployment:**
- Replace `new Date().toISOString()` with `admin.firestore.FieldValue.serverTimestamp()`
- Remove "Workaround for emulator" comments

---

### Infinite Loop in Triggers?

Check for triggers updating themselves:

```bash
# Look for onWrite/onUpdate triggers
grep -r "onWrite\|onUpdate" src/interfaces/triggers/
```

**Fix:** Add a `_systemUpdate` flag:
```typescript
// In the trigger:
if (afterData?._systemUpdate) {
  return null; // Skip system updates
}

// When updating:
await update({ 
  field: value,
  _systemUpdate: true 
});
```

---

### Rate Limit errors from Google APIs?

Check sync logic:

```typescript
// Look for force=true in bulk operations
// Should use force=false to enable hash-based idempotency
```

**Fix:** Use hash checking to skip unchanged data.

---

## 🚀 Pre-Deployment Checklist

Before deploying to production, verify:

### Build:
- [ ] `cd functions && npm run build` - succeeds without errors
- [ ] No TypeScript errors
- [ ] No linter warnings

### Code Review:
- [ ] Search for emulator workarounds: `grep -r "Workaround" src/`
- [ ] Replace `new Date().toISOString()` with `serverTimestamp()`
- [ ] Remove debug logging (or make it conditional)
- [ ] Check for `console.log` (should be `functions.logger`)

### Configuration:
- [ ] Verify Firebase config: `firebase functions:config:get`
- [ ] Check required environment variables exist
- [ ] Review firestore.rules and firestore.indexes.json

### Documentation:
- [ ] Update `CHANGELOG.md` with changes
- [ ] Update `PROJECT_STATUS.md` if needed
- [ ] Add any new gotchas to `DEVELOPMENT_NOTES.md`

### Deployment:
```bash
# Deploy specific function (recommended for testing):
firebase deploy --only functions:functionName

# Deploy all functions (use with caution):
firebase deploy --only functions
```

### Post-Deployment:
- [ ] Check Firebase Console logs for errors
- [ ] Verify all functions deployed successfully
- [ ] Run smoke tests on critical functions
- [ ] Monitor for 10-15 minutes

---

**Last Updated:** December 2024