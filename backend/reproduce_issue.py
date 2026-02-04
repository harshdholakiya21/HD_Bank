import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'banking_system.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from django.contrib.auth import get_user_model
from banking_core.views import ManagerCreateClientView, UpdateBalanceView

User = get_user_model()
factory = APIRequestFactory()

def run_tests():
    print("--- REPRODUCTION TESTS ---")
    
    # Setup Users
    manager = User.objects.filter(username='harsh').first()
    if not manager:
        print("[ERROR] Manager 'harsh' not found. Run previous fix first.")
        return

    # Create dummy employee for testing
    employee, _ = User.objects.get_or_create(username='test_emp', defaults={
        'role': 'EMPLOYEE', 'email': 'emp@test.com'
    })
    
    # Test 1: Manager Create Client
    print("\n[TEST 1] Manager attempting to Create Client...")
    view = ManagerCreateClientView.as_view()
    data = {
        'username': 'test_client_m', 'email': 'tm@test.com', 
        'phone': '1112223333', 'password': 'pass', 'initial_balance': '1000'
    }
    User.objects.filter(username='test_client_m').delete()
    
    req = factory.post('/api/manager/create-client/', data, format='json')
    force_authenticate(req, user=manager)
    res = view(req)
    if res.status_code == 201:
        print(f"[PASS] Manager Created Client: {res.status_code}")
    else:
        print(f"[FAIL] Manager Failed to Create Client: {res.status_code} {res.data}")

    # Test 2: Employee Create Client
    print("\n[TEST 2] Employee attempting to Create Client...")
    data_e = {
        'username': 'test_client_e', 'email': 'te@test.com', 
        'phone': '4445556666', 'password': 'pass', 'initial_balance': '1000'
    }
    User.objects.filter(username='test_client_e').delete()
    
    req = factory.post('/api/manager/create-client/', data_e, format='json')
    force_authenticate(req, user=employee)
    res = view(req)
    if res.status_code == 201:
        print(f"[PASS] Employee Created Client: {res.status_code}")
    else:
        print(f"[FAIL] Employee Failed to Create Client (Expected if restricted): {res.status_code} {res.data}")

    # Test 3: Employee Update Balance
    print("\n[TEST 3] Employee attempting to Update Balance...")
    # Need a client account first
    client = User.objects.filter(username='test_client_m').first()
    if client and hasattr(client, 'account'):
        acc_num = client.account.account_number
        view_bal = UpdateBalanceView.as_view()
        data_bal = {'account_number': acc_num, 'amount': '500'}
        
        req = factory.post('/api/manager/update-balance/', data_bal, format='json')
        force_authenticate(req, user=employee)
        res = view_bal(req)
        
        if res.status_code == 200:
             print(f"[PASS] Employee Updated Balance: {res.data}")
        else:
             print(f"[FAIL] Employee Failed Update Balance: {res.status_code} {res.data}")
    else:
        print("[SKIP] Test 3 skipped (No client/account generated in Test 1)")

    print("--- END TESTS ---")

if __name__ == "__main__":
    run_tests()
