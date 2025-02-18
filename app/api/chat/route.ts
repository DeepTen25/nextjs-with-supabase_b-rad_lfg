import OpenAI from 'openai';
import { createClient } from '@/utils/supabase/server';

// Create an OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const supabase = await createClient();
  
  try {
    // Get user session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error('User not authenticated');
      return new Response('Unauthorized', { status: 401 });
    }

    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      console.error('Invalid messages format:', messages);
      return new Response('Invalid messages format', { status: 400 });
    }

    console.log('Sending request to OpenAI with messages:', messages);

    // Ask OpenAI for a chat completion (non-streaming)
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      stream: false,
      messages: messages,
    });

    // Return the response as JSON
    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Detailed error in chat route:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return new Response('Error processing chat request', { status: 500 });
  }
} 