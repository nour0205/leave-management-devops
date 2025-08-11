import React, { createContext, useContext, useState } from 'react';
import { User, LeaveRequest, HRContextType, UserRole } from '@/types/hr';

const HRContext = createContext<HRContextType | undefined>(undefined);

export function HRProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);

  // === LOGIN FUNCTION ===
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

      // ✅ Load leave requests safely
      const leaveRes = await fetch('/api/leaves', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!leaveRes.ok) {
        console.error("❌ Failed to load leave requests:", await leaveRes.text());
        setLeaveRequests([]);
      } else {
        const data = await leaveRes.json();
        setLeaveRequests(Array.isArray(data) ? data : []);
      }

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // === LOGOUT ===
  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setLeaveRequests([]);
    localStorage.removeItem('token');
  };

  // === DISABLED ROLE SWITCHER ===
  const switchRole = (_role: UserRole) => {
    // Roles are backend-enforced; no frontend switch
  };

  // === SUBMIT LEAVE REQUEST ===
  const submitLeaveRequest = async (
    request: Omit<LeaveRequest, 'id' | 'employeeId' | 'employeeName' | 'status' | 'requestedAt'>
  ) => {
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

    if (!res.ok) {
      console.error("❌ Failed to submit leave:", await res.text());
      return;
    }

    const newLeave = await res.json();
    setLeaveRequests(prev => [newLeave, ...prev]);
  };

  // === REVIEW LEAVE REQUEST (Manager only) ===
  const reviewLeaveRequest = async (
    requestId: string,
    status: 'approved' | 'rejected',
    notes?: string
  ) => {
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
        reviewNotes: notes,
      }),
    });

    if (!res.ok) {
      console.error("❌ Failed to review leave:", await res.text());
      return;
    }

    const updated = await res.json();
    setLeaveRequests(prev =>
      prev.map(req => (req.id === requestId ? updated : req))
    );
  };

  // === REFRESH LEAVES ===
  const refreshLeaves = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('/api/leaves', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("❌ refreshLeaves error:", await res.text());
        setLeaveRequests([]);
        return;
      }

      const data = await res.json();
      setLeaveRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("refreshLeaves crash:", err);
      setLeaveRequests([]);
    }
  };

  return (
    <HRContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        leaveRequests,
        login,
        logout,
        switchRole,
        submitLeaveRequest,
        reviewLeaveRequest,
        refreshLeaves,
      }}
    >
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
