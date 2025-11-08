-- Create jobs table
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Full-time', 'Part-time', 'Internship', 'Contract')),
  stipend TEXT NOT NULL,
  skills TEXT[] NOT NULL DEFAULT '{}',
  description TEXT NOT NULL,
  published_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  actively_hiring BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for jobs (public read access)
CREATE POLICY "Anyone can view active jobs" 
ON public.jobs 
FOR SELECT 
USING (is_active = true);

-- Create job applications table
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for job applications
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Policies for job applications
CREATE POLICY "Users can view their own applications" 
ON public.job_applications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create job applications" 
ON public.job_applications 
FOR INSERT 
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample job data
INSERT INTO public.jobs (title, company, location, type, stipend, skills, description, published_date, actively_hiring) VALUES
('Frontend Developer Intern', 'TechCorp Solutions', 'Mumbai, India', 'Internship', '₹25,000/month', 
 ARRAY['React', 'JavaScript', 'CSS', 'Git'], 
 'We are looking for a passionate frontend developer intern who can work on modern web applications using React. You will be part of our development team and work on real-world projects that impact thousands of users. The role involves collaborating with designers, implementing responsive designs, writing clean code, and participating in code reviews. You should have a good understanding of JavaScript fundamentals and be eager to learn new technologies.',
 now() - interval '2 days', true),

('Data Analyst', 'DataViz Inc', 'Bangalore, India', 'Full-time', '₹6,00,000/year',
 ARRAY['Python', 'SQL', 'Tableau', 'Excel'],
 'Join our data team to analyze business metrics and create insightful reports. You will work with large datasets, create visualizations, and help drive business decisions through data-driven insights.',
 now() - interval '7 days', true),

('Mobile App Developer', 'AppMakers Studio', 'Delhi, India', 'Part-time', '₹35,000/month',
 ARRAY['React Native', 'Flutter', 'Firebase'],
 'Develop cross-platform mobile applications for our clients. Experience with React Native or Flutter is required. You will be working on various projects ranging from e-commerce apps to social platforms.',
 now() - interval '3 days', false),

('UI/UX Design Intern', 'Creative Minds', 'Pune, India', 'Internship', '₹20,000/month',
 ARRAY['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
 'Create beautiful and functional user interfaces for web and mobile applications. You will work closely with our design team to understand user needs and create engaging experiences.',
 now() - interval '5 days', true),

('Backend Developer', 'ServerTech Labs', 'Hyderabad, India', 'Full-time', '₹8,00,000/year',
 ARRAY['Node.js', 'Express', 'MongoDB', 'AWS'],
 'Build scalable backend systems and APIs. Work with microservices architecture and cloud technologies to power our applications.',
 now() - interval '1 day', true),

('DevOps Engineer', 'CloudOps Solutions', 'Chennai, India', 'Full-time', '₹10,00,000/year',
 ARRAY['Docker', 'Kubernetes', 'Jenkins', 'AWS'],
 'Manage and automate our deployment pipelines. Experience with containerization and orchestration tools required.',
 now() - interval '4 days', true);