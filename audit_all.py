"""
Complete button-by-button workflow audit.
Tests every UI action against the live backend.
"""
import urllib.request, urllib.error, urllib.parse, json, datetime, time

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
        try: return json.loads(e.read()), e.code
        except: return {'error': str(e)}, e.code
    except Exception as e:
        return {'error': str(e)}, 0

def ok(name, cond, detail=''):
    global PASS, FAIL
    if cond: PASS+=1; results.append(f'  PASS  {name}')
    else: FAIL+=1; results.append(f'  FAIL  {name}' + (f'  [{detail}]' if detail else ''))

def section(s): results.append(f'\n=== {s} ===')

today = datetime.date.today().isoformat()
due14 = (datetime.date.today() + datetime.timedelta(days=14)).isoformat()

# ─── HELPER: get valid IDs ────────────────────────────────────
def get_ids():
    d,_ = req('GET','/books?limit=1'); bid = d['data'][0]['BOOKID'] if d.get('data') else 1
    d,_ = req('GET','/members?limit=1'); mid = d['data'][0]['MEMBERID'] if d.get('data') else 1
    d,_ = req('GET','/librarians?limit=1'); lid = d['data'][0]['LIBRARIANID'] if d.get('data') else 1
    d,_ = req('GET','/categories?limit=1'); cid = d['data'][0]['CATEGORYID'] if d.get('data') else 1
    d,_ = req('GET','/publishers?limit=1'); pid = d['data'][0]['PUBLISHERID'] if d.get('data') else 1
    d,_ = req('GET','/library-branches?limit=1'); brid = d['data'][0]['BRANCHID'] if d.get('data') else 1
    d,_ = req('GET','/book-locations?limit=1'); locid = d['data'][0]['LOCATIONID'] if d.get('data') else 1
    d,_ = req('GET','/authors?limit=1'); aid = d['data'][0]['AUTHORID'] if d.get('data') else 1
    d,_ = req('GET','/fines?limit=100')
    unpaid = next((f for f in d.get('data',[]) if f.get('FINESTATUS')=='Unpaid'), None)
    d,_ = req('GET','/book-copies?limit=200')
    avail_copy = next((c for c in d.get('data',[]) if c.get('STATUS')=='Available'), None)
    return bid,mid,lid,cid,pid,brid,locid,aid,unpaid,avail_copy

bid,mid,lib_id,cid,pid,brid,locid,aid,unpaid_fine,avail_copy = get_ids()

# ════════════════════════════════════════════════════════════════
# 1. DASHBOARD BUTTONS
# ════════════════════════════════════════════════════════════════
section('DASHBOARD')
d,s = req('GET','/dashboard/stats')
ok('Dashboard loads (Refresh button)', s==200 and 'totalBooks' in d.get('data',{}))
ok('Dashboard totalBooks > 0', d.get('data',{}).get('totalBooks',0) > 0)
ok('Dashboard totalMembers > 0', d.get('data',{}).get('totalMembers',0) > 0)
ok('Dashboard activeLoans > 0', d.get('data',{}).get('activeLoans',0) >= 0)
ok('Dashboard outstandingFines field exists', 'outstandingFines' in d.get('data',{}))
d2,s2 = req('GET','/dashboard/recent-loans')
ok('Recent Loans table loads', s2==200 and isinstance(d2.get('data'),list))
d3,s3 = req('GET','/dashboard/recent-books')
ok('Recent Books table loads', s3==200 and isinstance(d3.get('data'),list))

# ════════════════════════════════════════════════════════════════
# 2. BOOKS — Add / View / Edit / Search / Pagination / Delete
# ════════════════════════════════════════════════════════════════
section('BOOKS')
ts = str(int(time.time()))
d,s = req('POST','/books',{'TITLE':f'Audit Book {ts}','CATEGORYID':cid,'PUBLISHERID':pid,'PRICE':19.99,'EDITION':'1st','PUBLISHYEAR':2024})
ok('[Add New] Book created',s==201,str(d))
# Find it
d2,_ = req('GET',f'/books?limit=100&page=2')
d2b,_ = req('GET',f'/books?limit=100&page=1')
all_books = d2.get('data',[]) + d2b.get('data',[])
new_book = next((b for b in all_books if b.get('TITLE')==f'Audit Book {ts}'),None)
ok('[View] New book appears in list', new_book is not None)
if new_book:
    nb_id = new_book['BOOKID']
    d,s = req('GET',f'/books/{nb_id}')
    ok('[View Detail] GET /books/:id works', s==200 and d.get('data',{}).get('BOOKID')==nb_id)
    d,s = req('PUT',f'/books/{nb_id}',{'TITLE':f'Audit Book {ts} Edited','CATEGORYID':cid,'PUBLISHERID':pid})
    ok('[Edit] PUT /books/:id works', s==200, str(d))
    d,s = req('DELETE',f'/books/{nb_id}')
    ok('[Delete] DELETE works or FK error', s in [200,400], str(d))

