from django.db import models
from django.contrib.auth.models import AbstractUser
from djongo import models as djongo_models

class User(AbstractUser):
    # id = djongo_models.ObjectIdField(primary_key=True, db_column='_id')
    ROLE_CHOICES = (
        ('CLIENT', 'Client'),
        ('EMPLOYEE', 'Employee'),
        ('MANAGER', 'Manager'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='CLIENT')
    phone = models.CharField(max_length=15, unique=True, null=True, blank=True)

    def __str__(self):
        return f"{self.username} - {self.role}"

class ReferenceID(models.Model):
    # id = djongo_models.ObjectIdField(primary_key=True, db_column='_id')
    code = models.CharField(max_length=50, unique=True)
    is_used = models.BooleanField(default=False)
    used_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='used_reference')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.code

class Account(models.Model):
    # id = djongo_models.ObjectIdField(primary_key=True, db_column='_id')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='accounts')
    account_number = models.CharField(max_length=20, unique=True)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.account_number} - {self.user.username}"
