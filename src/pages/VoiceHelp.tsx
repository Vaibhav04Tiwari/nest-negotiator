import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Navigation, UserPlus, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { VoiceAssistant } from "@/components/VoiceAssistant";

const VoiceHelp = () => {
  const { t } = useLanguage();
  
  const features = [
    {
      icon: <Navigation className="h-8 w-8 text-primary" />,
      title: "Voice Navigation",
      description: "Navigate the app by saying commands like 'go to calculator', 'show marketplace', or 'take me home'",
      examples: ["Go to budget calculator", "Show me materials", "Take me to marketplace"]
    },
    {
      icon: <UserPlus className="h-8 w-8 text-primary" />,
      title: "Registration Help", 
      description: "Get step-by-step voice guidance for labour registration process",
      examples: ["Help me register", "What information do I need?", "Guide me through registration"]
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      title: "Question & Answer",
      description: "Ask questions about BuildMate features, pricing, or how to use the app",
      examples: ["What is BuildMate?", "How do I find work?", "What are the costs?"]
    }
  ];

  return (
    <div className="container mx-auto py-10">
      <Helmet>
        <title>Voice Help - BuildMate</title>
        <meta name="description" content="Learn how to use BuildMate's voice features to navigate and register easily without typing." />
      </Helmet>

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Voice Assistant Help</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Use your voice to explore BuildMate! Perfect for those who prefer speaking over typing.
          The voice assistant works in multiple languages including Hindi, English, Spanish, French, and Arabic.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3 mb-8">
        {features.map((feature, index) => (
          <Card key={index} className="h-full">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-3 p-3 rounded-full bg-primary/10 w-fit">
                {feature.icon}
              </div>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{feature.description}</p>
              <div>
                <h4 className="font-medium mb-2">Example Commands:</h4>
                <ul className="space-y-1">
                  {feature.examples.map((example, exIndex) => (
                    <li key={exIndex} className="text-sm text-muted-foreground flex items-center gap-2">
                      <Mic className="h-3 w-3" />
                      "{example}"
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            How to Use Voice Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Getting Started:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Look for the "Voice Help" button in the bottom-right corner of any page</li>
                <li>Click it to start listening</li>
                <li>Speak clearly in your preferred language</li>
                <li>Wait for the assistant to respond</li>
                <li>Follow the voice instructions or navigation</li>
              </ol>
            </div>
            <div>
              <h3 className="font-medium mb-2">Language Support:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>🇺🇸 English - "Take me to calculator"</li>
                <li>🇮🇳 हिन्दी - "मुझे कैलकुलेटर पर ले चलो"</li>
                <li>🇪🇸 Español - "Llévame a la calculadora"</li>
                <li>🇫🇷 Français - "Emmène-moi au calculateur"</li>
                <li>🇸🇦 العربية - "خذني إلى الحاسبة"</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <h3 className="text-xl font-semibold mb-4">Ready to Try?</h3>
        <p className="text-muted-foreground mb-6">
          Start by clicking the voice button below or navigate to any page and look for the voice help button!
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Button asChild>
            <Link to="/">Go to Homepage</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/marketplace">Browse Labour</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/labour-registration">Register as Labour</Link>
          </Button>
        </div>
      </div>

      <VoiceAssistant context="general" />
    </div>
  );
};

export default VoiceHelp;