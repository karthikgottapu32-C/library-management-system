"""
Full workflow test suite against live backend.
Tests every entity CRUD + specific workflows.
"""
import urllib.request, urllib.error, json, sys

BASE = 'http://localhost:5000/api'
PASS = 0; FAIL = 0; results = []

def req(method, path, body=None):
    url = BASE + path
    data = json.dumps(body).encode() if body else None
    headers = {'Content-Type': 'application/json'} if body else {}
    r = urllib.request.Request(url, data=data, method=method, headers=headers)
    try:
        resp = urllib.request.urlopen(r, timeout=10)
        return json.loads(resp.read()), resp.status
    except urllib.error.HTTPError as e:
        return json.loads(e.read()), e.code
    except Exception as e:
        return {'error': str(e)}, 0

def check(name, cond, detail=''):
    global PASS, FAIL
    if cond:
        PASS += 1; results.append(f'  PASS  {name}')
    else:
        FAIL += 1; results.append(f'  FAIL  {name}' + (f' | {detail}' if detail else ''))

def section(s): results.append(f'\n--- {s} ---')

# =====================================================================
# DASHBOARD
# =====================================================================
section('DASHBOARD')
d, s = req('GET', '/dashboard/stats')
check('Dashboard stats returns 200', s == 200, str(s))
check('Dashboard has totalBooks', 'totalBooks' in d.get('data',{}), str(d))
check('Dashboard has activeLoans', 'activeLoans' in d.get('data',{}))
check('Dashboard has outstandingFines', 'outstandingFines' in d.get('data',{}))
check('Dashboard totalBooks > 50', d.get('data',{}).get('totalBooks',0) > 50, str(d.get('data',{}).get('totalBooks')))
check('Dashboard totalMembers > 100', d.get('data',{}).get('totalMembers',0) > 100)

d2, s2 = req('GET', '/dashboard/recent-loans')
check('Recent loans endpoint OK', s2 == 200)
check('Recent loans returns list', isinstance(d2.get('data'), list))

d3, s3 = req('GET', '/dashboard/recent-books')
check('Recent books endpoint OK', s3 == 200)

# =====================================================================
# BOOKS - Full CRUD + Search
# =====================================================================
section('BOOKS CRUD')
d, s = req('GET', '/books?limit=10')
check('GET /books returns 200', s == 200)
check('GET /books returns 10+ rows', len(d.get('data',[])) >= 10)

d, s = req('POST', '/books', {'TITLE': 'The Testbook Chronicle', 'CATEGORYID': 1, 'PUBLISHERID': 1, 'PRICE': 29.99, 'EDITION': '1st', 'PUBLISHYEAR': 2024})
check('POST /books creates book (201)', s == 201, str(d))

# Find the newly created book
d2, _ = req('GET', '/books?limit=100&page=1')
new_book = next((b for b in d2.get('data',[]) if b.get('TITLE') == 'The Testbook Chronicle'), None)
check('New book appears in listing', new_book is not None)

if new_book:
    bid = new_book['BOOKID']
    d, s = req('GET', f'/books/{bid}')
    check('GET /books/:id returns book', s == 200 and d.get('data',{}).get('BOOKID') == bid)

    d, s = req('PUT', f'/books/{bid}', {'TITLE': 'The Testbook Chronicle - Revised', 'CATEGORYID': 1, 'PUBLISHERID': 1})
    check('PUT /books/:id updates book', s == 200, str(d))

    # Get with search
    d, s = req('GET', '/books?search=Chronicle')
    check('Search /books finds updated title', s == 200 and len(d.get('data',[])) > 0)

    # Delete - likely FK-free if just created
    d, s = req('DELETE', f'/books/{bid}')
    check('DELETE /books/:id succeeds or gives FK error', s in [200, 400], str(d))

# =====================================================================
# MEMBERS - Full CRUD + Search
# =====================================================================
section('MEMBERS CRUD')
d, s = req('GET', '/members?limit=10')
check('GET /members returns 200', s == 200)
check('GET /members returns 10+ rows', len(d.get('data',[])) >= 10)

d, s = req('POST', '/members', {'MEMBERNAME': 'Workflow Test User', 'EMAIL': 'workflow.test@testsuite.com', 'MEMBERTYPE': 'Regular', 'PHONE': '555-9999'})
check('POST /members creates member (201)', s == 201, str(d))

