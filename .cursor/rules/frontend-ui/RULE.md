description: "Frontend rules for React/Vite application. Enforces ESM and functional components."

globs: ["src/**/*.ts", "src/**/*.tsx"]

---

\# Frontend (React) Rules

\## 🔴 CRITICAL: Frontend Versions

\*\*This frontend uses specific versions. DO NOT suggest code for other versions!\*\*

\- \*\*React:\*\* `^18.3.1` (React 18 - Functional Components, Hooks, Concurrent Features)

\- \*\*Vite:\*\* `^5.4.2` (NOT Webpack, NOT CRA)

\- \*\*firebase:\*\* `^12.4.0` (v9+ modular syntax)

\- \*\*@tanstack/react-query:\*\* `^5.90.5` (v5, NOT v4)

\- \*\*react-router-dom:\*\* `^7.9.4` (v7, NOT v6)

\- \*\*@hebcal/core:\*\* `^5.10.1`

\- \*\*TypeScript:\*\* `^5.5.3`

\### ⚠️ Common Mistakes to Avoid:

\- ❌ Don't suggest React 17 class components

\- ❌ Don't suggest firebase v8 syntax (`firebase.initializeApp()`)

\- ❌ Don't suggest react-query v4 syntax

\- ❌ Don't suggest react-router v6 syntax (`useHistory`, old routing)

\- ❌ Don't suggest Webpack config

\*\*Always check \`DEPENDENCIES.md\` before suggesting changes!\*\*

\---



\## ⚡ Module System (ESM)

\*\*The Frontend uses ESM (Vite).\*\*

\- ✅ ALWAYS use `import` and `export`.

\- This contrasts with the backend (CommonJS).



\## ⚛️ React Standards

\- Prefer \*\*Functional Components\*\*.

\- Use Hooks for state management.

\- Place logic in Custom Hooks or Services (following Clean Architecture where possible).



\## 🐛 Debugging

\- If "It doesn't work": Check Browser Console first.

\- Verify if the issue is local (Emulator) or Production.

