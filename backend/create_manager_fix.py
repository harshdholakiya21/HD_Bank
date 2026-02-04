import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'banking_system.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def create_manager():
    username = 'harsh'
    if not User.objects.filter(username=username).exists():
        print(f"Creating manager user: {username}")
        User.objects.create_user(
            username=username,
            email='harsh@test.com',
            password='password123',
            role='MANAGER'
        )
        print("Manager user created successfully.")
    else:
        print(f"Manager user {username} already exists.")

if __name__ == "__main__":
    create_manager()