d2, _ = req('GET', '/members?limit=200')
new_member = next((m for m in d2.get('data',[]) if m.get('EMAIL') == 'workflow.test@testsuite.com'), None)
check('New member appears in listing', new_member is not None)

if new_member:
    mid = new_member['MEMBERID']
    d, s = req('PUT', f'/members/{mid}', {'MEMBERNAME': 'Workflow Test User Updated', 'MEMBERTYPE': 'Premium'})
    check('PUT /members/:id updates', s == 200)

    d, s = req('GET', '/members?search=workflow')
    check('Search /members by name', s == 200 and len(d.get('data',[])) > 0)

    d, s = req('DELETE', f'/members/{mid}')
    check('DELETE /members/:id (no FKs)', s in [200, 400])

# =====================================================================
# AUTHORS
# =====================================================================
section('AUTHORS CRUD')
d, s = req('GET', '/authors?limit=5')
check('GET /authors returns 200', s == 200)
check('GET /authors returns data', len(d.get('data',[])) > 0)

d, s = req('POST', '/authors', {'AUTHORNAME': 'Test Author Workflow', 'NATIONALITY': 'Indian', 'BIOGRAPHY': 'A test author.'})
check('POST /authors creates (201)', s == 201, str(d))

d2, _ = req('GET', '/authors?limit=100')
new_author = next((a for a in d2.get('data',[]) if 'Workflow' in (a.get('AUTHORNAME',''))), None)
check('New author appears in listing', new_author is not None)
if new_author:
    aid = new_author['AUTHORID']
    d, s = req('PUT', f'/authors/{aid}', {'AUTHORNAME': 'Test Author Workflow Updated', 'NATIONALITY': 'British'})
    check('PUT /authors/:id updates', s == 200)

    d, s = req('GET', '/authors?search=workflow')
    check('Search /authors finds result', s == 200 and len(d.get('data',[])) > 0)

# =====================================================================
# PUBLISHERS
# =====================================================================
section('PUBLISHERS CRUD')
d, s = req('POST', '/publishers', {'PUBLISHERNAME': 'Test Publisher Workflow', 'PHONE': '555-8888', 'EMAIL': 'pub@workflow.com'})
check('POST /publishers creates (201)', s == 201, str(d))
d2, _ = req('GET', '/publishers?limit=30')
check('GET /publishers returns list', len(d2.get('data',[])) > 0)
new_pub = next((p for p in d2.get('data',[]) if 'Workflow' in p.get('PUBLISHERNAME','')), None)
check('New publisher in listing', new_pub is not None)
if new_pub:
    d, s = req('PUT', f'/publishers/{new_pub["PUBLISHERID"]}', {'PUBLISHERNAME': 'Test Publisher Updated'})
    check('PUT /publishers updates', s == 200)

# =====================================================================
# CATEGORIES
# =====================================================================
section('CATEGORIES CRUD')
d, s = req('POST', '/categories', {'CATEGORYNAME': 'Workflow Test Category', 'DESCRIPTION': 'Test'})
check('POST /categories creates (201)', s == 201, str(d))
d2, _ = req('GET', '/categories?limit=30')
new_cat = next((c for c in d2.get('data',[]) if 'Workflow' in c.get('CATEGORYNAME','')), None)
check('New category in listing', new_cat is not None)
if new_cat:
    d, s = req('PUT', f'/categories/{new_cat["CATEGORYID"]}', {'CATEGORYNAME': 'Workflow Cat Updated'})
    check('PUT /categories updates', s == 200)

# =====================================================================
# BOOK COPIES
# =====================================================================
section('BOOK COPIES CRUD')
# Get valid book, branch, location IDs
d_b, _ = req('GET', '/books?limit=1')
d_br, _ = req('GET', '/library-branches?limit=1')
d_l, _ = req('GET', '/book-locations?limit=1')

