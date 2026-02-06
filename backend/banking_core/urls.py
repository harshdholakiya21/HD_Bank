from django.urls import path
from .views import (
    RegisterView, VerifyOTPView, LoginView, 
    ManagerGenerateRefView, ManagerCreateClientView, ClientDashboardView,
    UpdateBalanceView, ManagerListRefView, UpdateClientDetailsView,
    ManagerStatsView, UserListView, ClientDetailView, HealthCheckView
)

urlpatterns = [
    path('health/', HealthCheckView.as_view(), name='health-check'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('auth/login/', LoginView.as_view(), name='login'),
    
    path('manager/generate-ref/', ManagerGenerateRefView.as_view(), name='generate-ref'),
    path('manager/list-refs/', ManagerListRefView.as_view(), name='list-refs'),
    path('manager/create-client/', ManagerCreateClientView.as_view(), name='create-client'),
    
    path('client/dashboard/', ClientDashboardView.as_view(), name='client-dashboard'),
    path('manager/update-balance/', UpdateBalanceView.as_view(), name='update-balance'),
    path('manager/update-client-details/', UpdateClientDetailsView.as_view(), name='update-client-details'),
    
    path('manager/stats/', ManagerStatsView.as_view(), name='manager-stats'),
    path('manager/users/', UserListView.as_view(), name='user-list'),
    path('manager/client-detail/', ClientDetailView.as_view(), name='client-detail'),
]
