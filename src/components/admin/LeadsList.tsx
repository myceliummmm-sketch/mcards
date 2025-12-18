import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Search, Filter, RefreshCw, Mail, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Lead {
  id: string;
  email: string;
  quiz_blocker: string | null;
  quiz_score: number | null;
  created_at: string | null;
  source: string | null;
}

interface LeadsListProps {
  selectedLeads: string[];
  onSelectionChange: (leads: string[]) => void;
}

const BLOCKER_COLORS: Record<string, string> = {
  market: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  tech: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  funding: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  team: "bg-green-500/20 text-green-400 border-green-500/30",
  timing: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  competition: "bg-red-500/20 text-red-400 border-red-500/30",
};

const LeadsList = ({ selectedLeads, onSelectionChange }: LeadsListProps) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [blockerFilter, setBlockerFilter] = useState<string>("all");

  const fetchLeads = async () => {
    setLoading(true);
    try {
      // Use edge function to fetch leads (service role needed)
      const { data, error } = await supabase.functions.invoke("get-leads");
      if (error) throw error;
      setLeads(data?.leads || []);
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = lead.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBlocker = blockerFilter === "all" || lead.quiz_blocker === blockerFilter;
    return matchesSearch && matchesBlocker;
  });

  const uniqueBlockers = [...new Set(leads.map((l) => l.quiz_blocker).filter(Boolean))];

  const toggleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(filteredLeads.map((l) => l.email));
    }
  };

  const toggleLead = (email: string) => {
    if (selectedLeads.includes(email)) {
      onSelectionChange(selectedLeads.filter((e) => e !== email));
    } else {
      onSelectionChange([...selectedLeads, email]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Leads Database
            </CardTitle>
            <CardDescription>
              {leads.length} total leads • {selectedLeads.length} selected
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchLeads}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={blockerFilter} onValueChange={setBlockerFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by blocker" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Blockers</SelectItem>
              {uniqueBlockers.map((blocker) => (
                <SelectItem key={blocker} value={blocker!}>
                  {blocker}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Blocker</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No leads found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedLeads.includes(lead.email)}
                        onCheckedChange={() => toggleLead(lead.email)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-sm">{lead.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {lead.quiz_blocker && (
                        <Badge
                          variant="outline"
                          className={BLOCKER_COLORS[lead.quiz_blocker] || ""}
                        >
                          {lead.quiz_blocker}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {lead.quiz_score !== null && (
                        <Badge variant="secondary">{lead.quiz_score}%</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {lead.source || "quiz"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {lead.created_at
                          ? format(new Date(lead.created_at), "MMM d, yyyy")
                          : "-"}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadsList;