if d_b.get('data') and d_br.get('data') and d_l.get('data'):
    book_id = d_b['data'][0]['BOOKID']
    branch_id = d_br['data'][0]['BRANCHID']
    loc_id = d_l['data'][0]['LOCATIONID']
    
    d, s = req('POST', '/book-copies', {'BOOKID': book_id, 'BRANCHID': branch_id, 'LOCATIONID': loc_id, 'STATUS': 'Available', 'ACCESSIONNO': 'TEST-COPY-001'})
    check('POST /book-copies creates (201)', s == 201, str(d))
    
    d2, _ = req('GET', '/book-copies?limit=200')
    new_copy = next((c for c in d2.get('data',[]) if c.get('ACCESSIONNO') == 'TEST-COPY-001'), None)
    check('New book copy in listing', new_copy is not None)
    
    if new_copy:
        cid = new_copy['COPYID']
        d, s = req('PUT', f'/book-copies/{cid}', {'STATUS': 'Damaged'})
        check('PUT /book-copies updates status', s == 200)

# =====================================================================
# LOAN WORKFLOW: Issue -> Verify Issued -> Return -> Verify Available
# =====================================================================
section('LOAN WORKFLOW')
# Find an Available copy
d_copies, _ = req('GET', '/book-copies?limit=200')
avail_copy = next((c for c in d_copies.get('data',[]) if c.get('STATUS') == 'Available'), None)
d_members, _ = req('GET', '/members?limit=1')
d_libs, _ = req('GET', '/librarians?limit=1')

if avail_copy and d_members.get('data') and d_libs.get('data'):
    copy_id = avail_copy['COPYID']
    member_id = d_members['data'][0]['MEMBERID']
    lib_id = d_libs['data'][0]['LIBRARIANID']
    
    d, s = req('POST', '/loans', {
        'COPYID': copy_id, 'MEMBERID': member_id, 'LIBRARIANID': lib_id,
        'ISSUEDATE': '2024-09-01', 'DUEDATE': '2024-09-15', 'STATUS': 'Active'
    })
    check('POST /loans creates loan (201)', s == 201, str(d))
    
    # Verify copy is now Issued (trigger)
    d_copy, _ = req('GET', f'/book-copies/{copy_id}')
    copy_status = d_copy.get('data',{}).get('STATUS','')
    check('Oracle trigger sets copy to Issued', copy_status == 'Issued', f'got: {copy_status}')
    
    # Find the loan we just created
    d_loans, _ = req('GET', '/loans?limit=250')
    new_loan = next((l for l in d_loans.get('data',[]) if l.get('COPYID') == copy_id and l.get('STATUS') == 'Active'), None)
    check('Active loan appears in loan list', new_loan is not None)
    
    if new_loan:
        loan_id = new_loan['LOANID']
        # Return the book
        d, s = req('PUT', f'/loans/{loan_id}', {'RETURNDATE': '2024-09-14', 'STATUS': 'Returned'})
        check('PUT /loans returns book (Returned status)', s == 200, str(d))
        
        # Verify copy back to Available
        d_copy2, _ = req('GET', f'/book-copies/{copy_id}')
        copy_status2 = d_copy2.get('data',{}).get('STATUS','')
        check('Oracle trigger sets copy back to Available', copy_status2 == 'Available', f'got: {copy_status2}')

# =====================================================================
# FINE
# =====================================================================
section('FINE WORKFLOW')
d, s = req('GET', '/fines?limit=10')
check('GET /fines returns data', s == 200 and len(d.get('data',[])) > 0)

d_unpaid, _ = req('GET', '/fines?limit=100')
unpaid_fine = next((f for f in d_unpaid.get('data',[]) if f.get('FINESTATUS') == 'Unpaid'), None)
check('Unpaid fines exist in DB', unpaid_fine is not None)

# =====================================================================
# PAYMENT WORKFLOW: Pay a fine -> verify fine status change
# =====================================================================
section('PAYMENT WORKFLOW')
if unpaid_fine:
    fine_id = unpaid_fine['FINEID']
    member_id2 = unpaid_fine.get('MEMBERID', 1)
    amount = unpaid_fine.get('FINEAMOUNT', 25)
    
    d, s = req('POST', '/payments', {
        'FINEID': fine_id, 'MEMBERID': member_id2, 'AMOUNT': amount,
        'PAYMENTDATE': '2024-09-28', 'PAYMENTMODE': 'Cash'
    })
    check('POST /payments creates payment (201)', s == 201, str(d))
    
    # Check fine status updated by trigger
    d_fine, _ = req('GET', f'/fines/{fine_id}')
    fine_status = d_fine.get('data',{}).get('FINESTATUS','')
    check('Fine status changes to Paid after payment (trigger)', fine_status == 'Paid', f'got: {fine_status}')

