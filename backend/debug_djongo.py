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
    sys.exit(1) # Fail the build so we see this error
