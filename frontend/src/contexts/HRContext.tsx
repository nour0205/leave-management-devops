import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, LeaveRequest, HRContextType, UserRole } from '@/types/hr';

const HRContext = createContext<HRContextType | undefined>(undefined);

export function HRProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) return false;

      const { token, user } = await res.json();
      localStorage.setItem('token', token);
      setCurrentUser(user);
      setIsAuthenticated(true);

      // Load leave requests
      const leaveRes = await fetch('/api/leaves', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const leaves = await leaveRes.json();
      setLeaveRequests(leaves);

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setLeaveRequests([]);
    localStorage.removeItem('token');
  };

  const switchRole = (_role: UserRole) => {
    // Disabled in live version — roles are backend-determined
  };

  const submitLeaveRequest = async (request: Omit<LeaveRequest, 'id' | 'employeeId' | 'employeeName' | 'status' | 'requestedAt'>) => {
    if (!currentUser) return;

    const token = localStorage.getItem('token');
    const res = await fetch('/api/leaves', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...request,
        employeeId: currentUser.id,
        employeeName: currentUser.name,
      }),
    });

    const newLeave = await res.json();
    setLeaveRequests(prev => [newLeave, ...prev]);
  };

  const reviewLeaveRequest = async (requestId: string, status: 'approved' | 'rejected', notes?: string) => {
    if (!currentUser) return;

    const token = localStorage.getItem('token');
    const res = await fetch(`/api/leaves/${requestId}/review`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status,
        reviewedById: currentUser.id,
        reviewedByName: currentUser.name,
        reviewNotes: notes,
      }),
    });

    const updated = await res.json();

    setLeaveRequests(prev =>
      prev.map(req => (req.id === requestId ? updated : req))
    );
  };

  const refreshLeaves = async () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await fetch('/api/leaves', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch leave requests");
    
    const updatedLeaves = await res.json();
    setLeaveRequests(updatedLeaves);
  } catch (err) {
    console.error("refreshLeaves error:", err);
  }
};


  return (
    <HRContext.Provider value={{
      currentUser,
      isAuthenticated,
      leaveRequests,
      login,
      logout,
      switchRole,
      submitLeaveRequest,
      reviewLeaveRequest,
      refreshLeaves
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
