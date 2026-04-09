import { useState, useEffect } from "react";
import { MessageCircle, Ticket, HelpCircle, Search, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Layout from "@/components/Layout";
import SEOHelmet from "@/components/SEOHelmet";
import SupportTicketForm from "@/components/support/SupportTicketForm";
import UserTickets from "@/components/support/UserTickets";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const categoryLabels: Record<string, string> = {
  getting_started: "Getting Started",
  system_sizing_reliability: "System Sizing & Reliability",
  delivery_support_trust: "Delivery, Support & Trust",
  general: "General",
  orders: "Orders",
  payments: "Payments",
  shipping: "Shipping",
  returns: "Returns",
  services: "Services",
  products: "Products",
};

const HelpCenter = () => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchFaqs = async () => {
      const { data } = await supabase
        .from("faq_items")
        .select("id, question, answer, category")
        .eq("is_published", true)
        .order("sort_order");

      if (data) setFaqs(data);
    };

    fetchFaqs();
  }, []);

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(faqs.map((f) => f.category))];

  return (
    <Layout>
      <SEOHelmet
        title="Help Center | PawaMore Systems"
        description="Get help with your PawaMore order, products, or services. Chat with our AI assistant, submit support tickets, or browse FAQs."
      />

      {/* Hero */}
      <section className="pt-24 pb-12 bg-gradient-to-b from-primary/5 to-background">
        <div className="container px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
              How can we help you?
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Search our help center, chat with our AI assistant, or submit a support ticket
            </p>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search for answers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-base"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-8 border-b border-border">
        <div className="container px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  Live Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Chat with our AI assistant for instant answers. Available 24/7.
                </CardDescription>
                <p className="text-xs text-muted-foreground mt-2">
                  Click the chat icon in the bottom right corner
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Ticket className="w-5 h-5 text-primary" />
                  Support Ticket
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Submit a detailed request for our support team to review.
                </CardDescription>
                <Button variant="link" className="p-0 h-auto mt-2" asChild>
                  <a href="#tickets">Submit a ticket →</a>
                </Button>
              </CardContent>
            </Card>

            <Link to="/contact">
              <Card className="hover:shadow-md transition-shadow h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ExternalLink className="w-5 h-5 text-primary" />
                    Contact Us
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Reach out directly via phone, email, or visit our office.
                  </CardDescription>
                  <span className="text-sm text-primary mt-2 inline-block">
                    View contact info →
                  </span>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container px-4 sm:px-6">
          <Tabs defaultValue="faqs" className="space-y-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="faqs" className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                FAQs
              </TabsTrigger>
              <TabsTrigger value="tickets" className="flex items-center gap-2">
                <Ticket className="w-4 h-4" />
                Tickets
              </TabsTrigger>
            </TabsList>

            {/* FAQs Tab */}
            <TabsContent value="faqs" className="space-y-6">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  All
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {categoryLabels[cat] || cat}
                  </Button>
                ))}
              </div>

              {/* FAQ List */}
              <div className="max-w-2xl mx-auto space-y-3">
                {filteredFaqs.length === 0 ? (
                  <div className="text-center py-12">
                    <HelpCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {searchTerm ? "No FAQs match your search" : "No FAQs available"}
                    </p>
                  </div>
                ) : (
                  filteredFaqs.map((faq) => (
                    <Collapsible
                      key={faq.id}
                      open={expandedFaq === faq.id}
                      onOpenChange={() =>
                        setExpandedFaq(expandedFaq === faq.id ? null : faq.id)
                      }
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-between text-left h-auto py-4 px-4 hover:bg-muted/50 border border-border rounded-lg"
                        >
                          <span className="font-medium pr-4">{faq.question}</span>
                          {expandedFaq === faq.id ? (
                            <ChevronUp className="w-5 h-5 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 flex-shrink-0" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-4 pb-4">
                        <p className="text-muted-foreground pt-2 whitespace-pre-wrap">
                          {faq.answer}
                        </p>
                      </CollapsibleContent>
                    </Collapsible>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Tickets Tab */}
            <TabsContent value="tickets" id="tickets">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                <SupportTicketForm />
                {user && <UserTickets />}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default HelpCenter;
