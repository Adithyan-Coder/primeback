import { useState } from 'react';
import { ArrowLeft, Lock, Send, Clock, FileText, MessageSquare, Folder } from 'lucide-react';
import { User, Project, AccessRequest, ViewType } from '../App';
import { Sidebar } from './Sidebar';
import { RepositoryView } from './RepositoryView';
import { NotificationPanel } from './NotificationPanel';

interface ProjectDetailProps {
  user: User;
  project: Project;
  projects: Project[];
  accessRequests: AccessRequest[];
  onNavigate: (view: ViewType) => void;
  onLogout: () => void;
  onRequestAccess: (projectId: string) => void;
  onApproveRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
}

type TabType = 'overview' | 'repository' | 'timeline' | 'discussion';

export function ProjectDetail({
  user,
  project,
  projects,
  accessRequests,
  onNavigate,
  onLogout,
  onRequestAccess,
  onApproveRequest,
  onRejectRequest,
}: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [message, setMessage] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  // Check if faculty has access
  const hasAccess = 
    (user.role === 'student' && project.ownerId === user.id) || // Owner always has access
    project.status === 'public' || // Public projects
    (user.role === 'faculty' && project.approvedFacultyIds?.includes(user.id)); // Approved faculty members

  // Check if request is pending
  const hasPendingRequest = accessRequests.some(
    req => req.projectId === project.id && req.facultyId === user.id && req.status === 'pending'
  );

  // Calculate notification count
  const notificationCount = user.role === 'student'
    ? accessRequests.filter(req => {
        const proj = projects.find(p => p.id === req.projectId);
        return proj && proj.ownerId === user.id && req.status === 'pending';
      }).length
    : accessRequests.filter(req => req.facultyId === user.id && req.status === 'pending').length;

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: FileText },
    { id: 'repository' as TabType, label: 'Repository', icon: Folder },
    { id: 'timeline' as TabType, label: 'Timeline', icon: Clock },
    { id: 'discussion' as TabType, label: 'Discussion', icon: MessageSquare },
  ];

  const mockFiles = [
    { name: 'src', type: 'folder', children: [
      { name: 'components', type: 'folder', children: [] },
      { name: 'utils', type: 'folder', children: [] },
      { name: 'App.tsx', type: 'file', children: [] },
      { name: 'index.tsx', type: 'file', children: [] },
    ]},
    { name: 'docs', type: 'folder', children: [
      { name: 'README.md', type: 'file', children: [] },
      { name: 'API_DOCUMENTATION.md', type: 'file', children: [] },
    ]},
    { name: 'reports', type: 'folder', children: [
      { name: 'Project_Report.pdf', type: 'file', children: [] },
      { name: 'Presentation.pptx', type: 'file', children: [] },
    ]},
    { name: 'package.json', type: 'file', children: [] },
  ];

  const mockTimeline = [
    { date: '2 hours ago', message: 'Updated documentation and API specs', author: project.owner },
    { date: '1 day ago', message: 'Fixed critical bug in authentication module', author: project.teamMembers[1]?.name || 'Team Member' },
    { date: '3 days ago', message: 'Added new feature: Dark mode support', author: project.owner },
    { date: '5 days ago', message: 'Implemented test coverage for core modules', author: project.teamMembers[2]?.name || 'Team Member' },
    { date: '1 week ago', message: 'Initial project setup and dependencies', author: project.owner },
  ];

  const mockDiscussion = [
    { author: project.owner, message: 'Welcome to the project! Feel free to ask any questions.', time: '2 days ago' },
    { author: 'Dr. Smith', message: 'Great work on the architecture. Could you elaborate on the scalability approach?', time: '1 day ago' },
    { author: project.owner, message: 'Thanks! We\'re using microservices with Docker for horizontal scaling.', time: '20 hours ago' },
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // Mock sending message
      setMessage('');
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        user={user}
        currentView="dashboard"
        notificationCount={notificationCount}
        onNavigate={onNavigate}
        onLogout={onLogout}
        onNotificationClick={() => setShowNotifications(!showNotifications)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-6">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">{project.title}</h1>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span>by {project.owner}</span>
                <span>•</span>
                <span>{project.year}</span>
                <span>•</span>
                <span>{project.license} License</span>
              </div>
            </div>
            {user.role === 'faculty' && !hasAccess && (
              <button
                onClick={() => !hasPendingRequest && onRequestAccess(project.id)}
                disabled={hasPendingRequest}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition shadow-lg ${
                  hasPendingRequest
                    ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/30'
                }`}
              >
                <Lock className="w-5 h-5" />
                {hasPendingRequest ? 'Request Sent' : 'Request Access'}
              </button>
            )}
          </div>
        </header>

        {/* Tabs */}
        <div className="bg-white border-b border-slate-200 px-8">
          <div className="flex gap-6">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium transition ${
                    isActive
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          {!hasAccess ? (
            <div className="h-full flex items-center justify-center p-8">
              <div className="max-w-md text-center">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-10 h-10 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Access Required</h3>
                <p className="text-slate-600 mb-6">
                  This project is private. Request access from the project owner to view full details.
                </p>
                <div className="bg-white rounded-lg border border-slate-200 p-6 text-left">
                  <h4 className="font-semibold text-slate-800 mb-3">Limited Preview</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Title:</span> {project.title}</p>
                    <p><span className="font-medium">Domains:</span> {project.domains.join(', ')}</p>
                    <p><span className="font-medium">Year:</span> {project.year}</p>
                    <p className="text-slate-500 italic">Full abstract and project details are hidden</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8">
              {activeTab === 'overview' && (
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Abstract */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Abstract</h3>
                    <p className="text-slate-700 leading-relaxed">{project.abstract}</p>
                  </div>

                  {/* Team Members */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Team Members</h3>
                    <div className="space-y-4">
                      {project.teamMembers.map((member, index) => (
                        <div key={index} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-indigo-700 font-semibold text-lg">
                              {member.name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800">{member.name}</h4>
                            <p className="text-sm text-slate-600 mb-1">{member.email}</p>
                            <p className="text-sm text-indigo-600 font-medium">{member.contribution}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tech Stack & Details */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                      <h3 className="text-lg font-bold text-slate-800 mb-4">Tech Stack</h3>
                      <div className="flex flex-wrap gap-2">
                        {project.techStack.map(tech => (
                          <span
                            key={tech}
                            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg font-medium text-sm"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                      <h3 className="text-lg font-bold text-slate-800 mb-4">Project Info</h3>
                      <div className="space-y-2 text-sm">
                        <p className="flex justify-between">
                          <span className="text-slate-600">License:</span>
                          <span className="font-medium text-slate-800">{project.license}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-slate-600">Academic Year:</span>
                          <span className="font-medium text-slate-800">{project.year}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-slate-600">Last Updated:</span>
                          <span className="font-medium text-slate-800">
                            {new Date(project.lastUpdated).toLocaleDateString()}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'repository' && (
                <div className="max-w-7xl mx-auto">
                  <RepositoryView 
                    projectTitle={project.title} 
                    owner={project.owner}
                    uploadedFiles={project.uploadedFiles}
                  />
                </div>
              )}

              {activeTab === 'timeline' && (
                <div className="max-w-3xl mx-auto">
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Project Timeline</h3>
                    <div className="space-y-4">
                      {mockTimeline.map((item, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Clock className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div className="flex-1 pb-4 border-b border-slate-100 last:border-0">
                            <p className="font-medium text-slate-800 mb-1">{item.message}</p>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <span>{item.author}</span>
                              <span>•</span>
                              <span>{item.date}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'discussion' && (
                <div className="max-w-3xl mx-auto">
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Discussion</h3>
                    
                    {/* Messages */}
                    <div className="space-y-4 mb-6">
                      {mockDiscussion.map((msg, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-slate-600 font-semibold text-sm">
                              {msg.author.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-slate-800 text-sm">{msg.author}</span>
                              <span className="text-xs text-slate-500">{msg.time}</span>
                            </div>
                            <p className="text-slate-700 text-sm bg-slate-50 rounded-lg p-3">
                              {msg.message}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Message Input */}
                    <form onSubmit={handleSendMessage} className="flex gap-3">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                      />
                      <button
                        type="submit"
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2"
                      >
                        <Send className="w-5 h-5" />
                        Send
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Notification Panel */}
      {showNotifications && (
        <NotificationPanel
          user={user}
          accessRequests={accessRequests}
          projects={projects}
          onApprove={onApproveRequest}
          onReject={onRejectRequest}
          onClose={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
}