import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { VoiceRecorder } from '@/utils/voiceRecorder';
import { supabase } from '@/integrations/supabase/client';

interface VoiceAssistantProps {
  context?: 'general' | 'labour' | 'navigation';
  onStateChange?: (state: 'idle' | 'listening' | 'processing' | 'speaking') => void;
}

export const VoiceAssistant = ({ context = 'general', onStateChange }: VoiceAssistantProps) => {
  const [state, setState] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  
  const voiceRecorderRef = useRef<VoiceRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  useEffect(() => {
    voiceRecorderRef.current = new VoiceRecorder();
    return () => {
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

  const startListening = async () => {
    if (!voiceRecorderRef.current) {
      toast({
        title: "Error",
        description: "Voice recorder not initialized",
        variant: "destructive"
      });
      return;
    }

    try {
      setState('listening');
      setTranscript('');
      setResponse('');
      await voiceRecorderRef.current.startRecording();
      
      toast({
        title: t('voice.listening') || "Listening...",
        description: t('voice.speakNow') || "Speak now"
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      setState('idle');
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start recording",
        variant: "destructive"
      });
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
        toast({
          title: "No speech detected",
          description: "Please try speaking again",
          variant: "destructive"
        });
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
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process voice",
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
    if (route) {
      setTimeout(() => {
        navigate(route);
      }, 2000); // Navigate after response is spoken
    }
  };

  const speakResponse = async (text: string) => {
    try {
      setState('speaking');
      
      // Get voice for language
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
      toast({
        title: "Error",
        description: "Failed to speak response",
        variant: "destructive"
      });
    }
  };

  const handleToggle = () => {
    if (state === 'idle') {
      startListening();
    } else if (state === 'listening') {
      stopListening();
    } else if (state === 'speaking' && audioRef.current) {
      // Stop current audio
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setState('idle');
    }
  };

  const getButtonText = () => {
    switch (state) {
      case 'listening':
        return t('voice.stopListening') || 'Stop Listening';
      case 'processing':
        return t('voice.processing') || 'Processing...';
      case 'speaking':
        return t('voice.speaking') || 'Speaking...';
      default:
        return t('voice.startListening') || 'Voice Help';
    }
  };

  const getIcon = () => {
    switch (state) {
      case 'listening':
        return <MicOff className="h-5 w-5" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin" />;
      case 'speaking':
        return <Volume2 className="h-5 w-5" />;
      default:
        return <Mic className="h-5 w-5" />;
    }
  };

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
        
        <Button
          onClick={handleToggle}
          size="lg"
          variant={state === 'listening' ? 'destructive' : 'default'}
          className={`rounded-full shadow-lg transition-all duration-200 ${
            state === 'listening' ? 'animate-pulse bg-red-500 hover:bg-red-600' : ''
          } ${
            state === 'speaking' ? 'bg-blue-500 hover:bg-blue-600' : ''
          }`}
          disabled={state === 'processing'}
        >
          {getIcon()}
          <span className="ml-2">{getButtonText()}</span>
        </Button>
      </div>
    </div>
  );
};