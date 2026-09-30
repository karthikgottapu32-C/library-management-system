-- ============================================================
-- LIBRARY MANAGEMENT SYSTEM - REALISTIC SEED DATA v2
-- Uses ACTUAL Oracle column names from schema_dump.json
-- Safe to re-run; all inserts wrapped with EXCEPTION
-- ============================================================
SET DEFINE OFF;
SET SERVEROUTPUT ON SIZE UNLIMITED;

DECLARE
    v_branch_id    NUMBER;
    v_cat_id       NUMBER;
    v_pub_id       NUMBER;
    v_loc_id       NUMBER;
    v_lib_id       NUMBER;
    v_book_id      NUMBER;
    v_author_id    NUMBER;
    v_member_id    NUMBER;
    v_copy_id      NUMBER;
    v_loan_id      NUMBER;
    v_min_book     NUMBER := 0;
    v_min_member   NUMBER := 0;

BEGIN

-- ============================================================
-- 1. LIBRARY_BRANCH  cols: BRANCHID, BRANCHNAME, ADDRESS, PHONE
-- ============================================================
    BEGIN INSERT INTO LIBRARY_BRANCH(BRANCHNAME,ADDRESS,PHONE) VALUES('Riverside Branch','12 River Rd, Riverside','555-3001'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO LIBRARY_BRANCH(BRANCHNAME,ADDRESS,PHONE) VALUES('Uptown Branch','45 High Street, Uptown','555-3002'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO LIBRARY_BRANCH(BRANCHNAME,ADDRESS,PHONE) VALUES('Midtown Branch','101 Central Ave, Midtown','555-3003'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO LIBRARY_BRANCH(BRANCHNAME,ADDRESS,PHONE) VALUES('University Branch','1 Campus Road, University Park','555-3004'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO LIBRARY_BRANCH(BRANCHNAME,ADDRESS,PHONE) VALUES('Heritage Branch','7 Old Town Square, Heritage','555-3005'); EXCEPTION WHEN OTHERS THEN NULL; END;
    COMMIT;
    NULL; -- done

-- ============================================================
-- 2. CATEGORY  cols: CATEGORYID, CATEGORYNAME, DESCRIPTION
-- ============================================================
    BEGIN INSERT INTO CATEGORY(CATEGORYNAME,DESCRIPTION) VALUES('Horror','Fear and supernatural terror'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO CATEGORY(CATEGORYNAME,DESCRIPTION) VALUES('Philosophy','Metaphysics and ethical inquiry'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO CATEGORY(CATEGORYNAME,DESCRIPTION) VALUES('Psychology','Human mind and behavior studies'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO CATEGORY(CATEGORYNAME,DESCRIPTION) VALUES('Political Science','Government, policy, and politics'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO CATEGORY(CATEGORYNAME,DESCRIPTION) VALUES('Economics','Markets, trade, and financial systems'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO CATEGORY(CATEGORYNAME,DESCRIPTION) VALUES('Graphic Novel','Sequential art storytelling'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO CATEGORY(CATEGORYNAME,DESCRIPTION) VALUES('Travel','Exploration and world cultures'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO CATEGORY(CATEGORYNAME,DESCRIPTION) VALUES('Cooking','Recipes and culinary arts'); EXCEPTION WHEN OTHERS THEN NULL; END;
    COMMIT;
    

-- ============================================================
-- 3. PUBLISHER  cols: PUBLISHERID, PUBLISHERNAME, ADDRESS, PHONE, EMAIL
-- ============================================================
    BEGIN INSERT INTO PUBLISHER(PUBLISHERNAME,ADDRESS,PHONE,EMAIL) VALUES('Tor Books','175 Fifth Ave, New York','212-388-0100','contact@torbooks.com'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO PUBLISHER(PUBLISHERNAME,ADDRESS,PHONE,EMAIL) VALUES('Bloomsbury Publishing','50 Bedford Square, London','020-7494-2111','info@bloomsbury.com'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO PUBLISHER(PUBLISHERNAME,ADDRESS,PHONE,EMAIL) VALUES('Doubleday','1745 Broadway, New York','212-751-2600','hello@doubleday.com'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO PUBLISHER(PUBLISHERNAME,ADDRESS,PHONE,EMAIL) VALUES('Bantam Books','1745 Broadway, New York','212-782-9000','info@bantam.com'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO PUBLISHER(PUBLISHERNAME,ADDRESS,PHONE,EMAIL) VALUES('Knopf','1745 Broadway, New York','212-751-2601','info@knopf.com'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO PUBLISHER(PUBLISHERNAME,ADDRESS,PHONE,EMAIL) VALUES('Little, Brown','1290 Avenue of Americas, NY','212-364-1100','info@littlebrown.com'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO PUBLISHER(PUBLISHERNAME,ADDRESS,PHONE,EMAIL) VALUES('Hodder Stoughton','338 Euston Road, London','020-7873-6000','books@hodder.co.uk'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO PUBLISHER(PUBLISHERNAME,ADDRESS,PHONE,EMAIL) VALUES('Penguin Books','375 Hudson Street, New York','212-366-2000','info@penguin.com'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO PUBLISHER(PUBLISHERNAME,ADDRESS,PHONE,EMAIL) VALUES('Scribner','1230 Avenue of Americas, NY','212-698-7000','info@scribner.com'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO PUBLISHER(PUBLISHERNAME,ADDRESS,PHONE,EMAIL) VALUES('Farrar Straus Giroux','18 West 18th Street, New York','212-741-6900','info@fsg.com'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO PUBLISHER(PUBLISHERNAME,ADDRESS,PHONE,EMAIL) VALUES('Grove Press','841 Broadway, New York','212-614-7850','info@grovepress.com'); EXCEPTION WHEN OTHERS THEN NULL; END;
    COMMIT;
    

-- ============================================================
-- 4. BOOK_LOCATION  cols: LOCATIONID, LOCATIONNAME, DESCRIPTION, BRANCHID
-- ============================================================
    FOR br IN (SELECT BRANCHID FROM LIBRARY_BRANCH) LOOP
        BEGIN INSERT INTO BOOK_LOCATION(LOCATIONNAME,DESCRIPTION,BRANCHID) VALUES('Fiction Aisle','General fiction collection',br.BRANCHID); EXCEPTION WHEN OTHERS THEN NULL; END;
        BEGIN INSERT INTO BOOK_LOCATION(LOCATIONNAME,DESCRIPTION,BRANCHID) VALUES('Reference Section','Non-circulating reference',br.BRANCHID); EXCEPTION WHEN OTHERS THEN NULL; END;
        BEGIN INSERT INTO BOOK_LOCATION(LOCATIONNAME,DESCRIPTION,BRANCHID) VALUES('Science & Tech','STEM and computer books',br.BRANCHID); EXCEPTION WHEN OTHERS THEN NULL; END;
        BEGIN INSERT INTO BOOK_LOCATION(LOCATIONNAME,DESCRIPTION,BRANCHID) VALUES('Children Corner','Books for young readers',br.BRANCHID); EXCEPTION WHEN OTHERS THEN NULL; END;
        BEGIN INSERT INTO BOOK_LOCATION(LOCATIONNAME,DESCRIPTION,BRANCHID) VALUES('Periodicals','Magazines and journals',br.BRANCHID); EXCEPTION WHEN OTHERS THEN NULL; END;
    END LOOP;
    COMMIT;
    

-- ============================================================
-- 5. LIBRARIAN  cols: LIBRARIANID, LIBRARIANNAME, PHONE, EMAIL, BRANCHID
-- ============================================================
    FOR br IN (SELECT BRANCHID FROM LIBRARY_BRANCH ORDER BY BRANCHID) LOOP
        BEGIN INSERT INTO LIBRARIAN(LIBRARIANNAME,PHONE,EMAIL,BRANCHID) VALUES('Chief Librarian '||br.BRANCHID,'555-40'||TO_CHAR(br.BRANCHID,'FM00'),'chief'||br.BRANCHID||'@lib.org',br.BRANCHID); EXCEPTION WHEN OTHERS THEN NULL; END;
        BEGIN INSERT INTO LIBRARIAN(LIBRARIANNAME,PHONE,EMAIL,BRANCHID) VALUES('Assistant Lib '||br.BRANCHID,'555-41'||TO_CHAR(br.BRANCHID,'FM00'),'asst'||br.BRANCHID||'@lib.org',br.BRANCHID); EXCEPTION WHEN OTHERS THEN NULL; END;
    END LOOP;
    BEGIN INSERT INTO LIBRARIAN(LIBRARIANNAME,PHONE,EMAIL) VALUES('Sarah Mitchell','555-2101','smitchell@library.org'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO LIBRARIAN(LIBRARIANNAME,PHONE,EMAIL) VALUES('James Thornton','555-2102','jthornton@library.org'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO LIBRARIAN(LIBRARIANNAME,PHONE,EMAIL) VALUES('Emily Clarke','555-2103','eclarke@library.org'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO LIBRARIAN(LIBRARIANNAME,PHONE,EMAIL) VALUES('Robert Nguyen','555-2104','rnguyen@library.org'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO LIBRARIAN(LIBRARIANNAME,PHONE,EMAIL) VALUES('Priya Sharma','555-2105','psharma@library.org'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO LIBRARIAN(LIBRARIANNAME,PHONE,EMAIL) VALUES('Daniel Osei','555-2106','dosei@library.org'); EXCEPTION WHEN OTHERS THEN NULL; END;
    COMMIT;
    

-- ============================================================
-- 6. AUTHOR  cols: AUTHORID, AUTHORNAME, NATIONALITY, BIOGRAPHY
-- ============================================================
    BEGIN INSERT INTO AUTHOR(AUTHORNAME,NATIONALITY,BIOGRAPHY) VALUES('George Orwell','British','Author of 1984 and Animal Farm, known for dystopian fiction.'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO AUTHOR(AUTHORNAME,NATIONALITY,BIOGRAPHY) VALUES('J.K. Rowling','British','Creator of the Harry Potter fantasy series.'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO AUTHOR(AUTHORNAME,NATIONALITY,BIOGRAPHY) VALUES('Stephen King','American','Prolific author of horror, thriller, and fantasy novels.'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO AUTHOR(AUTHORNAME,NATIONALITY,BIOGRAPHY) VALUES('Agatha Christie','British','Queen of Crime, creator of Poirot and Miss Marple.'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO AUTHOR(AUTHORNAME,NATIONALITY,BIOGRAPHY) VALUES('Ernest Hemingway','American','Nobel Prize winner known for minimalist prose style.'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO AUTHOR(AUTHORNAME,NATIONALITY,BIOGRAPHY) VALUES('F. Scott Fitzgerald','American','Chronicler of the Jazz Age, author of The Great Gatsby.'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO AUTHOR(AUTHORNAME,NATIONALITY,BIOGRAPHY) VALUES('Toni Morrison','American','Nobel laureate exploring African American experience.'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO AUTHOR(AUTHORNAME,NATIONALITY,BIOGRAPHY) VALUES('Gabriel Garcia Marquez','Colombian','Pioneer of magical realism, author of 100 Years of Solitude.'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO AUTHOR(AUTHORNAME,NATIONALITY,BIOGRAPHY) VALUES('Haruki Murakami','Japanese','Contemporary Japanese author blending magical realism with pop culture.'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO AUTHOR(AUTHORNAME,NATIONALITY,BIOGRAPHY) VALUES('Chimamanda Ngozi Adichie','Nigerian','Feminist author exploring identity, race, and culture.'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO AUTHOR(AUTHORNAME,NATIONALITY,BIOGRAPHY) VALUES('Kazuo Ishiguro','British-Japanese','Nobel laureate known for subtle, introspective narratives.'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO AUTHOR(AUTHORNAME,NATIONALITY,BIOGRAPHY) VALUES('Jhumpa Lahiri','American','Pulitzer Prize winner exploring the Indian-American experience.'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO AUTHOR(AUTHORNAME,NATIONALITY,BIOGRAPHY) VALUES('Neil Gaiman','British','Fantasy and graphic novel author, creator of American Gods.'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO AUTHOR(AUTHORNAME,NATIONALITY,BIOGRAPHY) VALUES('Terry Pratchett','British','Creator of the Discworld series of comedic fantasy.'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO AUTHOR(AUTHORNAME,NATIONALITY,BIOGRAPHY) VALUES('Margaret Atwood','Canadian','Speculative fiction author, known for The Handmaid''s Tale.'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO AUTHOR(AUTHORNAME,NATIONALITY,BIOGRAPHY) VALUES('Cormac McCarthy','American','Known for stark, violent portrayals of American landscapes.'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO AUTHOR(AUTHORNAME,NATIONALITY,BIOGRAPHY) VALUES('Donna Tartt','American','Author of literary mysteries including The Secret History.'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO AUTHOR(AUTHORNAME,NATIONALITY,BIOGRAPHY) VALUES('Anthony Doerr','American','Pulitzer winner, author of All the Light We Cannot See.'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO AUTHOR(AUTHORNAME,NATIONALITY,BIOGRAPHY) VALUES('Colson Whitehead','American','Two-time Pulitzer winner exploring race in American history.'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO AUTHOR(AUTHORNAME,NATIONALITY,BIOGRAPHY) VALUES('Zadie Smith','British','Acclaimed novelist known for White Teeth and NW.'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO AUTHOR(AUTHORNAME,NATIONALITY,BIOGRAPHY) VALUES('Jonathan Franzen','American','Author of complex family dramas like The Corrections.'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO AUTHOR(AUTHORNAME,NATIONALITY,BIOGRAPHY) VALUES('David Mitchell','British','Structural innovator known for Cloud Atlas.'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO AUTHOR(AUTHORNAME,NATIONALITY,BIOGRAPHY) VALUES('Salman Rushdie','British-Indian','Postcolonial author known for Midnight Children.'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO AUTHOR(AUTHORNAME,NATIONALITY,BIOGRAPHY) VALUES('Ian McEwan','British','Psychological fiction writer, known for Atonement.'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO AUTHOR(AUTHORNAME,NATIONALITY,BIOGRAPHY) VALUES('Arundhati Roy','Indian','Booker Prize winner and political activist.'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO AUTHOR(AUTHORNAME,NATIONALITY,BIOGRAPHY) VALUES('Aldous Huxley','British','Author of Brave New World and Point Counter Point.'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO AUTHOR(AUTHORNAME,NATIONALITY,BIOGRAPHY) VALUES('Ray Bradbury','American','Science fiction master known for Fahrenheit 451.'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO AUTHOR(AUTHORNAME,NATIONALITY,BIOGRAPHY) VALUES('Harper Lee','American','Author of To Kill a Mockingbird and Go Set a Watchman.'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO AUTHOR(AUTHORNAME,NATIONALITY,BIOGRAPHY) VALUES('John Steinbeck','American','Nobel laureate depicting the struggles of working-class Americans.'); EXCEPTION WHEN OTHERS THEN NULL; END;
    BEGIN INSERT INTO AUTHOR(AUTHORNAME,NATIONALITY,BIOGRAPHY) VALUES('Joseph Heller','American','Author of the satirical anti-war novel Catch-22.'); EXCEPTION WHEN OTHERS THEN NULL; END;
    COMMIT;
    

-- ============================================================
-- 7. BOOK  cols: BOOKID, TITLE, ISBN, CATEGORYID, PUBLISHERID, PRICE, EDITION, PUBLISHYEAR
-- ============================================================
    DECLARE
        PROCEDURE ins_book(p_title VARCHAR2, p_isbn VARCHAR2, p_year NUMBER) AS
            vc NUMBER; vp NUMBER;
        BEGIN
            SELECT CATEGORYID INTO vc FROM (SELECT CATEGORYID FROM CATEGORY ORDER BY DBMS_RANDOM.VALUE) WHERE ROWNUM=1;
            SELECT PUBLISHERID INTO vp FROM (SELECT PUBLISHERID FROM PUBLISHER ORDER BY DBMS_RANDOM.VALUE) WHERE ROWNUM=1;
            INSERT INTO BOOK(TITLE,ISBN,CATEGORYID,PUBLISHERID,PRICE,EDITION,PUBLISHYEAR)
            VALUES(p_title,p_isbn,vc,vp,ROUND(DBMS_RANDOM.VALUE(8,70),2),'1st',p_year);
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
    BEGIN
        ins_book('Nineteen Eighty-Four','978-0451524935',1949);
        ins_book('Animal Farm','978-0451526342',1945);
        ins_book('Harry Potter and the Philosopher Stone','978-0590353427',1997);
        ins_book('Harry Potter and the Chamber of Secrets','978-0439064873',1998);
        ins_book('Harry Potter and the Prisoner of Azkaban','978-0439136358',1999);
        ins_book('Harry Potter and the Goblet of Fire','978-0439139595',2000);
        ins_book('The Shining','978-0307743657',1977);
        ins_book('It','978-1501156700',1986);
        ins_book('Misery','978-0451169525',1987);
        ins_book('Pet Sematary','978-0385182508',1983);
        ins_book('Murder on the Orient Express','978-0062693662',1934);
        ins_book('And Then There Were None','978-0062073488',1939);
        ins_book('Death on the Nile','978-0062074003',1937);
        ins_book('A Farewell to Arms','978-0684801469',1929);
        ins_book('The Old Man and the Sea','978-0684801222',1952);
        ins_book('For Whom the Bell Tolls','978-0684803357',1940);
        ins_book('The Great Gatsby','978-0743273565',1925);
        ins_book('Tender is the Night','978-0684801544',1934);
        ins_book('Beloved','978-1400033416',1987);
        ins_book('Song of Solomon','978-1400033423',1977);
        ins_book('The Bluest Eye','978-0307278449',1970);
        ins_book('One Hundred Years of Solitude','978-0060883287',1967);
        ins_book('Love in the Time of Cholera','978-0307389732',1985);
        ins_book('Norwegian Wood','978-0375704024',1987);
        ins_book('Kafka on the Shore','978-1400079278',2002);
        ins_book('The Wind-Up Bird Chronicle','978-0679775430',1994);
        ins_book('Purple Hibiscus','978-1616953638',2003);
        ins_book('Half of a Yellow Sun','978-1400095209',2006);
        ins_book('The Remains of the Day','978-0679731726',1989);
        ins_book('Never Let Me Go','978-1400078776',2005);
        ins_book('The Namesake','978-0618485222',2003);
        ins_book('Interpreter of Maladies','978-0395927205',1999);
        ins_book('American Gods','978-0062572233',2001);
        ins_book('Good Omens','978-0060853983',1990);
        ins_book('The Handmaid''s Tale','978-0385490818',1985);
        ins_book('Oryx and Crake','978-0385503853',2003);
        ins_book('The Road','978-0307387899',2006);
        ins_book('No Country for Old Men','978-0307387875',2005);
        ins_book('The Secret History','978-1400031702',1992);
        ins_book('The Goldfinch','978-0316055437',2013);
        ins_book('All the Light We Cannot See','978-1476746586',2014);
        ins_book('The Underground Railroad','978-0385542364',2016);
        ins_book('White Teeth','978-0375703867',2000);
        ins_book('On Beauty','978-0143037743',2005);
        ins_book('The Corrections','978-0312421274',2001);
        ins_book('Freedom','978-0312576066',2010);
        ins_book('Cloud Atlas','978-0375507250',2004);
        ins_book('Midnight''s Children','978-0394511672',1981);
        ins_book('Atonement','978-0385721790',2001);
        ins_book('Saturday','978-0385662123',2005);
        ins_book('The God of Small Things','978-0060977498',1997);
        ins_book('Brave New World','978-0060850524',1932);
        ins_book('Fahrenheit 451','978-1451673319',1953);
        ins_book('To Kill a Mockingbird','978-0061935466',1960);
        ins_book('Of Mice and Men','978-0140177398',1937);
        ins_book('East of Eden','978-0142004234',1952);
        ins_book('The Grapes of Wrath','978-0143039433',1939);
        ins_book('Catch-22','978-1451626650',1961);
        ins_book('Slaughterhouse-Five','978-0385333481',1969);
        ins_book('The Catcher in the Rye','978-0316769174',1951);
        ins_book('Lord of the Flies','978-0399501487',1954);
    END;
    COMMIT;
    

-- Track lowest book we just inserted
    SELECT MIN(BOOKID) INTO v_min_book FROM BOOK WHERE TITLE = 'Nineteen Eighty-Four';
    IF v_min_book IS NULL THEN
        SELECT MAX(BOOKID) - 59 INTO v_min_book FROM BOOK;
    END IF;

-- ============================================================
-- 8. WRITTEN_BY  cols: BOOKID, AUTHORID (composite PK)
-- ============================================================
    FOR b IN (SELECT BOOKID FROM BOOK WHERE BOOKID >= NVL(v_min_book,1)) LOOP
        BEGIN
            SELECT AUTHORID INTO v_author_id FROM (
                SELECT AUTHORID FROM AUTHOR
                WHERE AUTHORID NOT IN (SELECT AUTHORID FROM WRITTEN_BY WHERE BOOKID = b.BOOKID)
                ORDER BY DBMS_RANDOM.VALUE
            ) WHERE ROWNUM = 1;
            INSERT INTO WRITTEN_BY(BOOKID,AUTHORID) VALUES(b.BOOKID,v_author_id);
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
        -- 25% chance second author
        IF DBMS_RANDOM.VALUE < 0.25 THEN
            BEGIN
                SELECT AUTHORID INTO v_author_id FROM (
                    SELECT AUTHORID FROM AUTHOR
                    WHERE AUTHORID NOT IN (SELECT AUTHORID FROM WRITTEN_BY WHERE BOOKID = b.BOOKID)
                    ORDER BY DBMS_RANDOM.VALUE
                ) WHERE ROWNUM = 1;
                INSERT INTO WRITTEN_BY(BOOKID,AUTHORID) VALUES(b.BOOKID,v_author_id);
            EXCEPTION WHEN OTHERS THEN NULL;
            END;
        END IF;
    END LOOP;
    COMMIT;
    

-- ============================================================
-- 9. BOOK_COPY  cols: COPYID,BOOKID,BRANCHID,LOCATIONID,ACCESSIONNO,STATUS,...
-- ============================================================
    FOR b IN (SELECT BOOKID FROM BOOK WHERE BOOKID >= NVL(v_min_book,1)) LOOP
        FOR c IN 1..2+MOD(b.BOOKID,2) LOOP
            BEGIN
                SELECT BRANCHID INTO v_branch_id FROM (SELECT BRANCHID FROM LIBRARY_BRANCH ORDER BY DBMS_RANDOM.VALUE) WHERE ROWNUM=1;
                SELECT LOCATIONID INTO v_loc_id FROM (SELECT LOCATIONID FROM BOOK_LOCATION ORDER BY DBMS_RANDOM.VALUE) WHERE ROWNUM=1;
                INSERT INTO BOOK_COPY(BOOKID,BRANCHID,LOCATIONID,ACCESSIONNO,STATUS)
                VALUES(b.BOOKID,v_branch_id,v_loc_id,'ACC-'||TO_CHAR(b.BOOKID,'FM0000')||'-'||TO_CHAR(c,'FM00'),'Available');
            EXCEPTION WHEN OTHERS THEN NULL;
            END;
        END LOOP;
    END LOOP;
    COMMIT;
    

-- ============================================================
-- 10. MEMBER  cols: MEMBERID,MEMBERNAME,ADDRESS,PHONE,EMAIL,MEMBERTYPE,DATEJOINED
-- ============================================================
    DECLARE
        TYPE t_fn IS TABLE OF VARCHAR2(30) INDEX BY PLS_INTEGER;
        TYPE t_ln IS TABLE OF VARCHAR2(30) INDEX BY PLS_INTEGER;
        fn t_fn; ln t_ln;
        v_fname VARCHAR2(30); v_lname VARCHAR2(30);
        v_mt VARCHAR2(20);
    BEGIN
        fn(1):='Alice';  fn(2):='Brian';  fn(3):='Clara';  fn(4):='David';  fn(5):='Elena';
        fn(6):='Frank';  fn(7):='Grace';  fn(8):='Henry';  fn(9):='Isabel'; fn(10):='Jack';
        fn(11):='Karen'; fn(12):='Liam';  fn(13):='Mia';   fn(14):='Noah';  fn(15):='Olivia';
        fn(16):='Peter'; fn(17):='Quinn'; fn(18):='Rachel';fn(19):='Samuel';fn(20):='Tina';
        fn(21):='Uma';   fn(22):='Victor';fn(23):='Wendy'; fn(24):='Xavier';fn(25):='Yasmin';
        ln(1):='Adams';  ln(2):='Baker';  ln(3):='Carter'; ln(4):='Davis';  ln(5):='Evans';
        ln(6):='Foster'; ln(7):='Green';  ln(8):='Harris'; ln(9):='Ingram'; ln(10):='Jenkins';
        ln(11):='King';  ln(12):='Lewis'; ln(13):='Morgan';ln(14):='Nelson';ln(15):='Owen';
        ln(16):='Parker';ln(17):='Quinn'; ln(18):='Reed';  ln(19):='Scott'; ln(20):='Turner';
        ln(21):='Underwood';ln(22):='Vance';ln(23):='Walsh';ln(24):='Xavier';ln(25):='Young';
        
        FOR i IN 1..100 LOOP
            v_fname := fn(1 + MOD(i-1, 25));
            v_lname := ln(1 + MOD(i*7-1, 25));
            v_mt := CASE MOD(i,3) WHEN 0 THEN 'Regular' WHEN 1 THEN 'Premium' ELSE 'Student' END;
            BEGIN
                INSERT INTO MEMBER(MEMBERNAME,ADDRESS,PHONE,EMAIL,MEMBERTYPE,DATEJOINED)
                VALUES(
                    v_fname||' '||v_lname,
                    TO_CHAR(100+i)||' Maple Ave, City District',
                    '555-'||TO_CHAR(5000+i,'FM0000'),
                    LOWER(v_fname)||'.'||LOWER(v_lname)||TO_CHAR(i)||'@mail.com',
                    v_mt,
                    SYSDATE - ROUND(DBMS_RANDOM.VALUE(30,1800))
                );
            EXCEPTION WHEN OTHERS THEN NULL;
            END;
        END LOOP;
        COMMIT;
    END;
    

-- ============================================================
-- 11. LOAN  (100+ rows; STATUS = Active|Returned|Overdue)
-- ============================================================
    FOR i IN 1..150 LOOP
        BEGIN
            SELECT COPYID INTO v_copy_id FROM (
                SELECT COPYID FROM BOOK_COPY WHERE STATUS='Available' ORDER BY DBMS_RANDOM.VALUE
            ) WHERE ROWNUM=1;
            SELECT MEMBERID INTO v_member_id FROM (SELECT MEMBERID FROM MEMBER ORDER BY DBMS_RANDOM.VALUE) WHERE ROWNUM=1;
            SELECT LIBRARIANID INTO v_lib_id FROM (SELECT LIBRARIANID FROM LIBRARIAN ORDER BY DBMS_RANDOM.VALUE) WHERE ROWNUM=1;
            DECLARE
                v_issue DATE := SYSDATE - ROUND(DBMS_RANDOM.VALUE(5,90));
                v_due   DATE; v_ret DATE; v_st VARCHAR2(20);
            BEGIN
                v_due := v_issue + 14;
                IF v_due < SYSDATE - 1 THEN
                    IF DBMS_RANDOM.VALUE < 0.55 THEN v_st:='Returned'; v_ret:=v_due+ROUND(DBMS_RANDOM.VALUE(1,15));
                    ELSE v_st:='Overdue'; v_ret:=NULL; END IF;
                ELSE v_st:='Active'; v_ret:=NULL; END IF;
                INSERT INTO LOAN(MEMBERID,COPYID,LIBRARIANID,ISSUEDATE,DUEDATE,RETURNDATE,STATUS)
                VALUES(v_member_id,v_copy_id,v_lib_id,v_issue,v_due,v_ret,v_st);
            END;
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
    END LOOP;
    COMMIT;
    

-- ============================================================
-- 12. RESERVATION  (30+; STATUS = Pending|Fulfilled|Cancelled)
-- ============================================================
    FOR i IN 1..40 LOOP
        BEGIN
            SELECT BOOKID INTO v_book_id FROM (SELECT BOOKID FROM BOOK ORDER BY DBMS_RANDOM.VALUE) WHERE ROWNUM=1;
            SELECT MEMBERID INTO v_member_id FROM (SELECT MEMBERID FROM MEMBER ORDER BY DBMS_RANDOM.VALUE) WHERE ROWNUM=1;
            INSERT INTO RESERVATION(MEMBERID,BOOKID,RESERVATIONDATE,STATUS)
            VALUES(v_member_id,v_book_id,SYSDATE-ROUND(DBMS_RANDOM.VALUE(1,45)),
                CASE MOD(i,3) WHEN 0 THEN 'Fulfilled' WHEN 1 THEN 'Pending' ELSE 'Cancelled' END);
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
    END LOOP;
    COMMIT;
    

-- ============================================================
-- 13. FINE  for overdue/returned loans not already fined
-- ============================================================
    FOR ln IN (
        SELECT LOANID,MEMBERID FROM LOAN
        WHERE STATUS IN ('Overdue','Returned')
        AND LOANID NOT IN (SELECT NVL(LOANID,0) FROM FINE)
        AND ROWNUM <= 60
    ) LOOP
        BEGIN
            INSERT INTO FINE(LOANID,MEMBERID,FINEAMOUNT,FINEDATE,FINESTATUS)
            VALUES(ln.LOANID,ln.MEMBERID,ROUND(DBMS_RANDOM.VALUE(5,100),2),
                SYSDATE-ROUND(DBMS_RANDOM.VALUE(0,30)),
                CASE WHEN DBMS_RANDOM.VALUE<0.4 THEN 'Paid' ELSE 'Unpaid' END);
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
    END LOOP;
    COMMIT;
    

-- ============================================================
-- 14. PAYMENT  for Paid fines lacking a payment record
-- ============================================================
    FOR fn IN (
        SELECT FINEID,MEMBERID,FINEAMOUNT FROM FINE
        WHERE FINESTATUS='Paid'
        AND FINEID NOT IN (SELECT NVL(FINEID,0) FROM PAYMENT)
        AND ROWNUM <= 40
    ) LOOP
        BEGIN
            INSERT INTO PAYMENT(FINEID,MEMBERID,AMOUNT,PAYMENTDATE,PAYMENTMODE)
            VALUES(fn.FINEID,fn.MEMBERID,fn.FINEAMOUNT,
                SYSDATE-ROUND(DBMS_RANDOM.VALUE(0,15)),
                CASE MOD(fn.FINEID,4) WHEN 0 THEN 'Cash' WHEN 1 THEN 'Credit Card' WHEN 2 THEN 'Online Transfer' ELSE 'Debit Card' END);
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
    END LOOP;
    COMMIT;
    

    
END;
/
EXIT;
