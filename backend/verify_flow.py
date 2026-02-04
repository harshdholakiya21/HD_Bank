import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'banking_system.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from django.contrib.auth import get_user_model
from banking_core.models import ReferenceID, Account
from banking_core.views import ManagerGenerateRefView, ManagerListRefView, RegisterView, ManagerCreateClientView

User = get_user_model()
factory = APIRequestFactory()

def verify_full_flow():
    print("--- START VERIFICATION ---")
    
    # 1. Setup Users
    manager = User.objects.get(username='harsh')
    print(f"[SETUP] Manager: {manager.username}")

    # 2. Generate Ref ID
    view_gen = ManagerGenerateRefView.as_view()
    req_gen = factory.post('/api/manager/generate-ref/')
    force_authenticate(req_gen, user=manager)
    res_gen = view_gen(req_gen)
    ref_code = res_gen.data['code']
    print(f"[STEP 1] Generated Ref ID: {ref_code}")

    # 3. Check List (Should contain new ID)
    view_list = ManagerListRefView.as_view()
    req_list = factory.get('/api/manager/list-refs/')
    force_authenticate(req_list, user=manager)
    res_list = view_list(req_list)
    
    found = any(r['code'] == ref_code for r in res_list.data)
    if found:
        print("[PASS] Ref ID appears in unused list.")
    else:
        print(f"[FAIL] Ref ID {ref_code} NOT found in list: {res_list.data}")

    # 4. Register Employee with Ref ID
    reg_data = {
        'username': 'new_emp_01',
        'email': 'emp01@test.com',
        'phone': '9998887771',
        'password': 'password123',
        'role': 'EMPLOYEE',
        'ref_id': ref_code
    }
    # Clean up if exists
    User.objects.filter(username='new_emp_01').delete()
    
    view_reg = RegisterView.as_view()
    req_reg = factory.post('/api/auth/register/', reg_data, format='json')
    res_reg = view_reg(req_reg)
    
    if res_reg.status_code == 201:
        print("[STEP 2] Employee Registered successfully.")
    else:
        print(f"[FAIL] Registration failed: {res_reg.data}")

    # 5. Check List (Should NOT contain used ID)
    res_list_after = view_list(req_list)
    found_after = any(r['code'] == ref_code for r in res_list_after.data)
    
    if not found_after:
        print("[PASS] Ref ID removed from unused list.")
    else:
        print("[FAIL] Ref ID still appears in list!")

    # 6. Verify DB State
    ref_obj = ReferenceID.objects.get(code=ref_code)
    if ref_obj.is_used and ref_obj.used_by.username == 'new_emp_01':
        print("[PASS] DB: is_used=True, used_by=new_emp_01")
    else:
        print(f"[FAIL] DB State verification failed: is_used={ref_obj.is_used}, used_by={ref_obj.used_by}")

    # 7. Create Client
    client_data = {
        'username': 'new_client_01',
        'email': 'client01@test.com',
        'phone': '9998887772',
        'password': 'password123',
        'initial_balance': '500.00'
    }
    User.objects.filter(username='new_client_01').delete()
    
    view_create = ManagerCreateClientView.as_view()
    req_create = factory.post('/api/manager/create-client/', client_data, format='json')
    force_authenticate(req_create, user=manager)
    res_create = view_create(req_create)

    if res_create.status_code == 201: # 201 Created logic in views? need to check return status
        # View returns 200 or 201? Let's assume 200/201 is success for now.
        print(f"[PASS] Client Created. Data: {res_create.data}")
    elif res_create.status_code == 200:
         print(f"[PASS] Client Created. Data: {res_create.data}")
    else:
        print(f"[FAIL] Client Creation failed: {res_create.status_code} {res_create.data}")

    print("--- END VERIFICATION ---")

if __name__ == "__main__":
    verify_full_flow()
