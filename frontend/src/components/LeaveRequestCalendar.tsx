import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CalendarDays, Plus } from "lucide-react";
import { useHR } from "@/contexts/HRContext";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays, addDays } from "date-fns";

export function LeaveRequestCalendar() {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { submitLeaveRequest, currentUser } = useHR();
  const { toast } = useToast();


  const handleRangeSelect = () => {
    if (selectedDates.length !== 2) return;
    
    const [start, end] = selectedDates.sort((a, b) => a.getTime() - b.getTime());
    const range: Date[] = [];
    
    let currentDate = start;
    while (currentDate <= end) {
      range.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }
    
    setSelectedDates(range);
  };

  const calculateLeaveDays = () => {
    if (selectedDates.length === 0) return 0;
    if (selectedDates.length === 1) return 1;
    
    const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
    return sortedDates.length;
  };

  const handleSubmit = async () => {
    if (selectedDates.length === 0 || !reason.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select dates and provide a reason for your leave request.",
        variant: "destructive"
      });
      return;
    }

    const leaveDays = calculateLeaveDays();
    if (currentUser && leaveDays > currentUser.leaveBalance) {
      toast({
        title: "Insufficient Leave Balance",
        description: `You only have ${currentUser.leaveBalance} days remaining, but requested ${leaveDays} days.`,
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
      
      submitLeaveRequest({
        startDate: sortedDates[0],
        endDate: sortedDates[sortedDates.length - 1],
        reason: reason.trim()
      });

      toast({
        title: "Leave Request Submitted",
        description: `Your request for ${leaveDays} day(s) has been submitted successfully.`,
        variant: "default"
      });

      // Reset form
      setSelectedDates([]);
      setReason("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit leave request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  const leaveDays = calculateLeaveDays();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Select Leave Dates
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Click on dates to select individual days, or select two dates to create a range.
          </p>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="multiple"
            selected={selectedDates}
            onSelect={(dates) => {
              if (dates) {
                setSelectedDates(Array.isArray(dates) ? dates : [dates]);
              } else {
                setSelectedDates([]);
              }
            }}
            disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
            className="rounded-md border pointer-events-auto"
          />
          
          {selectedDates.length === 2 && (
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRangeSelect}
                className="w-full"
              >
                Fill Date Range ({differenceInDays(selectedDates[1], selectedDates[0]) + 1} days)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Leave Request Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selected Dates Summary */}
          <div className="space-y-3">
            <Label>Selected Dates ({leaveDays} day{leaveDays !== 1 ? 's' : ''})</Label>
            {selectedDates.length > 0 ? (
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {selectedDates.map((date, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs"
                  >
                    {format(date, 'MMM dd, yyyy')}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No dates selected
              </p>
            )}
          </div>

          {/* Leave Balance Warning */}
          {currentUser && leaveDays > 0 && (
            <div className={cn(
              "p-3 rounded-lg border",
              leaveDays > currentUser.leaveBalance 
                ? "bg-destructive/10 border-destructive/20 text-destructive"
                : "bg-success/10 border-success/20 text-success"
            )}>
              <p className="text-sm font-medium">
                {leaveDays > currentUser.leaveBalance 
                  ? `⚠️ Insufficient balance! You need ${leaveDays - currentUser.leaveBalance} more days.`
                  : `✓ Available balance: ${currentUser.leaveBalance - leaveDays} days remaining after this request.`
                }
              </p>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Leave *</Label>
            <Textarea
              id="reason"
              placeholder="Please provide a reason for your leave request..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <Button 
            onClick={handleSubmit}
            disabled={selectedDates.length === 0 || !reason.trim() || isSubmitting || (currentUser && leaveDays > currentUser.leaveBalance)}
            className="w-full"
          >
            {isSubmitting ? "Submitting..." : `Submit Leave Request (${leaveDays} day${leaveDays !== 1 ? 's' : ''})`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}