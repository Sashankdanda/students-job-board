import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Mic, MicOff, Play, Pause, RotateCcw, Target, TrendingUp, Users, Brain, Clock, Star, Heart, RefreshCw, BarChart3, Award, BookOpen, Video, Mic2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { InterviewPractice } from './InterviewPractice';
import { InterviewInsights } from './InterviewInsights';

interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: string;
  estimatedTime: number;
  isFavorite?: boolean;
  examples?: string[];
}

interface InterviewSetup {
  jobTitle: string;
  company: string;
  industry: string;
  experienceLevel: string;
  interviewType: string;
  companyType: string;
  difficultyLevel: number[];
  jobDescription: string;
  questionType: string;
  customQuestions: string[];
}

interface PracticeSession {
  questionId: string;
  response: string;
  audioBlob?: Blob;
  timeSpent: number;
  confidenceLevel: number;
  startTime: Date;
  endTime?: Date;
}

interface AnalysisResult {
  contentQuality: number;
  confidenceLevel: number;
  sentiment: string;
  improvements: string[];
  suggestedResponse: string;
  speechAnalysis?: {
    pace: number;
    clarity: number;
    fillerWords: number;
    volume: number;
  };
  strengths: string[];
  score: number;
}

const InterviewPrep: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('setup');
  
  // Enhanced setup state
  const [setup, setSetup] = useState<InterviewSetup>({
    jobTitle: '',
    company: '',
    industry: '',
    experienceLevel: '',
    interviewType: '',
    companyType: '',
    difficultyLevel: [5],
    jobDescription: '',
    questionType: 'mixed',
    customQuestions: []
  });

  // Enhanced interview state
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [favoriteQuestions, setFavoriteQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userResponse, setUserResponse] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [progress, setProgress] = useState<any>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [questionTimer, setQuestionTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [currentSession, setCurrentSession] = useState<PracticeSession | null>(null);
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [practiceMode, setPracticeMode] = useState<'practice' | 'timed' | 'behavioral' | 'technical'>('practice');
  const [showHints, setShowHints] = useState(true);
  const [confidenceLevel, setConfidenceLevel] = useState(5);

  // Recording and playback state
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const audioUrl = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  // Website help state
  const [doubtQuestion, setDoubtQuestion] = useState('');
  const [doubtResponse, setDoubtResponse] = useState('');
  const [isAnsweringDoubt, setIsAnsweringDoubt] = useState(false);

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState({
    totalPracticeTime: 0,
    questionsAnswered: 0,
    averageScore: 0,
    improvementAreas: [],
    streakCount: 0,
    achievements: []
  });

  useEffect(() => {
    if (user) {
      fetchProgress();
    }
  }, [user]);

  const fetchProgress = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('interview_progress')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      setProgress(data || []);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const generateQuestions = async (generateMore: boolean = false) => {
    if (!setup.jobTitle) {
      toast({
        title: "Missing Information",
        description: "Please enter at least a job title",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('interview-prep', {
        body: {
          action: 'generate_questions',
          jobTitle: setup.jobTitle,
          company: setup.company,
          industry: setup.industry,
          experience: setup.experienceLevel,
          jobDescription: setup.jobDescription,
          questionType: setup.questionType,
          difficultyLevel: setup.difficultyLevel[0],
          interviewType: setup.interviewType,
          generateMore
        }
      });

      if (error) throw error;

      try {
        const questionsData = JSON.parse(data.response);
        const newQuestions = (questionsData.questions || questionsData).map((q: any, index: number) => ({
          id: `${Date.now()}-${index}`,
          question: typeof q === 'string' ? q : q.question,
          category: typeof q === 'string' ? 'general' : (q.category || 'general'),
          difficulty: typeof q === 'string' ? 'medium' : (q.difficulty || 'medium'),
          estimatedTime: typeof q === 'string' ? 3 : (q.estimatedTime || 3),
          hints: typeof q === 'string' ? [] : (q.hints || []),
          examples: typeof q === 'string' ? [] : (q.examples || [])
        }));
        
        if (generateMore) {
          setQuestions(prev => [...prev, ...newQuestions]);
        } else {
          setQuestions(newQuestions);
        }
        setCurrentQuestionIndex(0);
        setActiveTab('practice');
        toast({
          title: "Questions Generated!",
          description: `Generated ${newQuestions.length} interview questions`,
        });
      } catch (parseError) {
        // If JSON parsing fails, treat as plain text and create question objects
        const lines = data.response.split('\n').filter((line: string) => line.trim());
        const generatedQuestions = lines.map((line: string, index: number) => ({
          id: `${Date.now()}-${index}`,
          question: line.replace(/^\d+\.?\s*/, ''),
          category: 'general',
          difficulty: 'medium',
          estimatedTime: 3,
          hints: [],
          examples: []
        }));
        
        if (generateMore) {
          setQuestions(prev => [...prev, ...generatedQuestions]);
        } else {
          setQuestions(generatedQuestions);
        }
        setCurrentQuestionIndex(0);
        setActiveTab('practice');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        title: "Error",
        description: "Failed to generate questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleFavorite = (questionId: string) => {
    setFavoriteQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        const { data, error } = await supabase.functions.invoke('speech-recognition', {
          body: { audio: base64Audio }
        });

        if (error) throw error;
        setUserResponse(data.text);
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Error transcribing audio:', error);
      toast({
        title: "Transcription Error",
        description: "Failed to transcribe audio. Please try typing your response.",
        variant: "destructive",
      });
    }
  };

  const analyzeResponse = async () => {
    if (!userResponse.trim() || !questions[currentQuestionIndex]) {
      toast({
        title: "Missing Response",
        description: "Please provide a response to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('interview-prep', {
        body: {
          action: 'analyze_response',
          jobTitle: setup.jobTitle,
          company: setup.company,
          question: questions[currentQuestionIndex].question,
          response: userResponse
        }
      });

      if (error) throw error;

      try {
        const analysisData = JSON.parse(data.response);
        setAnalysis({
          ...analysisData,
          strengths: analysisData.strengths || [],
          score: analysisData.score || analysisData.contentQuality || 7
        });
      } catch (parseError) {
        // If JSON parsing fails, display as text
        setAnalysis({
          contentQuality: 7,
          confidenceLevel: 7,
          sentiment: 'positive',
          improvements: [data.response],
          suggestedResponse: '',
          strengths: [],
          score: 7
        });
      }

      // Store session data
      if (user) {
        await supabase.from('interview_sessions').insert({
          user_id: user.id,
          job_title: setup.jobTitle,
          company: setup.company,
          question: questions[currentQuestionIndex].question,
          response: userResponse,
          analysis: data.response,
          confidence_score: confidenceLevel,
          sentiment: 'positive'
        });
      }

      fetchProgress();
    } catch (error) {
      console.error('Error analyzing response:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserResponse('');
      setAnalysis(null);
    }
  };

  const getCompanyInsights = async () => {
    if (!setup.company) {
      toast({
        title: "Missing Company",
        description: "Please enter a company name",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('interview-prep', {
        body: {
          action: 'company_insights',
          company: setup.company,
          industry: setup.industry,
          jobTitle: setup.jobTitle
        }
      });

      if (error) throw error;
      
      toast({
        title: "Company Insights",
        description: "Check the insights tab for detailed information",
      });
      
      setActiveTab('insights');
    } catch (error) {
      console.error('Error getting company insights:', error);
      toast({
        title: "Error",
        description: "Failed to get company insights",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const answerWebsiteDoubt = async () => {
    if (!doubtQuestion.trim()) {
      toast({
        title: "Missing Question",
        description: "Please enter your question",
        variant: "destructive",
      });
      return;
    }

    setIsAnsweringDoubt(true);
    try {
      const { data, error } = await supabase.functions.invoke('interview-prep', {
        body: {
          action: 'website_doubt',
          userQuestion: doubtQuestion
        }
      });

      if (error) throw error;
      setDoubtResponse(data.response);
    } catch (error) {
      console.error('Error answering doubt:', error);
      toast({
        title: "Error",
        description: "Failed to answer your question. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnsweringDoubt(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Interview Preparation System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="practice">Practice</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="doubts">Website Help</TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="jobTitle">Job Title *</Label>
                  <Select value={setup.jobTitle} onValueChange={(value) => setSetup({...setup, jobTitle: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select job role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="software-engineer">Software Engineer</SelectItem>
                      <SelectItem value="product-manager">Product Manager</SelectItem>
                      <SelectItem value="data-scientist">Data Scientist</SelectItem>
                      <SelectItem value="marketing-manager">Marketing Manager</SelectItem>
                      <SelectItem value="sales-representative">Sales Representative</SelectItem>
                      <SelectItem value="business-analyst">Business Analyst</SelectItem>
                      <SelectItem value="ux-designer">UX Designer</SelectItem>
                      <SelectItem value="project-manager">Project Manager</SelectItem>
                      <SelectItem value="financial-analyst">Financial Analyst</SelectItem>
                      <SelectItem value="hr-specialist">HR Specialist</SelectItem>
                      <SelectItem value="custom">Custom Role</SelectItem>
                    </SelectContent>
                  </Select>
                  {setup.jobTitle === 'custom' && (
                    <Input
                      className="mt-2"
                      value={setup.jobTitle}
                      onChange={(e) => setSetup({...setup, jobTitle: e.target.value})}
                      placeholder="Enter custom job title"
                    />
                  )}
                </div>
                
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={setup.company}
                    onChange={(e) => setSetup({...setup, company: e.target.value})}
                    placeholder="e.g., Google, Microsoft, Startup"
                  />
                </div>
                
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={setup.industry} onValueChange={(value) => setSetup({...setup, industry: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                      <SelectItem value="media">Media & Entertainment</SelectItem>
                      <SelectItem value="nonprofit">Non-profit</SelectItem>
                      <SelectItem value="government">Government</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="experience">Experience Level</Label>
                  <Select value={setup.experienceLevel} onValueChange={(value) => setSetup({...setup, experienceLevel: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                      <SelectItem value="mid">Mid Level (2-5 years)</SelectItem>
                      <SelectItem value="senior">Senior Level (5+ years)</SelectItem>
                      <SelectItem value="lead">Lead/Manager (8+ years)</SelectItem>
                      <SelectItem value="executive">Executive (10+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="interviewType">Interview Type</Label>
                  <Select value={setup.interviewType} onValueChange={(value) => setSetup({...setup, interviewType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select interview type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Phone Interview</SelectItem>
                      <SelectItem value="video">Video Interview</SelectItem>
                      <SelectItem value="in-person">In-person Interview</SelectItem>
                      <SelectItem value="panel">Panel Interview</SelectItem>
                      <SelectItem value="technical">Technical Round</SelectItem>
                      <SelectItem value="behavioral">Behavioral Round</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="companyType">Company Type</Label>
                  <Select value={setup.companyType} onValueChange={(value) => setSetup({...setup, companyType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="startup">Startup (1-50 employees)</SelectItem>
                      <SelectItem value="small">Small Company (51-200 employees)</SelectItem>
                      <SelectItem value="medium">Medium Company (201-1000 employees)</SelectItem>
                      <SelectItem value="large">Large Corporation (1000+ employees)</SelectItem>
                      <SelectItem value="nonprofit">Non-profit Organization</SelectItem>
                      <SelectItem value="government">Government Agency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="difficultyLevel">Difficulty Level: {setup.difficultyLevel[0]}/10</Label>
                <div className="mt-2">
                  <Slider
                    value={setup.difficultyLevel}
                    onValueChange={(value) => setSetup({...setup, difficultyLevel: value})}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>Easy</span>
                    <span>Medium</span>
                    <span>Hard</span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="jobDescription">Job Description (Optional)</Label>
                <Textarea
                  id="jobDescription"
                  value={setup.jobDescription}
                  onChange={(e) => setSetup({...setup, jobDescription: e.target.value})}
                  placeholder="Paste the job description for more targeted questions..."
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="questionType">Question Focus</Label>
                <Select value={setup.questionType} onValueChange={(value) => setSetup({...setup, questionType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mixed">Mixed (Technical + Behavioral)</SelectItem>
                    <SelectItem value="technical">Technical Skills</SelectItem>
                    <SelectItem value="behavioral">Behavioral (STAR Method)</SelectItem>
                    <SelectItem value="cultural">Company Culture Fit</SelectItem>
                    <SelectItem value="leadership">Leadership & Management</SelectItem>
                    <SelectItem value="problem-solving">Problem Solving</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={() => {
                    if (!setup.jobTitle) {
                      toast({
                        title: "Missing Information",
                        description: "Please select a job title to continue",
                        variant: "destructive",
                      });
                      return;
                    }
                    setActiveTab('questions');
                  }}
                  className="flex items-center gap-2"
                >
                  <Target className="h-4 w-4" />
                  Continue to Questions
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    // Save preferences
                    localStorage.setItem('interviewSetup', JSON.stringify(setup));
                    toast({
                      title: "Preferences Saved",
                      description: "Your setup preferences have been saved for future sessions",
                    });
                  }}
                >
                  Save Preferences
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="questions" className="space-y-4">
              <div className="flex gap-4 flex-wrap">
                <Button 
                  onClick={() => generateQuestions(false)} 
                  disabled={isAnalyzing}
                  className="flex items-center gap-2"
                >
                  <Target className="h-4 w-4" />
                  {isAnalyzing ? 'Generating...' : 'Generate Questions'}
                </Button>
                <Button 
                  onClick={() => generateQuestions(true)}
                  variant="outline"
                  disabled={isAnalyzing}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Generate More
                </Button>
                <Button 
                  onClick={getCompanyInsights}
                  variant="outline"
                  disabled={isAnalyzing}
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Company Insights
                </Button>
              </div>
              
              {questions.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Generated Questions ({questions.length})</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab('practice')}
                        disabled={questions.length === 0}
                      >
                        Start Practice
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-4 max-h-96 overflow-y-auto">
                    {questions.map((q, index) => (
                      <Card key={q.id || index} className="p-4 relative">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex gap-2">
                            <Badge variant="outline">{q.category}</Badge>
                            <Badge variant="secondary">{q.difficulty}</Badge>
                            {q.estimatedTime && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {q.estimatedTime}min
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorite(q.id || index.toString())}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Heart className={`h-4 w-4 ${favoriteQuestions.includes(q.id || index.toString()) ? 'fill-current' : ''}`} />
                          </Button>
                        </div>
                        <p className="mb-2">{q.question}</p>
                        {q.examples && q.examples.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-muted-foreground mb-1">Example approaches:</p>
                            <ul className="text-sm text-muted-foreground list-disc list-inside">
                              {q.examples.map((example, idx) => (
                                <li key={idx}>{example}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="practice" className="space-y-4">
              {questions.length > 0 ? (
                <InterviewPractice
                  questions={questions}
                  currentQuestionIndex={currentQuestionIndex}
                  onQuestionChange={setCurrentQuestionIndex}
                  onResponseSubmit={(response, audioBlob, timeSpent, confidence) => {
                    setUserResponse(response);
                    setConfidenceLevel(confidence || 7);
                    analyzeResponse();
                  }}
                  isAnalyzing={isAnalyzing}
                  userResponse={userResponse}
                  onResponseChange={setUserResponse}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Generate questions first to start practicing</p>
                  <Button onClick={() => setActiveTab('questions')} className="mt-4">
                    Go to Questions
                  </Button>
                </div>
              )}

              {analysis && (
                <Card>
                  <CardHeader>
                    <CardTitle>Response Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="p-4">
                          <div className="text-center">
                            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                            <p className="text-sm text-gray-600">Confidence</p>
                            <p className="text-2xl font-bold">{analysis.confidenceLevel}/10</p>
                          </div>
                        </Card>
                        <Card className="p-4">
                          <div className="text-center">
                            <Target className="h-8 w-8 mx-auto mb-2 text-green-600" />
                            <p className="text-sm text-gray-600">Content Quality</p>
                            <p className="text-2xl font-bold">{analysis.contentQuality}/10</p>
                          </div>
                        </Card>
                        <Card className="p-4">
                          <div className="text-center">
                            <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                            <p className="text-sm text-gray-600">Sentiment</p>
                            <p className="text-2xl font-bold capitalize">{analysis.sentiment}</p>
                          </div>
                        </Card>
                      </div>
                      
                      {analysis.strengths && analysis.strengths.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 text-green-700">Strengths:</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {analysis.strengths.map((strength, index) => (
                              <li key={index} className="text-sm text-green-600">{strength}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {analysis.improvements && analysis.improvements.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Areas for Improvement:</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {analysis.improvements.map((improvement, index) => (
                              <li key={index} className="text-sm">{improvement}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {analysis.suggestedResponse && (
                        <div>
                          <h4 className="font-semibold mb-2">Suggested Response Structure:</h4>
                          <p className="text-sm bg-gray-50 p-3 rounded">{analysis.suggestedResponse}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <InterviewInsights progress={progress} sessions={sessions} />
            </TabsContent>

            <TabsContent value="doubts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>StudentJobs Platform Help</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="doubtQuestion">Ask your question about StudentJobs:</Label>
                    <Textarea
                      id="doubtQuestion"
                      value={doubtQuestion}
                      onChange={(e) => setDoubtQuestion(e.target.value)}
                      placeholder="e.g., How do I apply for jobs? How does the save feature work? What are the best practices for my profile?"
                      rows={3}
                    />
                  </div>
                  
                  <Button 
                    onClick={answerWebsiteDoubt}
                    disabled={isAnsweringDoubt || !doubtQuestion.trim()}
                  >
                    {isAnsweringDoubt ? 'Getting Answer...' : 'Get Answer'}
                  </Button>
                  
                  {doubtResponse && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Answer</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="whitespace-pre-wrap">{doubtResponse}</p>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewPrep;