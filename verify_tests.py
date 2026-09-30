"""
Targeted verification of the 4 suspected-test-bug failures.
"""
import urllib.request, urllib.error, urllib.parse, json

BASE = 'http://localhost:5000/api'

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

print("=== TEST 1: Search /books with space (URL encoded) ===")
q = urllib.parse.urlencode({'search': 'Harry Potter', 'limit': 10})
d, s = req('GET', f'/books?{q}')
print(f"Status: {s}, Rows: {len(d.get('data',[]))}, Sample: {[b.get('TITLE') for b in d.get('data',[])[:2]]}")

print("\n=== TEST 2: Search /authors by name ===")
q2 = urllib.parse.urlencode({'search': 'King', 'limit': 10})
d2, s2 = req('GET', f'/authors?{q2}')
print(f"Status: {s2}, Rows: {len(d2.get('data',[]))}, Sample: {[a.get('AUTHORNAME') for a in d2.get('data',[])[:3]]}")

print("\n=== TEST 3: GET /reservations ===")
d3, s3 = req('GET', '/reservations?limit=10')
print(f"Status: {s3}, Rows: {len(d3.get('data',[]))}")

print("\n=== TEST 4: POST /book-copies with unique ACCESSIONNO ===")
d_b, _ = req('GET', '/books?limit=1')
d_br, _ = req('GET', '/library-branches?limit=1')
d_l, _ = req('GET', '/book-locations?limit=1')
bid = d_b['data'][0]['BOOKID']
brid = d_br['data'][0]['BRANCHID']
lid = d_l['data'][0]['LOCATIONID']
import time
acc = f'TEST-COPY-{int(time.time())}'
d4, s4 = req('POST', '/book-copies', {'BOOKID': bid, 'BRANCHID': brid, 'LOCATIONID': lid, 'STATUS': 'Available', 'ACCESSIONNO': acc})
print(f"Status: {s4}, Result: {d4}")

print("\n=== TEST 5: Loan+Trigger end-to-end ===")
# Find available copy
d_copies, _ = req('GET', '/book-copies?limit=200')
avail = next((c for c in d_copies.get('data',[]) if c.get('STATUS') == 'Available'), None)
d_mem, _ = req('GET', '/members?limit=1')
d_lib, _ = req('GET', '/librarians?limit=1')
if avail and d_mem.get('data') and d_lib.get('data'):
    cid = avail['COPYID']
    mid = d_mem['data'][0]['MEMBERID']
    lid2 = d_lib['data'][0]['LIBRARIANID']
    import datetime
    today = datetime.date.today().isoformat()
    due   = (datetime.date.today() + datetime.timedelta(days=14)).isoformat()
    d5, s5 = req('POST', '/loans', {'COPYID': cid, 'MEMBERID': mid, 'LIBRARIANID': lid2,
                                     'ISSUEDATE': today, 'DUEDATE': due, 'STATUS': 'Active'})
    print(f"Loan created: {s5} | {d5}")
    # Check copy status (trigger)
    d_c2, _ = req('GET', f'/book-copies/{cid}')
    print(f"Copy status after loan: {d_c2.get('data',{}).get('STATUS')}")

print("\n=== TEST 6: Payment -> Fine trigger ===")
d_fines, _ = req('GET', '/fines?limit=100')
unpaid = next((f for f in d_fines.get('data',[]) if f.get('FINESTATUS') == 'Unpaid'), None)
if unpaid:
    import datetime
    d6, s6 = req('POST', '/payments', {
        'FINEID': unpaid['FINEID'], 'MEMBERID': unpaid['MEMBERID'],
        'AMOUNT': unpaid['FINEAMOUNT'],
        'PAYMENTDATE': datetime.date.today().isoformat(),
        'PAYMENTMODE': 'Cash'
    })
    print(f"Payment created: {s6} | {d6}")
    d_f2, _ = req('GET', f'/fines/{unpaid["FINEID"]}')
    print(f"Fine status after payment: {d_f2.get('data',{}).get('FINESTATUS')}")

print("\n=== TEST 7: Dashboard numbers vs Oracle counts ===")
d7, _ = req('GET', '/dashboard/stats')
stats = d7.get('data', {})
print(f"totalBooks={stats.get('totalBooks')} totalMembers={stats.get('totalMembers')}")
print(f"activeLoans={stats.get('activeLoans')} overdueLoans={stats.get('overdueLoans')}")
print(f"availableCopies={stats.get('availableCopies')} issuedCopies={stats.get('issuedCopies')}")
print(f"outstandingFines={stats.get('outstandingFines')} activeReservations={stats.get('activeReservations')}")
print(f"totalAuthors={stats.get('totalAuthors')} totalPublishers={stats.get('totalPublishers')} totalBranches={stats.get('totalBranches')}")
