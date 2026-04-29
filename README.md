# PETRA – Cloud-Based Petition Management & Monitoring System

> An AI-powered petition management platform that classifies petitions using NLP, assigns priority based on severity, and provides real-time status tracking for administrators.

## 🚀 Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React (Vite), Tailwind CSS, Axios   |
| Backend    | Flask, Flask-CORS, SQLAlchemy       |
| Database   | SQLite (dev) → Azure SQL (prod)     |
| AI/NLP     | TextBlob, Rule-based Engine         |
| Cloud      | Azure App Service, Blob Storage     |

## 📁 Project Structure

```
petra/
├── frontend/    # React + Vite + Tailwind
├── backend/     # Flask REST API
└── docs/        # Deployment guides
```

## 🛠️ Quick Start

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
python run.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📡 API Endpoints

| Method | Endpoint                          | Description              |
|--------|-----------------------------------|--------------------------|
| POST   | `/api/petitions`                  | Create a petition        |
| GET    | `/api/petitions`                  | List all petitions       |
| GET    | `/api/petitions/<id>`             | Get petition details     |
| PUT    | `/api/petitions/<id>/status`      | Update petition status   |
| DELETE | `/api/petitions/<id>`             | Delete a petition        |
| GET    | `/api/dashboard/stats`            | Dashboard statistics     |

## 📄 License

MIT
