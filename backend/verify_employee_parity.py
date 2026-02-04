import os
import django
import string
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'banking_system.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from django.contrib.auth import get_user_model
from banking_core.views import ManagerStatsView, UserListView, ClientDetailView

User = get_user_model()
factory = APIRequestFactory()

def get_random_string(length=6):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

def run_tests():
    print("--- EMPLOYEE PARITY VERIFICATION ---")
    
    # 1. Setup Employee
    emp_name = f"emp_ver_{get_random_string()}"
    employee = User.objects.create(username=emp_name, role='EMPLOYEE')
    print(f"[SETUP] Employee: {employee.username}")

    # 2. Test Stats Access (Pass = Employee can see stats)
    print("\n[TEST 1] Employee Stats Access...")
    view_stats = ManagerStatsView.as_view()
    req = factory.get('/api/manager/stats/')
    force_authenticate(req, user=employee)
    res = view_stats(req)
    if res.status_code == 200:
        print(f"[PASS] Stats Accessible. Total Balance: {res.data['total_balance']}")
    else:
        print(f"[FAIL] Stats Denied: {res.status_code}")

    # 3. Test Employee List Access (Pass = Employee can see list)
    print("\n[TEST 2] Employee List Access...")
    view_list = UserListView.as_view()
    req = factory.get('/api/manager/users/?role=EMPLOYEE')
    force_authenticate(req, user=employee)
    res = view_list(req)
    if res.status_code == 200:
        print(f"[PASS] List Accessible. Found {len(res.data)} employees")
    else:
        print(f"[FAIL] List Denied: {res.status_code}")

    # 4. Cleanup
    employee.delete()
    print("--- END VERIFICATION ---")

if __name__ == "__main__":
    run_tests()
