import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'banking_system.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

try:
    user = User.objects.get(username='harsh')
    user.role = 'MANAGER'
    user.save()
    print(f"Successfully updated role for {user.username} to {user.role}")
except User.DoesNotExist:
    print("User 'harsh' not found")
