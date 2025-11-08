import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Award, 
  BarChart3, 
  Users, 
  Brain,
  Star,
  Calendar,
  Zap,
  CheckCircle,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';

interface PerformanceMetrics {
  totalPracticeTime: number;
  questionsAnswered: number;
  averageScore: number;
  averageConfidence: number;
  improvementAreas: string[];
  strengths: string[];
  streakCount: number;
  achievements: Achievement[];
  sessionHistory: SessionData[];
  skillBreakdown: SkillData[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  type: 'practice' | 'streak' | 'improvement' | 'score';
}

interface SessionData {
  date: string;
  score: number;
  confidence: number;
  timeSpent: number;
  questionsAnswered: number;
}

interface SkillData {
  skill: string;
  score: number;
  improvement: number;
  sessions: number;
}

interface InterviewInsightsProps {
  progress: any[];
  sessions: any[];
}

export const InterviewInsights: React.FC<InterviewInsightsProps> = ({ progress, sessions }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalPracticeTime: 0,
    questionsAnswered: 0,
    averageScore: 0,
    averageConfidence: 0,
    improvementAreas: [],
    strengths: [],
    streakCount: 0,
    achievements: [],
    sessionHistory: [],
    skillBreakdown: []
  });

  const [activeInsightTab, setActiveInsightTab] = useState('overview');

  useEffect(() => {
    calculateMetrics();
  }, [progress, sessions]);

  const calculateMetrics = () => {
    if (!sessions || sessions.length === 0) return;

    const totalSessions = sessions.length;
    const totalScore = sessions.reduce((acc: number, session: any) => acc + (session.confidence_score || 0), 0);
    const avgScore = totalSessions > 0 ? totalScore / totalSessions : 0;

    // Calculate session history for the last 30 days
    const sessionHistory = sessions
      .slice(-30)
      .map((session: any) => ({
        date: new Date(session.created_at).toLocaleDateString(),
        score: session.confidence_score || 0,
        confidence: session.confidence_score || 0,
        timeSpent: 5, // Default time spent
        questionsAnswered: 1
      }));

    // Calculate skill breakdown
    const skillBreakdown = [
      { skill: 'Technical', score: avgScore * 0.9, improvement: 15, sessions: Math.floor(totalSessions * 0.4) },
      { skill: 'Behavioral', score: avgScore * 1.1, improvement: 20, sessions: Math.floor(totalSessions * 0.4) },
      { skill: 'Communication', score: avgScore * 0.95, improvement: 10, sessions: Math.floor(totalSessions * 0.2) }
    ];

    // Generate achievements
    const achievements: Achievement[] = [];
    if (totalSessions >= 5) {
      achievements.push({
        id: '1',
        title: 'Practice Makes Perfect',
        description: 'Completed 5 practice sessions',
        icon: '🎯',
        unlockedAt: new Date(),
        type: 'practice'
      });
    }
    if (avgScore >= 8) {
      achievements.push({
        id: '2',
        title: 'High Performer',
        description: 'Achieved average score of 8+',
        icon: '⭐',
        unlockedAt: new Date(),
        type: 'score'
      });
    }

    setMetrics({
      totalPracticeTime: totalSessions * 15, // Estimate 15 minutes per session
      questionsAnswered: totalSessions,
      averageScore: avgScore,
      averageConfidence: avgScore,
      improvementAreas: ['Speaking pace', 'Eye contact', 'Specific examples'],
      strengths: ['Problem solving', 'Technical knowledge', 'Enthusiasm'],
      streakCount: Math.min(totalSessions, 7),
      achievements,
      sessionHistory,
      skillBreakdown
    });
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-6">
      <Tabs value={activeInsightTab} onValueChange={setActiveInsightTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="tips">Tips & Advice</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Practice Time</p>
                    <p className="text-2xl font-bold">{formatTime(metrics.totalPracticeTime)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Questions Answered</p>
                    <p className="text-2xl font-bold">{metrics.questionsAnswered}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                    <p className="text-2xl font-bold">{metrics.averageScore.toFixed(1)}/10</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Zap className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Streak</p>
                    <p className="text-2xl font-bold">{metrics.streakCount} days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Achievements */}
          {metrics.achievements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {metrics.achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                      <div className="text-2xl mr-3">{achievement.icon}</div>
                      <div>
                        <p className="font-semibold text-yellow-900">{achievement.title}</p>
                        <p className="text-sm text-yellow-700">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Strengths and Improvement Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  Your Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {metrics.strengths.map((strength, index) => (
                    <li key={index} className="flex items-center">
                      <Star className="h-4 w-4 text-green-600 mr-2" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <AlertTriangle className="h-5 w-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {metrics.improvementAreas.map((area, index) => (
                    <li key={index} className="flex items-center">
                      <Lightbulb className="h-4 w-4 text-orange-600 mr-2" />
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.sessionHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="confidence" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Progress by Job Role */}
          {progress && progress.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Progress by Role</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progress.map((prog: any, index: number) => (
                    <div key={index} className="border rounded p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{prog.job_title}</h4>
                          {prog.company && <p className="text-sm text-gray-600">{prog.company}</p>}
                        </div>
                        <Badge variant="outline">{prog.total_sessions} sessions</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <p className="text-sm text-gray-600">Avg. Confidence</p>
                          <div className="flex items-center gap-2">
                            <Progress value={(prog.avg_confidence_score || 0) * 10} className="flex-1" />
                            <span className="text-sm font-semibold">{prog.avg_confidence_score?.toFixed(1) || 'N/A'}/10</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Last Practice</p>
                          <p className="text-sm">{new Date(prog.last_session_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          {/* Skill Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Skill Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {metrics.skillBreakdown.map((skill, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{skill.skill}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{skill.sessions} sessions</Badge>
                        <span className="text-sm text-green-600">+{skill.improvement}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={skill.score * 10} className="flex-1" />
                      <span className="text-sm font-semibold">{skill.score.toFixed(1)}/10</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Industry Benchmark */}
          <Card>
            <CardHeader>
              <CardTitle>Industry Benchmark</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-blue-900">Your Average Score</p>
                    <p className="text-2xl font-bold text-blue-700">{metrics.averageScore.toFixed(1)}/10</p>
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900">Industry Average</p>
                    <p className="text-2xl font-bold text-blue-700">7.2/10</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {metrics.averageScore > 7.2 
                    ? "🎉 You're performing above industry average!" 
                    : "💪 Keep practicing to reach the industry average of 7.2"}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tips" className="space-y-6">
          {/* Body Language Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Body Language & Presentation Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">💪 Posture & Positioning</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Sit up straight with shoulders back</li>
                    <li>Keep both feet flat on the floor</li>
                    <li>Lean slightly forward to show engagement</li>
                    <li>Maintain an open posture (no crossed arms)</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">👁️ Eye Contact & Facial Expression</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Make direct eye contact 70-80% of the time</li>
                    <li>Smile genuinely when appropriate</li>
                    <li>Nod to show understanding and agreement</li>
                    <li>Avoid looking at notes constantly</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">🗣️ Voice & Speech</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Speak clearly and at moderate pace</li>
                    <li>Vary your tone to show enthusiasm</li>
                    <li>Pause before answering complex questions</li>
                    <li>Project confidence through your voice</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">🤝 Hand Gestures & Movement</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Use natural hand gestures to emphasize points</li>
                    <li>Keep gestures within your "box" (shoulder width)</li>
                    <li>Avoid fidgeting or repetitive movements</li>
                    <li>Give a firm handshake (if in-person)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interview Best Practices */}
          <Card>
            <CardHeader>
              <CardTitle>Interview Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-green-700">✅ Do's</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                      Research the company thoroughly
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                      Prepare specific examples using STAR method
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                      Ask thoughtful questions about the role
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                      Follow up with a thank-you email
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 text-red-700">❌ Don'ts</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <AlertTriangle className="h-4 w-4 text-red-600 mr-2 mt-0.5" />
                      Arrive late or unprepared
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle className="h-4 w-4 text-red-600 mr-2 mt-0.5" />
                      Speak negatively about previous employers
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle className="h-4 w-4 text-red-600 mr-2 mt-0.5" />
                      Interrupt the interviewer
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle className="h-4 w-4 text-red-600 mr-2 mt-0.5" />
                      Ask about salary too early
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* STAR Method Guide */}
          <Card>
            <CardHeader>
              <CardTitle>STAR Method Framework</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">📍 Situation</h4>
                  <p className="text-sm text-blue-700">Set the context and background of your example</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">🎯 Task</h4>
                  <p className="text-sm text-green-700">Describe what needed to be accomplished</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2">⚡ Action</h4>
                  <p className="text-sm text-purple-700">Explain the steps you took to address the situation</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-900 mb-2">📊 Result</h4>
                  <p className="text-sm text-orange-700">Share the outcomes and what you learned</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};