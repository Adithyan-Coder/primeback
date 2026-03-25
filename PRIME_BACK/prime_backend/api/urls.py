from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('auth/login/', views.login, name='login'),
    path('auth/register/', views.register, name='register'),
    
    # Users
    path('users/', views.get_all_users, name='all_users'),
    path('users/<str:user_id>/', views.get_user, name='get_user'),
    path('users/<str:user_id>/update/', views.update_user, name='update_user'),
    
    # Projects
    path('projects/', views.get_projects, name='projects'),
    path('projects/create/', views.create_project, name='create_project'),
    path('projects/<str:project_id>/', views.get_project, name='get_project'),
    path('projects/<str:project_id>/update/', views.update_project, name='update_project'),
    path('projects/<str:project_id>/delete/', views.delete_project, name='delete_project'),
    path('projects/owner/<str:owner_id>/', views.get_projects_by_owner, name='projects_by_owner'),
    
    # Access Requests
    path('access-requests/', views.get_access_requests, name='access_requests'),
    path('access-requests/project/<str:project_id>/', views.get_access_requests_for_project, name='access_requests_for_project'),
    path('access-requests/create/', views.create_access_request, name='create_access_request'),
    path('access-requests/<str:request_id>/approve/', views.approve_access_request, name='approve_access_request'),
    path('access-requests/<str:request_id>/reject/', views.reject_access_request, name='reject_access_request'),
    
    # Landing Content
    path('landing-content/', views.get_landing_content, name='landing_content'),
    path('landing-content/update/', views.update_landing_content, name='update_landing_content'),
]
