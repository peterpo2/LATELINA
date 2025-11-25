# Docker Guide for AIPharm+

AIPharm+ is a digital-pharmacy demo that blends a React storefront, .NET 8 Web API, SQL Server database, and an OpenAI-powered
assistant. The Docker setup lets you experience every feature—including the seeded catalog, AI chat widget, and admin dashboard—
without installing the individual runtimes.

This is a beginner-friendly walkthrough for running the entire project with Docker Compose.  You do not need Visual Studio,
Node.js, or SQL Server when using these steps.

---

## 1. Requirements

1. [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
2. [Git](https://git-scm.com/downloads) to copy the repository.
3. An OpenAI API key with billing enabled (the chat bot will not work without credit on your OpenAI account).
4. A strong SQL Server password that you will use for the demo database.

Optional: update the email settings if you want the app to send real emails.  The defaults point to a sample Gmail inbox.

---

## 2. Prepare the project

1. Open a terminal and clone the repository:
   ```bash
   git clone https://github.com/your-username/AIPharm.git
   cd AIPharm
   ```
2. Open `docker-compose.yml` and replace every `Xyzzy2005!` value with the SQL Server password you chose.
3. Create a file named `.env` in the same folder and add your OpenAI key:
   ```bash
   echo OpenAI__ApiKey=your-openai-api-key > .env
   ```
   - If you are on Windows PowerShell use: `Set-Content -Path .env -Value 'OpenAI__ApiKey=your-openai-api-key'`
4. (Optional) Edit `AIPharm.Backend/AIPharm.Web/appsettings.json` and replace the email address, password, and SMTP host with
your own values if you need working email.

You only need to do these edits once.

---

## 3. Start the containers

```bash
docker-compose up --build
```

- The first run downloads the base images, so give it a few minutes.
- When you see `✅ Database migrated and seeded.` the backend and database are ready.

### Access the services
| Service | URL |
| --- | --- |
| Storefront | http://localhost:3000 |
| Swagger API explorer | http://localhost:5000/swagger |
| SQL Server | localhost, port 1433 |

Use the password you chose earlier when connecting to the database.

---

## 4. Stop, start, and clean up later

| Action | Command |
| --- | --- |
| Stop everything | Press `Ctrl + C` in the terminal that is running Docker Compose |
| Restart after making code changes | `docker-compose up --build` |
| Run in the background | `docker-compose up -d` |
| View logs from one service | `docker-compose logs backend` (replace `backend` with `frontend` or `database`) |
| Shut down and delete the database volume | `docker-compose down -v` |

If you change the SQL password or OpenAI key rerun `docker-compose up --build` to reload the configuration.

---

## 5. Sign in with the sample users

| Role | Email | Password |
| --- | --- | --- |
| Administrator | aipharmproject@gmail.com | Admin123! |
| Customer | maria.ivanova@example.com | Customer123! |
| Customer | georgi.petrov@example.com | Customer456! |

Change the administrator password if you plan to show the project to others.

---

## 6. Troubleshooting

| Problem | What to try |
| --- | --- |
| Docker says a port is in use | Close other apps that listen on ports 3000, 5000, or 1433. Then rerun `docker-compose up --build`. |
| The backend container restarts repeatedly | Ensure the SQL password in `docker-compose.yml` matches the one in `ConnectionStrings__DefaultConnection`. |
| AI chat responses fail | Confirm your OpenAI account has credit and the `.env` file contains the correct API key. Restart the backend container after editing the key. |
| Emails are not delivered | Update the `Email` section in `appsettings.json` with your own SMTP settings and app password. |

If you get stuck, run `docker-compose down -v` to reset the environment and start again.

---

You are now ready to explore the project with Docker.  Once you feel comfortable you can move on to the more detailed
`SETUP-GUIDE.md` for manual development workflows.
