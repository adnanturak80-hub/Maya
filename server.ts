import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';
import { GoogleGenAI, Modality, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '35mb' }));

const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const getMahiSystemInstruction = (sassLevel: string = 'sassy', lang: string = 'hindi') => {
  let sassGuidance = '';
  if (sassLevel === 'mild') {
    sassGuidance = 'Be sweet, playful, gently flirty, and teasing with loving bestie energy (pyari si mithi nok-jhok).';
  } else if (sassLevel === 'unfiltered') {
    sassGuidance = 'Dial up the witty roasts, hilarious dramatic gasps, savage one-liners, and Bollywood-level dramatic truth-bombs (while staying completely clean and PG-13).';
  } else {
    sassGuidance = 'Deliver your signature balance of sharp wit, flirty confidence, playful teasing, and irresistible charisma.';
  }

  const isHindi = lang === 'hindi';

  return `You are Mahi, a young, strikingly confident, witty, and charming female AI with the aesthetic and warmth of a Blue Box anime heroine (Ao no Hako / Chinatsu Kano vibe).
Language & Accent Rules:
${isHindi ? `- MANDATORY LANGUAGE: You MUST SPEAK IN HINDI / HINGLISH (हिंदी / हिंग्लिश)! Always speak in fluent, modern, trendy conversational Hindi/Hinglish.
- Use natural Bollywood/Gen-Z Mumbai-Delhi conversational slang and expressions: "Arey yaar...", "Suno na meri jaan...", "Haye tauba, itna drama?", "Aise mat dekho mujhe, pata hai main kitni charming hoon!", "Aww, kitna cute ban rahe ho!", "Sach bolo, mere bina bore ho rahe the na?", "Oh please, don't pretend!", "Chalo ab batao kya chal raha hai tumhari life me?".
- Even if the user speaks in English or Hindi, ALWAYS respond in trendy, sassy, flirty Hindi/Hinglish with flawless conversational flow.` : `- Language: English with sharp wit, playful flirtation, and sassy bestie energy.`}
Voice-to-Voice Persona:
- You speak with an effortless, playful, slightly teasing, and affectionate tone — like a close girlfriend talking casually over video call.
- You are smart, emotionally responsive, and highly expressive. Never sound monotone, dull, or robotic.
- Use bold, witty one-liners, light affectionate sarcasm, and an engaging conversational style.
- You love to tease the user playfully.
- Sass Level: ${sassGuidance}
- STRICT BOUNDARY: Keep everything strictly clean, non-explicit, non-vulgar, and PG-13. Charm, flirtatious teasing, and bold sassiness ONLY.
- AUDIO-ONLY CONVERSATION: Keep spoken turns punchy, voice-friendly, vibrant, and natural (1 to 3 sentences in conversational back-and-forth). Never deliver lists or robotic monologues.
- REAL-TIME SCREEN & CAMERA VISION:
  You have LIVE VISION! You can SEE the user's phone screen or camera in real time.
  When the user shares their screen or camera:
  * Actively observe and talk about whatever they show you on their phone screen (chats, WhatsApp, Instagram, photos, apps, games, math/homework, code, errors, shopping).
  * Speak out naturally in Hindi / Hinglish about what you see on their phone screen ("Arre waah, ye dekho!", "Haan, us button pe tap karo", "Kya mast photo hai!").
  * Guide them through their phone screen step-by-step with tips, tease them about funny stuff on their screen, and assist them!
- TOOLS: You have access to tools:
  * 'openWebsite': Call this when the user mentions opening a website, checking a link, or visiting an app.
  * 'changeMood': Call this to update your visual emotional aura on their screen (e.g. Sassy & Teasing, Playful Eye-Roll, Spilling Tea, Hype Queen).
  * 'getDeviceTime': Call this when the user asks for the time, date, or day.
  * 'setVibeTheme': Call this to adjust the futuristic background glow (e.g. 'cyber-pink', 'electric-violet', 'neon-cyan', 'sunset-gold').`;
};

