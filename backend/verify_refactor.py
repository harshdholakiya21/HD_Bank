import os
import django
import string
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'banking_system.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from django.contrib.auth import get_user_model
from banking_core.views import ManagerStatsView, UserListView, ClientDetailView, UpdateBalanceView, ManagerCreateClientView

User = get_user_model()
factory = APIRequestFactory()

def get_random_string(length=6):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

def run_tests():
    print("--- REFACTOR VERIFICATION ---")
    
    manager = User.objects.get(username='harsh')
    print(f"[SETUP] Manager: {manager.username}")

    # 1. Test Stats View
    print("\n[TEST 1] Manager Stats View...")
    view_stats = ManagerStatsView.as_view()
    req = factory.get('/api/manager/stats/')
    force_authenticate(req, user=manager)
    res = view_stats(req)
    if res.status_code == 200:
        print(f"[PASS] Total Balance: {res.data['total_balance']}")
    else:
        print(f"[FAIL] Stats failed: {res.status_code}")

    # 2. Test User List (Employees)
    print("\n[TEST 2] Employee List...")
    view_list = UserListView.as_view()
    req = factory.get('/api/manager/users/?role=EMPLOYEE')
    force_authenticate(req, user=manager)
    res = view_list(req)
    if res.status_code == 200:
        print(f"[PASS] Found {len(res.data)} employees")
    else:
        print(f"[FAIL] List failed: {res.status_code}")

    # 3. Create a clean client for testing
    client_name = f"test_cl_{get_random_string()}"
    client_data = {
        'username': client_name, 'email': f'{client_name}@test.com', 
        'phone': '1112223333', 'password': 'pass', 'initial_balance': '500.00'
    }
    User.objects.filter(username=client_name).delete() # Cleanup
    
    view_create = ManagerCreateClientView.as_view()
    req_c = factory.post('/api/manager/create-client/', client_data, format='json')
    force_authenticate(req_c, user=manager)
    res_c = view_create(req_c)
    acc_num = res_c.data['account'] 
    print(f"[SETUP] Created Client: {client_name} with Account {acc_num}")

    # 4. Test Client Detail Search
    print("\n[TEST 3] Client Search...")
    view_detail = ClientDetailView.as_view()
    req = factory.get(f'/api/manager/client-detail/?account_number={acc_num}')
    force_authenticate(req, user=manager)
    res = view_detail(req)
    if res.status_code == 200 and res.data['username'] == client_name:
        print(f"[PASS] Found client: {res.data['username']}")
    else:
        print(f"[FAIL] Search failed: {res.status_code} {res.data}")

    # 5. Test Withdrawal (Validation)
    print("\n[TEST 4] Withdraw Validation (Overdraft)...")
    view_upd = UpdateBalanceView.as_view()
    data = {'account_number': acc_num, 'amount': '1000', 'transaction_type': 'WITHDRAW'} # 500 balance
    req = factory.post('/api/manager/update-balance/', data, format='json')
    force_authenticate(req, user=manager)
    res = view_upd(req)
    if res.status_code == 400:
        print(f"[PASS] Overdraft blocked: {res.data['error']}")
    else:
        print(f"[FAIL] Overdraft allowed?!: {res.status_code}")

    # 6. Test Withdrawal (Success)
    print("\n[TEST 5] Withdraw Success...")
    data = {'account_number': acc_num, 'amount': '100', 'transaction_type': 'WITHDRAW'}
    req = factory.post('/api/manager/update-balance/', data, format='json')
    force_authenticate(req, user=manager)
    res = view_upd(req)
    if res.status_code == 200:
        print(f"[PASS] Withdrawal successful. New Balance: {res.data['new_balance']}")
    else:
        print(f"[FAIL] Withdrawal failed: {res.status_code}")

    print("--- END VERIFICATION ---")

if __name__ == "__main__":
    run_tests()
