import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'banking_system.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

User = get_user_model()

def test_token_creation():
    try:
        user = User.objects.first()
        if not user:
            print("No users found.")
            return

        print(f"User: {user.username}")
        print(f"ID: {user.id}")
        print(f"PK: {user.pk}")
        print(f"Internal structure keys: {list(user.__dict__.keys())}")
        if hasattr(user, '_id'):
            print(f"_id: {user._id}")
            
        token, created = Token.objects.get_or_create(user=user)
        print(f"Success! Token: {token.key}")
        
    except Exception as e:
        print(f"CRASH DETECTED: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_token_creation()