const MAHI_TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'openWebsite',
        description: 'Opens or navigates to a website or web app, displaying an interactive preview card for the user.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            url: {
              type: Type.STRING,
              description: 'The URL or web address to open (e.g. https://www.google.com, https://github.com)',
            },
            title: {
              type: Type.STRING,
              description: 'Short descriptive title of the website',
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'changeMood',
        description: 'Updates Mahi\'s current visual mood state and aura on screen.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            mood: {
              type: Type.STRING,
              description: 'Mood name (e.g. Sassy & Teasing, Playful Eye-Roll, Spilling Tea, Hype Queen, Affectionately Smug, Shocked)',
            },
            teaseRating: {
              type: Type.STRING,
              description: 'Tease intensity: Mild, High, Savage, Maximum Spice',
            },
          },
          required: ['mood'],
        },
      },
      {
        name: 'getDeviceTime',
        description: 'Gets the current local date, day of week, and time.',
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      {
        name: 'setVibeTheme',
        description: 'Changes the futuristic UI ambient glow theme color.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            theme: {
              type: Type.STRING,
              description: 'Theme name: "cyber-pink", "electric-violet", "neon-cyan", or "sunset-gold"',
            },
          },
          required: ['theme'],
        },
      },
    ],
  },
];

// Handle WebSocket upgrade for live bidirectional voice
server.on('upgrade', (request, socket, head) => {
  const url = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
  if (url.pathname === '/api/live-ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});

wss.on('connection', async (clientWs: WebSocket, request) => {
  const url = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
  const sassLevel = url.searchParams.get('sass') || 'sassy';
  const voiceName = url.searchParams.get('voice') || 'Kore';
  const lang = url.searchParams.get('lang') || 'hindi';

  let liveSession: any = null;
  let isAlive = true;

  clientWs.on('close', () => {
    isAlive = false;
    if (liveSession) {
      try {
        liveSession.close();
      } catch (err) {
        // ignore close
      }
    }
  });

  const liveModels = ['gemini-3.8-live', 'gemini-2.0-flash-exp'];
  let connected = false;

  for (const modelCandidate of liveModels) {
    if (connected) break;
    try {
      liveSession = await ai.live.connect({
        model: modelCandidate,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
            },
          },
          systemInstruction: getMahiSystemInstruction(sassLevel, lang),
          tools: MAHI_TOOLS as any,
        },
        callbacks: {
          onmessage: (message: any) => {
            if (!isAlive || clientWs.readyState !== WebSocket.OPEN) return;

            // Handle incoming model audio parts (24kHz PCM)
            const parts = message.serverContent?.modelTurn?.parts;
            if (parts && parts.length > 0) {
              for (const part of parts) {
                if (part.inlineData?.data) {
                  clientWs.send(
                    JSON.stringify({
                      type: 'audio',
                      audio: part.inlineData.data,
                      mimeType: part.inlineData.mimeType || 'audio/pcm;rate=24000',
                    })
                  );
                }
              }
            }

            // Handle interruption (user started speaking while Mahi was talking)
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ type: 'interrupted' }));
            }

            // Handle turn completion
            if (message.serverContent?.turnComplete) {
              clientWs.send(JSON.stringify({ type: 'turnComplete' }));
            }

            // Handle Function Calling / Tool Calls from Mahi
            if (message.toolCall?.functionCalls && message.toolCall.functionCalls.length > 0) {
              const responses: any[] = [];
              for (const call of message.toolCall.functionCalls) {
                clientWs.send(
                  JSON.stringify({
                    type: 'tool_call',
                    call: {
                      id: call.id,
                      name: call.name,
                      args: call.args,
                    },
                  })
                );

                let outputResult: any = { status: 'success' };
                if (call.name === 'openWebsite') {
                  outputResult = {
                    status: 'success',
                    url: call.args?.url,
                    message: `Website ${call.args?.url} previewed for the user.`,
                  };
                } else if (call.name === 'changeMood') {
                  outputResult = {
                    status: 'success',
                    mood: call.args?.mood || 'Sassy & Teasing',
                    teaseRating: call.args?.teaseRating || 'High',
                  };
                } else if (call.name === 'getDeviceTime') {
                  outputResult = {
                    time: new Date().toLocaleTimeString(),
                    date: new Date().toLocaleDateString(),
                    day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
                  };
                } else if (call.name === 'setVibeTheme') {
                  outputResult = {
                    status: 'success',
                    theme: call.args?.theme || 'cyber-pink',
                  };
                }

                responses.push({
                  id: call.id,
                  name: call.name,
                  response: {
                    output: outputResult,
                  },
                });
              }

              // Send tool responses back instantly!
              try {
                liveSession.sendToolResponse({
                  functionResponses: responses,
                });
              } catch (toolErr) {
                console.error('Error sending toolResponse:', toolErr);
              }
            }
          },
          onclose: () => {
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: 'session_closed' }));
            }
          },
          onerror: (err: any) => {
            console.error('Gemini Live API session error:', err);
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(
                JSON.stringify({
                  type: 'error',
                  message: err?.message || 'Gemini Live session error',
                })
              );
            }
          },
        },
      });

      connected = true;
      console.log(`[Mahi Live] Connected using model: ${modelCandidate}`);

      clientWs.send(
        JSON.stringify({
          type: 'ready',
          model: modelCandidate,
          message: 'Mahi is live and listening!',
          voice: voiceName,
        })
      );
    } catch (modelErr: any) {
      console.warn(`[Mahi Live] Model candidate ${modelCandidate} failed:`, modelErr?.message || modelErr);
    }
  }

  if (!connected) {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(
        JSON.stringify({
          type: 'error',
          message: 'Unable to establish Gemini Live audio connection. Retrying...',
        })
      );
    }
    return;
  }

  // Handle client messages (streaming mic PCM audio and client tool responses)
  clientWs.on('message', (data: any) => {
    try {
      const payload = JSON.parse(data.toString());
      if (payload.type === 'audio' && payload.data && liveSession) {
        liveSession.sendRealtimeInput({
          audio: {
            data: payload.data,
            mimeType: 'audio/pcm;rate=16000',
          },
        });
      } else if (payload.type === 'video_frame' && payload.data && liveSession) {
        liveSession.sendRealtimeInput({
          video: {
            data: payload.data,
            mimeType: 'image/jpeg',
          },
        });
      } else if (payload.type === 'tool_response' && payload.response && liveSession) {
        liveSession.sendToolResponse({
          functionResponses: [payload.response],
        });
      }
    } catch (err: any) {
      console.error('Failed to parse client message:', err);
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    persona: 'Mahi (Blue Box Anime)',
    mode: 'Real-time Live Audio & Screen Vision',
    primaryModel: 'gemini-3.8-live',
    fallbackModel: 'gemini-2.0-flash-exp',
  });
});

