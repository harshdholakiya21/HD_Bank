from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .serializers import (
    RegisterSerializer, UserSerializer, ReferenceIDSerializer, 
    CreateClientSerializer, AccountSerializer
)
from .models import ReferenceID, Account
import uuid

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Generate Mock OTP
            otp = "123456" 
            return Response({
                "message": "User registered successfully. OTP sent.", 
                "username": user.username,
                "mock_otp": otp
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        otp = request.data.get('otp')
        
        if otp == "123456": # Validate OTP
            from django.contrib.auth import get_user_model
            User = get_user_model()
            try:
                user = User.objects.get(username=username)
                user.is_active = True
                user.save()
                token, _ = Token.objects.get_or_create(user=user)
                return Response({
                    "message": "Verification Successful", 
                    "token": token.key,
                    "role": user.role
                })
            except User.DoesNotExist:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        
        if user:
            if not user.is_active:
                return Response({"error": "User not verified"}, status=status.HTTP_401_UNAUTHORIZED)
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
            return Response({
                "message": "Client created successfully",
                "account": user.account.account_number
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
            # Manual summation for MongoDB Decimal128 support
            accounts = Account.objects.all()
            total_balance = __import__('decimal').Decimal('0.00')
            
            for acc in accounts:
                try:
                    bal = acc.balance
                    if hasattr(bal, 'to_decimal'):
                        bal = bal.to_decimal()
                    total_balance += bal
                except Exception:
                    continue # Skip corrupt accounts
                
            return Response({"total_balance": str(total_balance)})
        except Exception as e:
            print(f"Stats Error: {e}")
            return Response({"total_balance": "0.00"})

class UserListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'role') or request.user.role not in ['MANAGER', 'EMPLOYEE']:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            role = request.query_params.get('role')
            if role:
                users = User.objects.filter(role=role)
            else:
                 users = User.objects.all()
            
            # Helper to safely serialize
            data = []
            for u in users:
                try:
                    data.append(UserSerializer(u).data)
                except:
                    pass
            return Response(data)
        except Exception as e:
             print(f"UserList Error: {e}")
             return Response([])

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
            balance = account.balance
            if hasattr(balance, 'to_decimal'):
                 balance = balance.to_decimal()
            
            return Response({
                "username": account.user.username,
                "email": account.user.email,
                "phone": account.user.phone,
                "account_number": account.account_number,
                "balance": str(balance)
            })
        except Account.DoesNotExist:
            return Response({"error": "Account not found"}, status=status.HTTP_404_NOT_FOUND)

class ClientDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'role') or request.user.role != 'CLIENT':
             return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            account = request.user.account
             # Handle MongoDB Decimal128
            balance = account.balance
            if hasattr(balance, 'to_decimal'):
                balance = balance.to_decimal()
                
            return Response({
                "username": request.user.username,
                "account_number": account.account_number,
                "balance": str(balance)
            })
        except Account.DoesNotExist:
            return Response({"error": "No account found"}, status=status.HTTP_404_NOT_FOUND)

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
