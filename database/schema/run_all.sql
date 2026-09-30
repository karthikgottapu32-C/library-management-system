-- Master Execution Script for Library Management System
-- Please run this script while connected as LIBRARY_USER, NOT AS SYSDBA
SET SERVEROUTPUT ON;
SET DEFINE OFF;

PROMPT ==================================================
PROMPT Step 1: Creating Tables and Constraints...
PROMPT ==================================================
@01_create_tables.sql

PROMPT ==================================================
PROMPT Step 2: Creating Sequences and Triggers...
PROMPT ==================================================
@02_create_sequences_triggers.sql

PROMPT ==================================================
PROMPT Step 3: Inserting Sample Data...
PROMPT ==================================================
@03_insert_all_data.sql

PROMPT ==================================================
PROMPT Step 4: Verifying Database Installation...
PROMPT ==================================================
@04_verify_database.sql

PROMPT ==================================================
PROMPT Database Setup Completed Successfully!
PROMPT ==================================================
EXIT;
