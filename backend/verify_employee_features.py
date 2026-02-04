import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'banking_system.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from django.contrib.auth import get_user_model
from banking_core.views import ManagerCreateClientView, UpdateClientDetailsView, UpdateBalanceView

User = get_user_model()
factory = APIRequestFactory()

def run_tests():
    print("--- VERIFICATION TESTS ---")
    
    # 1. Setup Users
    manager = User.objects.get(username='harsh')
    
    # Ensure Employee Exists
    employee, _ = User.objects.get_or_create(username='test_emp_v2', defaults={
        'role': 'EMPLOYEE', 'email': 'emp_v2@test.com'
    })
    print(f"[SETUP] Employee: {employee.username}")

    # 2. Test: Employee Create Client
    print("\n[TEST 1] Employee attempting to Create Client...")
    view_create = ManagerCreateClientView.as_view()
    data_create = {
        'username': 'test_client_new', 'email': 'new@test.com', 
        'phone': '5556667777', 'password': 'pass', 'initial_balance': '2000'
    }
    User.objects.filter(username='test_client_new').delete() # Clean up
    
    req = factory.post('/api/manager/create-client/', data_create, format='json')
    force_authenticate(req, user=employee)
    res = view_create(req)
    
    if res.status_code == 201:
        print(f"[PASS] Employee Created Client. Account: {res.data['account']}")
        acc_number = res.data['account']
    else:
        print(f"[FAIL] Employee Failed Create Client: {res.status_code} {res.data}")
        return

    # 3. Test: Employee Update Client Details
    print("\n[TEST 2] Employee attempting to Update Client Details...")
    view_update = UpdateClientDetailsView.as_view()
    data_update = {
        'account_number': acc_number,
        'email': 'updated_email@test.com'
    }
    
    req_upd = factory.post('/api/manager/update-client-details/', data_update, format='json')
    force_authenticate(req_upd, user=employee)
    res_upd = view_update(req_upd)
    
    if res_upd.status_code == 200 and res_upd.data['email'] == 'updated_email@test.com':
        print(f"[PASS] Employee Updated Client Details: {res_upd.data}")
    else:
        print(f"[FAIL] Employee Update Failed: {res_upd.status_code} {res_upd.data}")

    # 4. Test: Manager Update Client Details (Regression Check)
    print("\n[TEST 3] Manager attempting to Update Client Details...")
    data_update_m = {
        'account_number': acc_number,
        'phone': '1231231234'
    }
    req_upd_m = factory.post('/api/manager/update-client-details/', data_update_m, format='json')
    force_authenticate(req_upd_m, user=manager)
    res_upd_m = view_update(req_upd_m)
    
    if res_upd_m.status_code == 200 and res_upd_m.data['phone'] == '1231231234':
         print(f"[PASS] Manager Updated Client Details: {res_upd_m.data}")
    else:
         print(f"[FAIL] Manager Update Failed: {res_upd_m.status_code} {res_upd_m.data}")

    print("--- END VERIFICATION ---")

if __name__ == "__main__":
    run_tests()
