import Header from "@/components/Header";
import Hero from "@/components/Hero";
import JobCategories from "@/components/JobCategories";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <JobCategories />
        
        {/* Chatbot CTA Section */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Have Questions?</h2>
            <p className="text-muted-foreground text-lg mb-6">
              Chat with our assistant to get instant answers about jobs, internships, and companies
            </p>
            <Link to="/chatbot">
              <Button size="lg" className="gap-2">
                <MessageCircle className="w-5 h-5" />
                Start Chatting
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
