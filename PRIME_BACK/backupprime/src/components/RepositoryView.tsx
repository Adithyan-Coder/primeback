import { useState } from 'react';
import { 
  Code2, 
  GitBranch, 
  FileText, 
  Folder, 
  AlertCircle, 
  GitPullRequest, 
  PlayCircle, 
  BookOpen,
  Shield,
  BarChart3,
  Star,
  Eye,
  GitFork,
  Clock,
  CheckCircle2,
  XCircle,
  Circle,
  Download,
  Search,
  Code,
  FileImage,
  FileArchive,
  File
} from 'lucide-react';
import { UploadedFile } from '../App';

type RepoTab = 'code' | 'issues' | 'pull-requests' | 'actions' | 'wiki';

interface RepositoryViewProps {
  projectTitle: string;
  owner: string;
  uploadedFiles?: UploadedFile[];
}

interface FileItem {
  name: string;
  type: 'folder' | 'file';
  size?: string;
  lastCommit?: string;
  lastCommitTime?: string;
  children?: FileItem[];
}

interface Issue {
  id: number;
  title: string;
  author: string;
  status: 'open' | 'closed';
  labels: string[];
  comments: number;
  created: string;
}

interface PullRequest {
  id: number;
  title: string;
  author: string;
  status: 'open' | 'merged' | 'closed';
  branch: string;
  targetBranch: string;
  comments: number;
  created: string;
}

interface WorkflowRun {
  id: number;
  name: string;
  status: 'success' | 'failed' | 'in_progress';
  branch: string;
  commit: string;
  time: string;
  duration: string;
}

