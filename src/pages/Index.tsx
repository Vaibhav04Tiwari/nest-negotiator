import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, Map, Users2, MessageSquareMore } from "lucide-react";
import { Link } from "react-router-dom";
import { useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { VoiceAssistant } from "@/components/VoiceAssistant";

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  
  const onMouseMove = (e: React.MouseEvent) => {
    const el = heroRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--x", `${x}%`);
    el.style.setProperty("--y", `${y}%`);
  };

  return (
    <div>
      <Helmet>
        <title>BuildMate: Construction Budget & Labour Marketplace</title>
        <meta name="description" content="Plan your house construction: budget calculator, material prices, map planning and hire labour with in-site chat." />
        <link rel="canonical" href={window.location.origin + "/"} />
      </Helmet>

      <section ref={heroRef} onMouseMove={onMouseMove} className="relative overflow-hidden">
        <div className="absolute inset-0 hero-glow" />
        <div className="container mx-auto py-20 md:py-28 relative">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-muted px-3 py-1 text-xs font-medium text-foreground">
              <Users2 className="h-4 w-4" /> {t("home.tagline")}
            </span>
            <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight">
              {t("home.hero.title")}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {t("home.hero.subtitle")}
            </p>
            <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
              <Button asChild variant="hero" className="group">
                <Link to="/calculator">
                  <Calculator className="mr-2 transition-transform group-hover:scale-110" /> {t("home.calculateBudget")}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/marketplace">
                  <Users2 className="mr-2" /> {t("home.findLabour")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto py-12 md:py-16">
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <Calculator className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-semibold">{t("home.smartCalculator")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t("home.smartCalculatorDesc")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Map className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-semibold">{t("home.mapPlanning")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t("home.mapPlanningDesc")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <MessageSquareMore className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-semibold">{t("home.connectBargain")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t("home.connectBargainDesc")}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bg-brand-muted py-12 md:py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">{t("home.joinToday")}</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t("home.joinDesc")}
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button asChild size="lg">
              <Link to="/auth">
                {t("home.signUpCustomer")}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/labour-registration">
                {t("home.registerLabour")}
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Voice Assistant for Labour Accessibility */}
      <VoiceAssistant context="navigation" />
    </div>
  );
};

export default Index;
