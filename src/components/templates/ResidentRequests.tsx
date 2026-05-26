'use client';

import { useState } from 'react';
import { ResidentRequest, RequestType, ResidentUser } from '@/types';
import { FileText, Send, Clock, CheckCircle, XCircle, Plus, User, DollarSign, FileSpreadsheet, Users } from 'lucide-react';
import { formatCurrency } from '@/utils';

interface ResidentRequestsProps {
  currentUser?: ResidentUser;
  requests: ResidentRequest[];
  onSubmitRequest: (request: Omit<ResidentRequest, 'id' | 'createdAt' | 'status'>) => void;
}

const REQUEST_TYPES: { value: RequestType; label: string; icon: typeof User; description: string }[] = [
  {
    value: 'PLOT_SIZE_UPDATE',
    label: 'Plot Size Update',
    icon: User,
    description: 'Request to update your registered plot size',
  },
  {
    value: 'PAYMENT_ISSUE',
    label: 'Payment Issue',
    icon: DollarSign,
    description: 'Report payment discrepancies or issues',
  },
  {
    value: 'EXPENSE_SHEET_MONTHLY',
    label: 'Monthly Expense Sheet',
    icon: FileSpreadsheet,
    description: 'Request monthly expense breakdown',
  },
  {
    value: 'EXPENSE_SHEET_YEARLY',
    label: 'Yearly Expense Sheet',
    icon: FileSpreadsheet,
    description: 'Request annual expense summary',
  },
  {
    value: 'ADD_FAMILY_MEMBER',
    label: 'Add Family Member',
    icon: Users,
    description: 'Add a family member to your plot',
  },
];

export default function ResidentRequests({
  currentUser,
  requests,
  onSubmitRequest,
}: ResidentRequestsProps) {
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  const [selectedRequestType, setSelectedRequestType] = useState<RequestType | ''>('');
  const [description, setDescription] = useState('');
  const [newPlotSize, setNewPlotSize] = useState('');
  const [familyMemberName, setFamilyMemberName] = useState('');
  const [familyMemberRelationship, setFamilyMemberRelationship] = useState('');
  const [familyMemberContact, setFamilyMemberContact] = useState('');

  const handleSubmit = () => {
    if (!selectedRequestType || !description.trim() || !currentUser) {
      alert('Please fill in all required fields');
      return;
    }

    const baseRequest = {
      residentId: currentUser.id,
      residentName: currentUser.fullName,
      plotNumber: currentUser.plotNumber,
      requestType: selectedRequestType as RequestType,
      description: description.trim(),
    };

    let requestData: any = { ...baseRequest };

    // Add type-specific fields
    if (selectedRequestType === 'PLOT_SIZE_UPDATE' && newPlotSize) {
      requestData.newPlotSize = parseFloat(newPlotSize);
    }

    if (selectedRequestType === 'ADD_FAMILY_MEMBER') {
      if (!familyMemberName.trim() || !familyMemberRelationship.trim() || !familyMemberContact.trim()) {
        alert('Please fill in all family member details');
        return;
      }
      requestData.familyMemberDetails = {
        name: familyMemberName.trim(),
        relationship: familyMemberRelationship.trim(),
        contact: familyMemberContact.trim(),
      };
    }

    onSubmitRequest(requestData);

    // Reset form
    setSelectedRequestType('');
    setDescription('');
    setNewPlotSize('');
    setFamilyMemberName('');
    setFamilyMemberRelationship('');
    setFamilyMemberContact('');
    setIsCreatingRequest(false);
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

  const getRequestTypeLabel = (type: RequestType) => {
    return REQUEST_TYPES.find(rt => rt.value === type)?.label || type;
  };

  const userRequests = requests.filter(req => req.residentId === currentUser?.id);

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
              {currentUser?.plotData && (
                <p className="text-xs text-slate-500 mt-1">
                  Current: {currentUser.plotData.areaInSqFt.toFixed(2)} Sq.ft
                </p>
              )}
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
              className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
            >
              <Send className="w-4 h-4" />
              Submit Request
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
            <p className="text-sm text-slate-500 mt-1">Click "New Request" to get started</p>
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
                    {request.status}
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
                  <div className="p-3 bg-indigo-600/10 rounded border border-indigo-500/30">
                    <p className="text-xs text-indigo-400 mb-1">Admin Notes</p>
                    <p className="text-sm text-slate-300">{request.adminNotes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
