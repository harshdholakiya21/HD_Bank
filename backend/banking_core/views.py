from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .serializers import (
    UserSerializer, ReferenceIDSerializer, 
    CreateClientSerializer, AccountSerializer, 
    EmployeeRegisterSerializer, ClientInitActivationSerializer, ClientCompleteActivationSerializer
)
from .models import ReferenceID, Account
import uuid
from django.db import connections
from django.db.utils import OperationalError

class HealthCheckView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            # Ensure connection
            db_conn = connections['default']
            db_conn.cursor()
            return Response({"status": "ok", "db": "connected"}, status=status.HTTP_200_OK)
        except OperationalError:
            return Response({"status": "error", "db": "disconnected"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            return Response({"status": "error", "db": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SafeHealthCheckView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({"status": "alive", "message": "Server is running"}, status=status.HTTP_200_OK)

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = CreateClientSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "Client registered successfully", 
                "username": user.username
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EmployeeRegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = EmployeeRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "Employee registered successfully.", 
                "username": user.username
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ClientInitActivationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ClientInitActivationSerializer(data=request.data)
        if serializer.is_valid():
            # Mock OTP sent
            return Response({
                "message": "OTP sent to registered email and phone.", 
                "mock_otp": "123456"
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ClientCompleteActivationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ClientCompleteActivationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "Activation successful. You can now login.",
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # Deprecated logic or used for Login OTP if implemented later
        return Response({"error": "Use activation endpoints"}, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        
        if user:
            # Check if active (though activation sets it true)
            if not user.is_active:
                 return Response({"error": "User disabled"}, status=status.HTTP_401_UNAUTHORIZED)

            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                "token": token.key,
                "role": user.role,
                "username": user.username
            })
        return Response({"error": "Invalid Credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        

class ManagerGenerateRefView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if not hasattr(request.user, 'role') or request.user.role != 'MANAGER':
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        code = f"REF-{uuid.uuid4().hex[:8].upper()}"
        ref = ReferenceID.objects.create(code=code)
        return Response(ReferenceIDSerializer(ref).data)

class ManagerListRefView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'role') or request.user.role != 'MANAGER':
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        all_refs = ReferenceID.objects.all().order_by('-created_at')
        refs = [ref for ref in all_refs if not ref.is_used]
        return Response(ReferenceIDSerializer(refs, many=True).data)

class ManagerCreateClientView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Allow both MANAGER and EMPLOYEE
        if not hasattr(request.user, 'role') or request.user.role not in ['MANAGER', 'EMPLOYEE']:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = CreateClientSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # User might have multiple accounts now, we want the one just created.
            # CreateClientSerializer create() returns user.
            # But the serializer creates the account.
            # Let's verify how we can get it. 
            # In my serializer I did: Account.objects.create(user=user...)
            # I should probably update serializer to return account, or just fetch the last one.
            # For simplicity let's assume the serializer logic I wrote (Step 195) returned 'user'.
            # I can just fetch the latest account for this user?
            # Or better, update views to return the account number properly.
            # The previous serializer code (Step 195):
            # acc_num = ...; Account.objects.create(..., account_number=acc_num...)
            # But it returns `user`.
            # I'll rely on fetching the *latest* account or similar.
            # Actually, `user.accounts.last()` (if ordered) or `Account.objects.filter(user=user).last()`.
            # Since I just created it, it should be the latest.
            
            try:
                latest_account = Account.objects.filter(user=user).order_by('-id').first() # Verify default ID ordering in Djongo?
                # Djongo ObjectId might order by time? Yes.
                acc_num = latest_account.account_number if latest_account else "UNKNOWN"
            except:
                acc_num = "UNKNOWN"

            return Response({
                "message": "Client created successfully",
                "account": acc_num
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdateClientDetailsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if not hasattr(request.user, 'role') or request.user.role not in ['MANAGER', 'EMPLOYEE']:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        account_number = request.data.get('account_number')
        username = request.data.get('username')
        email = request.data.get('email')
        phone = request.data.get('phone')

        if not account_number:
            return Response({"error": "Account number is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            account = Account.objects.get(account_number=account_number)
            user = account.user
            
            if username: user.username = username
            if email: user.email = email
            if phone: user.phone = phone
            
            user.save()
            
            return Response({
                "message": "Client details updated successfully",
                "username": user.username,
                "email": user.email,
                "phone": user.phone
            })
        except Account.DoesNotExist:
            return Response({"error": "Account not found"}, status=status.HTTP_404_NOT_FOUND)

class ManagerStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'role') or request.user.role not in ['MANAGER', 'EMPLOYEE']:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            accounts = Account.objects.all()
            total_balance = __import__('decimal').Decimal('0.00')
            for acc in accounts:
                try:
                    bal = acc.balance
                    if hasattr(bal, 'to_decimal'): bal = bal.to_decimal()
                    total_balance += bal
                except: continue
            return Response({"total_balance": str(total_balance)})
        except:
             return Response({"total_balance": "0.00"})

class UserListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'role') or request.user.role not in ['MANAGER', 'EMPLOYEE']:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        from django.contrib.auth import get_user_model
        User = get_user_model()
        users = User.objects.all()
        # Serialize simply
        data = []
        for u in users:
             try:
                 # Minimal data needed
                 data.append({"id": str(u.id), "username": u.username, "role": u.role, "email": u.email, "phone": u.phone})
             except: pass
        return Response(data)

class ClientDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'role') or request.user.role not in ['MANAGER', 'EMPLOYEE']:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        account_number = request.query_params.get('account_number')
        if not account_number:
            return Response({"error": "Account number required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            account = Account.objects.get(account_number=account_number)
            bal = account.balance
            if hasattr(bal, 'to_decimal'): bal = bal.to_decimal()
            return Response({
                "username": account.user.username,
                "email": account.user.email,
                "phone": account.user.phone,
                "account_number": account.account_number,
                "balance": str(bal)
            })
        except Account.DoesNotExist:
            return Response({"error": "Account not found"}, status=status.HTTP_404_NOT_FOUND)


class ClientDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'role') or request.user.role != 'CLIENT':
             return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        accounts = request.user.accounts.all()
        account_data = []
        total_balance = __import__('decimal').Decimal('0.00')

        for acc in accounts:
            bal = acc.balance
            if hasattr(bal, 'to_decimal'): bal = bal.to_decimal()
            total_balance += bal
            account_data.append({
                "account_number": acc.account_number,
                "balance": str(bal)
            })
                
        return Response({
            "username": request.user.username,
            "accounts": account_data,
            "total_balance": str(total_balance)
        })

class UpdateBalanceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if not hasattr(request.user, 'role') or request.user.role not in ['MANAGER', 'EMPLOYEE']:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        account_number = request.data.get('account_number')
        transaction_type = request.data.get('transaction_type', 'DEPOSIT').upper() # DEPOSIT or WITHDRAW
        
        try:
            amount = float(request.data.get('amount'))
            if amount <= 0:
                 return Response({"error": "Amount must be positive"}, status=status.HTTP_400_BAD_REQUEST)
        except (ValueError, TypeError):
             return Response({"error": "Invalid amount"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            account = Account.objects.get(account_number=account_number)
            
            # Handle MongoDB Decimal128
            current_balance = account.balance
            if hasattr(current_balance, 'to_decimal'):
                 current_balance = current_balance.to_decimal()
            
            amount_decimal = __import__('decimal').Decimal(amount)

            if transaction_type == 'WITHDRAW':
                if current_balance < amount_decimal:
                    return Response({"error": "Insufficient funds"}, status=status.HTTP_400_BAD_REQUEST)
                account.balance = current_balance - amount_decimal
            else: # DEPOSIT
                account.balance = current_balance + amount_decimal
                
            account.save()
            return Response({
                "message": f"{transaction_type} successful",
                "new_balance": str(account.balance)
            })
        except Account.DoesNotExist:
            return Response({"error": "Account not found"}, status=status.HTTP_404_NOT_FOUND)
