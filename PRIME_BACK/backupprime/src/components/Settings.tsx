import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { NotificationPanel } from './NotificationPanel';
import { User, ViewType, AccessRequest, Project } from '../App';
import { Bell, Lock, User as UserIcon, Mail, Shield } from 'lucide-react';

interface SettingsProps {
  user: User;
  projects: Project[];
  accessRequests: AccessRequest[];
  onNavigate: (view: ViewType) => void;
  onLogout: () => void;
  onApproveRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
  onUpdateUser: (user: User) => void;
}

export function Settings({
  user,
  projects,
  accessRequests,
  onNavigate,
  onLogout,
  onApproveRequest,
  onRejectRequest,
  onUpdateUser,
}: SettingsProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [editedUser, setEditedUser] = useState<User>(user);

  useEffect(() => {
    setEditedUser(user);
  }, [user]);

  // Pending requests for badge
  const pendingRequests = accessRequests.filter(
    req =>
      req.status === 'pending' &&
      projects.find(p => p.id === req.projectId && p.ownerId === user.id)
  );

  const handleUpdateField = (field: keyof User, value: string) => {
    setEditedUser({ ...editedUser, [field]: value });
  };

  const handleSave = async () => {
    await onUpdateUser(editedUser);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar
        user={user}
        currentView="settings"
        notificationCount={pendingRequests.length}
        onNavigate={(view) => {
          if (view === 'notifications') {
            setShowNotifications(!showNotifications);
          } else {
            onNavigate(view);
          }
        }}
        onLogout={onLogout}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
            <p className="text-slate-600 mt-1">
              Manage your account preferences and settings
            </p>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-8">
          <div className="max-w-4xl mx-auto space-y-6">

            {/* Account Info */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Account Information
                </h3>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  value={editedUser.name}
                  readOnly
                  className="w-full px-4 py-3 border rounded-lg bg-slate-50"
                />
                <input
                  type="email"
                  value={editedUser.email || ''}
                  onChange={(e) => handleUpdateField('email', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="your.email@example.com"
                />
                <input
                  type="text"
                  value={editedUser.role}
                  readOnly
                  className="w-full px-4 py-3 border rounded-lg bg-slate-50"
                />
                <button
                  onClick={handleSave}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
                >
                  Save Changes
                </button>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold">Notification Preferences</h3>
              </div>

              <p className="text-sm text-slate-600">
                Control how you receive notifications.
              </p>
            </div>

            {/* Security */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold">Security</h3>
              </div>

              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
                Enable 2FA
              </button>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-xl border border-red-200 p-6">
              <h3 className="text-lg font-semibold text-red-600 mb-4">
                Danger Zone
              </h3>

              <button className="px-4 py-2 bg-red-600 text-white rounded-lg">
                Delete Account
              </button>
            </div>

          </div>
        </div>
      </div>

      {/*Notification Panel */}
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