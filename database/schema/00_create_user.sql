-- Create application user and grant privileges
-- Run this script as SYSDBA

BEGIN
   EXECUTE IMMEDIATE 'DROP USER c##library_user CASCADE';
EXCEPTION
   WHEN OTHERS THEN
      IF SQLCODE != -1918 THEN
         RAISE;
      END IF;
END;
/

CREATE USER c##library_user IDENTIFIED BY library_password;

GRANT CONNECT, RESOURCE, CREATE SESSION, CREATE TABLE, CREATE VIEW, CREATE PROCEDURE, CREATE SEQUENCE, CREATE TRIGGER TO c##library_user;
ALTER USER c##library_user QUOTA UNLIMITED ON USERS;

PROMPT ==================================================
PROMPT User c##library_user created successfully!
PROMPT ==================================================
EXIT;