export function RepositoryView({ projectTitle, owner, uploadedFiles }: RepositoryViewProps) {
  const [activeTab, setActiveTab] = useState<RepoTab>('code');
  const [currentBranch, setCurrentBranch] = useState('main');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const mockFiles: FileItem[] = [
    { 
      name: '.github', 
      type: 'folder', 
      lastCommit: 'Add CI/CD workflow', 
      lastCommitTime: '2 days ago',
      children: [
        { name: 'workflows', type: 'folder', children: [
          { name: 'ci.yml', type: 'file', size: '1.2 KB' }
        ]},
      ]
    },
    { 
      name: 'docs', 
      type: 'folder', 
      lastCommit: 'Update documentation', 
      lastCommitTime: '3 days ago',
      children: [
        { name: 'API.md', type: 'file', size: '4.5 KB' },
        { name: 'CONTRIBUTING.md', type: 'file', size: '2.1 KB' },
      ]
    },
    { 
      name: 'src', 
      type: 'folder', 
      lastCommit: 'Refactor components', 
      lastCommitTime: '5 hours ago',
      children: [
        { name: 'components', type: 'folder', children: [] },
        { name: 'utils', type: 'folder', children: [] },
        { name: 'App.tsx', type: 'file', size: '3.4 KB' },
        { name: 'index.tsx', type: 'file', size: '512 bytes' },
      ]
    },
    { 
      name: 'tests', 
      type: 'folder', 
      lastCommit: 'Add unit tests', 
      lastCommitTime: '1 day ago',
      children: []
    },
    { name: '.gitignore', type: 'file', size: '342 bytes', lastCommit: 'Initial commit', lastCommitTime: '2 weeks ago' },
    { name: 'package.json', type: 'file', size: '1.8 KB', lastCommit: 'Update dependencies', lastCommitTime: '6 hours ago' },
    { name: 'README.md', type: 'file', size: '5.2 KB', lastCommit: 'Update README', lastCommitTime: '1 day ago' },
    { name: 'tsconfig.json', type: 'file', size: '456 bytes', lastCommit: 'Initial commit', lastCommitTime: '2 weeks ago' },
  ];

  const mockIssues: Issue[] = [
    {
      id: 1,
      title: 'Add dark mode support',
      author: 'student1',
      status: 'open',
      labels: ['enhancement', 'ui'],
      comments: 5,
      created: '2 days ago'
    },
    {
      id: 2,
      title: 'Fix authentication bug in login flow',
      author: 'student2',
      status: 'open',
      labels: ['bug', 'critical'],
      comments: 3,
      created: '3 days ago'
    },
    {
      id: 3,
      title: 'Improve documentation for API endpoints',
      author: owner,
      status: 'closed',
      labels: ['documentation'],
      comments: 2,
      created: '1 week ago'
    },
  ];

  const mockPRs: PullRequest[] = [
    {
      id: 1,
      title: 'Implement user profile page',
      author: 'student1',
      status: 'open',
      branch: 'feature/user-profile',
      targetBranch: 'main',
      comments: 7,
      created: '1 day ago'
    },
    {
      id: 2,
      title: 'Fix responsive design issues',
      author: 'student2',
      status: 'merged',
      branch: 'fix/responsive-layout',
      targetBranch: 'main',
      comments: 4,
      created: '3 days ago'
    },
  ];

  const mockWorkflows: WorkflowRun[] = [
    {
      id: 1,
      name: 'CI/CD Pipeline',
      status: 'success',
      branch: 'main',
      commit: 'Update dependencies',
      time: '2 hours ago',
      duration: '3m 24s'
    },
    {
      id: 2,
      name: 'Test Suite',
      status: 'success',
      branch: 'main',
      commit: 'Add unit tests',
      time: '5 hours ago',
      duration: '2m 15s'
    },
    {
      id: 3,
      name: 'CI/CD Pipeline',
      status: 'failed',
      branch: 'feature/user-profile',
      commit: 'Implement user profile',
      time: '1 day ago',
      duration: '1m 45s'
    },
  ];

  const tabs = [
    { id: 'code' as RepoTab, label: 'Code', icon: Code2 },
    { id: 'issues' as RepoTab, label: 'Issues', icon: AlertCircle, count: mockIssues.filter(i => i.status === 'open').length },
    { id: 'pull-requests' as RepoTab, label: 'Pull requests', icon: GitPullRequest, count: mockPRs.filter(pr => pr.status === 'open').length },
    { id: 'actions' as RepoTab, label: 'Actions', icon: PlayCircle },
    { id: 'wiki' as RepoTab, label: 'Wiki', icon: BookOpen },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Repository Header */}
      <div className="bg-white border border-slate-200 rounded-t-xl">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-slate-800">
                <span className="text-indigo-600">{owner}</span>
                <span className="text-slate-400 mx-2">/</span>
                <span>{projectTitle}</span>
              </h2>
              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-full border border-slate-300">
                Public
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition">
                <Eye className="w-4 h-4" />
                Watch
                <span className="ml-1 px-1.5 py-0.5 bg-slate-100 text-xs rounded-full">12</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition">
                <GitFork className="w-4 h-4" />
                Fork
                <span className="ml-1 px-1.5 py-0.5 bg-slate-100 text-xs rounded-full">3</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition">
                <Star className="w-4 h-4" />
                Star
                <span className="ml-1 px-1.5 py-0.5 bg-slate-100 text-xs rounded-full">28</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition ${
                  isActive
                    ? 'border-amber-500 text-slate-900'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 text-xs font-semibold rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-t-0 border-slate-200 rounded-b-xl">
        {activeTab === 'code' && (
          <div>
            {/* Branch and Actions Bar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition">
                  <GitBranch className="w-4 h-4" />
                  {currentBranch}
                  <span className="ml-1 px-1.5 py-0.5 bg-slate-100 text-xs rounded-full">3 branches</span>
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition">
                  <FileText className="w-4 h-4" />
                  <span className="text-slate-500">24 commits</span>
                </button>
              </div>
              <button className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition">
                <Download className="w-4 h-4" />
                Code
              </button>
            </div>

            {/* Latest Commit Info */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-700 font-semibold text-xs">{owner.charAt(0)}</span>
                </div>
                <span className="text-sm font-medium text-slate-800">{owner}</span>
                <span className="text-sm text-slate-600">Update dependencies</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">a3f2c9b</span>
                <Clock className="w-4 h-4" />
                <span>6 hours ago</span>
              </div>
            </div>

            {/* File Browser */}
            <div className="px-6 py-4">
              <FileTree files={mockFiles} />
            </div>

            {/* README Preview */}
            <div className="px-6 py-6 border-t border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-slate-600" />
                <h3 className="font-semibold text-slate-800">README.md</h3>
              </div>
              <div className="prose prose-slate max-w-none">
                <h1 className="text-2xl font-bold text-slate-800 mb-4">{projectTitle}</h1>
                <p className="text-slate-700 mb-4">
                  A comprehensive academic project demonstrating modern web development practices
                  with React, TypeScript, and Tailwind CSS.
                </p>
                <h2 className="text-xl font-bold text-slate-800 mb-3 mt-6">Features</h2>
                <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4">
                  <li>Modern React architecture with TypeScript</li>
                  <li>Responsive design with Tailwind CSS</li>
                  <li>Component-based structure for maintainability</li>
                  <li>Comprehensive test coverage</li>
                </ul>
                <h2 className="text-xl font-bold text-slate-800 mb-3 mt-6">Getting Started</h2>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4 overflow-x-auto">
                  <code>{`npm install\nnpm start`}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'issues' && (
          <div className="p-6">
            {/* Issues Toolbar */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition text-sm">
                New issue
              </button>
            </div>

            {/* Issues Filters */}
            <div className="flex items-center gap-4 mb-4 text-sm">
              <button className="font-medium text-slate-900">
                <CheckCircle2 className="w-4 h-4 inline mr-1" />
                {mockIssues.filter(i => i.status === 'open').length} Open
              </button>
              <button className="font-medium text-slate-600 hover:text-slate-900">
                <XCircle className="w-4 h-4 inline mr-1" />
                {mockIssues.filter(i => i.status === 'closed').length} Closed
              </button>
            </div>

            {/* Issues List */}
            <div className="border border-slate-200 rounded-lg divide-y divide-slate-200">
              {mockIssues.map(issue => (
                <div key={issue.id} className="p-4 hover:bg-slate-50 transition">
                  <div className="flex items-start gap-3">
                    {issue.status === 'open' ? (
                      <Circle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 hover:text-indigo-600 cursor-pointer mb-1">
                        {issue.title}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-slate-600 flex-wrap">
                        <span>#{issue.id}</span>
                        <span>opened {issue.created}</span>
                        <span>by {issue.author}</span>
                        {issue.labels.map(label => (
                          <span
                            key={label}
                            className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                    {issue.comments > 0 && (
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <AlertCircle className="w-4 h-4" />
                        {issue.comments}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'pull-requests' && (
          <div className="p-6">
            {/* PR Toolbar */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search pull requests..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition text-sm">
                New pull request
              </button>
            </div>

            {/* PR Filters */}
            <div className="flex items-center gap-4 mb-4 text-sm">
              <button className="font-medium text-slate-900">
                <GitPullRequest className="w-4 h-4 inline mr-1" />
                {mockPRs.filter(pr => pr.status === 'open').length} Open
              </button>
              <button className="font-medium text-slate-600 hover:text-slate-900">
                <CheckCircle2 className="w-4 h-4 inline mr-1" />
                {mockPRs.filter(pr => pr.status === 'merged').length} Merged
              </button>
              <button className="font-medium text-slate-600 hover:text-slate-900">
                <XCircle className="w-4 h-4 inline mr-1" />
                {mockPRs.filter(pr => pr.status === 'closed').length} Closed
              </button>
            </div>

            {/* PR List */}
            <div className="border border-slate-200 rounded-lg divide-y divide-slate-200">
              {mockPRs.map(pr => (
                <div key={pr.id} className="p-4 hover:bg-slate-50 transition">
                  <div className="flex items-start gap-3">
                    {pr.status === 'open' ? (
                      <GitPullRequest className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : pr.status === 'merged' ? (
                      <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 hover:text-indigo-600 cursor-pointer mb-1">
                        {pr.title}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-slate-600 flex-wrap">
                        <span>#{pr.id}</span>
                        <span>opened {pr.created}</span>
                        <span>by {pr.author}</span>
                        <span className="flex items-center gap-1">
                          <GitBranch className="w-3 h-3" />
                          {pr.branch} → {pr.targetBranch}
                        </span>
                      </div>
                    </div>
                    {pr.comments > 0 && (
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <AlertCircle className="w-4 h-4" />
                        {pr.comments}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">All workflows</h3>
              <p className="text-sm text-slate-600">
                Showing workflow runs for all branches and tags
              </p>
            </div>

            {/* Workflow Runs */}
            <div className="border border-slate-200 rounded-lg divide-y divide-slate-200">
              {mockWorkflows.map(workflow => (
                <div key={workflow.id} className="p-4 hover:bg-slate-50 transition">
                  <div className="flex items-start gap-4">
                    {workflow.status === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : workflow.status === 'failed' ? (
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0 animate-pulse" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-900">{workflow.name}</h4>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          workflow.status === 'success'
                            ? 'bg-green-100 text-green-700'
                            : workflow.status === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {workflow.status === 'in_progress' ? 'In progress' : workflow.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <span>{workflow.commit}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <GitBranch className="w-3 h-3" />
                          {workflow.branch}
                        </span>
                        <span>•</span>
                        <span>{workflow.time}</span>
                        <span>•</span>
                        <span>{workflow.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'wiki' && (
          <div className="p-8 text-center">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Welcome to the Wiki</h3>
            <p className="text-slate-600 mb-4">
              Wikis provide a place in your repository to lay out the roadmap of your project,
              show the current status, and document software better.
            </p>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
              Create the first page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Enhanced File Tree Component
function FileTree({ files, depth = 0 }: { files: FileItem[]; depth?: number }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleFolder = (name: string) => {
    setExpanded(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div>
      {files.map((file, index) => (
        <div key={index}>
          <div
            onClick={() => file.type === 'folder' && toggleFolder(file.name)}
            className={`flex items-center justify-between px-3 py-2 hover:bg-slate-50 rounded cursor-pointer group ${
              depth > 0 ? 'ml-6' : ''
            }`}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {file.type === 'folder' ? (
                <Folder className="w-4 h-4 text-blue-500 flex-shrink-0" />
              ) : (
                <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
              )}
              <span className="text-sm text-indigo-600 font-medium hover:underline truncate">
                {file.name}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              {file.lastCommit && (
                <span className="hidden md:block truncate max-w-xs">{file.lastCommit}</span>
              )}
              {file.lastCommitTime && (
                <span className="whitespace-nowrap">{file.lastCommitTime}</span>
              )}
            </div>
          </div>
          {file.type === 'folder' && expanded[file.name] && file.children && (
            <FileTree files={file.children} depth={depth + 1} />
          )}
        </div>
      ))}
    </div>
  );
}