# Infrastructure Notes (v0.1.0)

## Frontend
- **Framework:** React 18 + TypeScript running on Vite.
- **Styling:** Tailwind CSS with custom gradients and motion for hero/footer components.
- **Caching:** No service worker or data caching layer is configured yet. All product and news reads go straight to the API.
- **Version banner:** The footer renders the release number from `src/config/appVersion.ts` so deployments remain traceable.

## Backend
- **Tech stack:** .NET 8 Web API, Entity Framework Core, SQL Server 2022 container.
- **Authentication:** JWT bearer tokens with seeded demo accounts.
- **AI integration:** OpenAI client configured through `OpenAI__ApiKey` in environment variables or `appsettings.json`.

## DevOps
- **Containers:** `docker-compose.yml` orchestrates `frontend`, `backend`, and `database` services for local parity.
- **CI/CD hooks:** Run `npm run build` for the frontend and `dotnet test` in the backend solution before deployment.
- **Versioning policy:** Semantic versioning starting at **0.1.0**. Increment the patch number for fixes, minor number for feature batches, and major for breaking changes.

Review [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for cloud-specific instructions.
