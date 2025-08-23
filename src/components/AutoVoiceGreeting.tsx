import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Mic, MicOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { VoiceRecorder } from '@/utils/voiceRecorder';
import { supabase } from '@/integrations/supabase/client';

interface AutoVoiceGreetingProps {
  context?: 'general' | 'labour' | 'navigation';
}

export const AutoVoiceGreeting = ({ context = 'general' }: AutoVoiceGreetingProps) => {
  const [state, setState] = useState<'greeting' | 'idle' | 'listening' | 'processing' | 'speaking'>('greeting');
  const [hasGreeted, setHasGreeted] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  
  const voiceRecorderRef = useRef<VoiceRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const greetingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();
  const { language, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    voiceRecorderRef.current = new VoiceRecorder();
    
    // Check if user has been greeted in this session
    const sessionGreeted = sessionStorage.getItem('voice_greeted');
    
    if (!sessionGreeted && isVoiceEnabled) {
      // Auto-greet after a short delay when user enters website
      greetingTimeoutRef.current = setTimeout(() => {
        autoGreetUser();
      }, 2000); // 2 second delay
    } else {
      setState('idle');
    }

    return () => {
      if (greetingTimeoutRef.current) {
        clearTimeout(greetingTimeoutRef.current);
      }
      if (voiceRecorderRef.current?.isRecording()) {
        voiceRecorderRef.current.stopRecording().catch(console.error);
      }
    };
  }, []);

  const getLanguageCode = () => {
    const languageMap: Record<string, string> = {
      'en': 'en',
      'hi': 'hi', 
      'es': 'es',
      'fr': 'fr',
      'ar': 'ar'
    };
    return languageMap[language] || 'en';
  };

  const getGreetingMessage = () => {
    const greetings = {
      en: "Hello! Welcome to BuildMate! I'm your voice assistant. I can help you navigate the app, find labour, calculate budgets, or register for services. Just speak to me anytime! How can I help you today?",
      hi: "नमस्ते! BuildMate में आपका स्वागत है! मैं आपका आवाज़ सहायक हूं। मैं आपको ऐप नेविगेट करने, मजदूर खोजने, बजट कैलकुलेट करने या सेवाओं के लिए रजिस्टर करने में मदद कर सकता हूं। कभी भी मुझसे बात करें! आज मैं आपकी कैसे मदद कर सकता हूं?",
      es: "¡Hola! ¡Bienvenido a BuildMate! Soy tu asistente de voz. Puedo ayudarte a navegar por la aplicación, encontrar trabajadores, calcular presupuestos o registrarte para servicios. ¡Habla conmigo en cualquier momento! ¿Cómo puedo ayudarte hoy?",
      fr: "Salut! Bienvenue sur BuildMate! Je suis votre assistant vocal. Je peux vous aider à naviguer dans l'application, trouver des ouvriers, calculer des budgets ou vous inscrire aux services. Parlez-moi à tout moment! Comment puis-je vous aider aujourd'hui?",
      ar: "مرحباً! أهلاً بك في BuildMate! أنا مساعدك الصوتي. يمكنني مساعدتك في التنقل في التطبيق، العثور على العمالة، حساب الميزانيات أو التسجيل للخدمات. تحدث معي في أي وقت! كيف يمكنني مساعدتك اليوم؟"
    };
    return greetings[getLanguageCode()] || greetings.en;
  };

  const autoGreetUser = async () => {
    if (hasGreeted) return;
    
    try {
      setState('speaking');
      setHasGreeted(true);
      sessionStorage.setItem('voice_greeted', 'true');
      
      const greetingText = getGreetingMessage();
      await speakResponse(greetingText);
      
      // After greeting, start listening for user response
      setTimeout(() => {
        if (state !== 'listening') {
          startAutoListening();
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error in auto greeting:', error);
      setState('idle');
    }
  };

  const startAutoListening = async () => {
    if (!voiceRecorderRef.current || !isVoiceEnabled) return;

    try {
      setState('listening');
      setTranscript('');
      setResponse('');
      await voiceRecorderRef.current.startRecording();
      
      // Auto-stop listening after 10 seconds
      setTimeout(() => {
        if (voiceRecorderRef.current?.isRecording()) {
          stopListening();
        }
      }, 10000);
      
    } catch (error) {
      console.error('Error starting auto listening:', error);
      setState('idle');
    }
  };

  const stopListening = async () => {
    if (!voiceRecorderRef.current?.isRecording()) return;

    try {
      setState('processing');
      const audioData = await voiceRecorderRef.current.stopRecording();
      
      // Convert speech to text
      const { data: transcriptionData, error: transcriptionError } = await supabase.functions.invoke('voice-to-text', {
        body: { 
          audio: audioData,
          language: getLanguageCode()
        }
      });

      if (transcriptionError) throw transcriptionError;
      
      const userText = transcriptionData?.text || '';
      setTranscript(userText);
      
      if (!userText.trim()) {
        setState('idle');
        // Offer to help again after silence
        setTimeout(() => {
          if (state === 'idle') {
            speakResponse("I'm still here if you need help. Just say 'help me' or ask any question!");
          }
        }, 3000);
        return;
      }

      // Get AI response
      const { data: assistantData, error: assistantError } = await supabase.functions.invoke('voice-assistant', {
        body: {
          message: userText,
          language: getLanguageCode(),
          context
        }
      });

      if (assistantError) throw assistantError;

      const assistantResponse = assistantData?.response || '';
      const action = assistantData?.action;
      setResponse(assistantResponse);

      // Handle navigation actions
      if (action?.type === 'navigate') {
        handleNavigation(action.destination);
      }

      // Convert response to speech
      if (assistantResponse) {
        await speakResponse(assistantResponse);
      }
      
    } catch (error) {
      console.error('Error processing voice:', error);
      setState('idle');
      toast({
        title: "Voice Error",
        description: "Had trouble understanding. Please try again or click the voice button.",
        variant: "destructive"
      });
    }
  };

  const handleNavigation = (destination: string) => {
    const routes: Record<string, string> = {
      'calculator': '/calculator',
      'materials': '/materials',
      'marketplace': '/marketplace',
      'register': '/labour-registration',
      'home': '/'
    };

    const route = routes[destination];
    if (route && route !== location.pathname) {
      setTimeout(() => {
        navigate(route);
      }, 2000); // Navigate after response is spoken
    }
  };

  const speakResponse = async (text: string) => {
    try {
      setState('speaking');
      
      const voiceMap: Record<string, string> = {
        'en': 'alloy',
        'hi': 'onyx',
        'es': 'nova', 
        'fr': 'shimmer',
        'ar': 'fable'
      };

      const { data: speechData, error: speechError } = await supabase.functions.invoke('text-to-voice', {
        body: {
          text,
          voice: voiceMap[getLanguageCode()] || 'alloy'
        }
      });

      if (speechError) throw speechError;

      if (speechData?.audioContent) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(speechData.audioContent), c => c.charCodeAt(0))],
          { type: 'audio/mp3' }
        );
        
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        audio.onended = () => {
          setState('idle');
          URL.revokeObjectURL(audioUrl);
          
          // Auto-listen again after speaking, unless user disabled voice
          if (isVoiceEnabled && hasGreeted) {
            setTimeout(startAutoListening, 1500);
          }
        };
        
        audio.onerror = () => {
          setState('idle');
          URL.revokeObjectURL(audioUrl);
        };
        
        await audio.play();
      }
    } catch (error) {
      console.error('Error speaking response:', error);
      setState('idle');
    }
  };

  const toggleVoice = () => {
    if (!isVoiceEnabled) {
      setIsVoiceEnabled(true);
      if (!hasGreeted) {
        autoGreetUser();
      } else {
        startAutoListening();
      }
    } else {
      setIsVoiceEnabled(false);
      setState('idle');
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (voiceRecorderRef.current?.isRecording()) {
        voiceRecorderRef.current.stopRecording().catch(console.error);
      }
    }
  };

  const manualStartListening = () => {
    if (state === 'idle' && isVoiceEnabled) {
      startAutoListening();
    } else if (state === 'listening') {
      stopListening();
    }
  };

  if (!isVoiceEnabled) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={toggleVoice}
          size="lg"
          variant="outline"
          className="rounded-full shadow-lg"
        >
          <VolumeX className="h-5 w-5 mr-2" />
          Enable Voice Help
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex flex-col items-end gap-2">
        {(transcript || response) && (
          <div className="bg-background border rounded-lg p-3 max-w-xs shadow-lg">
            {transcript && (
              <div className="text-sm text-muted-foreground mb-2">
                <strong>You:</strong> {transcript}
              </div>
            )}
            {response && (
              <div className="text-sm">
                <strong>Assistant:</strong> {response}
              </div>
            )}
          </div>
        )}
        
        <div className="flex gap-2">
          <Button
            onClick={toggleVoice}
            size="sm"
            variant="outline"
            className="rounded-full"
          >
            <VolumeX className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={manualStartListening}
            size="lg"
            variant={state === 'listening' ? 'destructive' : state === 'speaking' ? 'secondary' : 'default'}
            className={`rounded-full shadow-lg transition-all duration-200 ${
              state === 'listening' ? 'animate-pulse bg-red-500 hover:bg-red-600' : ''
            } ${
              state === 'speaking' ? 'bg-blue-500 hover:bg-blue-600' : ''
            }`}
            disabled={state === 'processing' || !isVoiceEnabled}
          >
            {state === 'listening' ? <MicOff className="h-5 w-5" /> :
             state === 'processing' ? <Loader2 className="h-5 w-5 animate-spin" /> :
             state === 'speaking' ? <Volume2 className="h-5 w-5" /> :
             <Mic className="h-5 w-5" />}
            <span className="ml-2">
              {state === 'greeting' ? 'Starting...' :
               state === 'listening' ? 'Listening...' :
               state === 'processing' ? 'Processing...' :
               state === 'speaking' ? 'Speaking...' :
               'Voice Help'}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};