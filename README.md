# SHOPFLASH

## FILE STRUCTURE

```
SHOPFLASH/
├── README.md
├── backend/
│   ├── .env               # enviroment file (already config for azure cloud database use)
│   ├── main.py
│   ├── requirements.txt
│   ├── models/
│   └── ...
├── shopflash/            (frontend)
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
└── init.sql (database initialization script)
```

## Run the Application
### Backend
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   .\venv\Scripts\activate  # Windows
   ```
3. Install the required packages:
   ```bash
    pip install -r requirements.txt
    ```
4. Run the backend server:
    ```bash
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
    ```
### Frontend
1. Navigate to the `shopflash` directory:
   ```bash
   cd shopflash
   ```
2. Install the required packages:
   ```bash
    npm install
    ```
3. Run the frontend development server:
    ```bash
     npm start
     ```
The frontend will be accessible at `http://localhost:3000` and will communicate with the backend server running at `http://localhost:8000`.
