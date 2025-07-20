export type UserRole = 'employee' | 'manager';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  leaveBalance: number;
  totalLeaves: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface HRContextType {
  currentUser: User | null;
  leaveRequests: LeaveRequest[];
  switchRole: (role: UserRole) => void;
  submitLeaveRequest: (request: Omit<LeaveRequest, 'id' | 'employeeId' | 'employeeName' | 'status' | 'requestedAt'>) => void;
  reviewLeaveRequest: (requestId: string, status: 'approved' | 'rejected', notes?: string) => void;
}