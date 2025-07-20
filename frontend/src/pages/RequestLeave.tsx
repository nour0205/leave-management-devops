import { LeaveRequestCalendar } from "@/components/LeaveRequestCalendar";
import { LeaveBalanceCard } from "@/components/LeaveBalanceCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Info } from "lucide-react";

export default function RequestLeave() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Request Leave</h1>
        <p className="text-muted-foreground">
          Select your desired leave dates and submit your request for approval.
        </p>
      </div>

      {/* Leave Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <LeaveBalanceCard />
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-info" />
              Leave Policy Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Request Guidelines:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Submit requests at least 2 weeks in advance</li>
                  <li>• Weekend days are excluded automatically</li>
                  <li>• Maximum 10 consecutive days per request</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Approval Process:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Manager review within 3 business days</li>
                  <li>• Emergency leave: Contact manager directly</li>
                  <li>• Approved requests cannot be modified</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Component */}
      <LeaveRequestCalendar />
    </div>
  );
}