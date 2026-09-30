import urllib.request, json, urllib.error

BASE = 'http://localhost:5000/api'

def req(method, path, body=None):
    url = BASE + path
    data = json.dumps(body).encode() if body else None
    r = urllib.request.Request(url, data=data, method=method,
        headers={'Content-Type':'application/json'} if body else {})
    try:
        resp = urllib.request.urlopen(r, timeout=5)
        return json.loads(resp.read()), resp.status
    except urllib.error.HTTPError as e:
        return json.loads(e.read()), e.code

# POST - create book
d, s = req('POST', '/books', {'TITLE': 'API Test Book', 'CATEGORYID': 1, 'PUBLISHERID': 1, 'PRICE': 25})
print('CREATE book:', s, d)

# GET to find our book
d2, _ = req('GET', '/books?search=API Test Book')
if d2.get('data'):
    bid = d2['data'][0]['BOOKID']
    print('Found BookID:', bid)

    # PUT - update
    d3, s3 = req('PUT', '/books/' + str(bid), {'TITLE': 'API Test Book Updated', 'CATEGORYID': 1, 'PUBLISHERID': 1})
    print('UPDATE book:', s3, d3)

    # DELETE
    d4, s4 = req('DELETE', '/books/' + str(bid))
    print('DELETE book:', s4, d4)
else:
    print('Could not find created book')

# Test Member create
d5, s5 = req('POST', '/members', {'MEMBERNAME': 'Test Member', 'EMAIL': 'testmember@example.com', 'MEMBERTYPE': 'Regular'})
print('CREATE member:', s5, d5)

# Test Author create  
d6, s6 = req('POST', '/authors', {'AUTHORNAME': 'Test Author', 'NATIONALITY': 'India'})
print('CREATE author:', s6, d6)
