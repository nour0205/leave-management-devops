import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeaveBalanceCard } from "@/components/LeaveBalanceCard";
import { useHR } from "@/contexts/HRContext";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, CheckCircle, Clock, XCircle, Users, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { currentUser, leaveRequests } = useHR();

  if (!currentUser) return null;

  const userRequests = leaveRequests.filter(req => req.employeeId === currentUser.id);
  const pendingRequests = leaveRequests.filter(req => req.status === 'pending');
  const recentRequests = leaveRequests.slice(0, 5);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success/10 text-success border-success/20">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge className="bg-warning/10 text-warning border-warning/20">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {currentUser.name}!
        </h1>
        <p className="text-muted-foreground">
          {currentUser.role === 'manager' 
            ? 'Manage your team\'s leave requests and monitor department activity.'
            : 'View your leave balance and manage your leave requests.'
          }
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <LeaveBalanceCard />
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Requests</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userRequests.length}</div>
            <p className="text-xs text-muted-foreground">
              Total submitted
            </p>
          </CardContent>
        </Card>

        {currentUser.role === 'manager' && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <Clock className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{pendingRequests.length}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting review
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  Active employees
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Recent Leave Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentRequests.length > 0 ? (
            <div className="space-y-4">
              {recentRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(request.status)}
                    <div>
                      <div className="font-medium">
                        {currentUser.role === 'manager' ? request.employeeName : 'Your Request'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(request.startDate, 'MMM dd')} - {format(request.endDate, 'MMM dd, yyyy')}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {request.reason}
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    {getStatusBadge(request.status)}
                    <div className="text-xs text-muted-foreground">
                      {format(request.requestedAt, 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No leave requests found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}