import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Briefcase, Heart, TrendingUp } from 'lucide-react';
import { Navigate } from 'react-router-dom';

interface SavedJob {
  id: string;
  job_id: string;
  created_at: string;
  jobs: {
    title: string;
    company: string;
    location: string;
    type: string;
    stipend: string;
    skills: string[];
  };
}

interface Application {
  id: string;
  job_id: string;
  applicant_name: string;
  applicant_email: string;
  status: string;
  created_at: string;
  jobs: {
    title: string;
    company: string;
    location: string;
    type: string;
    stipend: string;
  };
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch saved jobs
      const { data: savedJobsData, error: savedJobsError } = await supabase
        .from('saved_jobs')
        .select(`
          id,
          job_id,
          created_at,
          jobs (
            title,
            company,
            location,
            type,
            stipend,
            skills
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (savedJobsError) throw savedJobsError;

      // Fetch applications
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('job_applications')
        .select(`
          id,
          job_id,
          applicant_name,
          applicant_email,
          status,
          created_at,
          jobs (
            title,
            company,
            location,
            type,
            stipend
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (applicationsError) throw applicationsError;

      setSavedJobs(savedJobsData || []);
      setApplications(applicationsData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const removeSavedJob = async (savedJobId: string) => {
    try {
      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('id', savedJobId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setSavedJobs(prev => prev.filter(job => job.id !== savedJobId));
      toast({
        title: "Success",
        description: "Job removed from favorites",
      });
    } catch (error) {
      console.error('Error removing saved job:', error);
      toast({
        title: "Error",
        description: "Failed to remove job from favorites",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your job search activity.</p>
        </div>

        {loadingData ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Stats Cards */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saved Jobs</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{savedJobs.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Applications</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{applications.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Applications</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {applications.filter(app => app.status === 'pending').length}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Saved Jobs */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Saved Jobs</h2>
            {savedJobs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No saved jobs yet</p>
                  <p className="text-sm text-gray-400">Save jobs to view them here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {savedJobs.map((savedJob) => (
                  <Card key={savedJob.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{savedJob.jobs.title}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSavedJob(savedJob.id)}
                        >
                          <Heart className="h-4 w-4 fill-current" />
                        </Button>
                      </div>
                      <p className="text-gray-600 mb-2">{savedJob.jobs.company}</p>
                      <p className="text-sm text-gray-500 mb-2">{savedJob.jobs.location}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline">{savedJob.jobs.type}</Badge>
                          <Badge variant="secondary">{savedJob.jobs.stipend}</Badge>
                        </div>
                        <p className="text-xs text-gray-400">
                          Saved {format(new Date(savedJob.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Application History */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Application History</h2>
            {applications.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No applications yet</p>
                  <p className="text-sm text-gray-400">Apply to jobs to track them here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <Card key={application.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{application.jobs.title}</h3>
                        <Badge 
                          variant={application.status === 'pending' ? 'default' : 'secondary'}
                        >
                          {application.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-2">{application.jobs.company}</p>
                      <p className="text-sm text-gray-500 mb-2">{application.jobs.location}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{application.jobs.type}</Badge>
                        <p className="text-xs text-gray-400">
                          Applied {format(new Date(application.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;