# MailCraft AI

A full-stack AI writing assistant: generate professional emails, formal/informal letters, rewrite text, fix grammar, and shift tone — with real-time streamed responses.

**Stack:** React (Vite) + Tailwind CSS · Node.js + Express · Anthropic Claude API · Docker · AWS App Runner

---

## 1. Project structure

```
mailcraft-ai/
├── Dockerfile                 # Multi-stage build: builds React, then bundles it into the Express image
├── .dockerignore
├── client/                    # React + Vite + Tailwind frontend
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── constants.js
│       ├── lib/api.js         # Streaming fetch helper
│       └── components/
│           ├── Header.jsx
│           ├── ModeTabs.jsx
│           ├── ToneSelector.jsx
│           ├── InputPanel.jsx
│           └── OutputPanel.jsx
└── server/                    # Express backend
    ├── package.json
    ├── .env.example
    └── src/
        ├── index.js            # App entrypoint, serves API + built React app
        ├── routes/generate.js  # POST /api/generate
        └── services/
            ├── promptBuilder.js  # Turns UI feature + tone into a prompt
            └── llm.js            # Streams from the Anthropic API
```

**How it fits together:** in production, there is **one container and one URL**. Express serves the built React static files *and* the `/api/generate` endpoint from the same origin — no CORS, no separate frontend host needed. In development, Vite runs on port 5173 and proxies `/api` calls to Express on port 8080.

---

## 2. Prerequisites

- Node.js 20+ and npm
- Docker Desktop (for containerizing)
- An AWS account with billing set up
- An Anthropic API key from https://console.anthropic.com/ (or swap in OpenAI — see step 8)
- AWS CLI installed and configured (`aws configure`)

---

## 3. Local setup — backend

```bash
cd server
npm install
cp .env.example .env
```

Open `server/.env` and paste in your key:

```
ANTHROPIC_API_KEY=sk-ant-your-real-key-here
```

Run the backend:

```bash
npm run dev
```

You should see `MailCraft AI server listening on port 8080`. Test it:

```bash
curl http://localhost:8080/api/health
# {"status":"ok"}
```

---

## 4. Local setup — frontend

In a **second terminal**:

