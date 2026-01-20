# HebBirthday - Hebrew Calendar Sync Platform (SaaS)

**HebBirthday** is a serverless, multi-tenant SaaS platform designed to solve a complex interoperability challenge: synchronizing Hebrew (Lunar) birthdays and anniversaries seamlessly with Google Calendar (Solar).

Built with a scalable architecture designed to **serve thousands of concurrent users**, the platform aims to make the Jewish calendar accessible to Jewish communities worldwide. It currently supports three languages (Hebrew, English, Spanish) with a flexible infrastructure designed for rapid expansion into additional languages.

## 🚀 Key Features

* **Complex Date Logic:** Accurate conversion between Hebrew and Gregorian dates, handling leap years and specific Jewish calendar rules (leveraging `hebcal`).
* **Global Accessibility (i18n):** Full internationalization support using `i18next`. Currently serving users in **English, Hebrew, and Spanish**, with a JSON-based structure for easily adding new locales.
* **Deep Google Integration:** Full OAuth 2.0 authentication flow and two-way integration with the Google Calendar API.
* **Multi-Tenancy:** Secure data isolation and user management via Firebase Authentication and Firestore Security Rules.
* **Smart Sync Engine:** Background jobs (Cloud Scheduler) ensure calendars remain updated indefinitely without user intervention.
* **Performance:** Implemented caching strategies and batch operations to minimize API calls and respect strict quota limits.

---

## 🛠 Architecture & Design Patterns

The project follows **Clean Architecture** principles to ensure separation of concerns, testability, and maintainability. The backend logic (`functions/src`) is strictly decoupled.

*(See full architectural details in [ARCHITECTURE.md](./ARCHITECTURE.md))*

### Directory Structure

```text
functions/src
├── application/       # Application Business Rules (Use Cases)
│   ├── use-cases/     # Specific actions (e.g., SyncBirthdayUseCase)
│   └── ...
├── domain/            # Enterprise Business Rules (Entities)
│   ├── services/      # Domain logic (e.g., ZodiacService, HebcalService)
│   └── entities/      # Type definitions and interfaces
├── infrastructure/    # Frameworks & Drivers (External World)
│   ├── database/      # Repository Implementations (Firestore connection)
│   ├── google/        # Google API Clients
│   └── tasks/         # Cloud Tasks management
└── interfaces/        # Interface Adapters
    └── http/          # HTTP Triggers and API Controllers
Key Architectural Decisions
Repository Pattern: All database interactions are abstracted via Repositories. The core business logic is agnostic to the underlying database (Firestore), allowing for easy mocking and testing.

Dependency Injection: Services and Repositories are injected into Use Cases, promoting loose coupling.

Serverless Scalability: The backend runs on Google Cloud Functions, allowing the system to scale down to zero when idle and auto-scale instantly to handle high-load sync operations.

Typed Implementation: Written entirely in TypeScript to ensure type safety and prevent runtime errors in critical calendar logic.

💻 Tech Stack
Frontend: React, Vite, Tailwind CSS (Mobile-First) - Hosted on Netlify.

Internationalization: i18next (EN, HE, ES support).

Backend: Node.js, TypeScript, Google Cloud Functions.

Database: Google Firestore (NoSQL).

Authentication: Firebase Auth & Google OAuth 2.0.

Infrastructure: GCP Cloud Scheduler, Cloud Tasks.

🔄 The Sync Workflow
Trigger: User initiates sync via UI or the system triggers a scheduled job.

Calculation: CalculateHebrewDataUseCase computes the next 10 years of Gregorian occurrences for the given Hebrew date.

Validation: The system checks for existing calendar events to prevent duplicates.

Execution: ManageCalendarUseCase leverages batch processing to write events to the user's Google Calendar via the GoogleCalendarClient.

Feedback: Real-time status updates are pushed to the frontend/logs.

📚 Documentation & Guides
User Guide: USER_GUIDE.md - How to use the application.

Deployment: DEPLOYMENT_GUIDE.md - CI/CD and deployment steps.

Dependencies: DEPENDENCIES.md - List of project libraries.

Analytics Policy: ANALYTICS_DATA_COLLECTION.md

📸 Deployment
The application utilizes a hybrid deployment strategy:

Frontend: Automatically deployed to Netlify (via netlify.toml).

Backend: Deployed to Google Cloud Functions via CI/CD pipelines.

Author
Chagai Yechiel - IT Operations & Automation Developer [LinkedIn](https://www.linkedin.com/in/chagai-yechiel/) | [Portfolio](https://hebbirthday.app/)