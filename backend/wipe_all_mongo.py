import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'banking_system.settings')
django.setup()

def wipe_mongo():
    with connection.cursor() as cursor:
        # Djongo cursor exposes underlying pymongo collection in some versions, or we can use raw sql?
        # Djongo raw SQL for dropping table:
        try:
            print("Dropping django_migrations...")
            cursor.execute("DROP TABLE django_migrations")
        except Exception as e:
            print(f"Error dropping migrations: {e}")
            
        try:
            print("Dropping banking_core_user...")
            cursor.execute("DROP TABLE banking_core_user")
        except Exception as e:
            print(f"Error dropping user table: {e}")

        # Also drop auth_user, authtoken_token just in case
        try:
            cursor.execute("DROP TABLE authtoken_token")
        except: pass

if __name__ == "__main__":
    wipe_mongo()
