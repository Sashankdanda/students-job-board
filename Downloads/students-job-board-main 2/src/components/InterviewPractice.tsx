import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Mic, MicOff, Play, Pause, RotateCcw, Clock, Target, TrendingUp, Lightbulb, Timer, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: string;
  estimatedTime: number;
  hints?: string[];
  examples?: string[];
}

interface PracticeMode {
  type: 'practice' | 'timed' | 'behavioral' | 'technical';
  timeLimit?: number;
  showHints: boolean;
  autoAdvance: boolean;
}

interface InterviewPracticeProps {
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  onQuestionChange: (index: number) => void;
  onResponseSubmit: (response: string, audioBlob?: Blob, timeSpent?: number, confidence?: number) => void;
  isAnalyzing: boolean;
  userResponse: string;
  onResponseChange: (response: string) => void;
}

export const InterviewPractice: React.FC<InterviewPracticeProps> = ({
  questions,
  currentQuestionIndex,
  onQuestionChange,
  onResponseSubmit,
  isAnalyzing,
  userResponse,
  onResponseChange
}) => {
  const { toast } = useToast();
  const [practiceMode, setPracticeMode] = useState<PracticeMode>({
    type: 'practice',
    showHints: true,
    autoAdvance: false
  });
  
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [questionTimer, setQuestionTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [confidenceLevel, setConfidenceLevel] = useState([7]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showThinkingTime, setShowThinkingTime] = useState(false);
  const [thinkingTimer, setThinkingTimer] = useState(120); // 2 minutes thinking time

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const thinkingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (isTimerActive && timerRef.current === null) {
      timerRef.current = setInterval(() => {
        setQuestionTimer(prev => prev + 1);
      }, 1000);
    } else if (!isTimerActive && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerActive]);

  useEffect(() => {
    if (showThinkingTime && thinkingTimerRef.current === null) {
      thinkingTimerRef.current = setInterval(() => {
        setThinkingTimer(prev => {
          if (prev <= 1) {
            setShowThinkingTime(false);
            toast({
              title: "Thinking Time Over",
              description: "You can now start recording your answer",
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!showThinkingTime && thinkingTimerRef.current) {
      clearInterval(thinkingTimerRef.current);
      thinkingTimerRef.current = null;
    }

    return () => {
      if (thinkingTimerRef.current) {
        clearInterval(thinkingTimerRef.current);
      }
    };
  }, [showThinkingTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startThinkingTime = () => {
    setShowThinkingTime(true);
    setThinkingTimer(120);
    toast({
      title: "Thinking Time Started",
      description: "You have 2 minutes to think about your answer",
    });
  };

  const startRecording = async () => {
    if (showThinkingTime) {
      toast({
        title: "Wait for Thinking Time",
        description: "Please wait for the thinking time to complete",
        variant: "destructive",
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Auto-transcribe audio if response is empty
        if (!userResponse.trim()) {
          transcribeAudio(audioBlob);
        }
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setIsTimerActive(true);
      setQuestionTimer(0);
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
      setIsTimerActive(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    // This would integrate with your speech recognition edge function
    // For now, we'll show a placeholder
    toast({
      title: "Audio Recorded",
      description: "Audio has been recorded. You can play it back or type your response manually.",
    });
  };

  const playAudio = () => {
    if (audioUrl && audioRef.current) {
      if (isPlayingAudio) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
      } else {
        audioRef.current.play();
        setIsPlayingAudio(true);
      }
    }
  };

  const submitResponse = () => {
    if (!userResponse.trim() && !audioUrl) {
      toast({
        title: "No Response",
        description: "Please provide a response before submitting",
        variant: "destructive",
      });
      return;
    }

    const audioBlob = audioChunks.current.length > 0 
      ? new Blob(audioChunks.current, { type: 'audio/webm' }) 
      : undefined;

    onResponseSubmit(userResponse, audioBlob, questionTimer, confidenceLevel[0]);
    
    // Reset for next question
    setQuestionTimer(0);
    setIsTimerActive(false);
    setAudioUrl(null);
    audioChunks.current = [];
    setConfidenceLevel([7]);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      onQuestionChange(currentQuestionIndex + 1);
      onResponseChange('');
      setQuestionTimer(0);
      setIsTimerActive(false);
      setAudioUrl(null);
      audioChunks.current = [];
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      onQuestionChange(currentQuestionIndex - 1);
      onResponseChange('');
      setQuestionTimer(0);
      setIsTimerActive(false);
      setAudioUrl(null);
      audioChunks.current = [];
    }
  };

  if (!currentQuestion) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No questions available. Please generate questions first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Practice Mode Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Practice Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-hints">Show Hints</Label>
            <Switch
              id="show-hints"
              checked={practiceMode.showHints}
              onCheckedChange={(checked) => 
                setPracticeMode({...practiceMode, showHints: checked})
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-advance">Auto-advance Questions</Label>
            <Switch
              id="auto-advance"
              checked={practiceMode.autoAdvance}
              onCheckedChange={(checked) => 
                setPracticeMode({...practiceMode, autoAdvance: checked})
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Question Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                Question {currentQuestionIndex + 1} of {questions.length}
                {isTimerActive && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(questionTimer)}
                  </Badge>
                )}
              </CardTitle>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{currentQuestion.category}</Badge>
                <Badge variant="secondary">{currentQuestion.difficulty}</Badge>
                {currentQuestion.estimatedTime && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    {currentQuestion.estimatedTime}min
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={startThinkingTime}
                disabled={showThinkingTime || isRecording}
              >
                <Timer className="h-4 w-4 mr-1" />
                Thinking Time
              </Button>
            </div>
          </div>
          
          {showThinkingTime && (
            <div className="mt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Timer className="h-4 w-4" />
                Thinking time: {formatTime(thinkingTimer)}
              </div>
              <Progress value={(120 - thinkingTimer) / 120 * 100} className="mt-2" />
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-lg leading-relaxed">
            {currentQuestion.question}
          </div>

          {practiceMode.showHints && currentQuestion.hints && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 mb-2">Hints:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                      {currentQuestion.hints.map((hint, index) => (
                        <li key={index}>{hint}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Response Input */}
          <div className="space-y-4">
            <Label htmlFor="response">Your Response:</Label>
            <Textarea
              id="response"
              value={userResponse}
              onChange={(e) => onResponseChange(e.target.value)}
              placeholder="Type your response or use the microphone to record..."
              rows={6}
              disabled={showThinkingTime}
            />

            {/* Audio Recording Controls */}
            <div className="flex gap-2 items-center">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? "destructive" : "outline"}
                size="sm"
                disabled={showThinkingTime}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {isRecording ? 'Stop Recording' : 'Record Response'}
              </Button>

              {audioUrl && (
                <Button
                  onClick={playAudio}
                  variant="outline"
                  size="sm"
                >
                  {isPlayingAudio ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isPlayingAudio ? 'Pause' : 'Play Recording'}
                </Button>
              )}

              {audioUrl && (
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlayingAudio(false)}
                  className="hidden"
                />
              )}
            </div>

            {/* Confidence Level */}
            <div className="space-y-2">
              <Label>Confidence Level: {confidenceLevel[0]}/10</Label>
              <Slider
                value={confidenceLevel}
                onValueChange={setConfidenceLevel}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Not Confident</span>
                <span>Very Confident</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={submitResponse}
                disabled={isAnalyzing || (!userResponse.trim() && !audioUrl) || showThinkingTime}
                className="flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                {isAnalyzing ? 'Analyzing...' : 'Analyze Response'}
              </Button>

              <Button
                onClick={previousQuestion}
                variant="outline"
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>

              <Button
                onClick={nextQuestion}
                variant="outline"
                disabled={currentQuestionIndex >= questions.length - 1}
              >
                Next Question
              </Button>

              <Button
                onClick={() => {
                  onResponseChange('');
                  setQuestionTimer(0);
                  setIsTimerActive(false);
                  setAudioUrl(null);
                  audioChunks.current = [];
                  setConfidenceLevel([7]);
                }}
                variant="outline"
                size="sm"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{currentQuestionIndex + 1} / {questions.length}</span>
            </div>
            <Progress value={(currentQuestionIndex + 1) / questions.length * 100} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};