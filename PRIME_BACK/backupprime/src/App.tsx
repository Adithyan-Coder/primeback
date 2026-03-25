import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { ProjectDetail } from './components/ProjectDetail';
import { ProjectCreation } from './components/ProjectCreation';
import { Profile } from './components/Profile';
import { Landing } from './components/Landing';
import { AdminDashboard } from './components/AdminDashboard';
import { Settings } from './components/Settings';
import { defaultLandingContent, LandingContent } from './data/landingContent';
import { apiClient } from './lib/apiClient';

export type UserRole = 'student' | 'faculty' | 'admin';

export interface User {
  id: string;
  username: string;
  email?: string;
  name: string;
  role: UserRole;
}

export type ProjectStatus = 'public' | 'locked' | 'approved';

export interface TeamMember {
  name: string;
  email: string;
  contribution: string;
}

export interface Project {
  id: string;
  title: string;
  abstract: string;
  domains: string[];
  year: string;
  license: string;
  techStack: string[];
  status: ProjectStatus;
  owner: string;
  ownerId: string;
  teamMembers: TeamMember[];
  createdAt: string;
  lastUpdated: string;
  approvedFacultyIds?: string[]; // Track which faculty members have been granted access
  approvalStatus?: 'pending' | 'approved' | 'rejected'; // Admin approval status
}

export interface AccessRequest {
  id: string;
  projectId: string;
  facultyId: string;
  facultyName: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
}

