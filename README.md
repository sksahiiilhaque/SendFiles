# 🚀 SendFiles — Modern, Secure & Low-Cost File Transfer

**SendFiles** is a modern, high-performance, responsive file transfer web application inspired by Send Anywhere. It allows seamless, fast transfers of files up to **5 GB** between Android phones, iPhones, Windows PCs, Macs, and tablets using temporary 6-digit transfer codes, shareable links, and QR codes.

---

## 🌟 Key Features

- **5 GB File Uploads**: Powered by chunked multipart uploads with retry and pause/resume support.
- **Direct-to-Storage Architecture**: Files upload directly from the browser to Cloudflare R2 (or local disk in development), bypassing Node.js server bandwidth bottlenecks.
- **Temporary 6-Digit Transfer Codes**: Quick numeric codes (e.g., `834 912`) for effortless cross-device sharing.
- **Mobile QR Code Scanning**: Point any iPhone or Android camera at the screen to immediately open and download files.
- **Direct Share Links**: One-click copyable URLs that deep-link directly into the file download interface.
- **Real-Time Transfer Metrics**: Live upload progress bar, transfer speed (MB/s), uploaded/total size, and dynamic ETA calculation.
- **Sender Management**: Sender receives a cryptographic token to pause, resume, cancel, or permanently revoke transfers at any time.
- **Automated 24-Hour Expiration & Cleanup**: Background cron periodically wipes expired files and aborts incomplete multipart uploads.
- **Dual Storage Modes**: Zero-config Local File System adapter for local development, and Cloudflare R2 S3-compatible adapter for production.
- **Zero Sign-Up & Privacy First**: No accounts, no email required, no tracking cookies. Files are permanently wiped upon expiration.
- **Brute-Force Protection**: Strict rate limiting on transfer code lookups to prevent code guessing.
- **Light & Dark Themes**: Sleek glassmorphism, curated HSL color palette, accessible contrast, and persistent theme toggle.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Language** | JavaScript (ES Modules, JSX) | Pure JavaScript across frontend and backend (No TypeScript) |
| **Frontend** | React 19 + Vite | Fast modern UI, component modularity, instant HMR |
| **Styling** | Modern Vanilla CSS & Design Tokens | Glassmorphism, smooth animations, light/dark themes, responsive |
| **Backend** | Node.js (v24) + Express.js | API coordination, multipart session management, signed URL generation |
| **Database** | SQLite (`node:sqlite` DatabaseSync) | Lightweight, persistent, zero-dependency embedded database |
| **Storage (Dev)** | Local Storage Adapter | Simulates S3 multipart chunking locally without cloud credentials |
| **Storage (Prod)**| Cloudflare R2 | S3-compatible private bucket with **$0 egress bandwidth fees** |
| **Icons & QR** | Lucide React + `qrcode` | Clean iconography and instant client-side QR generation |

---

## 📂 Project Architecture

```
d:/SendFiles/
├── client/                          # React + Vite Frontend
│   ├── public/                      # Static assets & SVG favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Logo, navigation links, light/dark toggle
│   │   │   ├── Hero.jsx             # Headline, CTAs, animated device beam graphic
│   │   │   ├── UploadArea.jsx       # Drag & drop, multi-file queue, 5GB validator
│   │   │   ├── UploadProgress.jsx   # Live progress bar, speed, ETA, pause/cancel
│   │   │   ├── TransferSuccess.jsx  # 6-digit code, share link, QR trigger, revoke
│   │   │   ├── ReceiveFiles.jsx     # Code input, metadata, file list, Download All
│   │   │   ├── HowItWorks.jsx       # 4-step illustrated guide
│   │   │   ├── Footer.jsx           # Privacy policies, terms, copyright
│   │   │   ├── QrCodeModal.jsx      # Canvas QR code generator modal
│   │   │   └── Toast.jsx            # Micro-interaction notifications
│   │   ├── context/
│   │   │   └── ThemeContext.jsx     # Dark/light theme provider & local storage sync
│   │   ├── utils/
│   │   │   ├── api.js               # Backend API client
│   │   │   ├── formatters.js        # Byte sizes, speeds, countdowns, codes
│   │   │   └── multipartUploader.js # Chunking engine, pause/resume, retries
│   │   ├── App.jsx                  # Main application controller & routing
│   │   ├── index.css                # Custom CSS design system tokens
│   │   └── main.jsx                 # React root
│   ├── package.json
│   └── vite.config.js               # Vite config with /api reverse proxy
├── server/                          # Node.js + Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── index.js             # Environment configuration
│   │   │   └── database.js          # SQLite connection and schema
│   │   ├── controllers/
│   │   │   └── transferController.js
│   │   ├── middleware/
│   │   │   ├── errorHandler.js      # Safe error handler
│   │   │   ├── rateLimiter.js       # Code brute-force and request rate limiter
│   │   │   └── validator.js         # Input validation (size, codes, tokens)
│   │   ├── routes/
│   │   │   ├── transferRoutes.js    # Transfer lifecycle endpoints
│   │   │   └── localUploadRoutes.js # Local storage chunk streaming endpoints
│   │   ├── services/
│   │   │   ├── codeGenerator.js     # Collision-free 6-digit code generator
│   │   │   ├── cleanupService.js    # Background cron for expired files & aborts
│   │   │   ├── transferService.js   # Transfer domain business logic
│   │   │   └── storage/
│   │   │       ├── storageInterface.js # Storage factory
│   │   │       ├── localStorageService.js # Local disk multipart simulator
│   │   │       └── r2StorageService.js    # Cloudflare R2 presigned URL service
│   │   ├── utils/
│   │   │   ├── cryptoUtils.js       # Cryptographic hashes, tokens, sanitizers
│   │   │   └── logger.js            # Structured, secret-redacting logger
│   │   ├── app.js                   # Express app configuration
│   │   └── server.js                # Server entrypoint with background scheduler
│   ├── tests/
│   │   └── e2e-test.js              # Comprehensive end-to-end integration test
│   ├── .env.example
│   └── package.json
├── package.json                     # Root orchestrator scripts
└── README.md
```

