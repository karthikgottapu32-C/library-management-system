# Oracle DBMS Library Management System

This is a complete implementation of the Library Management System based on your ER diagram.

## Database (Oracle)
The database contains all 15 required entities:
1. AUTHOR
2. BOOK
3. BOOK_COPY
4. BOOK_LOCATION
5. CATEGORY
6. FINE
7. LIBRARIAN
8. LIBRARY_BRANCH
9. LOAN
10. MEMBER
11. PAYMENT
12. PUBLISHER
13. RESERVATION
14. SUPPLIER
15. WRITTEN_BY

### Setup Instructions
1. Open SQL*Plus and log in as `SYSDBA`:
   ```bash
   sqlplus / as sysdba
   ```
2. Navigate to the project directory:
   ```bash
   cd database/schema
   ```
3. Run the schema creation script:
   ```sql
   @01_create_tables.sql
   @02_create_sequences_triggers.sql
   ```
4. Insert the data:
   ```sql
   @../data/authors.sql
   ```

## Local Development
Install backend and frontend dependencies once:

```bash
npm install --prefix=backend
npm install --prefix=frontend
```

Configure `backend/.env` with `DATABASE_URL` for the current PostgreSQL backend. Keep the local backend port at `8000`.

Start the backend in Terminal 1 from the project root:

```bash
npm start --prefix=backend
```

Start Vite in Terminal 2:

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`. Frontend API requests use `/api`, which Vite proxies to `http://localhost:8000`.
