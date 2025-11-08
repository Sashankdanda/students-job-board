import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi there! 👋 I'm here to help you with your job search. You can ask me about finding jobs, creating your profile, applying for positions, or navigating the website. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const getBotResponse = (userInput: string): string => {
    const message = userInput.toLowerCase();
    
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
        message.includes('update profile') || message.includes('resume') ||
        message.includes('cv') || message.includes('my profile')) {
      return "Your profile is your digital resume! ✨ Go to your profile section 📝 Fill in your education, skills, and experience 📄 Upload your resume 🎯 Add a professional photo. A complete profile gets 3x more employer views!";
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
    if (message.includes('interview') || message.includes('interview tips') || 
        message.includes('prepare interview') || message.includes('interview prep') ||
        message.includes('job interview')) {
      return "Interview preparation is key! 💪 Research the company beforehand 📋 Practice common interview questions 👔 Dress professionally and arrive early 📱 Prepare questions to ask them too. We have interview resources in our career center!";
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
        message.includes('broken') || message.includes('issue') ||
        message.includes('cant access') || message.includes("can't access")) {
      return "Sorry you're having trouble! 🔧 Try refreshing the page or clearing your browser cache 📱 Make sure you're using a supported browser 💬 Contact our support team at support@studentjobs.com for technical issues. I'm here for general questions!";
    }
    
    // Company info
    if (message.includes('companies') || message.includes('employers') || 
        message.includes('which companies') || message.includes('company list') ||
        message.includes('who hires') || message.includes('top companies')) {
      return "We partner with amazing companies! 🏢 Browse job postings to see all employers 🌟 We have startups, Fortune 500s, and everything in between 🎯 Use company size filters to find your preferred work environment. Check individual company profiles for more details!";
    }
    
    // Tips and advice
    if (message.includes('tips') || message.includes('advice') || 
        message.includes('suggestions') || message.includes('help me') ||
        message.includes('what should i do') || message.includes('what should I do')) {
      return "Here are some great job search tips! 🌟 Keep your profile updated 📝 Apply within 48 hours of job posting 🎯 Customize your applications for each role ⭐ Follow up professionally 📊 Track your applications. What specific area would you like tips on?";
    }
    
    // Account/login issues
    if (message.includes('login') || message.includes('sign in') || 
        message.includes('password') || message.includes('account') ||
        message.includes('register') || message.includes('sign up')) {
      return "Having account issues? 🔐 Use the 'Sign In' button at the top right 📧 Check your email for verification links 🔄 Use 'Forgot Password' if needed 📞 Contact support if you're still having trouble. Need help with anything else?";
    }
    
    // Job categories/types
    if (message.includes('job types') || message.includes('categories') || 
        message.includes('what jobs') || message.includes('available jobs') ||
        message.includes('fields') || message.includes('industries')) {
      return "We have opportunities in many fields! 💻 Technology & IT 📈 Marketing & Sales 🏥 Healthcare 📚 Education 🎨 Creative & Design 🔬 Research 🏭 Manufacturing and more! Use our category filters to explore specific industries.";
    }
    
    // Success stories/testimonials
    if (message.includes('success') || message.includes('testimonials') || 
        message.includes('reviews') || message.includes('stories') ||
        message.includes('does this work')) {
      return "Yes, we help students find great opportunities! 🎉 Over 10,000 students have found jobs through our platform ⭐ 4.8/5 average rating from users 💼 85% of users find jobs within 3 months 📈 Many go on to full-time roles. You're in good hands!";
    }
    
    // Fallback responses (rotate between them)
    const fallbacks = [
      "I'm still learning! 🤖 Could you rephrase that? I can help with job searching, applications, profiles, interviews, and general website questions.",
      "That's a great question! For detailed help, try browsing our FAQ section or contact our support team. I'm best at helping with job search basics!",
      "I'd love to help! Try asking about finding jobs, creating your profile, or how to apply for positions. What would you like to know?"
    ];
    
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  };

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    // Show typing indicator for 1-2 seconds, then add bot response
    const typingDelay = Math.random() * 1000 + 1000; // 1-2 seconds
    setTimeout(() => {
      const botResponse = getBotResponse(currentInput);
      const botMessage: Message = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, typingDelay);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Student Job Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <ScrollArea ref={scrollAreaRef} className="flex-1 mb-4 p-4 border rounded-lg max-h-[400px] overflow-y-auto">
          <div className="space-y-4 min-h-0">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
              >
                <div className={`flex gap-3 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {message.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                    <p className={`text-xs mt-2 opacity-70 ${
                      message.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-3 justify-start mb-4">
                <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <form onSubmit={handleSubmit} className="flex gap-2 flex-shrink-0 mt-auto">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me about jobs, applications, interviews, or anything else..."
            className="flex-1"
            disabled={isTyping}
          />
          <Button type="submit" disabled={isTyping || !inputValue.trim()}>
            {isTyping ? 'Thinking...' : 'Send'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default Chatbot;