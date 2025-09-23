import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Users, DollarSign, Search, Building, Star } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Companies = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const mockCompanies = [
    {
      id: 1,
      name: "TechCorp Solutions",
      location: "Mumbai, India",
      industry: "Technology",
      employees: "500-1000",
      rating: 4.5,
      openPositions: 12,
      stipendRange: "₹20,000 - ₹40,000",
      salaryRange: "₹4,00,000 - ₹12,00,000",
      description: "Leading technology company focused on innovative solutions for modern businesses.",
      benefits: ["Health Insurance", "Flexible Hours", "Remote Work", "Learning Budget"],
      activelyHiring: true
    },
    {
      id: 2,
      name: "DataViz Inc",
      location: "Bangalore, India",
      industry: "Data Analytics",
      employees: "200-500",
      rating: 4.2,
      openPositions: 8,
      stipendRange: "₹25,000 - ₹35,000",
      salaryRange: "₹6,00,000 - ₹15,00,000",
      description: "Data analytics company helping businesses make data-driven decisions.",
      benefits: ["Health Insurance", "Stock Options", "Training Programs", "Gym Membership"],
      activelyHiring: true
    },
    {
      id: 3,
      name: "AppMakers Studio",
      location: "Delhi, India",
      industry: "Mobile Development",
      employees: "50-200",
      rating: 4.0,
      openPositions: 5,
      stipendRange: "₹18,000 - ₹30,000",
      salaryRange: "₹3,50,000 - ₹8,00,000",
      description: "Creative studio specializing in mobile app development for startups and enterprises.",
      benefits: ["Flexible Hours", "Project Bonuses", "Skill Development", "Team Outings"],
      activelyHiring: false
    },
    {
      id: 4,
      name: "Creative Minds",
      location: "Pune, India",
      industry: "Design & UX",
      employees: "100-200",
      rating: 4.7,
      openPositions: 6,
      stipendRange: "₹15,000 - ₹25,000",
      salaryRange: "₹3,00,000 - ₹7,00,000",
      description: "Award-winning design agency creating beautiful digital experiences.",
      benefits: ["Creative Freedom", "Design Tools", "Conference Tickets", "Work-Life Balance"],
      activelyHiring: true
    },
    {
      id: 5,
      name: "FinTech Innovations",
      location: "Hyderabad, India",
      industry: "Financial Technology",
      employees: "300-500",
      rating: 4.3,
      openPositions: 15,
      stipendRange: "₹30,000 - ₹45,000",
      salaryRange: "₹7,00,000 - ₹18,00,000",
      description: "Revolutionary fintech company transforming digital payments and banking.",
      benefits: ["High Compensation", "Stock Options", "Health Benefits", "Learning Budget"],
      activelyHiring: true
    },
    {
      id: 6,
      name: "EcoSolutions Ltd",
      location: "Chennai, India",
      industry: "Green Technology",
      employees: "150-300",
      rating: 4.1,
      openPositions: 4,
      stipendRange: "₹22,000 - ₹32,000",
      salaryRange: "₹5,00,000 - ₹10,00,000",
      description: "Sustainable technology company focused on environmental solutions.",
      benefits: ["Environmental Impact", "Research Opportunities", "Flexible Work", "Green Commute"],
      activelyHiring: true
    }
  ];

  const filteredCompanies = mockCompanies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Explore Companies
          </h1>
          <p className="text-muted-foreground text-lg mb-6">
            Discover amazing companies and their opportunities
          </p>
          
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search companies or industries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <Card key={company.id} className="hover:shadow-elegant transition-all duration-300 border-muted/20">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-foreground">
                        {company.name}
                      </CardTitle>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-muted-foreground">{company.rating}</span>
                      </div>
                    </div>
                  </div>
                  {company.activelyHiring && (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      Hiring
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {company.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {company.employees} employees
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {company.industry}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {company.description}
                </p>
                
                <div className="space-y-3 mb-4">
                  <div>
                    <h4 className="font-medium text-foreground text-sm mb-1">Stipend Range:</h4>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <DollarSign className="w-4 h-4" />
                      {company.stipendRange}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-foreground text-sm mb-1">Salary Range:</h4>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <DollarSign className="w-4 h-4" />
                      {company.salaryRange}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-foreground text-sm mb-2">Benefits:</h4>
                    <div className="flex flex-wrap gap-1">
                      {company.benefits.slice(0, 2).map((benefit, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {benefit}
                        </Badge>
                      ))}
                      {company.benefits.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{company.benefits.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {company.openPositions} open positions
                  </span>
                  <Button size="sm" className="bg-gradient-primary border-0 hover:opacity-90">
                    View Jobs
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {filteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No companies found matching your search.</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Companies;