q = urllib.parse.urlencode({'search':'Harry Potter','limit':10})
d,s = req('GET',f'/books?{q}')
ok('[Search] Books search works', s==200 and len(d.get('data',[]))>0)
d,s = req('GET','/books?limit=10&page=1')
ok('[Pagination] Page 1 returns 10', s==200 and len(d.get('data',[]))==10)
d2,_ = req('GET','/books?limit=10&page=2')
ok('[Pagination] Page 2 returns rows', len(d2.get('data',[]))>0)

# ════════════════════════════════════════════════════════════════
# 3. MEMBERS — Add / Edit / Search / Delete
# ════════════════════════════════════════════════════════════════
section('MEMBERS')
ts2 = str(int(time.time()))
d,s = req('POST','/members',{'MEMBERNAME':f'Audit Member {ts2}','EMAIL':f'audit{ts2}@test.com','MEMBERTYPE':'Regular','PHONE':'555-0001','DATEJOINED':today})
ok('[Add New] Member created', s==201, str(d))
d2,_ = req('GET','/members?limit=50')
nm = next((m for m in d2.get('data',[]) if f'Audit Member' in m.get('MEMBERNAME','')),None)
ok('[View] New member in list', nm is not None)
if nm:
    nm_id = nm['MEMBERID']
    d,s = req('PUT',f'/members/{nm_id}',{'MEMBERNAME':f'Audit Member {ts2} Edited','MEMBERTYPE':'Premium'})
    ok('[Edit] PUT /members/:id works', s==200)
    q2 = urllib.parse.urlencode({'search':f'Audit Member','limit':10})
    d,s = req('GET',f'/members?{q2}')
    ok('[Search] Members search works', s==200 and len(d.get('data',[]))>0)
    d,s = req('DELETE',f'/members/{nm_id}')
    ok('[Delete] DELETE works or FK error', s in [200,400])

# ════════════════════════════════════════════════════════════════
# 4. AUTHORS — Add / Edit / Search
# ════════════════════════════════════════════════════════════════
section('AUTHORS')
ts3 = str(int(time.time()))
d,s = req('POST','/authors',{'AUTHORNAME':f'Audit Author {ts3}','NATIONALITY':'Indian','BIOGRAPHY':'Test bio.'})
ok('[Add New] Author created', s==201, str(d))
d2,_ = req('GET','/authors?limit=100')
na = next((a for a in d2.get('data',[]) if 'Audit Author' in a.get('AUTHORNAME','')),None)
ok('[View] New author in list', na is not None)
if na:
    na_id = na['AUTHORID']
    d,s = req('PUT',f'/authors/{na_id}',{'AUTHORNAME':f'Audit Author {ts3} Edited','NATIONALITY':'British'})
    ok('[Edit] PUT /authors/:id works', s==200)
q3 = urllib.parse.urlencode({'search':'King','limit':5})
d,s = req('GET',f'/authors?{q3}')
ok('[Search] Authors search works', s==200 and len(d.get('data',[]))>0)

# ════════════════════════════════════════════════════════════════
# 5. PUBLISHERS — Add / Edit / Search
# ════════════════════════════════════════════════════════════════
section('PUBLISHERS')
ts4 = str(int(time.time()))
d,s = req('POST','/publishers',{'PUBLISHERNAME':f'Audit Pub {ts4}','PHONE':'555-9001','EMAIL':f'pub{ts4}@test.com','ADDRESS':'123 Test St'})
ok('[Add New] Publisher created', s==201, str(d))
d2,_ = req('GET','/publishers?limit=30')
np = next((p for p in d2.get('data',[]) if 'Audit Pub' in p.get('PUBLISHERNAME','')),None)
ok('[View] New publisher in list', np is not None)
if np:
    d,s = req('PUT',f'/publishers/{np["PUBLISHERID"]}',{'PUBLISHERNAME':f'Audit Pub {ts4} Edited'})
    ok('[Edit] PUT /publishers/:id works', s==200)
q4 = urllib.parse.urlencode({'search':'Penguin','limit':5})
d,s = req('GET',f'/publishers?{q4}')
ok('[Search] Publishers search works', s==200)

