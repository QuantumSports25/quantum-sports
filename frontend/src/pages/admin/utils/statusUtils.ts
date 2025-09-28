import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
    case 'confirmed':
    case 'approved':
      return 'text-green-400 bg-green-900/20 border-green-800';
    case 'under_review':
      return 'text-yellow-400 bg-yellow-900/20 border-yellow-800';
    case 'cancelled':
    case 'rejected':
    case 'failed':
    case 'blocked':
      return 'text-red-400 bg-red-900/20 border-red-800';
    default:
      return 'text-gray-400 bg-gray-900/20 border-gray-800';
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
    case 'confirmed':
    case 'approved':
      return CheckCircle;
    case 'pending':
    case 'under_review':
      return Clock;
    case 'cancelled':
    case 'rejected':
    case 'blocked':
      return XCircle;
    default:
      return AlertCircle;
  }
}; 