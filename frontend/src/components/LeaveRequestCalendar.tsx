import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CalendarDays, Plus, Paperclip } from "lucide-react";
import { useHR } from "@/contexts/HRContext";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays, addDays } from "date-fns";
import axios from "axios";

export function LeaveRequestCalendar() {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [reason, setReason] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { submitLeaveRequest, currentUser, refreshLeaves } = useHR();
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
    return [...selectedDates].sort((a, b) => a.getTime() - b.getTime()).length;
  };

  const handleSubmit = async () => {
    if (selectedDates.length === 0 || !reason.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select dates and provide a reason.",
        variant: "destructive"
      });
      return;
    }

    const leaveDays = calculateLeaveDays();
    if (currentUser && leaveDays > currentUser.leaveBalance) {
      toast({
        title: "Insufficient Leave Balance",
        description: `You only have ${currentUser.leaveBalance} days remaining, but requested ${leaveDays}.`,
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());

      // Submit leave request
      const res = await axios.post("/api/leaves", {
        employeeId: currentUser.id,
        employeeName: currentUser.name,
        startDate: sortedDates[0],
        endDate: sortedDates[sortedDates.length - 1],
        reason: reason.trim()
      });

      const leaveId = res.data.id;

      // Upload file (if any)
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        await axios.post(`/api/leaves/${leaveId}/attachments`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      toast({
        title: "Leave Request Submitted",
        description: `Your request for ${leaveDays} day(s) was submitted successfully.`,
      });

      setSelectedDates([]);
      setReason("");
      setFile(null);
      refreshLeaves(); // Refresh dashboard or request list
    } catch (error) {
      console.error("Submit error:", error);
      toast({
        title: "Error",
        description: "Failed to submit leave request.",
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
          {/* Selected Dates */}
          <div className="space-y-3">
            <Label>Selected Dates ({leaveDays} day{leaveDays !== 1 ? "s" : ""})</Label>
            {selectedDates.length > 0 ? (
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {selectedDates.map((date, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {format(date, "MMM dd, yyyy")}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No dates selected</p>
            )}
          </div>

          {/* Leave Balance */}
          {currentUser && leaveDays > 0 && (
            <div className={cn(
              "p-3 rounded-lg border",
              leaveDays > currentUser.leaveBalance
                ? "bg-destructive/10 border-destructive/20 text-destructive"
                : "bg-success/10 border-success/20 text-success"
            )}>
              <p className="text-sm font-medium">
                {leaveDays > currentUser.leaveBalance
                  ? `⚠️ You need ${leaveDays - currentUser.leaveBalance} more days.`
                  : `✓ You’ll have ${currentUser.leaveBalance - leaveDays} days left.`}
              </p>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Leave *</Label>
            <Textarea
              id="reason"
              placeholder="Describe the reason for your leave..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>

          {/* 📎 File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file" className="flex items-center gap-1">
              <Paperclip className="h-4 w-4" />
              Optional Attachment
            </Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              selectedDates.length === 0 ||
              !reason.trim() ||
              (currentUser && leaveDays > currentUser.leaveBalance)
            }
            className="w-full"
          >
            {isSubmitting ? "Submitting..." : `Submit Request (${leaveDays} day${leaveDays !== 1 ? "s" : ""})`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