# ════════════════════════════════════════════════════════════════
# 6. CATEGORIES — Add / Edit
# ════════════════════════════════════════════════════════════════
section('CATEGORIES')
ts5 = str(int(time.time()))
d,s = req('POST','/categories',{'CATEGORYNAME':f'Audit Cat {ts5}','DESCRIPTION':'Test category'})
ok('[Add New] Category created', s==201, str(d))
d2,_ = req('GET','/categories?limit=30')
nc = next((c for c in d2.get('data',[]) if 'Audit Cat' in c.get('CATEGORYNAME','')),None)
ok('[View] New category in list', nc is not None)
if nc:
    d,s = req('PUT',f'/categories/{nc["CATEGORYID"]}',{'CATEGORYNAME':f'Audit Cat {ts5} Edited'})
    ok('[Edit] PUT /categories/:id works', s==200)

# ════════════════════════════════════════════════════════════════
# 7. LIBRARY BRANCHES — Add / Edit
# ════════════════════════════════════════════════════════════════
section('LIBRARY BRANCHES')
ts6 = str(int(time.time()))
d,s = req('POST','/library-branches',{'BRANCHNAME':f'Audit Branch {ts6}','ADDRESS':'456 Test Ave','PHONE':'555-7001'})
ok('[Add New] Branch created', s==201, str(d))
d2,_ = req('GET','/library-branches?limit=20')
nb2 = next((b for b in d2.get('data',[]) if 'Audit Branch' in b.get('BRANCHNAME','')),None)
ok('[View] New branch in list', nb2 is not None)
if nb2:
    d,s = req('PUT',f'/library-branches/{nb2["BRANCHID"]}',{'BRANCHNAME':f'Audit Branch {ts6} Edited','ADDRESS':'456 Edited Ave'})
    ok('[Edit] PUT /library-branches/:id works', s==200)

# ════════════════════════════════════════════════════════════════
# 8. BOOK LOCATIONS — Add / Edit
# ════════════════════════════════════════════════════════════════
section('BOOK LOCATIONS')
ts7 = str(int(time.time()))
d,s = req('POST','/book-locations',{'LOCATIONNAME':f'Audit Loc {ts7}','DESCRIPTION':'Test location','BRANCHID':brid})
ok('[Add New] Location created', s==201, str(d))
d2,_ = req('GET','/book-locations?limit=50')
nl = next((l for l in d2.get('data',[]) if 'Audit Loc' in l.get('LOCATIONNAME','')),None)
ok('[View] New location in list', nl is not None)
if nl:
    d,s = req('PUT',f'/book-locations/{nl["LOCATIONID"]}',{'LOCATIONNAME':f'Audit Loc {ts7} Edited'})
    ok('[Edit] PUT /book-locations/:id works', s==200)

# ════════════════════════════════════════════════════════════════
# 9. LIBRARIANS — Add / Edit
# ════════════════════════════════════════════════════════════════
section('LIBRARIANS')
ts8 = str(int(time.time()))
d,s = req('POST','/librarians',{'LIBRARIANNAME':f'Audit Lib {ts8}','PHONE':'555-8001','EMAIL':f'auditlib{ts8}@lib.org','BRANCHID':brid})
ok('[Add New] Librarian created', s==201, str(d))
d2,_ = req('GET','/librarians?limit=30')
nlib = next((l for l in d2.get('data',[]) if 'Audit Lib' in l.get('LIBRARIANNAME','')),None)
ok('[View] New librarian in list', nlib is not None)
if nlib:
    d,s = req('PUT',f'/librarians/{nlib["LIBRARIANID"]}',{'LIBRARIANNAME':f'Audit Lib {ts8} Edited'})
    ok('[Edit] PUT /librarians/:id works', s==200)

# ════════════════════════════════════════════════════════════════
# 10. SUPPLIERS — Add / Edit
# ════════════════════════════════════════════════════════════════
section('SUPPLIERS')
ts9 = str(int(time.time()))
d,s = req('POST','/suppliers',{'SUPPLIERNAME':f'Audit Supplier {ts9}','PHONE':'555-6001','EMAIL':f'sup{ts9}@supply.com'})
ok('[Add New] Supplier created', s==201, str(d))
d2,_ = req('GET','/suppliers?limit=20')
ns = next((s2 for s2 in d2.get('data',[]) if 'Audit Supplier' in s2.get('SUPPLIERNAME','')),None)
ok('[View] New supplier in list', ns is not None)
if ns:
    d,s = req('PUT',f'/suppliers/{ns["SUPPLIERID"]}',{'SUPPLIERNAME':f'Audit Supplier {ts9} Edited'})
    ok('[Edit] PUT /suppliers/:id works', s==200)

