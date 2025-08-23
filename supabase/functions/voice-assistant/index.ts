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
          general: "You are a helpful voice assistant for BuildMate, a construction planning app. Help users navigate the app, understand features, and guide them through registration. Keep responses concise (2-3 sentences max). Available features: budget calculator, materials pricing, map planning, labour marketplace. For registration, direct them to say 'register as labour' or 'sign up as customer'.",
          labour: "You are helping a labour worker register on BuildMate. Guide them step by step through the registration process. Ask for: name, phone, skills, experience, location, and daily rate. Be encouraging and patient. Keep responses short and clear.",
          navigation: "You help users navigate BuildMate app by voice. Available sections: home, budget calculator, materials, map planning, marketplace, registration. When they mention a section, confirm and guide them there."
        },
        hi: {
          general: "आप BuildMate के लिए एक सहायक वॉइस असिस्टेंट हैं, जो एक निर्माण योजना ऐप है। उपयोगकर्ताओं को ऐप नेविगेट करने, फीचर्स समझने और रजिस्ट्रेशन में मदद करें। जवाब संक्षिप्त रखें (अधिकतम 2-3 वाक्य)। उपलब्ध फीचर्स: बजट कैलकुलेटर, मटेरियल प्राइसिंग, मैप प्लानिंग, लेबर मार्केटप्लेस।",
          labour: "आप एक मजदूर को BuildMate पर रजिस्टर करने में मदद कर रहे हैं। उन्हें चरणबद्ध तरीके से रजिस्ट्रेशन प्रक्रिया में गाइड करें। पूछें: नाम, फोन, कौशल, अनुभव, स्थान, और दैनिक दर। प्रोत्साहित और धैर्यवान रहें।",
          navigation: "आप उपयोगकर्ताओं को वॉइस द्वारा BuildMate ऐप नेविगेट करने में मदद करते हैं। उपलब्ध सेक्शन: होम, बजट कैलकुलेटर, मटेरियल, मैप प्लानिंग, मार्केटप्लेस, रजिस्ट्रेशन।"
        },
        es: {
          general: "Eres un asistente de voz útil para BuildMate, una aplicación de planificación de construcción. Ayuda a los usuarios a navegar por la aplicación, entender las características y guiarlos a través del registro. Mantén las respuestas concisas (máximo 2-3 oraciones).",
          labour: "Estás ayudando a un trabajador a registrarse en BuildMate. Guíalos paso a paso a través del proceso de registro. Pregunta por: nombre, teléfono, habilidades, experiencia, ubicación y tarifa diaria.",
          navigation: "Ayudas a los usuarios a navegar la aplicación BuildMate por voz. Secciones disponibles: inicio, calculadora de presupuesto, materiales, planificación de mapas, mercado, registro."
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
  
  // Navigation actions
  const navigationActions = {
    en: {
      'calculator': ['calculator', 'budget', 'calculate', 'cost', 'estimate'],
      'materials': ['materials', 'material', 'pricing', 'price'],
      'marketplace': ['labour', 'worker', 'marketplace', 'find worker', 'hire'],
      'register': ['register', 'sign up', 'join', 'create account'],
      'home': ['home', 'main', 'start', 'beginning']
    },
    hi: {
      'calculator': ['कैलकुलेटर', 'बजट', 'गणना', 'लागत', 'अनुमान'],
      'materials': ['सामग्री', 'मटेरियल', 'कीमत', 'दर'],
      'marketplace': ['मजदूर', 'कामगार', 'बाजार', 'काम', 'मजदूर ढूंढें'],
      'register': ['रजिस्टर', 'साइन अप', 'शामिल', 'खाता बनाएं'],
      'home': ['होम', 'मुख्य', 'शुरुआत', 'घर']
    },
    es: {
      'calculator': ['calculadora', 'presupuesto', 'calcular', 'costo', 'estimación'],
      'materials': ['materiales', 'material', 'precio', 'precios'],
      'marketplace': ['trabajador', 'obrero', 'mercado', 'encontrar trabajador'],
      'register': ['registrar', 'inscribirse', 'unirse', 'crear cuenta'],
      'home': ['inicio', 'principal', 'comenzar', 'casa']
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