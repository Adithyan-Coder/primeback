from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import json
from datetime import datetime
import uuid
import os
from supabase import create_client, Client

# Initialize Supabase
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ========================
# AUTHENTICATION ENDPOINTS
# ========================

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Login endpoint"""
    username = request.data.get('username')
    password = request.data.get('password')
    role = request.data.get('role', 'student')
    
    if not username or not password:
        return Response({'error': 'Username and password required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        response = supabase.table('users').select('*').eq('username', username).execute()
        if response.data:
            user = response.data[0]
            if user.get('password') != password:
                return Response({'error': 'Invalid username or password'}, status=status.HTTP_401_UNAUTHORIZED)

            user_response = {
                'id': user['id'],
                'username': user['username'],
                'email': user.get('email', ''),
                'name': user.get('name', user['username']),
                'role': user.get('role', role)
            }
            return Response(user_response, status=status.HTTP_200_OK)

        return Response({'error': 'Invalid username or password'}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register endpoint"""
    username = request.data.get('username')
    password = request.data.get('password')
    name = request.data.get('name')
    role = request.data.get('role', 'student')
    
    if not all([username, password, name]):
        return Response({'error': 'Username, password, and name required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        existing = supabase.table('users').select('*').eq('username', username).execute()
        if existing.data:
            return Response({'error': 'User already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        new_user = {
            'id': str(uuid.uuid4()),
            'username': username,
            'password': password,
            'name': name,
            'role': role,
            'created_at': datetime.utcnow().isoformat()
        }
        supabase.table('users').insert(new_user).execute()
        user_response = {
            'id': new_user['id'],
            'username': new_user['username'],
            'email': new_user.get('email', ''),
            'name': new_user['name'],
            'role': new_user['role']
        }
        return Response(user_response, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ========================
# USERS ENDPOINTS
# ========================

@api_view(['GET'])
def get_user(request, user_id):
    """Get user by ID"""
    try:
        response = supabase.table('users').select('*').eq('id', user_id).execute()
        if response.data:
            return Response(response.data[0], status=status.HTTP_200_OK)
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_all_users(request):
    """Get all users"""
    try:
        response = supabase.table('users').select('*').execute()
        return Response(response.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_user(request, user_id):
    """Get user by ID"""
    try:
        response = supabase.table('users').select('*').eq('id', user_id).execute()
        if response.data:
            return Response(response.data[0], status=status.HTTP_200_OK)
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([AllowAny])
def update_user(request, user_id):
    """Update user endpoint"""
    try:
        # Get user from Supabase
        response = supabase.table('users').select('*').eq('id', user_id).execute()
        if not response.data:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        user = response.data[0]
        
        # Update fields
        updated_data = {}
        for field in ['username', 'email', 'name', 'role']:
            if field in request.data:
                updated_data[field] = request.data[field]
        
        if updated_data:
            supabase.table('users').update(updated_data).eq('id', user_id).execute()
            # Return updated user
            updated_user = supabase.table('users').select('*').eq('id', user_id).execute().data[0]
            user_response = {
                'id': updated_user['id'],
                'username': updated_user['username'],
                'email': updated_user.get('email', ''),
                'name': updated_user.get('name', updated_user['username']),
                'role': updated_user.get('role', 'student')
            }
            return Response(user_response, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'No fields to update'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ========================
# PROJECTS ENDPOINTS
# ========================

def normalize_project(project):
    return {
        'id': project.get('id'),
        'title': project.get('title'),
        'abstract': project.get('abstract'),
        'domains': project.get('domains') or project.get('domains', []),
        'year': project.get('year'),
        'license': project.get('license'),
        'techStack': project.get('techstack') or project.get('techStack') or [],
        'status': project.get('status'),
        'owner': project.get('owner'),
        'ownerId': project.get('ownerid') or project.get('ownerId'),
        'createdAt': project.get('createdat') or project.get('createdAt'),
        'lastUpdated': project.get('lastupdated') or project.get('lastUpdated'),
        'approvedFacultyIds': project.get('approvedfacultyids') or project.get('approvedFacultyIds') or [],
        'approvalStatus': project.get('approvalstatus') or project.get('approvalStatus'),
        'teamMembers': project.get('teamMembers', [])
    }


@api_view(['GET'])
def get_projects(request):
    """Get all projects"""
    try:
        response = supabase.table('projects').select('*').execute()
        projects = []
        for project in response.data:
            # Get team members
            team_response = supabase.table('team_members').select('*').eq('project_id', project['id']).execute()
            project_data = normalize_project(project)
            project_data['teamMembers'] = team_response.data
            projects.append(project_data)
        return Response(projects, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_project(request, project_id):
    """Get project by ID"""
    try:
        response = supabase.table('projects').select('*').eq('id', project_id).execute()
        if response.data:
            project = response.data[0]
            team_response = supabase.table('team_members').select('*').eq('project_id', project_id).execute()
            project_data = normalize_project(project)
            project_data['teamMembers'] = team_response.data
            return Response(project_data, status=status.HTTP_200_OK)
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def create_project(request):
    """Create a new project"""
    try:
        project_data = {
            'id': str(uuid.uuid4()),
            'title': request.data.get('title'),
            'abstract': request.data.get('abstract'),
            'domains': request.data.get('domains', []),
            'year': request.data.get('year'),
            'license': request.data.get('license'),
            'techstack': request.data.get('techStack', []),
            'status': request.data.get('status', 'public'),
            'owner': request.data.get('owner'),
            'ownerid': request.data.get('ownerId') or request.data.get('ownerid'),
            'createdat': datetime.utcnow().isoformat(),
            'lastupdated': datetime.utcnow().isoformat(),
            'approvedfacultyids': request.data.get('approvedFacultyIds', []),
            'approvalstatus': request.data.get('approvalStatus', 'pending')
        }

        response = supabase.table('projects').insert(project_data).execute()

        # Insert team members
        team_members = request.data.get('teamMembers', [])
        for member in team_members:
            member_data = {
                'id': str(uuid.uuid4()),
                'project_id': project_data['id'],
                'name': member.get('name'),
                'email': member.get('email'),
                'contribution': member.get('contribution')
            }
            supabase.table('team_members').insert(member_data).execute()

        # Return normalized project format expected by frontend
        created_project = normalize_project(project_data)
        created_project['teamMembers'] = team_members
        return Response(created_project, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
def update_project(request, project_id):
    """Update a project"""
    try:
        project_data = {
            'title': request.data.get('title'),
            'abstract': request.data.get('abstract'),
            'domains': request.data.get('domains'),
            'year': request.data.get('year'),
            'license': request.data.get('license'),
            'techstack': request.data.get('techStack') or request.data.get('techstack'),
            'status': request.data.get('status'),
            'lastupdated': datetime.utcnow().isoformat(),
            'approvalstatus': request.data.get('approvalStatus') or request.data.get('approvalstatus')
        }
        project_data = {k: v for k, v in project_data.items() if v is not None}

        response = supabase.table('projects').update(project_data).eq('id', project_id).execute()
        if response.data:
            updated = normalize_project(response.data[0])
            team_response = supabase.table('team_members').select('*').eq('project_id', project_id).execute()
            updated['teamMembers'] = team_response.data
            return Response(updated, status=status.HTTP_200_OK)
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
def delete_project(request, project_id):
    """Delete a project"""
    try:
        # Delete team members first
        supabase.table('team_members').delete().eq('project_id', project_id).execute()
        
        # Delete project
        response = supabase.table('projects').delete().eq('id', project_id).execute()
        return Response({'message': 'Project deleted'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_projects_by_owner(request, owner_id):
    """Get projects by owner"""
    try:
        response = supabase.table('projects').select('*').eq('ownerid', owner_id).execute()
        projects = []
        for project in response.data:
            team_response = supabase.table('team_members').select('*').eq('project_id', project['id']).execute()
            project_data = normalize_project(project)
            project_data['teamMembers'] = team_response.data
            projects.append(project_data)
        return Response(projects, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ========================
# ACCESS REQUESTS ENDPOINTS
# ========================

@api_view(['GET'])
def get_access_requests(request):
    """Get all access requests"""
    try:
        response = supabase.table('access_requests').select('*').execute()
        return Response(response.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_access_requests_for_project(request, project_id):
    """Get access requests for a project"""
    try:
        response = supabase.table('access_requests').select('*').eq('projectId', project_id).execute()
        return Response(response.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def create_access_request(request):
    """Create an access request"""
    try:
        access_request = {
            'id': str(uuid.uuid4()),
            'projectId': request.data.get('projectId'),
            'facultyId': request.data.get('facultyId'),
            'facultyName': request.data.get('facultyName'),
            'status': 'pending',
            'timestamp': datetime.utcnow().isoformat()
        }
        
        response = supabase.table('access_requests').insert(access_request).execute()
        return Response(access_request, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
def approve_access_request(request, request_id):
    """Approve an access request"""
    try:
        # Update request status
        supabase.table('access_requests').update({'status': 'approved'}).eq('id', request_id).execute()
        
        # Get request details
        req_response = supabase.table('access_requests').select('*').eq('id', request_id).execute()
        if req_response.data:
            req = req_response.data[0]
            
            # Add faculty to approved list
            proj_response = supabase.table('projects').select('approvedFacultyIds').eq('id', req['projectId']).execute()
            if proj_response.data:
                project = proj_response.data[0]
                approved_ids = project.get('approvedFacultyIds', []) or []
                if req['facultyId'] not in approved_ids:
                    approved_ids.append(req['facultyId'])
                    supabase.table('projects').update({'approvedFacultyIds': approved_ids}).eq('id', req['projectId']).execute()
        
        return Response({'message': 'Request approved'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
def reject_access_request(request, request_id):
    """Reject an access request"""
    try:
        supabase.table('access_requests').update({'status': 'rejected'}).eq('id', request_id).execute()
        return Response({'message': 'Request rejected'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ========================
# LANDING CONTENT ENDPOINTS
# ========================

@api_view(['GET'])
def get_landing_content(request):
    """Get landing page content"""
    try:
        response = supabase.table('landing_content').select('*').limit(1).execute()
        if response.data:
            return Response(response.data[0], status=status.HTTP_200_OK)
        return Response({'error': 'Content not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
def update_landing_content(request):
    """Update landing page content (admin only)"""
    try:
        content_data = {
            'title': request.data.get('title'),
            'subtitle': request.data.get('subtitle'),
            'description': request.data.get('description'),
            'features': request.data.get('features')
        }
        content_data = {k: v for k, v in content_data.items() if v is not None}
        
        # Get existing content
        existing = supabase.table('landing_content').select('*').limit(1).execute()
        if existing.data:
            response = supabase.table('landing_content').update(content_data).eq('id', existing.data[0]['id']).execute()
        else:
            content_data['id'] = str(uuid.uuid4())
            response = supabase.table('landing_content').insert(content_data).execute()
        
        return Response(content_data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
