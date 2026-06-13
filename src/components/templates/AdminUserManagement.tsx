'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  RefreshCw, 
  AlertCircle,
  CheckCircle2,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import ConfirmDialog from '@/components/molecules/ConfirmDialog';
import { PageLoader } from '../atoms';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'RESIDENT' | 'ADMIN';
  plotNumber?: string;
  emailVerified: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AdminUserManagementProps {
  onUserUpdate?: () => void;
}

export default function AdminUserManagement({ onUserUpdate }: AdminUserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<User>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    plotNumber: '',
    role: 'RESIDENT' as 'RESIDENT' | 'ADMIN'
  });
  
  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: 'danger' | 'warning' | 'info' | 'success';
    confirmText?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'info',
  });
  const [dialogLoading, setDialogLoading] = useState(false);

  // Fetch users from API
  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/users?page=${page}&limit=10`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users');
      }

      setUsers(data.data || []);
      setCurrentPage(data.pagination?.page || 1);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  // Handle add new user
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserData.name,
          email: newUserData.email,
          password: newUserData.password,
          plotNumber: newUserData.plotNumber || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setSuccess('User created successfully');
      setShowAddForm(false);
      setNewUserData({ name: '', email: '', password: '', plotNumber: '', role: 'RESIDENT' });
      fetchUsers(currentPage);
      onUserUpdate?.();
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    }
  };

  // Handle edit user
  const handleEditClick = (user: User) => {
    setEditingUserId(user.id);
    setEditFormData({
      name: user.name,
      email: user.email,
      plotNumber: user.plotNumber,
      role: user.role,
      emailVerified: user.emailVerified
    });
  };

  const handleEditSave = async (userId: string) => {
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user');
      }

      setSuccess('User updated successfully');
      setEditingUserId(null);
      setEditFormData({});
      fetchUsers(currentPage);
      onUserUpdate?.();
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    }
  };

  const handleEditCancel = () => {
    setEditingUserId(null);
    setEditFormData({});
  };

  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    userId: string;
    userName: string;
    typedName: string;
  } | null>(null);

  // Handle delete user
  const handleDeleteUser = (userId: string, userName: string) => {
    setDeleteConfirmation({
      userId,
      userName,
      typedName: ''
    });
  };

  // Execute delete after name confirmation
  const executeDeleteUser = async () => {
    if (!deleteConfirmation) return;

    setDialogLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/users/${deleteConfirmation.userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }

      setSuccess('User deleted successfully');
      fetchUsers(currentPage);
      onUserUpdate?.();
      setDeleteConfirmation(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setDialogLoading(false);
    }
  };

  // Handle password reset
  const handlePasswordReset = (userId: string, userEmail: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reset Password',
      message: `Reset password for "${userEmail}"? The user's current password will be cleared and they will be required to create a new password on their next login attempt.`,
      variant: 'warning',
      confirmText: 'Reset Password',
      onConfirm: async () => {
        setDialogLoading(true);
        setError('');
        setSuccess('');

        try {
          const response = await fetch('/api/admin/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to reset password');
          }

          setSuccess('Password reset successfully. User will be prompted to create a new password on next login.');
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        } catch (err: any) {
          setError(err.message || 'Failed to reset password');
        } finally {
          setDialogLoading(false);
        }
      },
    });
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.plotNumber && user.plotNumber.includes(searchQuery))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <PageLoader message="Loading..." fullScreen />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-500/10 rounded-lg">
            <Users className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">User Management</h2>
            <p className="text-sm text-slate-400">Manage registered users and their accounts</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add New User
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-400">
          <CheckCircle2 className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}

      {/* Add User Form */}
      {showAddForm && (
        <div className="p-6 bg-slate-900/50 border border-slate-800/40 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Add New User</h3>
          <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
              <input
                type="text"
                value={newUserData.name}
                onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                required
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <input
                type="email"
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                required
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Plot Number (Optional)</label>
              <input
                type="text"
                value={newUserData.plotNumber}
                onChange={(e) => setNewUserData({ ...newUserData, plotNumber: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="15"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Initial Password</label>
              <input
                type="password"
                value={newUserData.password}
                onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                required
                minLength={8}
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="Min. 8 characters"
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors"
              >
                Create User
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewUserData({ name: '', email: '', password: '', plotNumber: '', role: 'RESIDENT' });
                }}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, or plot number..."
          className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/50 border border-slate-800/40 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50 border-b border-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Plot</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Verified</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3">
                    {editingUserId === user.id ? (
                      <input
                        type="text"
                        value={editFormData.name || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                      />
                    ) : (
                      <span className="text-white font-medium">{user.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingUserId === user.id ? (
                      <input
                        type="email"
                        value={editFormData.email || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                      />
                    ) : (
                      <span className="text-slate-300 text-sm">{user.email}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingUserId === user.id ? (
                      <input
                        type="text"
                        value={editFormData.plotNumber || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, plotNumber: e.target.value })}
                        className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                        placeholder="Plot #"
                      />
                    ) : (
                      <span className="text-slate-300 text-sm">{user.plotNumber || '—'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      user.role === 'ADMIN' 
                        ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' 
                        : 'bg-slate-700 text-slate-300'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {editingUserId === user.id ? (
                      <select
                        value={editFormData.emailVerified ? 'verified' : 'not-verified'}
                        onChange={(e) => setEditFormData({ 
                          ...editFormData, 
                          emailVerified: e.target.value === 'verified' ? new Date().toISOString() : null 
                        })}
                        className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                      >
                        <option value="verified">✓ Verified</option>
                        <option value="not-verified">Not verified</option>
                      </select>
                    ) : (
                      <span className={`text-sm ${
                        user.emailVerified ? 'text-green-400' : 'text-slate-500'
                      }`}>
                        {user.emailVerified ? '✓ Verified' : 'Not verified'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {editingUserId === user.id ? (
                        <>
                          <button
                            onClick={() => handleEditSave(user.id)}
                            className="p-1.5 bg-green-600 hover:bg-green-500 text-white rounded transition-colors"
                            title="Save changes"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleEditCancel}
                            className="p-1.5 bg-slate-600 hover:bg-slate-500 text-white rounded transition-colors"
                            title="Cancel editing"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditClick(user)}
                            className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
                            title="Edit user"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePasswordReset(user.id, user.email)}
                            className="p-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded transition-colors"
                            title="Reset password"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            No users found matching your search.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        confirmText={confirmDialog.confirmText}
        loading={dialogLoading}
      />

      {/* Delete User Confirmation Modal with Name Verification */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-red-500/30 rounded-lg max-w-md w-full shadow-2xl">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">Delete User Account</h3>
                  <p className="text-sm text-slate-300 mb-4">
                    You are about to permanently delete the account for <span className="font-semibold text-red-400">{deleteConfirmation.userName}</span>. 
                    This action cannot be undone and will remove all associated data.
                  </p>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      To confirm deletion, please type the user's name:
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmation.typedName}
                      onChange={(e) => setDeleteConfirmation({ ...deleteConfirmation, typedName: e.target.value })}
                      placeholder={deleteConfirmation.userName}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                      autoFocus
                    />
                    {deleteConfirmation.typedName && deleteConfirmation.typedName !== deleteConfirmation.userName && (
                      <p className="text-xs text-red-400 mt-1">Name does not match</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-800/50 border-t border-slate-700 flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmation(null)}
                disabled={dialogLoading}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={executeDeleteUser}
                disabled={deleteConfirmation.typedName !== deleteConfirmation.userName || dialogLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {dialogLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete User
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}