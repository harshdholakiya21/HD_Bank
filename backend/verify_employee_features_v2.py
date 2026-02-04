import os
import django
import random
import string

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'banking_system.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from django.contrib.auth import get_user_model
from banking_core.views import ManagerCreateClientView, UpdateClientDetailsView, UpdateBalanceView

User = get_user_model()
factory = APIRequestFactory()

def get_random_string(length=6):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

def run_tests():
    print("--- VERIFICATION TESTS ---")
    
    # 1. Setup Manager
    try:
        manager = User.objects.get(username='harsh')
    except User.DoesNotExist:
        print("Manager 'harsh' missing.")
        return

    # 2. Setup Employee (Unique)
    emp_username = f"emp_{get_random_string()}"
    employee = User.objects.create(
        username=emp_username, 
        email=f'{emp_username}@test.com',
        role='EMPLOYEE'
    )
    employee.set_password('password123')
    employee.save()
    print(f"[SETUP] Employee created: {emp_username}")

    # 3. Test: Employee Create Client
    print("\n[TEST 1] Employee attempting to Create Client...")
    view_create = ManagerCreateClientView.as_view()
    client_username = f"client_{get_random_string()}"
    data_create = {
        'username': client_username, 
        'email': f'{client_username}@test.com', 
        'phone': '5556667777', 
        'password': 'pass', 
        'initial_balance': '2000'
    }
    
    req = factory.post('/api/manager/create-client/', data_create, format='json')
    force_authenticate(req, user=employee)
    res = view_create(req)
    
    if res.status_code == 201:
        print(f"[PASS] Employee Created Client. Account: {res.data['account']}")
        acc_number = res.data['account']
    else:
        print(f"[FAIL] Employee Failed Create Client: {res.status_code} {res.data}")
        return

    # 4. Test: Employee Update Client Details
    print("\n[TEST 2] Employee attempting to Update Client Details...")
    view_update = UpdateClientDetailsView.as_view()
    new_email = f'updated_{get_random_string()}@test.com'
    data_update = {
        'account_number': acc_number,
        'email': new_email
    }
    
    req_upd = factory.post('/api/manager/update-client-details/', data_update, format='json')
    force_authenticate(req_upd, user=employee)
    res_upd = view_update(req_upd)
    
    if res_upd.status_code == 200 and res_upd.data['email'] == new_email:
        print(f"[PASS] Employee Updated Client Details: {res_upd.data}")
    else:
        print(f"[FAIL] Employee Update Failed: {res_upd.status_code} {res_upd.data}")

    # 5. Cleanup
    employee.delete()
    print("[CLEANUP] Done.")

    print("--- END VERIFICATION ---")

if __name__ == "__main__":
    run_tests()
