import { CheckCircle, Clock, XCircle } from 'lucide-react';

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'confirmed':
      return 'bg-green-400/10 text-green-400';
    case 'pending':
      return 'bg-yellow-400/10 text-yellow-400';
    case 'cancelled':
      return 'bg-red-400/10 text-red-400';
    default:
      return 'bg-gray-400/10 text-gray-400';
  }
};

export const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'confirmed':
      return CheckCircle;
    case 'pending':
      return Clock;
    case 'cancelled':
      return XCircle;
    default:
      return Clock;
  }
};