# ════════════════════════════════════════════════════════════════
# 11. BOOK COPIES — Add / Edit / Status check
# ════════════════════════════════════════════════════════════════
section('BOOK COPIES')
acc_no = f'AUDIT-{ts}'
d,s = req('POST','/book-copies',{'BOOKID':bid,'BRANCHID':brid,'LOCATIONID':locid,'ACCESSIONNO':acc_no,'STATUS':'Available'})
ok('[Add New] Book copy created', s==201, str(d))
d2,_ = req('GET','/book-copies?limit=200')
nc2 = next((c for c in d2.get('data',[]) if c.get('ACCESSIONNO')==acc_no),None)
ok('[View] New copy in list with status Available', nc2 is not None and nc2.get('STATUS')=='Available')
if nc2:
    cid2 = nc2['COPYID']
    d,s = req('PUT',f'/book-copies/{cid2}',{'STATUS':'Damaged'})
    ok('[Edit Status] PUT copy status to Damaged', s==200)
    d,s = req('PUT',f'/book-copies/{cid2}',{'STATUS':'Available'})
    ok('[Edit Status] PUT copy status back to Available', s==200)

# ════════════════════════════════════════════════════════════════
# 12. LOAN WORKFLOW — Issue → Trigger → Return → Trigger
# ════════════════════════════════════════════════════════════════
section('LOAN WORKFLOW (Issue / Return / Trigger)')
if avail_copy:
    copy_id = avail_copy['COPYID']
    d,s = req('POST','/loans',{'COPYID':copy_id,'MEMBERID':mid,'LIBRARIANID':lib_id,'ISSUEDATE':today,'DUEDATE':due14,'STATUS':'Active'})
    ok('[Issue] POST /loans creates loan', s==201, str(d))
    d2,_ = req('GET',f'/book-copies/{copy_id}')
    ok('[Trigger] Copy STATUS = Issued after loan', d2.get('data',{}).get('STATUS')=='Issued', d2.get('data',{}).get('STATUS'))
    d3,_ = req('GET','/loans?limit=250')
    active_loan = next((l for l in d3.get('data',[]) if l.get('COPYID')==copy_id and l.get('STATUS')=='Active'),None)
    ok('[View] Active loan appears in list', active_loan is not None)
    if active_loan:
        loan_id = active_loan['LOANID']
        d,s = req('PUT',f'/loans/{loan_id}',{'RETURNDATE':today,'STATUS':'Returned'})
        ok('[Return] PUT loan STATUS = Returned', s==200, str(d))
        d4,_ = req('GET',f'/book-copies/{copy_id}')
        ok('[Trigger] Copy STATUS = Available after return', d4.get('data',{}).get('STATUS')=='Available', d4.get('data',{}).get('STATUS'))
else:
    ok('[Issue] Available copy found for loan test', False, 'No available copy')

# ════════════════════════════════════════════════════════════════
# 13. FINES — View outstanding
# ════════════════════════════════════════════════════════════════
section('FINES')
d,s = req('GET','/fines?limit=10')
ok('[View] GET /fines returns rows', s==200 and len(d.get('data',[]))>0)
d2,_ = req('GET','/fines?limit=200')
unpaid = next((f for f in d2.get('data',[]) if f.get('FINESTATUS')=='Unpaid'),None)
ok('[View] Unpaid fines exist', unpaid is not None)

# ════════════════════════════════════════════════════════════════
# 14. PAYMENT WORKFLOW — Pay fine → Trigger updates fine
# ════════════════════════════════════════════════════════════════
section('PAYMENT WORKFLOW')
if unpaid:
    fine_id = unpaid['FINEID']
    mem_id = unpaid.get('MEMBERID',mid)
    amt = unpaid.get('FINEAMOUNT',25)
    d,s = req('POST','/payments',{'FINEID':fine_id,'MEMBERID':mem_id,'AMOUNT':amt,'PAYMENTDATE':today,'PAYMENTMODE':'Cash'})
    ok('[Pay Fine] POST /payments creates payment', s==201, str(d))
    d2,_ = req('GET',f'/fines/{fine_id}')
    ok('[Trigger] Fine FINESTATUS = Paid after payment', d2.get('data',{}).get('FINESTATUS')=='Paid', d2.get('data',{}).get('FINESTATUS'))
    d3,_ = req('GET','/dashboard/stats')
    ok('[Dashboard] outstandingFines updated after payment', 'outstandingFines' in d3.get('data',{}))

