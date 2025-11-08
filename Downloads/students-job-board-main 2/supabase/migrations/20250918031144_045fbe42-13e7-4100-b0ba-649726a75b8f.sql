-- Create table for interview sessions and progress tracking
CREATE TABLE public.interview_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_title TEXT NOT NULL,
  company TEXT,
  question TEXT NOT NULL,
  response TEXT NOT NULL,
  analysis JSONB,
  confidence_score INTEGER,
  sentiment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for interview progress tracking
CREATE TABLE public.interview_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_title TEXT NOT NULL,
  company TEXT,
  total_sessions INTEGER DEFAULT 0,
  avg_confidence_score DECIMAL,
  improvement_areas JSONB,
  strengths JSONB,
  last_session_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, job_title, company)
);

-- Enable RLS
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for interview_sessions
CREATE POLICY "Users can view their own interview sessions" 
ON public.interview_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interview sessions" 
ON public.interview_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interview sessions" 
ON public.interview_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for interview_progress
CREATE POLICY "Users can view their own interview progress" 
ON public.interview_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interview progress" 
ON public.interview_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interview progress" 
ON public.interview_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update interview progress
CREATE OR REPLACE FUNCTION public.update_interview_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update progress record
  INSERT INTO public.interview_progress (
    user_id, 
    job_title, 
    company, 
    total_sessions, 
    avg_confidence_score, 
    last_session_date
  )
  VALUES (
    NEW.user_id,
    NEW.job_title,
    NEW.company,
    1,
    NEW.confidence_score,
    NEW.created_at
  )
  ON CONFLICT (user_id, job_title, company) 
  DO UPDATE SET
    total_sessions = interview_progress.total_sessions + 1,
    avg_confidence_score = (
      (interview_progress.avg_confidence_score * interview_progress.total_sessions + NEW.confidence_score) 
      / (interview_progress.total_sessions + 1)
    ),
    last_session_date = NEW.created_at,
    updated_at = now();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for interview progress updates
CREATE TRIGGER update_interview_progress_trigger
  AFTER INSERT ON public.interview_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_interview_progress();

-- Add trigger for updated_at columns
CREATE TRIGGER update_interview_sessions_updated_at
  BEFORE UPDATE ON public.interview_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_interview_progress_updated_at
  BEFORE UPDATE ON public.interview_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();