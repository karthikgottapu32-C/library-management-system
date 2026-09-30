import urllib.request, json

tests = [
    ('GET /api/health', 'http://localhost:8000/api/health'),
    ('GET /api/dashboard/stats', 'http://localhost:8000/api/dashboard/stats'),
    ('GET /api/books', 'http://localhost:8000/api/books?limit=2'),
    ('GET /api/members', 'http://localhost:8000/api/members?limit=2'),
    ('GET /api/authors', 'http://localhost:8000/api/authors?limit=2'),
    ('GET /api/loans', 'http://localhost:8000/api/loans?limit=2'),
    ('GET /api/fines', 'http://localhost:8000/api/fines?limit=2'),
    ('GET /api/payments', 'http://localhost:8000/api/payments?limit=2'),
    ('GET /api/librarians', 'http://localhost:8000/api/librarians?limit=2'),
    ('GET /api/book-copies', 'http://localhost:8000/api/book-copies?limit=2'),
    ('GET /api/suppliers', 'http://localhost:8000/api/suppliers?limit=2'),
    ('GET /api/written-by', 'http://localhost:8000/api/written-by?limit=2'),
]

for name, url in tests:
    try:
        r = urllib.request.urlopen(url, timeout=5)
        d = json.loads(r.read())
        ok = d.get('success', False)
        data = d.get('data', [])
        rows = len(data) if isinstance(data, list) else 'dict'
        status = 'OK' if ok else 'ERR'
        print('[' + status + '] ' + name + ' -> ' + str(rows) + ' rows')
    except Exception as e:
        print('[FAIL] ' + name + ' -> ' + str(e))
