-- Database Verification Script
SET SERVEROUTPUT ON;
SET VERIFY OFF;

DECLARE
    v_count NUMBER;
BEGIN
    DBMS_OUTPUT.PUT_LINE('--------------------------------------------------');
    DBMS_OUTPUT.PUT_LINE('TABLE NAME' || CHR(9) || CHR(9) || 'ROW COUNT');
    DBMS_OUTPUT.PUT_LINE('--------------------------------------------------');

    FOR rec IN (SELECT table_name FROM user_tables WHERE table_name IN (
        'AUTHOR', 'BOOK', 'BOOK_COPY', 'BOOK_LOCATION', 'CATEGORY', 'FINE', 'LIBRARIAN', 
        'LIBRARY_BRANCH', 'LOAN', 'MEMBER', 'PAYMENT', 'PUBLISHER', 'RESERVATION', 
        'SUPPLIER', 'WRITTEN_BY'
    ) ORDER BY table_name) LOOP
        EXECUTE IMMEDIATE 'SELECT COUNT(*) FROM ' || rec.table_name INTO v_count;
        DBMS_OUTPUT.PUT_LINE(RPAD(rec.table_name, 25) || v_count);
    END LOOP;
    DBMS_OUTPUT.PUT_LINE('--------------------------------------------------');
END;
/

-- Verify Business Logic Trigger: Loan Issue updates Book Copy
DECLARE
    v_status VARCHAR2(50);
BEGIN
    DBMS_OUTPUT.PUT_LINE('Testing Loan Issue Trigger...');
    -- Insert a loan for an available copy (CopyID=3)
    INSERT INTO LOAN (LoanID, MemberID, CopyID, LibrarianID, Status) VALUES (999, 1, 3, 1, 'Active');
    
    -- Check copy status
    SELECT Status INTO v_status FROM BOOK_COPY WHERE CopyID = 3;
    IF v_status = 'Issued' THEN
        DBMS_OUTPUT.PUT_LINE('SUCCESS: Book copy status updated to Issued.');
    ELSE
        DBMS_OUTPUT.PUT_LINE('FAILED: Book copy status is ' || v_status);
    END IF;

    DBMS_OUTPUT.PUT_LINE('Testing Loan Return Trigger...');
    -- Update loan to Returned
    UPDATE LOAN SET Status = 'Returned' WHERE LoanID = 999;
    
    SELECT Status INTO v_status FROM BOOK_COPY WHERE CopyID = 3;
    IF v_status = 'Available' THEN
        DBMS_OUTPUT.PUT_LINE('SUCCESS: Book copy status updated to Available.');
    ELSE
        DBMS_OUTPUT.PUT_LINE('FAILED: Book copy status is ' || v_status);
    END IF;

    -- Cleanup test data
    DELETE FROM LOAN WHERE LoanID = 999;
    COMMIT;
END;
/
