import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock } from "lucide-react";
import { useHR } from "@/contexts/HRContext";

export function LeaveBalanceCard() {
  const { currentUser } = useHR();
  
  if (!currentUser) return null;

  const usedLeaves = currentUser.totalLeaves - currentUser.leaveBalance;
  const usagePercentage = (usedLeaves / currentUser.totalLeaves) * 100;

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Leave Balance</CardTitle>
        <Calendar className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-primary">
                {currentUser.leaveBalance}
              </div>
              <p className="text-xs text-muted-foreground">
                days remaining
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-foreground">
                {usedLeaves}/{currentUser.totalLeaves}
              </div>
              <p className="text-xs text-muted-foreground">
                days used
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Usage</span>
              <span className="text-muted-foreground">{Math.round(usagePercentage)}%</span>
            </div>
            <Progress 
              value={usagePercentage} 
              className="h-2"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Annual leave allocation</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}