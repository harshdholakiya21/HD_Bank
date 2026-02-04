import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'banking_system.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory, force_authenticate
from banking_core.views import ManagerGenerateRefView, ManagerCreateClientView

User = get_user_model()
factory = APIRequestFactory()

def verify_harsh():
    try:
        harsh = User.objects.get(username='harsh')
        print(f"User: {harsh.username}, Role: {harsh.role}")
        
        # Test Generate Ref
        view = ManagerGenerateRefView.as_view()
        request = factory.post('/api/manager/generate-ref/')
        force_authenticate(request, user=harsh)
        response = view(request)
        
        if response.status_code == 200:
            print("[PASS] 'harsh' can generate Ref ID")
        else:
            print(f"[FAIL] 'harsh' cannot generate Ref ID. Status: {response.status_code}, Body: {response.data}")

        # Test Create Client - Mock data
        client_data = {
            'username': 'test_client_h',
            'email': 'h@test.com',
            'password': 'password123',
            'phone': '9999999999'
        }
        view_client = ManagerCreateClientView.as_view()
        request_client = factory.post('/api/manager/create-client/', client_data, format='json')
        force_authenticate(request_client, user=harsh)
        response_client = view_client(request_client)

        if response_client.status_code == 200:
            print(f"[PASS] 'harsh' can create client. Account: {response_client.data.get('account')}")
        else:
            print(f"[FAIL] 'harsh' cannot create client. Status: {response_client.status_code}, Body: {response_client.data}")

    except User.DoesNotExist:
        print("User 'harsh' not found!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    verify_harsh()
