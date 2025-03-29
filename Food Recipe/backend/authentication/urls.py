from django.urls import path
from .views import *


urlpatterns = [
    path('user-profile/', get_user_profile, name='user-profile'),
    path("register/", register_user, name="register"),
    path("login/", login_user, name="login"),
    path("forgot-password/", forgot_password, name="forgot-password"),
    path("reset-password/", reset_password, name="reset-password"),
    path("follow-user/", follow_user, name="follow-user"),
] 