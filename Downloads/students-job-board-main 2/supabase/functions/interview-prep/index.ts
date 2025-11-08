import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, jobTitle, company, industry, experience, jobDescription, questionType } = await req.json();
    console.log('Interview prep request:', { action, jobTitle, company, industry });

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    switch (action) {
      case 'generate_questions':
        systemPrompt = `You are an expert interview coach. Generate realistic interview questions based on the job details provided. 
        Focus on role-specific technical skills, behavioral questions, and company culture fit.
        Return 5-7 questions in JSON format with question, category (technical/behavioral/cultural), and difficulty level.`;
        
        userPrompt = `Generate interview questions for:
        Job Title: ${jobTitle}
        Company: ${company}
        Industry: ${industry}
        Experience Level: ${experience}
        Job Description: ${jobDescription}
        Question Type: ${questionType || 'mixed'}`;
        break;

      case 'analyze_response':
        const { response, question } = await req.json();
        systemPrompt = `You are an interview coach analyzing a candidate's response. Provide detailed feedback on:
        1. Content quality and relevance
        2. Confidence level (1-10)
        3. Sentiment analysis (positive/neutral/negative)
        4. Areas for improvement
        5. Suggested better response structure
        Return analysis in JSON format.`;
        
        userPrompt = `Analyze this interview response:
        Question: ${question}
        Response: ${response}
        Job Context: ${jobTitle} at ${company}`;
        break;

      case 'company_insights':
        systemPrompt = `You are a career advisor with deep knowledge of companies and industries. 
        Provide specific insights about the company's interview process, culture, values, and what they typically look for in candidates.
        Include tips for success and common interview themes.`;
        
        userPrompt = `Provide interview insights for ${company} in the ${industry} industry for a ${jobTitle} position.`;
        break;

      case 'body_language_tips':
        systemPrompt = `You are a communication expert specializing in body language and non-verbal communication during interviews.
        Provide specific, actionable tips for body language, eye contact, posture, and presentation skills.`;
        
        userPrompt = `Provide body language and presentation tips for a ${jobTitle} interview at ${company}.`;
        break;

      case 'website_doubt':
        const { userQuestion } = await req.json();
        systemPrompt = `You are a helpful assistant for StudentJobs platform. Answer questions about the website, 
        job search features, application process, and general career advice. Be informative and helpful.`;
        
        userPrompt = `User question about StudentJobs platform: ${userQuestion}`;
        break;

      default:
        throw new Error('Invalid action specified');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Store interaction for progress tracking
    if (action === 'analyze_response') {
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const jwt = authHeader.replace('Bearer ', '');
        const { data: userData } = await supabase.auth.getUser(jwt);
        
        if (userData.user) {
          await supabase.from('interview_sessions').insert({
            user_id: userData.user.id,
            job_title: jobTitle,
            company: company,
            question: await req.json().then(body => body.question),
            response: await req.json().then(body => body.response),
            analysis: aiResponse,
            created_at: new Date().toISOString()
          });
        }
      }
    }

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in interview-prep function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});