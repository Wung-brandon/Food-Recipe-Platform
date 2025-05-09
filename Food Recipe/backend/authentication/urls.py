from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Authentication endpoints
    path('token/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User registration and profile
    path('signup/', views.SignUpView.as_view(), name='signup'),
    path('chef/signup/', views.ChefSignUpView.as_view(), name='chef-signup'),
    path('user/profile/', views.ListCreateUserProfileView.as_view(), name='user-profile'),
    path('user/profile/<int:id>/', views.RetrieveUpdateUserProfileView.as_view(), name='user-profile-detail'),
    path('user/', views.GetUserView.as_view(), name='get-user'),
    
    # Chef specific endpoints
    path('chef/profile/<int:id>/', views.RetrieveUpdateChefProfileView.as_view(), name='chef-profile-detail'),
    path('chef/status/', views.check_chef_status, name='chef-status'),
    path('chefs/verified/', views.ListAllVerifiedChefsView.as_view(), name='verified-chefs'),
    
    # Admin chef verification endpoints
    path('admin/chefs/pending/', views.PendingChefApplicationsView.as_view(), name='pending-chef-applications'),
    path('admin/chef/<int:chef_id>/approve/', views.approve_chef, name='approve-chef'),
    path('admin/chef/<int:chef_id>/reject/', views.reject_chef, name='reject-chef'),
    
    # Email verification
    path('verify-email/<uidb64>/<token>/', views.EmailVerificationView.as_view(), name='verify-email'),
    path('resend-verification-email/', views.ResendVerificationEmailView.as_view(), name='resend-verification-email'),
    
    # Password reset
    path('forgot-password/', views.ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/<uidb64>/<token>/', views.ResetPasswordView.as_view(), name='reset-password'),
    
    # User follow
    path('follow/', views.follow_user, name='follow-user'),
]