import { X, Check, XCircle, Clock } from 'lucide-react';
import { User, AccessRequest, Project } from '../App';

interface NotificationPanelProps {
  user: User;
  accessRequests: AccessRequest[];
  projects: Project[];
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
  onClose: () => void;
}

export function NotificationPanel({
  user,
  accessRequests,
  projects,
  onApprove,
  onReject,
  onClose,
}: NotificationPanelProps) {
  // Filter requests based on user role
  const relevantRequests = user.role === 'student'
    ? accessRequests.filter(req => {
        const project = projects.find(p => p.id === req.projectId);
        return project && project.ownerId === user.id;
      })
    : accessRequests.filter(req => req.facultyId === user.id);

  const pendingRequests = relevantRequests.filter(req => req.status === 'pending');

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Sliding Panel */}
      <div className="fixed right-0 top-0 w-96 bg-white border-l border-slate-200 h-screen flex flex-col z-50 shadow-2xl transform transition-transform duration-300 ease-out">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Notifications</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {pendingRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                <Check className="w-8 h-8 text-slate-400" />
              </div>
              <p className="font-medium text-slate-800">All caught up!</p>
              <p className="text-sm text-slate-600 mt-1">No pending notifications</p>
            </div>
          ) : (
            pendingRequests.map(request => {
              const project = projects.find(p => p.id === request.projectId);
              if (!project) return null;

              return (
                <div
                  key={request.id}
                  className="bg-slate-50 rounded-lg p-4 border border-slate-200"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800 mb-1">
                        Access Request
                      </p>
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">{request.facultyName}</span> requested
                        access to <span className="font-medium">{project.title}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(request.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {user.role === 'student' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onApprove(request.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition text-sm"
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => onReject(request.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-300 transition text-sm"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}