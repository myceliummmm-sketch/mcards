-- Create email sequence logs table to track automated email sequences
CREATE TABLE public.email_sequence_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_email TEXT NOT NULL,
  sequence_step INTEGER NOT NULL DEFAULT 1,
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  next_send_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'opened', 'clicked', 'unsubscribed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_sequence_logs ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (for edge functions)
CREATE POLICY "Service role can manage email logs"
ON public.email_sequence_logs
FOR ALL
USING (auth.role() = 'service_role');

-- Create trigger for updated_at
CREATE TRIGGER update_email_sequence_logs_updated_at
BEFORE UPDATE ON public.email_sequence_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Create index for efficient queries
CREATE INDEX idx_email_sequence_logs_email ON public.email_sequence_logs(lead_email);
CREATE INDEX idx_email_sequence_logs_next_send ON public.email_sequence_logs(next_send_at) WHERE status = 'pending';

-- Create broadcast history table
CREATE TABLE public.broadcast_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  sent_by UUID,
  recipients_count INTEGER NOT NULL DEFAULT 0,
  sent_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.broadcast_history ENABLE ROW LEVEL SECURITY;

-- Service role can manage broadcast history
CREATE POLICY "Service role can manage broadcast history"
ON public.broadcast_history
FOR ALL
USING (auth.role() = 'service_role');