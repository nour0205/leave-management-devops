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

export interface Attachment {
  id: string;
  fileUrl: string;
  uploadedAt: Date;
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
  attachments?: Attachment[]; 
}

export interface HRContextType {
  currentUser: User | null;
  leaveRequests: LeaveRequest[];
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  submitLeaveRequest: (request: Omit<LeaveRequest, 'id' | 'employeeId' | 'employeeName' | 'status' | 'requestedAt'>) => void;
  reviewLeaveRequest: (requestId: string, status: 'approved' | 'rejected', notes?: string) => void;
   refreshLeaves: () => Promise<void>;
}