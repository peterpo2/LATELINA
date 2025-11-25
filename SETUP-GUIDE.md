# Manual Setup Guide for AIPharm+

AIPharm+ delivers a full digital-pharmacy experience: React + TypeScript storefront, .NET 8 Web API with AI-powered assistance,
seeded SQL Server data, and sample accounts for testing. Running it manually gives you insight into how each part works and how
they connect.

Use this guide if you prefer running the backend, frontend, and database yourself instead of using Docker.  Every step is listed
in the order you should complete it.

---

## 1. Install the required tools

| Tool | Why you need it |
| --- | --- |
| [Visual Studio 2022](https://visualstudio.microsoft.com/) **or** [VS Code](https://code.visualstudio.com/) | To open and build the .NET solution.  Install the **ASP.NET and web development** workload in Visual Studio. |
| [.NET 8 SDK](https://dotnet.microsoft.com/download) | Compiles and runs the backend Web API. |
| [Node.js 18+](https://nodejs.org/) | Builds and runs the React frontend. |
| [SQL Server](https://www.microsoft.com/sql-server/sql-server-downloads) (Developer, Express, or LocalDB) | Stores the demo data. |
| [Git](https://git-scm.com/downloads) | Copies the code from GitHub. |

You will also need:
- An OpenAI API key with billing enabled so the assistant can respond to questions.
- Email credentials (optional) if you want outgoing messages to work.

---

## 2. Clone the repository

Open a terminal and run:

```bash
git clone https://github.com/your-username/AIPharm.git
cd AIPharm
```

---

## 3. Configure secrets

### 3.1 Database connection
Edit `AIPharm.Backend/AIPharm.Web/appsettings.Development.json` and update the `DefaultConnection` string so it points to your SQL
Server instance.  Replace:
- `Server=aipharm-database,1433` with the server name or `localhost\\SQLEXPRESS`.
- `Password=Xyzzy2005!` with the password for your `sa` or SQL login.

### 3.2 OpenAI key
Choose one of the following:
- Add `OpenAI__ApiKey=your-openai-key` as an environment variable in your operating system, **or**
- Edit `AIPharm.Backend/AIPharm.Web/appsettings.json` and set the `OpenAI.ApiKey` value.

Make sure your OpenAI account has credit—free accounts cannot call the API.

### 3.3 Email (optional)
In the same `appsettings.json` file replace the values in the `Email` section with the SMTP server, username, and password from
your provider.  Gmail users must create an app password after enabling 2-Step Verification.  Set `UsePickupDirectory` to `true`
if you simply want `.eml` files saved locally for testing.

---

## 4. Prepare the database

1. Open a terminal inside `AIPharm.Backend`.
2. Restore packages and create the database:
   ```bash
   dotnet restore
   cd AIPharm.Web
   dotnet tool restore
   dotnet ef database update
   ```
   The migrations create the `AIPharm` database and populate it with sample data.

If you receive a login error double-check the connection string from step 3.1.

---

## 5. Run the backend

From `AIPharm.Backend/AIPharm.Web` execute:
```bash
dotnet run
```
The API listens on `https://localhost:7001` (HTTPS) and `http://localhost:5000` (HTTP).  Visit `https://localhost:7001/swagger`
to confirm the service is running.

Keep this terminal open while you work.  Press `Ctrl + C` to stop the backend.

---

## 6. Run the frontend

1. Open a new terminal and switch to the `src` folder.
2. Install dependencies and start the Vite dev server:
   ```bash
   npm install
   npm run dev
   ```
3. The console prints a local URL (usually http://localhost:5173).  Open it in your browser.

If the backend runs on a different port than 5000 update the `VITE_API_BASE_URL` value in `src/.env` or start the dev server with:
```bash
VITE_API_BASE_URL=https://localhost:7001/api npm run dev
```

---

## 7. Sign in and explore

Use the seeded accounts to log in:

| Role | Email | Password |
| --- | --- | --- |
| Administrator | aipharmproject@gmail.com | Admin123! |
| Customer | maria.ivanova@example.com | Customer123! |
| Customer | georgi.petrov@example.com | Customer456! |

Change the administrator password before using the site with real data.

---

## 8. Troubleshooting

| Issue | Suggested fix |
| --- | --- |
| `dotnet ef` command not found | Run `dotnet tool restore` inside `AIPharm.Backend`. |
| Database login failed | Check the server name, username, and password in `appsettings.Development.json`. |
| Swagger shows OpenAI errors | Ensure your OpenAI API key is correct and that your account has an active paid plan. |
| Frontend cannot reach the API | Confirm the backend terminal shows `Now listening on: http://localhost:5000`. Update `VITE_API_BASE_URL` if you changed the port. |
| Emails missing | Replace the sample Gmail credentials with your own provider settings. |

Once everything works you can begin modifying the code, adding products, or integrating new services.