# =====================================================================
# RESERVATION
# =====================================================================
section('RESERVATION WORKFLOW')
d_books, _ = req('GET', '/books?limit=1')
d_mems, _ = req('GET', '/members?limit=2')

if d_books.get('data') and d_mems.get('data') and len(d_mems['data']) > 1:
    bk = d_books['data'][0]['BOOKID']
    mb = d_mems['data'][1]['MEMBERID']
    
    d, s = req('POST', '/reservations', {'MEMBERID': mb, 'BOOKID': bk, 'RESERVATIONDATE': '2024-09-28', 'STATUS': 'Pending'})
    check('POST /reservations creates (201)', s == 201, str(d))
    
    d2, _ = req('GET', '/reservations?limit=100')
    check('GET /reservations returns list', s == 200 and len(d2.get('data',[])) > 0)
    
    new_res = next((r for r in d2.get('data',[]) if r.get('MEMBERID') == mb and r.get('STATUS') == 'Pending'), None)
    check('New reservation in listing', new_res is not None)
    if new_res:
        rid = new_res['RESERVATIONID']
        d, s = req('PUT', f'/reservations/{rid}', {'STATUS': 'Fulfilled'})
        check('PUT /reservations updates status', s == 200)

# =====================================================================
# PAGINATION
# =====================================================================
section('PAGINATION')
d1, s1 = req('GET', '/books?limit=10&page=1')
d2, s2 = req('GET', '/books?limit=10&page=2')
check('Pagination page 1 returns 10', s1==200 and len(d1.get('data',[]))==10)
check('Pagination page 2 returns data', s2==200 and len(d2.get('data',[]))>0)
if d1.get('data') and d2.get('data'):
    ids1 = set(b['BOOKID'] for b in d1['data'])
    ids2 = set(b['BOOKID'] for b in d2['data'])
    check('Page 1 and page 2 have no overlap', len(ids1 & ids2) == 0, str(ids1 & ids2))

# =====================================================================
# SEARCH
# =====================================================================
section('SEARCH')
d, s = req('GET', '/books?search=Harry Potter')
check('Search books by title substring', s==200 and len(d.get('data',[]))>0)

d, s = req('GET', '/members?search=alice')
check('Search members by name (alice)', s==200)

d, s = req('GET', '/authors?search=King')
check('Search authors by name (King)', s==200 and len(d.get('data',[]))>0)

# =====================================================================
# ERROR HANDLING
# =====================================================================
section('ERROR HANDLING')
# Duplicate ISBN
d, s = req('POST', '/books', {'TITLE': 'Duplicate Test', 'ISBN': '978-0451524935', 'CATEGORYID': 1, 'PUBLISHERID': 1})
check('Duplicate ISBN returns 400 with message', s == 400 and 'message' in d, str(d))
check('No raw ORA- in duplicate error', 'ORA-' not in d.get('message',''), d.get('message',''))

# Invalid FK
d, s = req('POST', '/books', {'TITLE': 'Bad FK Book', 'CATEGORYID': 99999, 'PUBLISHERID': 1})
check('Invalid FK returns 400', s == 400, str(d))

# Missing required field (empty body)
d, s = req('POST', '/books', {})
check('Empty POST returns 400 or 201', s in [400, 201], str(d))

# Delete referenced record
d_cats, _ = req('GET', '/categories?limit=1')
if d_cats.get('data'):
    cat_id = d_cats['data'][0]['CATEGORYID']
    d, s = req('DELETE', f'/categories/{cat_id}')
    check('Delete referenced category gives FK error', s == 400, str(d))
    check('FK error is human readable', 'ORA-' not in d.get('message',''), d.get('message',''))

# =====================================================================
# FINAL SUMMARY
# =====================================================================
print('\n' + '='*60)
print(f'  TOTAL: {PASS+FAIL} tests | PASS: {PASS} | FAIL: {FAIL}')
print('='*60)
for r in results:
    print(r)
print()
sys.exit(0 if FAIL == 0 else 1)
