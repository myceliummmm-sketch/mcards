import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Zap, Play, Pause, RefreshCw, Mail, Clock, Check, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";

interface SequenceLog {
  id: string;
  lead_email: string;
  sequence_step: number;
  status: string;
  sent_at: string | null;
  next_send_at: string | null;
  created_at: string;
}

const STEP_LABELS: Record<number, string> = {
  1: "Day 0: Playbook",
  2: "Day 2: Team Waiting",
  3: "Day 5: Ready to Build",
  4: "Day 7: Last Chance",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  sent: "bg-green-500/20 text-green-400 border-green-500/30",
  opened: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  clicked: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  failed: "bg-red-500/20 text-red-400 border-red-500/30",
  unsubscribed: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const SequenceManager = () => {
  const [sequences, setSequences] = useState<SequenceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);

  const fetchSequences = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("get-sequence-logs");
      if (error) throw error;
      setSequences(data?.logs || []);
    } catch (err) {
      console.error("Failed to fetch sequences:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSequences();
  }, []);

  const triggerSequenceCheck = async () => {
    setTriggering(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-email-sequences");
      if (error) throw error;
      toast.success("Sequence check completed", {
        description: `${data?.processed || 0} emails queued`,
      });
      fetchSequences();
    } catch (err: any) {
      toast.error("Failed to trigger sequence check", {
        description: err.message,
      });
    } finally {
      setTriggering(false);
    }
  };

  const stats = {
    pending: sequences.filter((s) => s.status === "pending").length,
    sent: sequences.filter((s) => s.status === "sent").length,
    opened: sequences.filter((s) => s.status === "opened").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total in Sequence</p>
                <p className="text-2xl font-bold">{sequences.length}</p>
              </div>
              <Mail className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sent</p>
                <p className="text-2xl font-bold text-green-500">{stats.sent}</p>
              </div>
              <Check className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Opened</p>
                <p className="text-2xl font-bold text-blue-500">{stats.opened}</p>
              </div>
              <Zap className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sequence Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Email Sequences
              </CardTitle>
              <CardDescription>
                Automated follow-up emails (Day 2, 5, 7)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchSequences}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button size="sm" onClick={triggerSequenceCheck} disabled={triggering}>
                {triggering ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Run Sequence Check
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Step</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Sent</TableHead>
                  <TableHead>Next Send</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : sequences.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <AlertCircle className="h-8 w-8" />
                        <p>No sequences active</p>
                        <p className="text-sm">
                          Sequences start automatically when leads complete the quiz
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  sequences.map((seq) => (
                    <TableRow key={seq.id}>
                      <TableCell>
                        <span className="font-mono text-sm">{seq.lead_email}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {STEP_LABELS[seq.sequence_step] || `Step ${seq.sequence_step}`}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={STATUS_COLORS[seq.status] || ""}
                        >
                          {seq.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {seq.sent_at
                            ? format(new Date(seq.sent_at), "MMM d, h:mm a")
                            : "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {seq.next_send_at
                            ? format(new Date(seq.next_send_at), "MMM d, h:mm a")
                            : "-"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SequenceManager;
