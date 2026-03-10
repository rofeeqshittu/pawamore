import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Mail, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface NewsletterSub {
  id: string;
  email: string;
  is_active: boolean;
}

interface NewsletterComposerProps {
  subscribers: NewsletterSub[];
}

const NewsletterComposer = ({ subscribers }: NewsletterComposerProps) => {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const activeSubscribers = subscribers.filter(s => s.is_active);

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      toast({ title: "Please fill in subject and body", variant: "destructive" });
      return;
    }

    if (activeSubscribers.length === 0) {
      toast({ title: "No active subscribers", variant: "destructive" });
      return;
    }

    if (!confirm(`Send newsletter to ${activeSubscribers.length} subscriber(s)?`)) return;

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-newsletter", {
        body: {
          subject: subject.trim(),
          body: body.trim(),
          recipients: activeSubscribers.map(s => s.email),
        },
      });

      if (error) throw error;

      toast({ title: "Newsletter sent! 📬", description: `Sent to ${activeSubscribers.length} subscriber(s)` });
      setSent(true);
      setSubject("");
      setBody("");
    } catch (error: any) {
      toast({ title: "Failed to send", description: error.message || "Please try again", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Send className="w-4 h-4" /> Compose Newsletter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg text-sm">
          <Users className="w-4 h-4 text-primary" />
          <span>Sending to <strong>{activeSubscribers.length}</strong> active subscriber{activeSubscribers.length !== 1 ? 's' : ''}</span>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Subject Line</label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. New Solar Deals This Month! ☀️"
            maxLength={200}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Email Body</label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your newsletter content here... (Plain text, simple formatting)"
            rows={8}
            maxLength={5000}
          />
          <p className="text-xs text-muted-foreground mt-1">{body.length}/5000 characters</p>
        </div>

        <Button
          variant="amber"
          className="w-full gap-2"
          onClick={handleSend}
          disabled={sending || !subject.trim() || !body.trim() || activeSubscribers.length === 0}
        >
          <Mail className="w-4 h-4" />
          {sending ? "Sending..." : `Send to ${activeSubscribers.length} Subscriber${activeSubscribers.length !== 1 ? 's' : ''}`}
        </Button>

        {sent && (
          <p className="text-xs text-center text-primary font-medium">✅ Last newsletter sent successfully</p>
        )}
      </CardContent>
    </Card>
  );
};

export default NewsletterComposer;
