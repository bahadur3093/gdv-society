'use client';

import { useState } from 'react';
import { ResidentRequest, RequestType } from '@/types';
import { FileText, CheckCircle, XCircle, Clock, Filter, Search, MessageSquare, User, DollarSign, FileSpreadsheet, Users } from 'lucide-react';
import ConfirmDialog from '@/components/molecules/ConfirmDialog';

interface AdminRequestManagementProps {
  requests: ResidentRequest[];
  onApproveRequest: (id: string, adminNotes?: string) => void;
  onRejectRequest: (id: string, adminNotes?: string) => void;
}

const REQUEST_TYPE_ICONS: Record<RequestType, typeof User> = {
  PLOT_SIZE_UPDATE: User,
  PAYMENT_ISSUE: DollarSign,
  EXPENSE_SHEET_MONTHLY: FileSpreadsheet,
  EXPENSE_SHEET_YEARLY: FileSpreadsheet,
  ADD_FAMILY_MEMBER: Users,
  PASSWORD_RESET: User,
};

const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  PLOT_SIZE_UPDATE: 'Plot Size Update',
  PAYMENT_ISSUE: 'Payment Issue',
  EXPENSE_SHEET_MONTHLY: 'Monthly Expense Sheet',
  EXPENSE_SHEET_YEARLY: 'Yearly Expense Sheet',
  ADD_FAMILY_MEMBER: 'Add Family Member',
  PASSWORD_RESET: 'Password Reset Request',
};

