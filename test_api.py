import json
import os
import urllib.error
import urllib.request


base_url = os.environ.get('LIBRARY_API_URL', 'http://localhost:8000').rstrip('/')
api_url = f'{base_url}/api'
collection_routes = [
    'authors', 'books', 'book-copies', 'book-locations', 'categories',
    'fines', 'librarians', 'library-branches', 'loans', 'members',
    'payments', 'publishers', 'reservations', 'suppliers', 'written-by',
]
dashboard_routes = [
    'dashboard/stats', 'dashboard/recent-loans',
    'dashboard/recent-reservations', 'dashboard/recent-books',
    'dashboard/overdue-loans',
]


def get_json(path):
    request = urllib.request.Request(f'{api_url}/{path}')
    with urllib.request.urlopen(request, timeout=15) as response:
        return response.status, json.loads(response.read())


def check_health(path):
    status, data = get_json(path)
    if status != 200 or data.get('status') != 'ok' or data.get('database') != 'connected':
        raise AssertionError(f'{path} did not report a healthy database: {data}')
    print(f'[OK] /api/{path}: database connected')


def check_collection(path):
    status, data = get_json(f'{path}?limit=2')
    rows = data.get('data')
    if status != 200 or data.get('success') is not True or not isinstance(rows, list):
        raise AssertionError(f'{path} returned an invalid collection response: {data}')
    if not rows:
        raise AssertionError(f'{path} returned no rows; expected imported production data')
    print(f'[OK] /api/{path}: {len(rows)} rows returned')


def main():
    failures = []
    for path in ['health', 'status']:
        try:
            check_health(path)
        except (AssertionError, OSError, urllib.error.URLError, json.JSONDecodeError) as error:
            failures.append((path, error))

    for path in dashboard_routes:
        try:
            status, data = get_json(path)
            if status != 200 or data.get('success') is not True:
                raise AssertionError(f'HTTP {status}: {data}')
            rows = data.get('data')
            if path == 'dashboard/stats':
                if not isinstance(rows, dict) or rows.get('totalBooks', 0) <= 0 or rows.get('totalMembers', 0) <= 0:
                    raise AssertionError(f'Dashboard stats do not show imported books and members: {rows}')
            elif not isinstance(rows, list):
                raise AssertionError(f'Expected a list response: {data}')
            print(f'[OK] /api/{path}: real data returned')
        except (AssertionError, OSError, urllib.error.URLError, json.JSONDecodeError) as error:
            failures.append((path, error))

    for path in collection_routes:
        try:
            check_collection(path)
        except (AssertionError, OSError, urllib.error.URLError, json.JSONDecodeError) as error:
            failures.append((path, error))

    if failures:
        for path, error in failures:
            print(f'[FAIL] /api/{path}: {error}')
        raise SystemExit(f'{len(failures)} endpoint check(s) failed against {base_url}')
    print(f'All {2 + len(dashboard_routes) + len(collection_routes)} read-only API checks passed: {base_url}')


if __name__ == '__main__':
    main()
