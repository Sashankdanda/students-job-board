import { Button } from "@/components/ui/button";
import { Search, User, Briefcase, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-all">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                StudentJobs
              </span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/jobs" className="text-foreground hover:text-primary transition-all">Find Jobs</Link>
            <Link to="/companies" className="text-foreground hover:text-primary transition-all">Companies</Link>
            <Link to="/chatbot" className="text-foreground hover:text-primary transition-all">Chat</Link>
            {user && <Link to="/dashboard" className="text-foreground hover:text-primary transition-all">Dashboard</Link>}
            <a href="#" className="text-foreground hover:text-primary transition-all">Resources</a>
          </nav>
          
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-muted-foreground">
                  Welcome, {user.email}
                </span>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/auth">Log In</Link>
                </Button>
                <Button asChild size="sm" className="bg-gradient-primary border-0 hover:opacity-90 transition-all">
                  <Link to="/auth">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;