export default function AdminRequestManagement({
  requests,
  onApproveRequest,
  onRejectRequest,
}: AdminRequestManagementProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ResidentRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  
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

  const filteredRequests = requests.filter((request) => {
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesSearch =
      searchQuery === '' ||
      request.residentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.plotNumber.includes(searchQuery) ||
      request.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;
  const approvedCount = requests.filter(r => r.status === 'APPROVED').length;
  const rejectedCount = requests.filter(r => r.status === 'REJECTED').length;

  const handleApprove = (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    
    // Special handling for password reset requests
    if (request?.requestType === 'PASSWORD_RESET') {
      setConfirmDialog({
        isOpen: true,
        title: 'Approve Password Reset',
        message: 'Approving this request will clear the user\'s password and require them to set a new one on next login. The user will receive a notification and will be prompted to create a new password when they attempt to log in.',
        variant: 'warning',
        confirmText: 'Approve Reset',
        onConfirm: async () => {
          setDialogLoading(true);
          try {
            const response = await fetch('/api/admin/approve-password-reset', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                requestId,
                adminNotes: adminNotes.trim() || 'Password reset approved',
              }),
            });

            if (!response.ok) {
              const data = await response.json();
              alert(data.error || 'Failed to approve password reset request');
              return;
            }

            onApproveRequest(requestId, adminNotes.trim() || undefined);
            setSelectedRequest(null);
            setAdminNotes('');
            setConfirmDialog({ ...confirmDialog, isOpen: false });
            alert('Password reset approved. User will be prompted to set a new password on next login.');
          } catch (error) {
            console.error('Error approving password reset:', error);
            alert('An error occurred while approving the password reset request');
          } finally {
            setDialogLoading(false);
          }
        },
      });
    } else {
      // Standard approval for other request types
      setConfirmDialog({
        isOpen: true,
        title: 'Approve Request',
        message: `Are you sure you want to approve this ${REQUEST_TYPE_LABELS[request?.requestType || 'PLOT_SIZE_UPDATE']} request from ${request?.residentName}?`,
        variant: 'success',
        confirmText: 'Approve Request',
        onConfirm: () => {
          onApproveRequest(requestId, adminNotes.trim() || undefined);
          setSelectedRequest(null);
          setAdminNotes('');
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        },
      });
    }
  };

  const handleReject = (requestId: string) => {
    if (!adminNotes.trim()) {
      alert('Please provide a reason for rejection in the admin notes.');
      return;
    }
    
    const request = requests.find(r => r.id === requestId);
    setConfirmDialog({
      isOpen: true,
      title: 'Reject Request',
      message: `Are you sure you want to reject this ${REQUEST_TYPE_LABELS[request?.requestType || 'PLOT_SIZE_UPDATE']} request from ${request?.residentName}? The resident will be notified with your admin notes.`,
      variant: 'danger',
      confirmText: 'Reject Request',
      onConfirm: () => {
        onRejectRequest(requestId, adminNotes.trim());
        setSelectedRequest(null);
        setAdminNotes('');
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      },
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-600/20 text-green-400 border-green-500/30';
      case 'REJECTED':
        return 'bg-red-600/20 text-red-400 border-red-500/30';
      default:
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <FileText className="w-8 h-8 text-indigo-400" />
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Resident Requests</h1>
          <p className="text-slate-400">Review and manage resident requests</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/30 border border-slate-800/40 rounded-lg">
          <p className="text-sm text-slate-400 mb-1">Total Requests</p>
          <p className="text-2xl font-bold text-slate-100">{requests.length}</p>
        </div>
        <div className="p-4 bg-yellow-600/10 border border-yellow-500/30 rounded-lg">
          <p className="text-sm text-yellow-400 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
        </div>
        <div className="p-4 bg-green-600/10 border border-green-500/30 rounded-lg">
          <p className="text-sm text-green-400 mb-1">Approved</p>
          <p className="text-2xl font-bold text-green-400">{approvedCount}</p>
        </div>
        <div className="p-4 bg-red-600/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400 mb-1">Rejected</p>
          <p className="text-2xl font-bold text-red-400">{rejectedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900/30 border border-slate-800/40 rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by resident name, plot number, or description..."
                className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-800/40 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>
          
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-3 bg-slate-900/50 border border-slate-800/40 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-slate-900/30 border border-slate-800/40 rounded-lg p-6">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400">No requests found</p>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => {
              const Icon = REQUEST_TYPE_ICONS[request.requestType];
              const isSelected = selectedRequest?.id === request.id;
              
              return (
                <div
                  key={request.id}
                  className="p-4 bg-slate-900/50 border border-slate-800/40 rounded-lg hover:border-slate-700 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-indigo-400" />
                      <div>
                        <h3 className="font-medium text-slate-100">
                          {REQUEST_TYPE_LABELS[request.requestType]}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {request.residentName} • Plot #{request.plotNumber} • {new Date(request.createdAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full border capitalize ${
                          getStatusColor(request.status)
                        }`}
                      >
                        {request.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 mb-3">{request.description}</p>

                  {/* Type-specific display */}
                  {request.newPlotSize && (
                    <div className="mb-3 p-3 bg-slate-900/50 rounded border border-slate-800/40">
                      <p className="text-xs text-slate-500 mb-1">Requested Plot Size</p>
                      <p className="text-sm font-mono text-cyan-400">{request.newPlotSize.toFixed(2)} Sq.ft</p>
                    </div>
                  )}

                  {request.familyMemberDetails && (
                    <div className="mb-3 p-3 bg-slate-900/50 rounded border border-slate-800/40">
                      <p className="text-xs text-slate-500 mb-2">Family Member Details</p>
                      <div className="space-y-1">
                        <p className="text-sm text-slate-300">
                          <span className="text-slate-500">Name:</span> {request.familyMemberDetails.name}
                        </p>
                        <p className="text-sm text-slate-300">
                          <span className="text-slate-500">Relationship:</span> {request.familyMemberDetails.relationship}
                        </p>
                        <p className="text-sm text-slate-300 font-mono">
                          <span className="text-slate-500">Contact:</span> {request.familyMemberDetails.contact}
                        </p>
                      </div>
                    </div>
                  )}

                  {request.adminNotes && (
                    <div className="mb-3 p-3 bg-indigo-600/10 rounded border border-indigo-500/30">
                      <p className="text-xs text-indigo-400 mb-1">Admin Notes</p>
                      <p className="text-sm text-slate-300">{request.adminNotes}</p>
                    </div>
                  )}

                  {/* Action Buttons for Pending Requests */}
                  {request.status === 'PENDING' && (
                    <div className="mt-4">
                      {isSelected ? (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              <MessageSquare className="w-4 h-4 inline mr-1" />
                              Admin Notes {request.status === 'PENDING' && '(Required for rejection)'}
                            </label>
                            <textarea
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              rows={3}
                              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800/40 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 resize-none"
                              placeholder="Add notes about this request..."
                            />
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleApprove(request.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(request.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRequest(null);
                                setAdminNotes('');
                              }}
                              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all duration-300 ease-in-out"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setAdminNotes(request.adminNotes || '');
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Review Request
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

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
    </div>
  );
}