export type ViewType = 'dashboard' | 'project-detail' | 'create-project' | 'profile' | 'settings';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [showLogin, setShowLogin] = useState(false);
  const [landingContent, setLandingContent] = useState<LandingContent>(defaultLandingContent);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
    // Add user to users list if not already present
    if (!allUsers.find(u => u.username === user.username)) {
      setAllUsers([...allUsers, user]);
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    try {
      const result = await apiClient.updateUser(updatedUser.id, updatedUser);
      if (result.error) throw new Error(result.error);
      setCurrentUser(result);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  // Load landing content on mount
  useEffect(() => {
    const loadLandingContent = async () => {
      try {
        const content = await apiClient.getLandingContent();
        if (content && !content.error) {
          setLandingContent(content);
        }
      } catch (error) {
        console.log('Using default landing content');
      }
    };
    loadLandingContent();
  }, []);

  // Load projects and access requests when user is logged in
  useEffect(() => {
    if (currentUser) {
      loadProjects();
      loadAccessRequests();
      loadAllUsers();
    }
  }, [currentUser]);

  const normalizeProjectData = (project: any): Project => {
    const safeArray = (value: any): any[] => (Array.isArray(value) ? value : []);

    return {
      id: project.id || project.ID || `proj-${Date.now()}`,
      title: project.title || '',
      abstract: project.abstract || '',
      domains: safeArray(project.domains ?? []),
      year: project.year || '',
      license: project.license || '',
      techStack: safeArray(project.techStack ?? project.techstack),
      status: project.status || 'locked',
      owner: project.owner || '',
      ownerId: project.ownerId || project.ownerid || '',
      teamMembers: safeArray(project.teamMembers),
      createdAt: project.createdAt || project.createdat || new Date().toISOString(),
      lastUpdated: project.lastUpdated || project.lastupdated || new Date().toISOString(),
      approvedFacultyIds: safeArray(project.approvedFacultyIds ?? project.approvedfacultyids),
      approvalStatus: project.approvalStatus || project.approvalstatus || 'pending',
    };
  };

  const loadProjects = async () => {
    try {
      const data = await apiClient.getProjects();
      if (Array.isArray(data)) {
        setProjects(data.map(normalizeProjectData));
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadAccessRequests = async () => {
    try {
      const data = await apiClient.getAccessRequests();
      if (Array.isArray(data)) {
        setAccessRequests(data);
      }
    } catch (error) {
      console.error('Failed to load access requests:', error);
    }
  };

  const loadAllUsers = async () => {
    try {
      const data = await apiClient.getAllUsers();
      if (Array.isArray(data)) {
        setAllUsers(data);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('dashboard');
  };

  const handleNavigate = (view: ViewType, projectId?: string) => {
    setCurrentView(view);
    if (projectId) {
      setSelectedProjectId(projectId);
    }
  };

  const handleCreateProject = async (project: Project) => {
    try {
      const result = await apiClient.createProject(project);
      if (result.error) throw new Error(result.error);
      setProjects([...projects, result]);
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleRequestAccess = async (projectId: string) => {
    if (!currentUser) return;
    try {
      const result = await apiClient.createAccessRequest(projectId, currentUser.id, currentUser.name);
      if (result.error) throw new Error(result.error);
      setAccessRequests([...accessRequests, result]);
    } catch (error) {
      console.error('Failed to request access:', error);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      const result = await apiClient.approveAccessRequest(requestId);
      if (result.error) throw new Error(result.error);
      setAccessRequests(
        accessRequests.map(req =>
          req.id === requestId ? { ...req, status: 'approved' as const } : req
        )
      );
      const request = accessRequests.find(req => req.id === requestId);
      if (request) {
        setProjects(
          projects.map(proj =>
            proj.id === request.projectId
              ? { 
                  ...proj, 
                  approvedFacultyIds: [...(proj.approvedFacultyIds || []), request.facultyId]
                }
              : proj
          )
        );
      }
    } catch (error) {
      console.error('Failed to approve request:', error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const result = await apiClient.rejectAccessRequest(requestId);
      if (result.error) throw new Error(result.error);
      setAccessRequests(
        accessRequests.map(req =>
          req.id === requestId ? { ...req, status: 'rejected' as const } : req
        )
      );
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  const handleApproveProject = (projectId: string) => {
    setProjects(
      projects.map(proj =>
        proj.id === projectId ? { ...proj, approvalStatus: 'approved' as const } : proj
      )
    );
  };

  const handleRejectProject = (projectId: string) => {
    setProjects(
      projects.map(proj =>
        proj.id === projectId ? { ...proj, approvalStatus: 'rejected' as const } : proj
      )
    );
  };

  if (!currentUser) {
    if (!showLogin) {
      return <Landing onGetStarted={() => setShowLogin(true)} content={landingContent} />;
    }
    return <Login onLogin={handleLogin} onBack={() => setShowLogin(false)} />;
  }

  // Admin view
  if (currentUser.role === 'admin') {
    return (
      <AdminDashboard
        user={currentUser}
        landingContent={landingContent}
        onUpdateContent={setLandingContent}
        onLogout={handleLogout}
      />
    );
  }

  const selectedProject = selectedProjectId
    ? projects.find(p => p.id === selectedProjectId)
    : null;

  return (
    <div className="min-h-screen bg-slate-50">
      {currentView === 'dashboard' && (
        <Dashboard
          user={currentUser}
          projects={projects}
          setProjects={setProjects}
          accessRequests={accessRequests}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onApproveRequest={handleApproveRequest}
          onRejectRequest={handleRejectRequest}
        />
      )}
      
      {currentView === 'create-project' && (
        <ProjectCreation
          user={currentUser}
          projects={projects}
          accessRequests={accessRequests}
          onNavigate={handleNavigate}
          onCreateProject={handleCreateProject}
          onLogout={handleLogout}
          onApproveRequest={handleApproveRequest}
          onRejectRequest={handleRejectRequest}
        />
      )}

      {currentView === 'project-detail' && selectedProject && (
        <ProjectDetail
          user={currentUser}
          project={selectedProject}
          projects={projects}
          accessRequests={accessRequests}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onRequestAccess={handleRequestAccess}
          onApproveRequest={handleApproveRequest}
          onRejectRequest={handleRejectRequest}
        />
      )}

      {currentView === 'profile' && (
        <Profile
          user={currentUser}
          projects={projects}
          accessRequests={accessRequests}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onApproveRequest={handleApproveRequest}
          onRejectRequest={handleRejectRequest}
        />
      )}

      {currentView === 'settings' && (
        <Settings
          user={currentUser}
          projects={projects}
          accessRequests={accessRequests}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onApproveRequest={handleApproveRequest}
          onRejectRequest={handleRejectRequest}
          onUpdateUser={handleUpdateUser}
        />
      )}
    </div>
  );
}

export default App;