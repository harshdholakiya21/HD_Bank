import sys
import traceback

print("DEBUG: Attempting to import djongo...")
try:
    import djongo
    print(f"DEBUG: Successfully imported djongo {djongo.__file__}")
    from djongo import base
    print(f"DEBUG: Successfully imported djongo.base {base.__file__}")
except Exception:
    print("DEBUG: Failed to import djongo!")
    traceback.print_exc()

print("DEBUG: Attempting to setup Django...")
try:
    import os
    import django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'banking_system.settings')
    django.setup()
    print("DEBUG: Django setup successful!")
except Exception:
    print("DEBUG: Django setup failed!")
    traceback.print_exc()
