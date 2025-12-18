import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Send, Eye, TestTube, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EmailComposerProps {
  selectedLeads: string[];
}

const EmailComposer = ({ selectedLeads }: EmailComposerProps) => {
  const [subject, setSubject] = useState("Your AI Team is Ready 🚀");
  const [htmlContent, setHtmlContent] = useState(`<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #e5e5e5; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; }
    h1 { color: #22c55e; font-size: 28px; }
    p { line-height: 1.6; color: #a3a3a3; }
    .cta { display: inline-block; background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #262626; font-size: 12px; color: #737373; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Your AI Advisory Team Awaits</h1>
    <p>Remember taking our quiz? Your personalized AI team of 7 advisors is ready to help you validate your startup idea.</p>
    <p>Each advisor brings unique expertise:</p>
    <ul>
      <li>🎯 <strong>Phoenix</strong> - Vision & Strategy</li>
      <li>📊 <strong>Prisma</strong> - Market Analysis</li>
      <li>⚡ <strong>Zen</strong> - Execution Planning</li>
      <li>🛡️ <strong>Ever</strong> - Risk Assessment</li>
      <li>💡 <strong>Techpriest</strong> - Technical Guidance</li>
      <li>🌟 <strong>Virgilia</strong> - Growth Strategy</li>
      <li>☠️ <strong>Toxic</strong> - Devil's Advocate</li>
    </ul>
    <a href="https://mycelium.lovable.app" class="cta">Meet Your Team →</a>
    <div class="footer">
      <p>You're receiving this because you took our startup validation quiz.</p>
      <p>© 2024 Mycelium. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`);
  const [testMode, setTestMode] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!subject.trim() || !htmlContent.trim()) {
      toast.error("Please fill in subject and content");
      return;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("broadcast-email", {
        body: { subject, htmlContent, testMode },
      });

      if (error) throw error;

      toast.success(data.message, {
        description: `${data.results?.sent || 0} emails sent successfully`,
      });
    } catch (err: any) {
      toast.error("Failed to send broadcast", {
        description: err.message,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Composer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Compose Broadcast
          </CardTitle>
          <CardDescription>
            Create and send emails to your leads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject Line</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">HTML Content</Label>
            <Textarea
              id="content"
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              placeholder="Enter HTML email content..."
              className="min-h-[300px] font-mono text-sm"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Switch
                id="test-mode"
                checked={testMode}
                onCheckedChange={setTestMode}
              />
              <Label htmlFor="test-mode" className="flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                Test Mode
                {testMode && (
                  <Badge variant="secondary" className="ml-2">
                    Sends to 1st lead only
                  </Badge>
                )}
              </Label>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="flex-1"
            >
              <Eye className="mr-2 h-4 w-4" />
              {showPreview ? "Hide" : "Show"} Preview
            </Button>
            <Button
              onClick={handleSend}
              disabled={isSending}
              className="flex-1"
            >
              {isSending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {testMode ? "Send Test" : "Send to All"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Email Preview
          </CardTitle>
          <CardDescription>
            How your email will appear
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden bg-white">
            <div className="bg-muted px-4 py-2 border-b">
              <p className="text-sm font-medium text-foreground">
                Subject: {subject || "(No subject)"}
              </p>
            </div>
            <iframe
              srcDoc={htmlContent}
              className="w-full h-[500px] border-0"
              title="Email Preview"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailComposer;
