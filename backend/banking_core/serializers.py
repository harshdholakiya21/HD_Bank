from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ReferenceID, Account

User = get_user_model()


class ReferenceIDSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    class Meta:
        model = ReferenceID
        fields = '__all__'

class AccountSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    class Meta:
        model = Account
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    accounts = AccountSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'role', 'accounts']

class CreateClientSerializer(serializers.ModelSerializer):
    initial_balance = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'phone', 'initial_balance']
        extra_kwargs = {
            'phone': {'validators': []},
            'username': {'validators': []},
            'email': {'validators': []}
        }

    def create(self, validated_data):
        initial_balance = validated_data.pop('initial_balance', 0)
        phone = validated_data.get('phone')
        
        # Check if user exists
        try:
            user = User.objects.get(phone=phone)
            # Update email if provided and different? Optional. For now, keep existing user details.
            if 'email' in validated_data and not user.email:
                user.email = validated_data['email']
                user.save()
        except User.DoesNotExist:
            user = User(**validated_data)
            user.set_unusable_password() 
            user.role = 'CLIENT'
            user.is_active = True 
            user.save()

        # Generate Account Number
        import random
        acc_num = f"HD{random.randint(10000000, 99999999)}"
        Account.objects.create(user=user, account_number=acc_num, balance=initial_balance)
        
        return user

class EmployeeRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    ref_id = serializers.CharField(write_only=True)
    otp_channel = serializers.ChoiceField(choices=['email', 'phone'], default='email', write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'phone', 'password', 'confirm_password', 'ref_id', 'otp_channel']

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
            
        ref_id = data.get('ref_id')
        try:
            ref = ReferenceID.objects.get(code=ref_id)
            if ref.is_used:
                raise serializers.ValidationError({"ref_id": "Reference ID already used."})
        except ReferenceID.DoesNotExist:
            raise serializers.ValidationError({"ref_id": "Invalid Reference ID."})
        data['ref_obj'] = ref
        return data

    def create(self, validated_data):
        ref_obj = validated_data.pop('ref_obj')
        ref_id = validated_data.pop('ref_id')
        password = validated_data.pop('password')
        validated_data.pop('confirm_password') # remove confirm
        otp_channel = validated_data.pop('otp_channel') # unused here but passed to view if needed, or just consumed
        
        user = User(**validated_data)
        user.set_password(password)
        user.role = 'EMPLOYEE'
        user.is_active = False # Inactive until OTP verified
        user.save()

        ref_obj.is_used = True
        ref_obj.used_by = user
        ref_obj.save()
        
        return user

class ClientInitActivationSerializer(serializers.Serializer):
    account_number = serializers.CharField()
    email = serializers.EmailField()
    phone = serializers.CharField()

    def validate(self, data):
        try:
            account = Account.objects.get(account_number=data['account_number'])
            user = account.user
            
            # Strict matching
            if user.phone != data['phone']:
                raise serializers.ValidationError({"detail": "Phone number does not match account records."})
            if user.email != data['email']:
                raise serializers.ValidationError({"detail": "Email does not match account records."})
                
            data['user'] = user
        except Account.DoesNotExist:
             raise serializers.ValidationError({"detail": "Invalid account details."})
        return data

class ClientCompleteActivationSerializer(serializers.Serializer):
    account_number = serializers.CharField()
    otp = serializers.CharField()
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        # OTP validation mock
        if data['otp'] != "123456":
             raise serializers.ValidationError({"otp": "Invalid OTP."})
             
        try:
            account = Account.objects.get(account_number=data['account_number'])
            data['user'] = account.user
        except Account.DoesNotExist:
            raise serializers.ValidationError({"detail": "Account not found."})
            
        return data
    
    def save(self):
        user = self.validated_data['user']
        user.set_password(self.validated_data['password'])
        user.save()
        return user
