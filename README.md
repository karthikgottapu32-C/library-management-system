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

## Backend (Node.js)
1. Navigate to the `backend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your Oracle credentials:
   ```
   ORACLE_USER=sys
   ORACLE_PASSWORD=your_password
   ORACLE_CONNECT_STRING=localhost:1521/XEPDB1
   PORT=5000
   ```
4. Start the server:
   ```bash
   npm start
   ```

## Frontend (React)
The frontend uses Tailwind CSS matching your visual specifications (dark sidebar, light content, stat cards, modern tables).

*(Note: The full scaffold is in progress. To complete all React components for the 15 entities, we will build them iteratively in the next steps.)*