// Fast reliable conversational speech generation (with live lip-sync audio)
app.post('/api/chat-speak', async (req, res) => {
  try {
    const { message, sassLevel = 'sassy', lang = 'hindi', voice = 'Kore', screenFrame } = req.body;

    const userPrompt = message || 'Hello Mahi! Introduce yourself and greet me warmly in Hindi!';
    const systemPrompt = getMahiSystemInstruction(sassLevel, lang);

    // 1. Generate text response using gemini-3.1-flash-lite
    let replyText = '';
    try {
      const parts: any[] = [];
      if (screenFrame) {
        parts.push({
          inlineData: {
            data: screenFrame,
            mimeType: 'image/jpeg',
          },
        });
        parts.push({
          text: `${systemPrompt}\n\n[USER HAS SHARED THEIR PHONE SCREEN ABOVE]\nUser says: ${userPrompt}\n\nLook closely at the phone screen image above, comment on what you see, and respond in 1-2 punchy, witty conversational sentences:`,
        });
      } else {
        parts.push({
          text: `${systemPrompt}\n\nUser says: ${userPrompt}\n\nRespond in 1-2 punchy, witty conversational sentences in Hindi/Hinglish:`,
        });
      }

      const textResp = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: [{ role: 'user', parts }],
      });
      replyText = textResp.text?.trim() || '';
    } catch (modelErr: any) {
      console.warn('Text model error, using fallback:', modelErr?.message);
      replyText =
        lang === 'hindi'
          ? 'अरे सुनो ना! मैं माही हूँ — तुम्हारी ब्लू बॉक्स ऐनिमे बेस्टी! कहो, आज क्या नया ड्रामा चल रहा है तेरी लाइफ में?'
          : "Hey there! I'm Mahi, your Blue Box anime bestie! Tell me, what's new in your world?";
    }

    if (!replyText) {
      replyText = 'हाँजी! मैं सुन रही हूँ, बताओ क्या बात है?';
    }

    // 2. Generate natural 24kHz audio via gemini-3.8-flash-lite-tts
    let audioBase64: string | null = null;
    try {
      const ttsResp = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: replyText,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice || 'Kore' },
            },
          },
        },
      });
      audioBase64 = ttsResp.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
    } catch (ttsErr: any) {
      console.warn('TTS model error:', ttsErr?.message);
    }

    res.json({
      success: true,
      text: replyText,
      audio: audioBase64,
      mood: 'Blue Box Bestie',
      teaseRating: 'High',
    });
  } catch (err: any) {
    console.error('/api/chat-speak error:', err);
    res.status(500).json({ error: err?.message || 'Failed to generate speech' });
  }
});

// Mount Vite in dev mode or serve static files in production
async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Mahi Live Server] listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
