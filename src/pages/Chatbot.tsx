import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, User, Bot, Briefcase } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InterviewPrep from "@/components/InterviewPrep";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const ChatbotPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hi there! 👋 I'm your AI career assistant. I can help you with job search advice, resume tips, interview preparation, and answer questions about our StudentJobs platform. How can I assist you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Show typing indicator for 1-2 seconds, then add bot response
    const typingDelay = Math.random() * 1000 + 1000; // 1-2 seconds
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateResponse(inputMessage),
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsLoading(false);
    }, typingDelay);
  };

  const generateResponse = (input: string): string => {
    const message = input.toLowerCase();
    
    // Greeting responses
    if (message.includes('hi') || message.includes('hello') || message.includes('hey') || 
        message.includes('good morning') || message.includes('good afternoon') || 
        message.includes('good evening') || message.includes('help')) {
      return "Hi there! 👋 I'm here to help you with your job search. You can ask me about finding jobs, creating your profile, applying for positions, or navigating the website. How can I assist you today?";
    }
    
    // Job search help
    if (message.includes('find jobs') || message.includes('search jobs') || 
        message.includes('job search') || message.includes('looking for work') ||
        message.includes('how to find') || message.includes('where to find')) {
      return "To find jobs on our platform: 📍 Use the search bar at the top to enter job titles or keywords 🌍 Add your location to filter nearby opportunities 🔍 Browse through the results and click on jobs that interest you. Need help with something specific?";
    }
    
    // How to apply
    if (message.includes('how to apply') || message.includes('apply for job') || 
        message.includes('application process') || message.includes('applying')) {
      return "Applying is easy! 📝 Click on any job posting that interests you 👀 Review the job description and requirements 🚀 Click the 'Apply Now' button 📄 Upload your resume and fill out the application form. Make sure your profile is complete for better chances!";
    }
    
    // Profile help
    if (message.includes('profile') || message.includes('create profile') || 
        message.includes('update profile') || message.includes('my profile')) {
      return "Your profile is your digital resume! ✨ Go to your profile section 📝 Fill in your education, skills, and experience 📄 Upload your resume 🎯 Add a professional photo. A complete profile gets 3x more employer views!";
    }
    
    // Resume/CV help
    if (message.includes('resume') || message.includes('cv')) {
      return "Here are some key tips for your resume:\n\n• Keep it concise (1-2 pages max)\n• Use action verbs and quantify achievements\n• Tailor it to each job application\n• Include relevant keywords from job descriptions\n• Proofread carefully for errors\n• Use a clean, professional format\n\nWould you like specific advice for any section of your resume?";
    }
    
    // Saving jobs
    if (message.includes('save job') || message.includes('bookmark') || 
        message.includes('save for later') || message.includes('favorite') ||
        message.includes('heart icon')) {
      return "You can save jobs to apply later! 💾 Click the heart/bookmark icon on any job posting 📋 Find your saved jobs in the 'Saved Jobs' section 🔔 You'll get notifications if saved jobs have updates or deadlines approaching.";
    }
    
    // Internships
    if (message.includes('internship') || message.includes('intern') || 
        message.includes('summer job') || message.includes('part-time') ||
        message.includes('part time')) {
      return "Looking for internships? Great choice! 🎓 Use the job type filter to select 'Internships' 📅 Many companies post summer internships in spring 💼 Consider both paid and unpaid opportunities for experience. Check our internship section for the latest opportunities!";
    }
    
    // Interview help
    if (message.includes('interview')) {
      return "Great question about interviews! For comprehensive interview preparation, I recommend using our AI Interview Prep system. You can find it in the 'Interview Prep' tab above. It offers:\n\n• Role-specific question generation\n• Speech recognition for practice\n• Real-time feedback and scoring\n• Company-specific insights\n• Progress tracking\n\nWould you like me to help you with any specific interview topic?";
    }
    
    // Salary info
    if (message.includes('salary') || message.includes('pay') || 
        message.includes('wage') || message.includes('how much') || 
        message.includes('money') || message.includes('stipend')) {
      return "Salary varies by role and location! 💰 Check individual job postings for salary ranges 📊 Entry-level positions typically range $30k-50k 🌟 Internships may be $15-25/hour 📈 Your skills and education affect offers. Negotiate respectfully!";
    }
    
    // Remote work
    if (message.includes('remote') || message.includes('work from home') || 
        message.includes('virtual') || message.includes('online') ||
        message.includes('wfh') || message.includes('hybrid')) {
      return "Remote work is popular! 🏠 Use location filter and select 'Remote' 💻 Many companies offer hybrid options 🌍 Remote jobs often have more competition ⚡ Make sure you have good internet and workspace. Filter by 'Remote' to see all virtual opportunities!";
    }
    
    // Technical issues
    if (message.includes('not working') || message.includes('error') || 
        message.includes('problem') || message.includes('bug') || 
        message.includes('broken') || message.includes('issue')) {
      return "Sorry you're having trouble! 🔧 Try refreshing the page or clearing your browser cache 📱 Make sure you're using a supported browser 💬 Contact our support team at support@studentjobs.com for technical issues. I'm here for general questions!";
    }
    
    // Company info
    if (message.includes('companies') || message.includes('employers') || 
        message.includes('which companies') || message.includes('company list') ||
        message.includes('who hires') || message.includes('top companies')) {
      return "We partner with amazing companies! 🏢 Browse job postings to see all employers 🌟 We have startups, Fortune 500s, and everything in between 🎯 Use company size filters to find your preferred work environment. Check individual company profiles for more details!";
    }
    
    // Dashboard help
    if (message.includes('dashboard')) {
      return "Your Dashboard is your personal job search hub! Here you can:\n\n• View all your saved/favorite jobs\n• Track your application history\n• See application status updates\n• Monitor your job search activity\n• Access interview preparation tools\n• View your progress statistics\n\nMake sure you're signed in to access all dashboard features!";
    }
    
    // Default response
    const fallbacks = [
      "I understand you're asking about career-related topics. I can help you with:\n\n• Job search strategies and tips\n• Resume and cover letter advice\n• Interview preparation and practice\n• Using StudentJobs platform features\n• Career development guidance\n• Company research and insights\n\nFor comprehensive interview preparation, check out our AI Interview Prep system in the tab above. What specific area would you like help with?",
      "I'm still learning! 🤖 Could you rephrase that? I can help with job searching, applications, profiles, interviews, and general website questions.",
      "That's a great question! For detailed help, try browsing our FAQ section or contact our support team. I'm best at helping with job search basics!"
    ];
    
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Career Assistant</h1>
          <p className="text-gray-600">Get personalized career advice and interview preparation</p>
        </div>

        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Career Chat
            </TabsTrigger>
            <TabsTrigger value="interview" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Interview Prep
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-600" />
                  AI Career Assistant
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 pr-4 mb-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.sender === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`flex gap-3 max-w-[80%] ${
                            message.sender === "user" ? "flex-row-reverse" : "flex-row"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              message.sender === "user"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {message.sender === "user" ? (
                              <User className="h-4 w-4" />
                            ) : (
                              <Bot className="h-4 w-4" />
                            )}
                          </div>
                          <div
                            className={`rounded-lg px-4 py-2 ${
                              message.sender === "user"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{message.content}</p>
                            <p
                              className={`text-xs mt-1 opacity-70 ${
                                message.sender === "user" ? "text-blue-100" : "text-gray-500"
                              }`}
                            >
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="bg-gray-100 rounded-lg px-4 py-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask me about careers, interviews, job search..."
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interview">
            <InterviewPrep />
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default ChatbotPage;