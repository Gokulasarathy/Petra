# PETRA – Azure Deployment Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                     Azure Cloud                      │
│                                                      │
│  ┌──────────────┐     ┌──────────────────────────┐  │
│  │  Azure App   │     │  Azure App Service        │  │
│  │  Service     │────▶│  (Backend - Flask)        │  │
│  │  (Frontend)  │     │  Python 3.11+             │  │
│  │  Static Web  │     └──────────┬───────────────┘  │
│  └──────────────┘                │                   │
│                                  │                   │
│  ┌──────────────┐     ┌─────────▼──────────────┐   │
│  │  Azure Blob  │     │  Azure SQL Database     │   │
│  │  Storage     │     │  (Replaces SQLite)      │   │
│  │  (Files)     │     └────────────────────────┘   │
│  └──────────────┘                                   │
└─────────────────────────────────────────────────────┘
```

---

## Step 1: Prepare Backend for Azure

### 1.1 Update `requirements.txt`
Add production dependencies:
```
gunicorn==23.0.0
pyodbc==5.2.0          # For Azure SQL
azure-storage-blob     # For Azure Blob Storage
```

### 1.2 Create `startup.txt`
```
gunicorn --bind=0.0.0.0 --timeout 600 run:app
```

### 1.3 Set Environment Variables in Azure
```bash
az webapp config appsettings set --name petra-api --resource-group petra-rg --settings \
  FLASK_ENV=production \
  SECRET_KEY=<generate-a-strong-key> \
  DATABASE_URL="mssql+pyodbc://<user>:<pass>@<server>.database.windows.net:1433/<db>?driver=ODBC+Driver+18+for+SQL+Server"
```

---

## Step 2: Deploy Backend to Azure App Service

```bash
# Login to Azure
az login

# Create resource group
az group create --name petra-rg --location eastus

# Create App Service plan
az appservice plan create --name petra-plan --resource-group petra-rg --sku B1 --is-linux

# Create web app
az webapp create --name petra-api --resource-group petra-rg \
  --plan petra-plan --runtime "PYTHON:3.11"

# Deploy from local
cd backend
az webapp up --name petra-api --resource-group petra-rg --runtime "PYTHON:3.11"
```

---

## Step 3: Deploy Frontend

### Option A: Azure Static Web Apps (Recommended)
```bash
cd frontend
npm run build

# Install SWA CLI
npm install -g @azure/static-web-apps-cli

# Deploy
swa deploy ./dist --env production
```

### Option B: Azure App Service
```bash
# Build frontend
cd frontend
npm run build

# Deploy dist folder to a separate Azure Web App
az webapp create --name petra-ui --resource-group petra-rg \
  --plan petra-plan --runtime "NODE:20-lts"
```

---

## Step 4: Azure SQL Migration

Replace SQLite with Azure SQL:

1. Create Azure SQL Database in the portal
2. Update `DATABASE_URL` environment variable
3. Install `pyodbc` driver
4. Flask-SQLAlchemy handles the rest — same models, just a different connection string

---

## Step 5: Azure Blob Storage Migration

Update `file_handler.py` to use Azure Blob Storage:

```python
from azure.storage.blob import BlobServiceClient

BLOB_CONNECTION_STRING = os.environ.get('AZURE_STORAGE_CONNECTION_STRING')
BLOB_CONTAINER = 'petition-files'

def save_file_to_blob(file):
    blob_service = BlobServiceClient.from_connection_string(BLOB_CONNECTION_STRING)
    container = blob_service.get_container_client(BLOB_CONTAINER)
    blob_name = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
    container.upload_blob(blob_name, file.read())
    return blob_name
```

---

## Step 6: CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy PETRA
on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install -r backend/requirements.txt
      - uses: azure/webapps-deploy@v2
        with:
          app-name: petra-api
          package: ./backend

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: cd frontend && npm ci && npm run build
      - uses: Azure/static-web-apps-deploy@v1
        with:
          app_location: frontend/dist
```
