# Illyrian Cycling Monorepo

This repository now contains two services in one Render monorepo:

- `frontend/` – static marketing site assets (`index.html`, `styles.css`, `script.js`, `images/`, `video/`)
- `backend/` – Node.js/Express API service that sends form submissions through Resend

## Local development

### Backend

```bash
cd backend
npm install
cp .env.example .env
# update .env with your Resend API key and admin email
npm start
```

The backend serves the frontend statically and exposes the contact endpoint at `/api/contact`.

If you deploy the frontend and backend as separate Render services, set the form's `data-api-url` attribute to the backend service URL, for example:

```html
<form class="contact-form" data-api-url="https://your-backend.onrender.com/api/contact" method="POST">
```

### Frontend

For local testing, open `frontend/index.html` directly in a browser or use the backend server at `http://localhost:3000`.

## Render deployment

Render can deploy both services from this same repository using `render.yaml`.

### Backend service

- Type: `Web Service`
- Root directory: `backend`
- Environment: `Node`
- Build command: `npm install`
- Start command: `npm start`
- Environment variables:
  - `RESEND_API_KEY`
  - `ADMIN_EMAIL`
  - `FROM_EMAIL`
  - `SITE_NAME`

### Frontend service

- Type: `Static Site`
- Root directory: `frontend`
- Publish path: `.`

### Using `render.yaml`

Render will use the `render.yaml` configuration at the repository root to create both services automatically.

If you prefer the Render dashboard, add the same service definitions manually using the paths above.
