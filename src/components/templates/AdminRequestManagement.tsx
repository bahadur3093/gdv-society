'use client';

import { useState, useEffect, useCallback } from 'react';
import { ResidentRequest, RequestType, RequestComment } from '@/types';
import { FileText, CheckCircle, XCircle, Clock, Filter, Search, MessageSquare, User, DollarSign, FileSpreadsheet, Users, Send, Loader2, RotateCcw } from 'lucide-react';
import ConfirmDialog from '@/components/molecules/ConfirmDialog';
import Modal from '@/components/molecules/Modal';
import ToastModal, { ToastState, closedToast, openToast } from '@/components/molecules/ToastModal';

// interface AdminRequestManagementProps {}

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

export default function AdminRequestManagement() {
  // State for requests and UI
  const [requests, setRequests] = useState<ResidentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED' | 'REOPENED'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ResidentRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  
  // State for comments
  const [comments, setComments] = useState<RequestComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<ToastState>(closedToast());

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

  // Fetch requests on mount
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/requests?sortBy=createdAt&sortOrder=desc');
        const data = await response.json();

        if (data.success) {
          interface ApiRequestData {
            id: string;
            userId: string;
            userName: string;
            plotNumber: string;
            requestType: RequestType;
            status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED' | 'REOPENED';
            description: string;
            createdAt: string;
            updatedAt?: string;
            adminNotes?: string;
            resolvedAt?: string;
            resolvedBy?: string;
            lastResidentReplyAt?: string;
            reopenedAt?: string;
            reopenCount?: number;
            newPlotSize?: number;
            familyMemberName?: string;
            familyMemberRelation?: string;
            familyMemberContact?: string;
          }

          const formattedRequests = data.data.map((req: ApiRequestData) => ({
            id: req.id,
            residentId: req.userId,
            residentName: req.userName,
            plotNumber: req.plotNumber,
            requestType: req.requestType,
            status: req.status,
            description: req.description,
            createdAt: req.createdAt,
            updatedAt: req.updatedAt,
            adminNotes: req.adminNotes,
            resolvedAt: req.resolvedAt,
            resolvedBy: req.resolvedBy,
            lastResidentReplyAt: req.lastResidentReplyAt,
            reopenedAt: req.reopenedAt,
            reopenCount: req.reopenCount,
            newPlotSize: req.newPlotSize,
            familyMemberDetails: req.familyMemberName ? {
              name: req.familyMemberName,
              relationship: req.familyMemberRelation,
              contact: req.familyMemberContact,
            } : undefined,
          }));
          setRequests(formattedRequests);
        } else {
          console.error('Failed to fetch requests:', data.error);
        }
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/requests?sortBy=createdAt&sortOrder=desc');
      const data = await response.json();

      if (data.success) {
        interface ApiRequestData {
          id: string;
          userId: string;
          userName: string;
          plotNumber: string;
          requestType: RequestType;
          status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED' | 'REOPENED';
          description: string;
          createdAt: string;
          updatedAt?: string;
          adminNotes?: string;
          resolvedAt?: string;
          resolvedBy?: string;
          lastResidentReplyAt?: string;
          reopenedAt?: string;
          reopenCount?: number;
          newPlotSize?: number;
          familyMemberName?: string;
          familyMemberRelation?: string;
          familyMemberContact?: string;
        }

        const formattedRequests = data.data.map((req: ApiRequestData) => ({
          id: req.id,
          residentId: req.userId,
          residentName: req.userName,
          plotNumber: req.plotNumber,
          requestType: req.requestType,
          status: req.status,
          description: req.description,
          createdAt: req.createdAt,
          updatedAt: req.updatedAt,
          adminNotes: req.adminNotes,
          resolvedAt: req.resolvedAt,
          resolvedBy: req.resolvedBy,
          lastResidentReplyAt: req.lastResidentReplyAt,
          reopenedAt: req.reopenedAt,
          reopenCount: req.reopenCount,
          newPlotSize: req.newPlotSize,
          familyMemberDetails: req.familyMemberName ? {
            name: req.familyMemberName,
            relationship: req.familyMemberRelation,
            contact: req.familyMemberContact,
          } : undefined,
        }));
        setRequests(formattedRequests);
      } else {
        console.error('Failed to fetch requests:', data.error);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRequestDetails = useCallback(async (requestId: string) => {
    try {
      setLoadingComments(true);
      const response = await fetch(`/api/requests/${requestId}`);
      const data = await response.json();

      if (data.success) {
        setComments(data.data.comments || []);
      } else {
        console.error('Failed to fetch request details:', data.error);
      }
    } catch (error) {
      console.error('Error fetching request details:', error);
    } finally {
      setLoadingComments(false);
    }
  }, []);

  const handleAddComment = async (requestId: string) => {
    if (!newComment.trim()) {
      setToast(openToast('Comment Required', 'Please enter a comment before posting.', 'warning'));
      return;
    }

    try {
      setSubmittingComment(true);
      const response = await fetch(`/api/requests/${requestId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setNewComment('');
        // Refresh comments
        fetchRequestDetails(requestId);
        // Refresh requests to update status
        fetchRequests();
      } else {
        setToast(openToast('Failed to Add Comment', data.error || 'Failed to add comment', 'error'));
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      setToast(openToast('Error', 'An error occurred while adding the comment.', 'error'));
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUpdateStatus = async (requestId: string, status: string, notes?: string) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes: notes }),
      });

      const data = await response.json();

      if (data.success) {
        setToast(openToast('Status Updated', `Request marked as ${status.toLowerCase()} successfully.`, 'success'));
        setSelectedRequest(null);
        setAdminNotes('');
        fetchRequests();
      } else {
        setToast(openToast('Update Failed', data.error || 'Failed to update request', 'error'));
      }
    } catch (error) {
      console.error('Error updating request:', error);
      setToast(openToast('Error', 'An error occurred while updating the request.', 'error'));
    } finally {
      setUpdating(false);
    }
  };

  const handleResolveRequest = async (requestId: string) => {
    try {
      setResolving(true);
      const response = await fetch(`/api/requests/${requestId}/resolve`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setToast(openToast('Request Resolved', 'The request has been marked as resolved.', 'success'));
        setSelectedRequest(null);
        fetchRequests();
      } else {
        setToast(openToast('Resolve Failed', data.error || 'Failed to resolve request', 'error'));
      }
    } catch (error) {
      console.error('Error resolving request:', error);
      setToast(openToast('Error', 'An error occurred while resolving the request.', 'error'));
    } finally {
      setResolving(false);
    }
  };

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
  const inProgressCount = requests.filter(r => r.status === 'IN_PROGRESS').length;
  const resolvedCount = requests.filter(r => r.status === 'RESOLVED').length;
  const rejectedCount = requests.filter(r => r.status === 'REJECTED').length;
  const reopenedCount = requests.filter(r => r.status === 'REOPENED').length;

  const handleApprove = (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    
    setConfirmDialog({
      isOpen: true,
      title: 'Mark as In Progress',
      message: `Are you sure you want to mark this ${REQUEST_TYPE_LABELS[request?.requestType || 'PLOT_SIZE_UPDATE']} request from ${request?.residentName} as in progress?`,
      variant: 'info',
      confirmText: 'Mark In Progress',
      onConfirm: async () => {
        setDialogLoading(true);
        try {
          await handleUpdateStatus(requestId, 'IN_PROGRESS', adminNotes.trim() || undefined);
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        } finally {
          setDialogLoading(false);
        }
      },
    });
  };

  const handleReject = (requestId: string) => {
    if (!adminNotes.trim()) {
      setToast(openToast('Admin Notes Required', 'Please provide a reason for rejection in the admin notes.', 'warning'));
      return;
    }
    
    const request = requests.find(r => r.id === requestId);
    setConfirmDialog({
      isOpen: true,
      title: 'Reject Request',
      message: `Are you sure you want to reject this ${REQUEST_TYPE_LABELS[request?.requestType || 'PLOT_SIZE_UPDATE']} request from ${request?.residentName}? The resident will be notified with your admin notes.`,
      variant: 'danger',
      confirmText: 'Reject Request',
      onConfirm: async () => {
        setDialogLoading(true);
        try {
          await handleUpdateStatus(requestId, 'REJECTED', adminNotes.trim());
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        } finally {
          setDialogLoading(false);
        }
      },
    });
  };

  const handleViewRequest = (request: ResidentRequest) => {
    setSelectedRequest(request);
    setAdminNotes(request.adminNotes || '');
    fetchRequestDetails(request.id);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'IN_PROGRESS':
        return <MessageSquare className="w-5 h-5 text-blue-400" />;
      case 'REOPENED':
        return <RotateCcw className="w-5 h-5 text-orange-400" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return 'bg-green-600/20 text-green-400 border-green-500/30';
      case 'REJECTED':
        return 'bg-red-600/20 text-red-400 border-red-500/30';
      case 'IN_PROGRESS':
        return 'bg-blue-600/20 text-blue-400 border-blue-500/30';
      case 'REOPENED':
        return 'bg-orange-600/20 text-orange-400 border-orange-500/30';
      default:
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

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
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 bg-slate-900/30 border border-slate-800/40 rounded-lg">
          <p className="text-sm text-slate-400 mb-1">Total</p>
          <p className="text-2xl font-bold text-slate-100">{requests.length}</p>
        </div>
        <div className="p-4 bg-yellow-600/10 border border-yellow-500/30 rounded-lg">
          <p className="text-sm text-yellow-400 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
        </div>
        <div className="p-4 bg-blue-600/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-400 mb-1">In Progress</p>
          <p className="text-2xl font-bold text-blue-400">{inProgressCount}</p>
        </div>
        <div className="p-4 bg-orange-600/10 border border-orange-500/30 rounded-lg">
          <p className="text-sm text-orange-400 mb-1">Reopened</p>
          <p className="text-2xl font-bold text-orange-400">{reopenedCount}</p>
        </div>
        <div className="p-4 bg-green-600/10 border border-green-500/30 rounded-lg">
          <p className="text-sm text-green-400 mb-1">Resolved</p>
          <p className="text-2xl font-bold text-green-400">{resolvedCount}</p>
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
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED' | 'REOPENED')}
              className="px-4 py-3 bg-slate-900/50 border border-slate-800/40 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="REOPENED">Reopened</option>
              <option value="RESOLVED">Resolved</option>
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

                  {/* Action Buttons */}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleViewRequest(request)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-all duration-300 ease-in-out"
                    >
                      <MessageSquare className="w-4 h-4" />
                      View Details
                    </button>
                    {(request.status === 'PENDING' || request.status === 'REOPENED') && (
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setAdminNotes(request.adminNotes || '');
                          handleApprove(request.id);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-all duration-300 ease-in-out"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Mark In Progress
                      </button>
                    )}
                    {request.status !== 'RESOLVED' && request.status !== 'REJECTED' && (
                      <button
                        onClick={() => handleResolveRequest(request.id)}
                        disabled={resolving}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Resolve
                      </button>
                    )}
                  </div>
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

      {/* Toast notifications */}
      <ToastModal
        {...toast}
        onClose={() => setToast(closedToast())}
      />

      {/* Request Details Modal */}
      {selectedRequest && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedRequest(null)}
          title={REQUEST_TYPE_LABELS[selectedRequest.requestType]}
          subtitle={`${selectedRequest.residentName} • Plot #${selectedRequest.plotNumber} • ${new Date(selectedRequest.createdAt).toLocaleDateString('en-IN')}`}
          size="lg"
          footer={
            selectedRequest.status !== 'RESOLVED' && selectedRequest.status !== 'REJECTED' ? (
              <div className="space-y-3">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Add a comment..."
                />
                <button
                  onClick={() => handleAddComment(selectedRequest.id)}
                  disabled={submittingComment || !newComment.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingComment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Post Comment
                    </>
                  )}
                </button>
              </div>
            ) : undefined
          }
        >
          <div className="space-y-6">
              {/* Request Details */}
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">Description</h3>
                <p className="text-slate-100">{selectedRequest.description}</p>
              </div>

              {selectedRequest.newPlotSize && (
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Requested Plot Size</h3>
                  <p className="text-cyan-400 font-mono">{selectedRequest.newPlotSize.toFixed(2)} Sq.ft</p>
                </div>
              )}

              {selectedRequest.familyMemberDetails && (
                <div>
                  <h3 className="text-sm font-medium text-slate-400 mb-2">Family Member Details</h3>
                  <div className="space-y-1">
                    <p className="text-slate-100"><span className="text-slate-500">Name:</span> {selectedRequest.familyMemberDetails.name}</p>
                    <p className="text-slate-100"><span className="text-slate-500">Relationship:</span> {selectedRequest.familyMemberDetails.relationship}</p>
                    <p className="text-slate-100 font-mono"><span className="text-slate-500">Contact:</span> {selectedRequest.familyMemberDetails.contact}</p>
                  </div>
                </div>
              )}

              {/* Admin Notes Section */}
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">Admin Notes</h3>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Add admin notes..."
                />
                {selectedRequest.status !== 'RESOLVED' && selectedRequest.status !== 'REJECTED' && (
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={() => handleUpdateStatus(selectedRequest.id, selectedRequest.status, adminNotes.trim())}
                      disabled={updating}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Update Notes
                    </button>
                    <button
                      onClick={() => handleReject(selectedRequest.id)}
                      disabled={updating}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject Request
                    </button>
                  </div>
                )}
              </div>

              {/* Comments Section */}
              <div>
                <h3 className="text-lg font-bold text-slate-100 mb-4">Comments</h3>
                {loadingComments ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                  </div>
                ) : comments.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No comments yet</p>
                ) : (
                  <div className="space-y-3">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className={`p-4 rounded-lg border ${
                          comment.isAdminComment
                            ? 'bg-indigo-600/10 border-indigo-500/30'
                            : 'bg-slate-800/50 border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-100">{comment.authorName}</span>
                            {comment.isAdminComment && (
                              <span className="px-2 py-0.5 text-xs bg-indigo-600 text-white rounded">Admin</span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500">
                            {new Date(comment.createdAt).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <p className="text-slate-300 whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
