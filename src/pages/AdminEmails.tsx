import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Users, History, Zap } from "lucide-react";
import EmailComposer from "@/components/admin/EmailComposer";
import LeadsList from "@/components/admin/LeadsList";
import BroadcastHistory from "@/components/admin/BroadcastHistory";
import SequenceManager from "@/components/admin/SequenceManager";

const AdminEmails = () => {
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Email Admin</h1>
          <p className="text-muted-foreground mt-2">
            Manage broadcasts and automated email sequences
          </p>
        </div>

        <Tabs defaultValue="compose" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="compose" className="gap-2">
              <Mail className="h-4 w-4" />
              Compose
            </TabsTrigger>
            <TabsTrigger value="leads" className="gap-2">
              <Users className="h-4 w-4" />
              Leads
            </TabsTrigger>
            <TabsTrigger value="sequences" className="gap-2">
              <Zap className="h-4 w-4" />
              Sequences
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose">
            <EmailComposer selectedLeads={selectedLeads} />
          </TabsContent>

          <TabsContent value="leads">
            <LeadsList 
              selectedLeads={selectedLeads} 
              onSelectionChange={setSelectedLeads} 
            />
          </TabsContent>

          <TabsContent value="sequences">
            <SequenceManager />
          </TabsContent>

          <TabsContent value="history">
            <BroadcastHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminEmails;