```bash
cd client
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). The Vite dev server proxies `/api/*` requests to your Express server on port 8080, so both must be running.

Try each mode (Email, Letter, Rewrite, Grammar, Tone) and confirm the draft streams into the right panel, Copy and Regenerate both work.

---

## 5. How generation works (so you can explain it in your report)

1. The frontend sends a `POST /api/generate` with `{ mode, tone, letterType, recipient, inputText }`.
2. `promptBuilder.js` turns that into a `system` + `user` prompt tailored to the selected feature (e.g. the grammar mode's system prompt instructs the model to fix errors only, without changing style).
3. `llm.js` calls the Anthropic Messages API with `stream: true`, reads the server-sent-event stream from Anthropic, and re-writes each text fragment directly onto the Express response as it arrives.
4. The frontend reads `response.body` with a `ReadableStream` reader and appends each chunk to state, so the draft appears progressively — no waiting for the full response.
5. API keys never reach the browser: only the Express server holds `ANTHROPIC_API_KEY`, read from an environment variable.

---

## 6. Build and run with Docker (test production mode locally)

From the **project root** (where the `Dockerfile` lives):

```bash
docker build -t mailcraft-ai .
docker run --rm -p 8080:8080 \
  -e ANTHROPIC_API_KEY=sk-ant-your-real-key-here \
  -e NODE_ENV=production \
  mailcraft-ai
```

Visit `http://localhost:8080` — this is the exact single-container setup that will run on AWS.

**What the Dockerfile does:**
- Stage 1: installs client deps and runs `vite build`, producing `client/dist`
- Stage 2: installs only production server deps
- Stage 3: copies the server + `client/dist` (renamed to `server/public`) into a small final `node:20-alpine` image, runs as the non-root `node` user, and listens on port 8080

---

## 7. Push the image to Amazon ECR

```bash
# Set these once
export AWS_REGION=us-east-1
export ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Create a repository (one-time)
aws ecr create-repository --repository-name mailcraft-ai --region $AWS_REGION

# Authenticate Docker to ECR
aws ecr get-login-password --region $AWS_REGION \
  | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Tag and push
docker tag mailcraft-ai:latest $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/mailcraft-ai:latest
docker push $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/mailcraft-ai:latest
```

---

## 8. Deploy on AWS App Runner

### Option A — AWS Console (recommended for a first deployment)

1. Go to **App Runner** → **Create service**.
2. Source: **Container registry** → **Amazon ECR** → select the `mailcraft-ai` repository and `latest` tag. Choose "Automatic" deployment if you want new pushes to redeploy automatically.
3. **Deployment settings**: create/select an access role that lets App Runner pull from ECR.
4. **Service settings**:
   - Port: `8080`
   - CPU/memory: 1 vCPU / 2 GB is plenty for this app
5. **Environment variables** (this is where your secret key goes — never bake it into the image):
   - `ANTHROPIC_API_KEY` = your key (mark as a secret if prompted, or better, reference an AWS Secrets Manager secret)
   - `NODE_ENV` = `production`
   - `LLM_MODEL` = `claude-sonnet-4-5-20250929` (optional override)
6. **Health check**: path `/api/health`, protocol HTTP.
7. Click **Create & deploy**. App Runner builds nothing itself (you already pushed the image) — it just pulls and runs it.
8. When status is "Running", copy the **Default domain** — that's your public HTTPS URL. This is what you paste into your Project Concept Note / Report.

### Option B — AWS CLI

```bash
aws apprunner create-service \
  --service-name mailcraft-ai \
  --source-configuration '{
    "ImageRepository": {
      "ImageIdentifier": "'"$ACCOUNT_ID"'.dkr.ecr.'"$AWS_REGION"'.amazonaws.com/mailcraft-ai:latest",
      "ImageConfiguration": {
        "Port": "8080",
        "RuntimeEnvironmentVariables": {
          "NODE_ENV": "production",
          "LLM_MODEL": "claude-sonnet-4-5-20250929"
        },
        "RuntimeEnvironmentSecrets": {
          "ANTHROPIC_API_KEY": "arn:aws:secretsmanager:REGION:ACCOUNT_ID:secret:mailcraft/anthropic-key"
        }
      },
      "ImageRepositoryType": "ECR"
    },
    "AutoDeploymentsEnabled": true
  }' \
  --instance-configuration '{"Cpu": "1024", "Memory": "2048"}'
```

Storing the key in **AWS Secrets Manager** and referencing it via `RuntimeEnvironmentSecrets` (rather than a plain env var) is the more secure option and worth mentioning in your report's "security best practices" section.

### Redeploying after code changes

```bash
docker build -t mailcraft-ai .
docker tag mailcraft-ai:latest $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/mailcraft-ai:latest
docker push $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/mailcraft-ai:latest
```

If automatic deployments are enabled, App Runner redeploys within a minute or two. Otherwise, click **Deploy** in the console.

---

## 9. Cost awareness (per the assignment's guideline)

- App Runner's smallest configuration (1 vCPU / 2 GB) is low-cost but **not** in the AWS Free Tier's "always free" bucket — it bills per vCPU/memory-hour while running plus per request. Pause or delete the service when you're done demoing.
- ECR: first 500 MB/month of storage is free tier eligible for new accounts; this image is well under that.
- Set a **AWS Budget alert** (Billing → Budgets → Create budget) for a small threshold (e.g. $5) so you're notified before unexpected charges.
- The Anthropic API bills separately, per token — keep an eye on usage in the Anthropic console during testing.

---

## 10. Security checklist (matches the assignment's requirements)

- [x] API key only ever lives in `server/.env` locally or App Runner environment variables/secrets in production — never in frontend code.
- [x] `.env` is git-ignored (`.gitignore`) and excluded from the Docker build context (`.dockerignore`).
- [x] Backend runs as the non-root `node` user inside the container.
- [x] Basic rate limiting (`express-rate-limit`) on `/api/generate` to reduce abuse/cost risk.
- [x] Input length capped (4000 characters) both client- and server-side.

---

## 11. Mapping this project to your deliverables

- **Concept Note**: use the feature list in this README (Email / Letter / Rewrite / Grammar / Tone), the target user ("anyone who needs to write a clear email or letter quickly"), and "LLM model and API used" → Anthropic Claude, Messages API, streaming.
- **Live Application**: your App Runner default domain from step 8.
- **Project Report**: section 5 above ("How generation works") covers architecture and prompting strategy — expand with your own screenshots and the specific prompts you tested.

Good luck with the submission — and remember to double check the live URL still works right before you submit it.