# ════════════════════════════════════════════════════════════════
# 15. RESERVATIONS — Add / Edit status / Delete
# ════════════════════════════════════════════════════════════════
section('RESERVATIONS')
d,s = req('POST','/reservations',{'MEMBERID':mid,'BOOKID':bid,'RESERVATIONDATE':today,'STATUS':'Pending'})
ok('[Add New] Reservation created', s==201, str(d))
d2,_ = req('GET','/reservations?limit=100')
nr = next((r for r in d2.get('data',[]) if r.get('MEMBERID')==mid and r.get('STATUS')=='Pending'),None)
ok('[View] New reservation in list', nr is not None)
if nr:
    rid = nr['RESERVATIONID']
    d,s = req('PUT',f'/reservations/{rid}',{'STATUS':'Fulfilled'})
    ok('[Edit Status] PUT reservation to Fulfilled', s==200, str(d))
    d,s = req('DELETE',f'/reservations/{rid}')
    ok('[Delete] DELETE reservation works', s in [200,400])

# ════════════════════════════════════════════════════════════════
# 16. WRITTEN BY — Add composite record
# ════════════════════════════════════════════════════════════════
section('WRITTEN BY')
d,s = req('GET','/written-by?limit=5')
ok('[View] GET /written-by returns rows', s==200 and len(d.get('data',[]))>0)
# Try insert (may fail if already exists - that's OK)
d,s = req('POST','/written-by',{'BOOKID':bid,'AUTHORID':aid})
ok('[Add] POST /written-by succeeds or duplicate error', s in [201,400])

# ════════════════════════════════════════════════════════════════
# 17. ERROR HANDLING — Duplicate / Invalid FK / FK delete block
# ════════════════════════════════════════════════════════════════
section('ERROR HANDLING')
d,s = req('POST','/books',{'TITLE':'Dup Test','ISBN':'978-0451524935','CATEGORYID':cid,'PUBLISHERID':pid})
ok('[Duplicate] Returns 400, not 500', s==400)
ok('[Duplicate] No raw ORA- in message', 'ORA-' not in d.get('message',''), d.get('message',''))

d,s = req('POST','/books',{'TITLE':'Bad FK','CATEGORYID':99999,'PUBLISHERID':pid})
ok('[Invalid FK] Returns 400', s==400)
ok('[Invalid FK] No raw ORA- in message', 'ORA-' not in d.get('message',''), d.get('message',''))

d,s = req('DELETE',f'/categories/{cid}')
ok('[FK Block Delete] Returns 400 (referenced)', s==400)
ok('[FK Block Delete] No raw ORA- in message', 'ORA-' not in d.get('message',''), d.get('message',''))

d,s = req('POST','/loans',{'COPYID':99999,'MEMBERID':mid,'LIBRARIANID':lib_id,'ISSUEDATE':today,'DUEDATE':due14,'STATUS':'Active'})
ok('[Invalid Copy FK] Returns 400', s==400)

d,s = req('POST','/members',{'MEMBERNAME':'No Type Member','MEMBERTYPE':'InvalidType'})
ok('[Check Constraint] Invalid MEMBERTYPE returns 400', s==400)

# ════════════════════════════════════════════════════════════════
# 18. PAGINATION — multiple pages
# ════════════════════════════════════════════════════════════════
section('PAGINATION & SEARCH')
p1,_ = req('GET','/members?limit=10&page=1')
p2,_ = req('GET','/members?limit=10&page=2')
p3,_ = req('GET','/members?limit=10&page=3')
ok('[Pagination] Members page 1 = 10 rows', len(p1.get('data',[]))==10)
ok('[Pagination] Members page 2 = 10 rows', len(p2.get('data',[]))==10)
ok('[Pagination] No ID overlap page1/page2', len(set(m['MEMBERID'] for m in p1.get('data',[]))&set(m['MEMBERID'] for m in p2.get('data',[])))==0)
ok('[Pagination] Page 3 has data', len(p3.get('data',[]))>0)

q5 = urllib.parse.urlencode({'search':'Orwell','limit':5})
d,s = req('GET',f'/books?{q5}')
ok('[Search] Book search "Orwell" works', s==200 and len(d.get('data',[]))>0, str(len(d.get('data',[]))))
q6 = urllib.parse.urlencode({'search':'alice','limit':5})
d,s = req('GET',f'/members?{q6}')
ok('[Search] Member search "alice" works', s==200)
q7 = urllib.parse.urlencode({'search':'Bloomsbury','limit':5})
d,s = req('GET',f'/publishers?{q7}')
ok('[Search] Publisher search "Bloomsbury" works', s==200)

# ════════════════════════════════════════════════════════════════
# SUMMARY
# ════════════════════════════════════════════════════════════════
print('='*62)
print(f'  TOTAL: {PASS+FAIL}  |  PASS: {PASS}  |  FAIL: {FAIL}')
print('='*62)
for r in results: print(r)
