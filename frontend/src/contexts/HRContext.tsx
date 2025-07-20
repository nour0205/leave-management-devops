
import React, { createContext, useContext, useState } from 'react';
import { User, LeaveRequest, HRContextType, UserRole } from '@/types/hr';
import { differenceInDays } from 'date-fns';

const mockUsers: Record<UserRole, User> = {
  employee: {
    id: 'emp-1',
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'employee',
    department: 'Engineering',
    leaveBalance: 18,
    totalLeaves: 25
  },
  manager: {
    id: 'mgr-1',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@company.com',
    role: 'manager',
    department: 'Engineering',
    leaveBalance: 20,
    totalLeaves: 30
  }
};

const mockLeaveRequests: LeaveRequest[] = [
  {
    id: 'req-1',
    employeeId: 'emp-1',
    employeeName: 'John Doe',
    startDate: new Date('2024-08-15'),
    endDate: new Date('2024-08-17'),
    reason: 'Family vacation',
    status: 'pending',
    requestedAt: new Date('2024-07-10')
  },
  {
    id: 'req-2',
    employeeId: 'emp-2',
    employeeName: 'Alice Smith',
    startDate: new Date('2024-08-20'),
    endDate: new Date('2024-08-22'),
    reason: 'Medical appointment',
    status: 'approved',
    requestedAt: new Date('2024-07-12'),
    reviewedAt: new Date('2024-07-13'),
    reviewedBy: 'Sarah Wilson',
    reviewNotes: 'Approved for medical reasons'
  }
];

const HRContext = createContext<HRContextType | undefined>(undefined);

export function HRProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('employee');
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(mockLeaveRequests);
  const [users, setUsers] = useState(mockUsers);
  
  const currentUser = users[currentRole];

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
  };

  const submitLeaveRequest = (request: Omit<LeaveRequest, 'id' | 'employeeId' | 'employeeName' | 'status' | 'requestedAt'>) => {
    const newRequest: LeaveRequest = {
      ...request,
      id: `req-${Date.now()}`,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      status: 'pending',
      requestedAt: new Date()
    };
    
    setLeaveRequests(prev => [newRequest, ...prev]);
  };

  const reviewLeaveRequest = (requestId: string, status: 'approved' | 'rejected', notes?: string) => {
    const request = leaveRequests.find(req => req.id === requestId);
    
    if (request && status === 'approved') {
      // Calculate leave days
      const leaveDays = differenceInDays(request.endDate, request.startDate) + 1;
      
      // Update the employee's leave balance
      setUsers(prevUsers => {
        const updatedUsers = { ...prevUsers };
        
        // Find the employee (check both employee and manager roles)
        if (updatedUsers.employee.id === request.employeeId) {
          updatedUsers.employee = {
            ...updatedUsers.employee,
            leaveBalance: Math.max(0, updatedUsers.employee.leaveBalance - leaveDays)
          };
        } else if (updatedUsers.manager.id === request.employeeId) {
          updatedUsers.manager = {
            ...updatedUsers.manager,
            leaveBalance: Math.max(0, updatedUsers.manager.leaveBalance - leaveDays)
          };
        }
        
        return updatedUsers;
      });
    }

    setLeaveRequests(prev => prev.map(request => 
      request.id === requestId 
        ? {
            ...request,
            status,
            reviewedAt: new Date(),
            reviewedBy: currentUser.name,
            reviewNotes: notes
          }
        : request
    ));
  };

  return (
    <HRContext.Provider value={{
      currentUser,
      leaveRequests,
      switchRole,
      submitLeaveRequest,
      reviewLeaveRequest
    }}>
      {children}
    </HRContext.Provider>
  );
}

export function useHR() {
  const context = useContext(HRContext);
  if (context === undefined) {
    throw new Error('useHR must be used within an HRProvider');
  }
  return context;
}
