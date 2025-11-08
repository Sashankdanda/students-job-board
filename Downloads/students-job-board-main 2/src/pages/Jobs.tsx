import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Calendar, DollarSign, Users, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Heart, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SmartSearch from "@/components/SmartSearch";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  stipend: string;
  skills: string[];
  description: string;
  published_date: string;
  actively_hiring: boolean;
}

const JOBS_PER_PAGE = 4;

const Jobs = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobQuery, setJobQuery] = useState(searchParams.get('q') || "");
  const [locationQuery, setLocationQuery] = useState(searchParams.get('location') || "");
  const [expandedJobs, setExpandedJobs] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [applicationForm, setApplicationForm] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchJobs();
    if (user) {
      fetchSavedJobs();
    }
  }, [user]);

  const fetchSavedJobs = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('saved_jobs')
        .select('job_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const savedJobIds = new Set(data.map(item => item.job_id));
      setSavedJobs(savedJobIds);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('published_date', { ascending: false });

      if (error) throw error as any;
      setJobs(data || []);
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error",
        description: `Failed to load jobs. ${error?.message ?? 'Please try again.'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (jobId: string) => {
    setExpandedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const filteredJobs = jobs.filter(job => {
    const skillsArray = Array.isArray(job.skills) ? job.skills : [];
    const matchesJob = !jobQuery || 
      job.title.toLowerCase().includes(jobQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(jobQuery.toLowerCase()) ||
      skillsArray.some(skill => skill.toLowerCase().includes(jobQuery.toLowerCase())) ||
      job.description.toLowerCase().includes(jobQuery.toLowerCase());
    
    const matchesLocation = !locationQuery ||
      job.location.toLowerCase().includes(locationQuery.toLowerCase());
    
    return matchesJob && matchesLocation;
  });

  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
  const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
  const paginatedJobs = filteredJobs.slice(startIndex, startIndex + JOBS_PER_PAGE);

  const handleApplyClick = (job: Job) => {
    setSelectedJob(job);
    setIsApplyDialogOpen(true);
  };

  const toggleSaveJob = async (jobId: string) => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to save jobs.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (savedJobs.has(jobId)) {
        // Remove from saved jobs
        const { error } = await supabase
          .from('saved_jobs')
          .delete()
          .eq('user_id', user.id)
          .eq('job_id', jobId);

        if (error) throw error;

        setSavedJobs(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });

        toast({
          title: "Job Removed",
          description: "Job removed from favorites.",
        });
      } else {
        // Add to saved jobs
        const { error } = await supabase
          .from('saved_jobs')
          .insert([{ user_id: user.id, job_id: jobId }]);

        if (error) throw error;

        setSavedJobs(prev => new Set([...prev, jobId]));

        toast({
          title: "Job Saved",
          description: "Job added to favorites.",
        });
      }
    } catch (error) {
      console.error('Error toggling saved job:', error);
      toast({
        title: "Error",
        description: "Failed to update saved jobs.",
        variant: "destructive",
      });
    }
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob || !user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: selectedJob.id,
          user_id: user.id,
          applicant_name: applicationForm.name,
          applicant_email: applicationForm.email,
          message: applicationForm.message,
        });

      if (error) throw error;

      toast({
        title: "Application Submitted!",
        description: `Your application for ${selectedJob.title} has been sent successfully. A confirmation email will be sent to ${applicationForm.email}.`,
      });

      setIsApplyDialogOpen(false);
      setApplicationForm({ name: "", email: "", message: "" });
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatJobDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">Loading jobs...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Find Your Dream Job
          </h1>
          <p className="text-muted-foreground text-lg mb-6">
            Discover amazing opportunities from top companies
          </p>
          
          {/* Smart Search Component */}
          <div className="max-w-3xl mx-auto mb-6">
            <SmartSearch 
              onSearch={(job, location) => {
                setJobQuery(job);
                setLocationQuery(location);
                setCurrentPage(1);
                
                // Update URL params
                const params = new URLSearchParams();
                if (job) params.set('q', job);
                if (location) params.set('location', location);
                setSearchParams(params);
              }}
            />
          </div>

          {/* Active Filters */}
          {(jobQuery || locationQuery) && (
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {jobQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Job: {jobQuery}
                  <button
                    onClick={() => {
                      setJobQuery("");
                      setCurrentPage(1);
                      const params = new URLSearchParams(searchParams);
                      params.delete('q');
                      setSearchParams(params);
                    }}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {locationQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Location: {locationQuery}
                  <button
                    onClick={() => {
                      setLocationQuery("");
                      setCurrentPage(1);
                      const params = new URLSearchParams(searchParams);
                      params.delete('location');
                      setSearchParams(params);
                    }}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setJobQuery("");
                  setLocationQuery("");
                  setCurrentPage(1);
                  setSearchParams(new URLSearchParams());
                }}
                className="h-6 px-2 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-6">
          {paginatedJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-elegant transition-all duration-300 border-muted/20">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl font-semibold text-foreground mb-2">
                      {job.title}
                    </CardTitle>
                    <p className="text-lg font-medium text-primary mb-3">{job.company}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatJobDate(job.published_date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {job.stipend}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={job.type === "Internship" ? "secondary" : "default"}>
                      {job.type}
                    </Badge>
                    {job.actively_hiring && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Users className="w-4 h-4" />
                        <span className="text-xs font-medium">Actively Hiring</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="mb-4">
                  <h4 className="font-medium text-foreground mb-2">Required Skills:</h4>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(job.skills) ? job.skills : []).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-medium text-foreground mb-2">Job Description:</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {expandedJobs.includes(job.id) 
                      ? job.description
                      : `${job.description.substring(0, 150)}...`
                    }
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => toggleExpanded(job.id)}
                    className="p-0 h-auto text-primary hover:text-primary/80 mt-2"
                  >
                    {expandedJobs.includes(job.id) ? (
                      <>
                        Show Less <ChevronUp className="w-4 h-4 ml-1" />
                      </>
                    ) : (
                      <>
                        Show More <ChevronDown className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleSaveJob(job.id)}
                    className={`mr-2 ${savedJobs.has(job.id) ? "text-red-600 hover:text-red-700" : ""}`}
                  >
                    <Heart className={`h-4 w-4 ${savedJobs.has(job.id) ? 'fill-current' : ''}`} />
                  </Button>
                  <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        className="bg-gradient-primary border-0 hover:opacity-90"
                        onClick={() => handleApplyClick(job)}
                        disabled={!user}
                      >
                        Apply Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Apply for {selectedJob?.title}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleApplicationSubmit} className="space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium mb-1">
                            Full Name
                          </label>
                          <Input
                            id="name"
                            value={applicationForm.name}
                            onChange={(e) => setApplicationForm(prev => ({ ...prev, name: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium mb-1">
                            Email Address
                          </label>
                          <Input
                            id="email"
                            type="email"
                            value={applicationForm.email}
                            onChange={(e) => setApplicationForm(prev => ({ ...prev, email: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="message" className="block text-sm font-medium mb-1">
                            Cover Letter / Message
                          </label>
                          <Textarea
                            id="message"
                            value={applicationForm.message}
                            onChange={(e) => setApplicationForm(prev => ({ ...prev, message: e.target.value }))}
                            rows={4}
                            placeholder="Tell us why you're interested in this position..."
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsApplyDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={submitting}>
                            {submitting ? "Submitting..." : "Submit Application"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No jobs found matching your search.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Jobs;