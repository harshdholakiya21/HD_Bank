from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ReferenceID, Account

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    account_number = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'role', 'account_number']

    def get_account_number(self, obj):
        if hasattr(obj, 'account'):
            return obj.account.account_number
        return None

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    ref_id = serializers.CharField(required=False, write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'phone', 'password', 'role', 'ref_id']

    def validate(self, data):
        role = data.get('role', 'CLIENT')
        if role == 'EMPLOYEE':
            ref_id = data.get('ref_id')
            if not ref_id:
                raise serializers.ValidationError({"ref_id": "Reference ID is required for Employees."})
            try:
                ref = ReferenceID.objects.get(code=ref_id)
                if ref.is_used:
                    raise serializers.ValidationError({"ref_id": "Reference ID already used."})
            except ReferenceID.DoesNotExist:
                raise serializers.ValidationError({"ref_id": "Invalid or used Reference ID."})
            data['ref_obj'] = ref
        return data

    def create(self, validated_data):
        ref_obj = validated_data.pop('ref_obj', None)
        ref_id = validated_data.pop('ref_id', None)
        password = validated_data.pop('password')
        
        user = User(**validated_data)
        user.set_password(password)
        user.is_active = False # Require OTP
        user.save()

        if ref_obj:
            ref_obj.is_used = True
            ref_obj.used_by = user
            ref_obj.save()
        
        return user

class ReferenceIDSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    class Meta:
        model = ReferenceID
        fields = '__all__'

class AccountSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    user = UserSerializer(read_only=True)
    class Meta:
        model = Account
        fields = '__all__'

class CreateClientSerializer(serializers.ModelSerializer):
    initial_balance = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'phone', 'initial_balance']

    def create(self, validated_data):
        initial_balance = validated_data.pop('initial_balance', 0)
        
        user = User(**validated_data)
        user.set_unusable_password() # Password set by client later
        user.role = 'CLIENT'
        user.is_active = True 
        user.save()

        # Generate Account Number (mock)
        import random
        acc_num = f"HD{random.randint(10000000, 99999999)}"
        Account.objects.create(user=user, account_number=acc_num, balance=initial_balance)
        
        return user

class ClientRegistrationSerializer(serializers.Serializer):
    account_number = serializers.CharField()
    phone = serializers.CharField()
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
            
        try:
            account = Account.objects.get(account_number=data['account_number'])
            user = account.user
            
            if user.phone != data['phone']:
                raise serializers.ValidationError({"detail": "Invalid account details."}) # Generic error for security
                
            if user.has_usable_password():
                 raise serializers.ValidationError({"detail": "Account already registered. Please login."})
                 
            data['user'] = user
        except Account.DoesNotExist:
             raise serializers.ValidationError({"detail": "Invalid account details."})
             
        return data

    def save(self):
        user = self.validated_data['user']
        user.set_password(self.validated_data['password'])
        user.save()
        return user