---

## ⚡ Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: v20+ or v24+ (Node v24 includes built-in `node:sqlite`)
- **npm**: v10+

### 2. Install Dependencies
Run from the project root:
```bash
npm run install:all
```
*(This installs root, server, and client dependencies).*

### 3. Start Development Servers
```bash
npm run dev
```
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:4000`
- **Health Check**: `http://localhost:4000/api/health`

By default, SendFiles runs with `STORAGE_PROVIDER=local`. You can test uploading multiple gigabyte files, downloading them, entering codes, generating QR codes, and revoking transfers immediately with **zero external cloud accounts required**!

### 4. Run Automated End-to-End Tests
To test the complete multipart upload, code generation, checksum verification, download, and cleanup pipeline:
```bash
npm run test:e2e
```

---

## ⚙️ Environment Variables

Copy `server/.env.example` to `server/.env`:

```env
# Server Port & URL
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Storage Provider: 'local' or 'r2'
STORAGE_PROVIDER=local

# Local storage paths (used when STORAGE_PROVIDER=local)
LOCAL_STORAGE_DIR=./data/storage
DATABASE_PATH=./data/sendfiles.db

# Cloudflare R2 Credentials (used when STORAGE_PROVIDER=r2)
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=sendfiles-bucket
R2_CUSTOM_DOMAIN=

# Transfer Configurations
MAX_FILE_SIZE_BYTES=5368709120       # 5 GB in bytes
TRANSFER_EXPIRATION_HOURS=24          # Default expiration (24 hours)
MULTIPART_CHUNK_SIZE_BYTES=10485760   # 10 MB chunk size for parallel uploads

# Security & Rate Limiting
RATE_LIMIT_CODE_MAX=20                # Max code guesses per 15 minutes per IP
RATE_LIMIT_CODE_WINDOW_MINUTES=15
SECURITY_SECRET=your-random-cryptographic-salt
```

---

## ☁️ Cloudflare R2 Production Setup

Cloudflare R2 provides an S3-compatible API with **$0 egress fees**, making it the most cost-effective solution for large file transfers.

### 1. Create a Bucket in Cloudflare
1. Log in to the Cloudflare Dashboard.
2. Go to **R2** > **Create bucket**. Name it `sendfiles-bucket`.
3. Keep the bucket **Private** (never enable public listing).

### 2. Configure CORS on the R2 Bucket
In the Cloudflare R2 dashboard, select your bucket > **Settings** > **CORS Policy** > **Add Rule**:
```json
[
  {
    "AllowedOrigins": [
      "https://your-sendfiles-domain.com",
      "http://localhost:5173"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag",
      "Content-Disposition",
      "Content-Length"
    ],
    "MaxAgeSeconds": 3600
  }
]
```
*(Exposing `ETag` is essential for multipart uploads so the browser can read chunk hashes).*

### 3. Generate R2 API Tokens
1. In Cloudflare R2, click **Manage R2 API Tokens** > **Create API Token**.
2. Permissions: **Object Read & Write**.
3. Copy:
   - Account ID
   - Access Key ID
   - Secret Access Key
4. Add them to your production `.env` and set `STORAGE_PROVIDER=r2`.

---

## 🌐 100% Free Forever Deployment Guide

You can run SendFiles **completely free with $0.00/month recurring cost** using any of the following architectures:

### 🏆 Option 1: 1-Click All-in-One Deployment (Render Free Web Service) — $0/mo
The Express server automatically serves the built React frontend (`client/dist`), meaning you can host the **entire full-stack application as a single free service**:

1. Push your SendFiles code to GitHub.
2. Sign up at [Render.com](https://render.com) (100% free account, no credit card required).
3. Click **New** > **Web Service** and connect your GitHub repo.
4. Render will auto-detect Node.js or `render.yaml`:
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
5. **Keep-Alive (Prevent Sleep)**: Render free web services spin down after 15 minutes of inactivity. To keep your app awake 24/7 for free, add this environment variable in the Render Dashboard:
   - `SELF_PING_URL`: `https://your-service-name.onrender.com/api/health`
   *(SendFiles will automatically ping itself every 14 minutes to stay awake 24/7!)*

---

### ⚡ Option 2: High-Performance Split Setup ($0/mo, 0ms Cold Starts)
For maximum speed, zero cold starts, and global CDN edge distribution:

| Component | Free Host | Free Quota | Monthly Cost |
|---|---|---|---|
| **Frontend** | [Cloudflare Pages](https://pages.cloudflare.com) | Unlimited requests, unlimited bandwidth | **$0.00** |
| **Storage** | [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) or [Backblaze B2](https://www.backblaze.com/cloud-storage) | 10 GB storage free, **$0 egress fees** | **$0.00** |
| **Backend API** | [Render](https://render.com) or [Koyeb](https://www.koyeb.com) | Free web service with self-ping keep-alive | **$0.00** |
| **Database** | Embedded SQLite (`node:sqlite`) | Persistent local disk or Free Turso LibSQL | **$0.00** |

#### Deploying Frontend to Cloudflare Pages:
1. In Cloudflare Dashboard, go to **Workers & Pages** > **Create application** > **Pages**.
2. Connect your GitHub repository.
3. Build Settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm --prefix client run build`
   - **Build output directory**: `client/dist`
4. Set environment variable: `VITE_API_BASE=https://your-backend.onrender.com/api`

---

### 📦 Option 3: Free S3 Storage Alternatives (No Credit Card Required)

- **Cloudflare R2**: 10 GB storage free forever, 10,000,000 Class B read operations free/month, $0 egress fees.
- **Backblaze B2**: 10 GB free forever, S3-compatible, **no credit card required** to create an account.
  To use Backblaze B2, set in your `.env`:
  ```env
  STORAGE_PROVIDER=b2
  R2_ACCESS_KEY_ID=your_b2_key_id
  R2_SECRET_ACCESS_KEY=your_b2_application_key
  R2_BUCKET_NAME=your_b2_bucket_name
  S3_ENDPOINT=https://s3.us-west-004.backblazeb2.com
  S3_REGION=us-west-004
  ```

---

### 🐳 Option 4: Free Docker Containers (Koyeb, Fly.io, Hugging Face)
Use the included multi-stage `Dockerfile` to deploy a containerized instance on:
- **Koyeb Free Nano**: Deploy via GitHub with Dockerfile.
- **Fly.io**: Run `fly launch` (uses `fly.toml` with 1 GB persistent volume for free).
- **Hugging Face Spaces**: Create a free Docker Space and push your repo.

---

## 🔒 Security & Privacy Implementation

1. **Brute-Force Code Protection**: Rate limiter restricts 6-digit code lookup attempts to 20 per 15-minute window per IP.
2. **Sender Authentication Token**: Upon transfer creation, the sender receives a high-entropy secret token (`x-sender-token`). Only the sender can pause, finalize, or revoke the transfer.
3. **No Database Secrets**: Sender tokens are stored only as HMAC-SHA256 hashes using a private server salt.
4. **Short-Lived Signed URLs**: Presigned PUT and GET URLs expire after 1 hour. Private storage keys are never exposed to receivers.
5. **Filename Sanitization**: Strip directory traversal characters (`../`, `\`), null bytes, control characters, and dangerous symbols.
6. **Automated Background Purge**: Expired records and files are deleted automatically by `cleanupService` every 15 minutes.
7. **No Plaintext File Storage**: Database stores only metadata (sizes, sanitized names, expiration timestamps).
8. **No Persistent Tracking**: No user accounts, cookies, or profiling.

---

## 🧪 Testing Checklist

- [x] Single-file upload
- [x] Multi-file batch upload (up to 50 files)
- [x] Chunked multipart upload with ETags
- [x] Real-time speed calculation and ETA
- [x] Pause, resume, and cancel upload controls
- [x] 6-digit code lookup
- [x] Individual file downloads and "Download All"
- [x] Checksum validation (bit-for-bit SHA256 integrity verified)
- [x] Shareable URLs (`/?code=XXXXXX`)
- [x] QR Code generation and camera scanning
- [x] Sender revocation (immediate 410 Gone)
- [x] Invalid code rate limiting and error handling
- [x] Automated background cleanup scheduler
- [x] Light and dark theme toggle persistence
- [x] Mobile-first responsive layout (Android, iOS, PC, Mac)
