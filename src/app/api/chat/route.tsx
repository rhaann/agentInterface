// src/app/api/chat/route.ts

import { type NextRequest, NextResponse } from 'next/server';

type N8nResponse = {
  reply: string;
};

// --- UPDATE Request Body type ---
type RequestBody = {
    message: string;
    sessionId: string; // Expect sessionId
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RequestBody;
    const userMessage = body.message;
    const sessionId = body.sessionId; // --- Get sessionId from body ---

    // --- Add validation for sessionId ---
    if (!userMessage || typeof userMessage !== 'string' || userMessage.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }
    if (!sessionId || typeof sessionId !== 'string') {
        return NextResponse.json({ error: 'Session ID is required.' }, { status: 400 });
    }
    // --- End validation ---

    console.log(`API Route: Received message: "${userMessage}" (Session: ${sessionId})`);

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!n8nWebhookUrl) {
        console.error("API Route ERROR: N8N_WEBHOOK_URL environment variable is not set.");
        return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    console.log(`API Route: Sending POST request to n8n: ${n8nWebhookUrl}`);
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // --- Forward BOTH message and sessionId to n8n ---
      body: JSON.stringify({
          message: userMessage,
          sessionId: sessionId // Pass it along
      }),
    });

    console.log("API Route: Received n8n status:", n8nResponse.status);

    // ... (Keep the rest of the response/error handling the same) ...
     if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error(`API Route ERROR: n8n workflow failed with status ${n8nResponse.status}:`, errorText);
      return NextResponse.json(
          { error: 'Failed to process message with backend workflow.' },
          { status: 502 }
      );
    }

    const data = (await n8nResponse.json()) as N8nResponse;
    console.log("API Route: Received n8n response data:", data);

    if (!data || typeof data.reply !== 'string') {
        console.error("API Route ERROR: Invalid response structure from n8n:", data);
        return NextResponse.json(
            { error: 'Received invalid response format from backend workflow.' },
            { status: 502 }
        );
    }

    return NextResponse.json({ reply: data.reply }, { status: 200 });


  } catch (error) {
    console.error('API Route ERROR: Error in POST handler:', error);
     if (error instanceof SyntaxError && error.message.includes('JSON')) {
       return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
     }
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}