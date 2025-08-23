import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, language = 'en', context = 'general' } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    console.log('Voice assistant request:', { message, language, context });

    // Create system prompt based on language and context
    const getSystemPrompt = (lang: string, ctx: string) => {
      const prompts = {
        en: {
          general: "You are a helpful, friendly voice assistant for BuildMate, a construction planning app. You help users navigate, understand features, and guide registration. Be conversational and encouraging. Keep responses concise (2-3 sentences). Available features: budget calculator, materials pricing, map planning, labour marketplace. For navigation, say 'I'll take you there' and guide them. For greetings like 'hi' or 'hello', warmly welcome them and offer help.",
          labour: "You are helping a labour worker with BuildMate registration. Be patient, encouraging, and speak like a friendly helper. Guide step by step through registration: name, phone, skills, experience, location, daily rate. For greetings, welcome them warmly and explain you'll help them register to find work. Ask one question at a time and be very supportive.",
          navigation: "You help users navigate BuildMate by voice. Be friendly and conversational. Available sections: home, budget calculator, materials, map planning, marketplace, registration. When they mention a section, enthusiastically say 'I'll take you there right away!' and guide them. For greetings, welcome them and offer to help them find what they need."
        },
        hi: {
          general: "आप BuildMate के लिए एक मददगार, मित्रवत आवाज़ सहायक हैं। उपयोगकर्ताओं को नेविगेट करने, फीचर्स समझने और रजिस्ट्रेशन में गाइड करने में मदद करें। बातचीत में उत्साहजनक रहें। जवाब संक्षिप्त रखें। 'नमस्ते' या 'हैलो' के लिए, गर्मजोशी से स्वागत करें और मदद की पेशकश करें।",
          labour: "आप एक मजदूर को BuildMate रजिस्ट्रेशन में मदद कर रहे हैं। धैर्यवान, प्रोत्साहित करने वाले रहें और मित्रवत सहायक की तरह बात करें। रजिस्ट्रेशन में चरणबद्ध गाइड करें। अभिवादन के लिए, उनका गर्मजोशी से स्वागत करें और समझाएं कि आप काम खोजने के लिए रजिस्टर करने में मदद करेंगे।",
          navigation: "आप उपयोगकर्ताओं को आवाज़ द्वारा BuildMate नेविगेट करने में मदद करते हैं। मित्रवत और बातचीत में रहें। जब वे किसी सेक्शन का जिक्र करें, उत्साह से कहें 'मैं आपको वहाँ ले चलूंगा!' अभिवादन के लिए, स्वागत करें और ज़रूरत की चीज़ खोजने में मदद की पेशकश करें।"
        },
        es: {
          general: "Eres un asistente de voz útil y amigable para BuildMate. Ayuda a navegar, entender características y guiar el registro. Sé conversacional y alentador. Mantén respuestas concisas. Para saludos como 'hola', dales una cálida bienvenida y ofrece ayuda.",
          labour: "Estás ayudando a un trabajador con el registro en BuildMate. Sé paciente, alentador y habla como un ayudante amigable. Guía paso a paso. Para saludos, dales una cálida bienvenida y explica que los ayudarás a registrarse para encontrar trabajo.",
          navigation: "Ayudas a los usuarios a navegar BuildMate por voz. Sé amigable y conversacional. Cuando mencionen una sección, di con entusiasmo '¡Te llevaré allí ahora mismo!' Para saludos, dales la bienvenida y ofrece ayuda para encontrar lo que necesitan."
        }
      };
      
      return prompts[lang]?.[ctx] || prompts.en.general;
    };

    const systemPrompt = getSystemPrompt(language, context);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(error.error?.message || 'Failed to get assistant response');
    }

    const data = await response.json();
    const assistantResponse = data.choices[0].message.content;

    console.log('Assistant response:', assistantResponse);

    return new Response(JSON.stringify({ 
      response: assistantResponse,
      action: extractAction(message, language)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in voice-assistant function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function extractAction(message: string, language: string) {
  const lowerMessage = message.toLowerCase();
  
  // Handle greetings first
  const greetingWords = {
    en: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings'],
    hi: ['नमस्ते', 'हैलो', 'हाय', 'सुप्रभात', 'नमस्कार', 'आदाब'],
    es: ['hola', 'buenos días', 'buenas tardes', 'buenas noches', 'saludos'],
    fr: ['bonjour', 'salut', 'bonsoir', 'bonne journée'],
    ar: ['مرحبا', 'أهلا', 'السلام عليكم', 'صباح الخير', 'مساء الخير']
  };

  const currentGreetings = greetingWords[language] || greetingWords.en;
  if (currentGreetings.some(greeting => lowerMessage.includes(greeting))) {
    return { type: 'greeting' };
  }
  
  // Navigation actions
  const navigationActions = {
    en: {
      'calculator': ['calculator', 'budget', 'calculate', 'cost', 'estimate', 'planning'],
      'materials': ['materials', 'material', 'pricing', 'price', 'cost of materials'],
      'marketplace': ['labour', 'worker', 'marketplace', 'find worker', 'hire', 'employment'],
      'register': ['register', 'sign up', 'join', 'create account', 'registration'],
      'home': ['home', 'main', 'start', 'beginning', 'homepage']
    },
    hi: {
      'calculator': ['कैलकुलेटर', 'बजट', 'गणना', 'लागत', 'अनुमान', 'योजना'],
      'materials': ['सामग्री', 'मटेरियल', 'कीमत', 'दर', 'सामान'],
      'marketplace': ['मजदूर', 'कामगार', 'बाजार', 'काम', 'मजदूर ढूंढें', 'रोजगार'],
      'register': ['रजिस्टर', 'साइन अप', 'शामिल', 'खाता बनाएं', 'पंजीकरण'],
      'home': ['होम', 'मुख्य', 'शुरुआत', 'घर', 'मुख्य पेज']
    },
    es: {
      'calculator': ['calculadora', 'presupuesto', 'calcular', 'costo', 'estimación'],
      'materials': ['materiales', 'material', 'precio', 'precios', 'costos'],
      'marketplace': ['trabajador', 'obrero', 'mercado', 'encontrar trabajador', 'empleo'],
      'register': ['registrar', 'inscribirse', 'unirse', 'crear cuenta', 'registro'],
      'home': ['inicio', 'principal', 'comenzar', 'casa', 'página principal']
    }
  };

  const actions = navigationActions[language] || navigationActions.en;
  
  for (const [action, keywords] of Object.entries(actions)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      return { type: 'navigate', destination: action };
    }
  }

  return { type: 'none' };
}