# ShopFlash

A simple e-commerce demo application with a FastAPI backend and a React frontend.

## Quick Overview

- Backend: FastAPI (Python + Uvicorn)
- Frontend: React (Create React App)
- Database: MySQL (schema provided in `SQL_Script.sql`)

## Highlights

- Product listing, categories, reviews, wishlist, orders, shipping, promotions, and payments
- JWT-based authentication and password hashing utilities
- OpenAPI documentation via FastAPI (`/docs`)
- Static product images served by the backend at `/images`

## Repo Layout

```
/ (project root)
├── README.md
├── LICENSE
├── SQL_Script.sql        # Database initialization script
├── backend/             # FastAPI backend
└── shopflash/           # React frontend
```

## Prerequisites

- Python 3.10+ (recommended)
- Node.js 16+ and npm
- MySQL server (or a cloud MySQL instance)

## Quick Start

### Backend

1. Change into the backend directory and create a virtual environment:

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Linux / macOS
# on Windows use: .\venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Configure environment variables

Create a `.env` file in `backend/` (example values):

```
DATABASE_URL=mysql+pymysql://user:password@host:3306/Ecommerce
SECRET_KEY=change-me-to-a-secure-value
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
DEBUG=True
```

4. Initialize the database (run the SQL script against your MySQL server):

```bash
# from project root
mysql -u root -p < SQL_Script.sql
```

5. Start the backend server:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API docs will be available at: `http://localhost:8000/docs`

### Frontend

1. Change into the frontend directory and install packages:

```bash
cd shopflash
npm install
```

2. Start the development server:

```bash
npm start
```

The frontend runs at `http://localhost:3000` and expects the backend at `http://localhost:8000` by default.

## Configuration notes

- The backend reads `DATABASE_URL` from the environment; the default fallback is `mysql+pymysql://root:password@localhost:3306/Ecommerce`.
- Set `SECRET_KEY` to a strong value in production to secure JWT tokens.
- Static images are served from the `backend/image` directory at the `/images` route.

## Where to look in the code

- Backend app entry: `backend/main.py`
- Database utilities: `backend/db.py` (uses `DATABASE_URL`)
- Auth utilities: `backend/auth.py` (JWT secrets and hashing)
- API routes: `backend/routes/`
- Frontend app: `shopflash/src/`

## Contributing

Contributions are welcome. Suggested workflow:

1. Fork the repo
2. Create a feature branch
3. Add tests (if applicable) and make changes
4. Open a pull request

## License

This project is licensed under the terms in the `LICENSE` file.

---

If you'd like, I can further tailor this README with screenshots, API examples, or deployment instructions (Docker/GitHub Actions). Reply with which additions you want.
