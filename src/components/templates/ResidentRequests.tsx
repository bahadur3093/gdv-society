'use client';

import { useState, useMemo, useEffect } from 'react';
import { ResidentRequest, RequestType, RequestStatus, AppConfigItem, RequestComment } from '@/types';
import { FileText, Send, Clock, CheckCircle, XCircle, Plus, User, DollarSign, FileSpreadsheet, Users, MessageSquare, RotateCcw, Loader2 } from 'lucide-react';
import { useAppConfig } from '@/hooks/useAppConfig';
import Modal from '@/components/molecules/Modal';
import ConfirmDialog from '@/components/molecules/ConfirmDialog';
import ToastModal, { ToastState, closedToast, openToast } from '@/components/molecules/ToastModal';
import { AppUser, useUser } from '../providers/UserProvider';

const ICON_MAP: Record<string, typeof User> = {
  User,
  DollarSign,
  FileSpreadsheet,
  Users,
  FileText,
};

export default function ResidentRequests() {
  const currentUser = useUser();
  const { config: requestTypesConfig, loading: configLoading, error: configError } = useAppConfig('residents_request_type');

  const REQUEST_TYPES = useMemo(() => {
    if (!requestTypesConfig || configError) {
      return [];
    }

    return requestTypesConfig?.map((item: AppConfigItem) => ({
      value: item.value as RequestType,
      label: item.label,
      icon: ICON_MAP[item.icon] || User, // Fallback to User icon if not found
      description: item.description,
      enable: item.enable ?? true, // Default to true if not specified
    }));
  }, [requestTypesConfig, configError]);

  // State for requests and UI
  const [requests, setRequests] = useState<ResidentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  const [selectedRequestType, setSelectedRequestType] = useState<RequestType | ''>('');
  const [description, setDescription] = useState('');
  const [newPlotSize, setNewPlotSize] = useState('');
  const [familyMemberName, setFamilyMemberName] = useState('');
  const [familyMemberRelationship, setFamilyMemberRelationship] = useState('');
  const [familyMemberContact, setFamilyMemberContact] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // State for viewing request details
  const [selectedRequest, setSelectedRequest] = useState<ResidentRequest | null>(null);
  const [comments, setComments] = useState<RequestComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [showReopenForm, setShowReopenForm] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [reopening, setReopening] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<ToastState>(closedToast());

  // Confirm dialog for resolve action
  const [confirmResolve, setConfirmResolve] = useState<{ isOpen: boolean; requestId: string }>(
    { isOpen: false, requestId: '' }
  );
  const [resolveDialogLoading, setResolveDialogLoading] = useState(false);

  // Fetch requests on mount
  useEffect(() => {
    if (!currentUser) return;

    const loadRequests = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/requests?sortBy=createdAt&sortOrder=desc');
        const data = await response.json();

        if (data.success) {
          const formattedRequests = data.data.map((req: {
            id: string;
            userId: string;
            userName: string;
            plotNumber: string;
            requestType: RequestType;
            status: RequestStatus;
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
          }) => ({
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

    loadRequests();
  }, [currentUser]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/requests?sortBy=createdAt&sortOrder=desc');
      const data = await response.json();

      if (data.success) {
        const formattedRequests = data.data.map((req: {
          id: string;
          userId: string;
          userName: string;
          plotNumber: string;
          requestType: RequestType;
          status: RequestStatus;
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
        }) => ({
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

  const handleSubmit = async () => {
    if (!selectedRequestType || !description.trim() || !currentUser) {
      setToast(openToast('Missing Fields', 'Please fill in all required fields.', 'warning'));
      return;
    }

    if (selectedRequestType === 'ADD_FAMILY_MEMBER') {
      if (!familyMemberName.trim() || !familyMemberRelationship.trim() || !familyMemberContact.trim()) {
        setToast(openToast('Missing Fields', 'Please fill in all family member details.', 'warning'));
        return;
      }
    }

    try {
      setSubmitting(true);

      const requestBody: {
        requestType: RequestType;
        description: string;
        newPlotSize?: number;
        familyMemberDetails?: {
          name: string;
          relationship: string;
          contact: string;
        };
      } = {
        requestType: selectedRequestType,
        description: description.trim(),
      };

      if (selectedRequestType === 'PLOT_SIZE_UPDATE' && newPlotSize) {
        requestBody.newPlotSize = parseFloat(newPlotSize);
      }

      if (selectedRequestType === 'ADD_FAMILY_MEMBER') {
        requestBody.familyMemberDetails = {
          name: familyMemberName.trim(),
          relationship: familyMemberRelationship.trim(),
          contact: familyMemberContact.trim(),
        };
      }

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        setToast(openToast('Request Submitted', 'Your request has been submitted successfully!', 'success'));
        // Reset form
        setSelectedRequestType('');
        setDescription('');
        setNewPlotSize('');
        setFamilyMemberName('');
        setFamilyMemberRelationship('');
        setFamilyMemberContact('');
        setIsCreatingRequest(false);
        // Refresh requests
        fetchRequests();
      } else {
        setToast(openToast('Submission Failed', data.error || 'Failed to submit request', 'error'));
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      setToast(openToast('Error', 'An error occurred while submitting the request.', 'error'));
    } finally {
      setSubmitting(false);
    }
  };

  const fetchRequestDetails = async (requestId: string) => {
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
  };

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

  const handleResolveRequest = async (requestId: string) => {
    try {
      setResolveDialogLoading(true);
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
      setResolveDialogLoading(false);
      setConfirmResolve({ isOpen: false, requestId: '' });
    }
  };

  const handleReopenRequest = async (requestId: string) => {
    if (!reopenReason.trim()) {
      setToast(openToast('Reason Required', 'Please provide a reason for reopening this request.', 'warning'));
      return;
    }

    try {
      setReopening(true);
      const response = await fetch(`/api/requests/${requestId}/reopen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reopenReason.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setToast(openToast('Request Reopened', 'The request has been reopened successfully.', 'success'));
        setReopenReason('');
        setShowReopenForm(false);
        setSelectedRequest(null);
        fetchRequests();
      } else {
        setToast(openToast('Reopen Failed', data.error || 'Failed to reopen request', 'error'));
      }
    } catch (error) {
      console.error('Error reopening request:', error);
      setToast(openToast('Error', 'An error occurred while reopening the request.', 'error'));
    } finally {
      setReopening(false);
    }
  };

  const handleViewRequest = (request: ResidentRequest) => {
    setSelectedRequest(request);
    setShowReopenForm(false);
    setReopenReason('');
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

  const getRequestTypeLabel = (type: RequestType) => {
    return REQUEST_TYPES.find(rt => rt.value === type)?.label || type;
  };

  const userRequests = requests.filter(req => req.residentId === currentUser?.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-violet-400" />
          <div>
            <h1 className="text-3xl font-bold text-slate-100">My Requests</h1>
            <p className="text-slate-400">Submit and track your requests to the admin</p>
          </div>
        </div>
        <button
          onClick={() => setIsCreatingRequest(!isCreatingRequest)}
          className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
        >
          <Plus className="w-5 h-5" />
          New Request
        </button>
      </div>

      {/* Create Request Form */}
      {isCreatingRequest && (
        <div className="bg-slate-900/30 border border-slate-800/40 rounded-lg p-6">
          <h2 className="text-lg font-bold text-slate-100 mb-4">Create New Request</h2>
          
          {/* Request Type Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">Request Type *</label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {REQUEST_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => setSelectedRequestType(type.value)}
                    className={`p-4 rounded-lg border-2 text-left transition-all duration-300 ${
                      selectedRequestType === type.value
                        ? 'border-violet-500 bg-violet-600/20'
                        : 'border-slate-800/40 bg-slate-900/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-5 h-5 text-violet-400" />
                      <span className="font-medium text-slate-100 text-sm">{type.label}</span>
                    </div>
                    <p className="text-xs text-slate-400">{type.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Type-specific fields */}
          {selectedRequestType === 'PLOT_SIZE_UPDATE' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                New Plot Size (Sq.ft) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newPlotSize}
                onChange={(e) => setNewPlotSize(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800/40 rounded-lg text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
                placeholder="1200.00"
              />
              {/* {currentUser?.plotData && (
                <p className="text-xs text-slate-500 mt-1">
                  Current: {currentUser.plotData.areaInSqFt.toFixed(2)} Sq.ft
                </p>
              )} */}
            </div>
          )}

          {selectedRequestType === 'ADD_FAMILY_MEMBER' && (
            <div className="mb-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={familyMemberName}
                  onChange={(e) => setFamilyMemberName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800/40 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Relationship *</label>
                <input
                  type="text"
                  value={familyMemberRelationship}
                  onChange={(e) => setFamilyMemberRelationship(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800/40 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
                  placeholder="Spouse, Child, Parent, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Contact Number *</label>
                <input
                  type="tel"
                  value={familyMemberContact}
                  onChange={(e) => setFamilyMemberContact(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800/40 rounded-lg text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800/40 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 resize-none"
              placeholder="Provide details about your request..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Request
                </>
              )}
            </button>
            <button
              onClick={() => {
                setIsCreatingRequest(false);
                setSelectedRequestType('');
                setDescription('');
                setNewPlotSize('');
                setFamilyMemberName('');
                setFamilyMemberRelationship('');
                setFamilyMemberContact('');
              }}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all duration-300 ease-in-out"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Requests List */}
      <div className="bg-slate-900/30 border border-slate-800/40 rounded-lg p-6">
        <h2 className="text-lg font-bold text-slate-100 mb-4">Request History</h2>
        {userRequests.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400">No requests submitted yet</p>
            <p className="text-sm text-slate-500 mt-1">Click `&quot;`New Request`&quot;` to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userRequests.map((request) => (
              <div
                key={request.id}
                className="p-4 bg-slate-900/50 border border-slate-800/40 rounded-lg hover:border-slate-700 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(request.status)}
                    <div>
                      <h3 className="font-medium text-slate-100">{getRequestTypeLabel(request.requestType)}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Submitted on {new Date(request.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full border capitalize ${
                      getStatusColor(request.status)
                    }`}
                  >
                    {request.status.replace('_', ' ')}
                  </span>
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
                      <p className="text-sm text-slate-300"><span className="text-slate-500">Name:</span> {request.familyMemberDetails.name}</p>
                      <p className="text-sm text-slate-300"><span className="text-slate-500">Relationship:</span> {request.familyMemberDetails.relationship}</p>
                      <p className="text-sm text-slate-300 font-mono"><span className="text-slate-500">Contact:</span> {request.familyMemberDetails.contact}</p>
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
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-lg transition-all duration-300 ease-in-out"
                  >
                    <MessageSquare className="w-4 h-4" />
                    View Details
                  </button>
                  {request.status !== 'RESOLVED' && request.status !== 'REJECTED' && (
                    <button
                      onClick={() => setConfirmResolve({ isOpen: true, requestId: request.id })}
                      disabled={resolving}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark Resolved
                    </button>
                  )}
                  {request.status === 'RESOLVED' && (
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowReopenForm(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-lg transition-all duration-300 ease-in-out"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reopen Request
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Details Modal */}
      {selectedRequest && !showReopenForm && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedRequest(null)}
          title={getRequestTypeLabel(selectedRequest.requestType)}
          subtitle={`Request #${selectedRequest.id.slice(0, 8)} • ${new Date(selectedRequest.createdAt).toLocaleDateString('en-IN')}`}
          size="lg"
          footer={
            selectedRequest.status !== 'RESOLVED' && selectedRequest.status !== 'REJECTED' ? (
              <div className="space-y-3">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                  placeholder="Add a comment..."
                />
                <button
                  onClick={() => handleAddComment(selectedRequest.id)}
                  disabled={submittingComment || !newComment.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
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

              {/* Comments Section */}
              <div>
                <h3 className="text-lg font-bold text-slate-100 mb-4">Comments</h3>
                {loadingComments ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
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

      {/* Reopen Request Modal */}
      {selectedRequest && showReopenForm && (
        <Modal
          isOpen={true}
          onClose={() => {
            setShowReopenForm(false);
            setReopenReason('');
            setSelectedRequest(null);
          }}
          title="Reopen Request"
          size="sm"
          footer={
            <div className="space-y-3">
              <textarea
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                placeholder="Explain why you're reopening this request..."
              />
              <div className="flex gap-3">
                <button
                  onClick={() => handleReopenRequest(selectedRequest.id)}
                  disabled={reopening || !reopenReason.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {reopening ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Reopening...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      Reopen Request
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowReopenForm(false);
                    setReopenReason('');
                    setSelectedRequest(null);
                  }}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all duration-300 ease-in-out"
                >
                  Cancel
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            <p className="text-slate-300">Please provide a reason for reopening this request:</p>
          </div>
        </Modal>
      )}
      {/* Confirm resolve dialog */}
      <ConfirmDialog
        isOpen={confirmResolve.isOpen}
        onClose={() => setConfirmResolve({ isOpen: false, requestId: '' })}
        onConfirm={() => handleResolveRequest(confirmResolve.requestId)}
        title="Mark as Resolved"
        message="Are you sure you want to mark this request as resolved? The resident will be notified."
        variant="success"
        confirmText="Mark Resolved"
        loading={resolveDialogLoading}
      />

      {/* Toast notifications */}
      <ToastModal
        {...toast}
        onClose={() => setToast(closedToast())}
      />
    </div>
  );
}
