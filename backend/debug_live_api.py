import requests
import sys

BASE_URL = "http://127.0.0.1:8000/api"

def test_employee_access(username, password):
    print(f"Testing access for user: {username}")
    
    # 1. Login
    try:
        resp = requests.post(f"{BASE_URL}/auth/login/", json={'username': username, 'password': password}, timeout=5)
    except Exception as e:
        print(f"Connection failed: {e}")
        return

    if resp.status_code != 200:
        print(f"Login Failed: {resp.status_code} {resp.text}")
        return

    data = resp.json()
    token = data.get('token')
    role = data.get('role')
    print(f"Login Success. Token: {token[:10]}... Role: {role}")

    if role != 'EMPLOYEE':
        print("WARNING: User is not an EMPLOYEE")

    headers = {'Authorization': f'Token {token}'}

    # 2. Test Stats
    print("\n[TEST] Manager Stats (Total Balance)")
    resp = requests.get(f"{BASE_URL}/manager/stats/", headers=headers, timeout=5)
    print(f"Status: {resp.status_code} Body: {resp.text}")

    # 3. Test Employee List
    print("\n[TEST] Employee List")
    resp = requests.get(f"{BASE_URL}/manager/users/?role=EMPLOYEE", headers=headers, timeout=5)
    print(f"Status: {resp.status_code} Body: {resp.text[:100]}...")

    # 4. Test Client Detail (Known working according to user)
    # Need a valid account number. Let's try to search for something random or list clients first?
    # We can't list clients easily without a new view, but UserListView without role gets all?
    # UserListView code: if role: filter. else: all.
    print("\n[TEST] All Users List (checking if allowed)")
    resp = requests.get(f"{BASE_URL}/manager/users/", headers=headers, timeout=5)
    print(f"Status: {resp.status_code} Body: {resp.text[:100]}...")

if __name__ == "__main__":
    # Use a known employee from the previous step if possible, or try 'empolyee' / 'password123' (guess)
    # The previous step showed 'empolyee' exists. I'll guess the password or create a new one.
    # Actually, verify_final_parity created 'emp_...' but deleted it.
    # 'empolyee' user exists. I don't know the password.
    # I will CREATE a new employee using the shell first to ensure I know the credentials.
    username = sys.argv[1] if len(sys.argv) > 1 else "debug_emp"
    password = "password123"
    test_employee_access(username, password)
