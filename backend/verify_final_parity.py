import os
import django
import string
import random
import uuid

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'banking_system.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from django.contrib.auth import get_user_model
from banking_core.views import ManagerStatsView, UserListView, ManagerCreateClientView

User = get_user_model()
factory = APIRequestFactory()

def get_unique_str():
    return uuid.uuid4().hex[:8]

def run_tests():
    print("--- EMPLOYEE PARITY & CREATE CLIENT VERIFICATION ---")
    
    # 1. Setup Unique Employee
    emp_username = f"emp_{get_unique_str()}"
    employee = User.objects.create(username=emp_username, role='EMPLOYEE')
    print(f"[SETUP] Employee: {employee.username}")

    try:
        # 2. Test Stats Access (Employee)
        print("\n[TEST 1] Employee Stats Access...")
        view_stats = ManagerStatsView.as_view()
        req = factory.get('/api/manager/stats/')
        force_authenticate(req, user=employee)
        res = view_stats(req)
        if res.status_code == 200:
            print(f"[PASS] Stats Accessible. Total Balance: {res.data['total_balance']}")
        else:
            print(f"[FAIL] Stats Denied: {res.status_code}")

        # 3. Test Employee List Access (Employee)
        print("\n[TEST 2] Employee List Access...")
        view_list = UserListView.as_view()
        req = factory.get('/api/manager/users/?role=EMPLOYEE')
        force_authenticate(req, user=employee)
        res = view_list(req)
        if res.status_code == 200:
            print(f"[PASS] List Accessible. Found {len(res.data)} employees")
        else:
            print(f"[FAIL] List Denied: {res.status_code}")

        # 4. Test Create Client (Employee)
        print("\n[TEST 3] Employee Create Client...")
        view_create = ManagerCreateClientView.as_view()
        client_user = f"cl_{get_unique_str()}"
        data = {
            'username': client_user, 
            'email': f'{client_user}@test.com', 
            'phone': '9998887777', 
            'password': 'password123', 
            'initial_balance': '1000'
        }
        req = factory.post('/api/manager/create-client/', data, format='json')
        force_authenticate(req, user=employee)
        res = view_create(req)
        if res.status_code == 201:
            print(f"[PASS] Employee Created Client: {res.data['account']}")
        else:
            print(f"[FAIL] Create Client Failed: {res.status_code} {res.data}")

    finally:
        # Cleanup
        employee.delete()
        print("\n--- END VERIFICATION ---")

if __name__ == "__main__":
    run_tests()
