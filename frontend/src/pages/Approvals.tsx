import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useHR } from "@/contexts/HRContext";
import { useToast } from "@/hooks/use-toast";
import { CheckSquare, XCircle, CheckCircle, Clock, MessageSquare, User } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Approvals() {
  const { leaveRequests, reviewLeaveRequest, currentUser } = useHR();
  const { toast } = useToast();
  const [reviewNotes, setReviewNotes] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  const pendingRequests = leaveRequests.filter(req => req.status === 'pending');
  const reviewedRequests = leaveRequests.filter(req => req.status !== 'pending');

  const handleReview = (requestId: string, status: 'approved' | 'rejected') => {
    reviewLeaveRequest(requestId, status, reviewNotes.trim() || undefined);
    
    toast({
      title: `Request ${status}`,
      description: `The leave request has been ${status} successfully.`,
      variant: status === 'approved' ? 'default' : 'destructive'
    });

    setReviewNotes("");
    setSelectedRequest(null);
  };

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

  const calculateLeaveDays = (startDate: Date, endDate: Date) => {
    return differenceInDays(endDate, startDate) + 1;
  };

  if (currentUser?.role !== 'manager') {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-muted-foreground">Access Denied</h1>
        <p className="text-muted-foreground">This page is only accessible to managers.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Leave Approvals</h1>
        <p className="text-muted-foreground">
          Review and approve or reject leave requests from your team members.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{pendingRequests.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting your review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {reviewedRequests.filter(req => 
                req.status === 'approved' && 
                req.reviewedAt && 
                format(req.reviewedAt, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">Requests approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviewed</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviewedRequests.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-warning" />
            Pending Approvals ({pendingRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRequests.length > 0 ? (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h3 className="font-semibold text-lg">{request.employeeName}</h3>
                          <p className="text-sm text-muted-foreground">
                            Requested on {format(request.requestedAt, 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">START DATE</Label>
                          <p className="font-medium">{format(request.startDate, 'MMM dd, yyyy')}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">END DATE</Label>
                          <p className="font-medium">{format(request.endDate, 'MMM dd, yyyy')}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">DURATION</Label>
                          <p className="font-medium">{calculateLeaveDays(request.startDate, request.endDate)} days</p>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">REASON</Label>
                        <p className="text-sm mt-1 p-3 bg-muted/50 rounded-md">{request.reason}</p>
                      </div>
                    </div>

                    {request.attachments && request.attachments.length > 0 && (
  <div className="mt-3 space-y-1">
    <Label className="text-xs text-muted-foreground">ATTACHMENTS</Label>
    <ul className="list-disc pl-5 text-sm">
      {request.attachments.map((att, i) => (
        <li key={i}>
          <a
            href={att.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Attachment #{i + 1}
          </a>
        </li>
      ))}
    </ul>
  </div>
)}


                    <div className="flex flex-col gap-2">
                      {getStatusBadge(request.status)}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="gap-2"
                          onClick={() => setSelectedRequest(request.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Approve Leave Request</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to approve {request.employeeName}'s leave request?
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="notes">Review Notes (Optional)</Label>
                            <Textarea
                              id="notes"
                              placeholder="Add any comments about this approval..."
                              value={reviewNotes}
                              onChange={(e) => setReviewNotes(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                            Cancel
                          </Button>
                          <Button onClick={() => handleReview(request.id, 'approved')}>
                            Approve Request
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="gap-2"
                          onClick={() => setSelectedRequest(request.id)}
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reject Leave Request</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to reject {request.employeeName}'s leave request?
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="notes">Reason for Rejection *</Label>
                            <Textarea
                              id="notes"
                              placeholder="Please provide a reason for rejecting this request..."
                              value={reviewNotes}
                              onChange={(e) => setReviewNotes(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                            Cancel
                          </Button>
                          <Button 
                            variant="destructive" 
                            onClick={() => handleReview(request.id, 'rejected')}
                            disabled={!reviewNotes.trim()}
                          >
                            Reject Request
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No Pending Requests</h3>
              <p className="text-muted-foreground">All leave requests have been reviewed.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            Recent Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reviewedRequests.length > 0 ? (
            <div className="space-y-4">
              {reviewedRequests.slice(0, 5).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(request.status)}
                    <div>
                      <div className="font-medium">{request.employeeName}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(request.startDate, 'MMM dd')} - {format(request.endDate, 'MMM dd, yyyy')}
                      </div>
                      {request.reviewNotes && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Note: {request.reviewNotes}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    {getStatusBadge(request.status)}
                    <div className="text-xs text-muted-foreground">
                      {request.reviewedAt && format(request.reviewedAt, 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No reviews completed yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}