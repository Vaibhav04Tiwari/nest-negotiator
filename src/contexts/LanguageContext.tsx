import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'es' | 'fr' | 'hi' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Header
    'header.budgetCalculator': 'Budget Calculator',
    'header.materials': 'Materials',
    'header.mapPlanning': 'Map Planning',
    'header.findLabour': 'Find Labour',
    'header.account': 'Account',
    'header.registerAsLabour': 'Register as Labour',
    'header.signOut': 'Sign Out',
    'header.getStarted': 'Get Started',
    'header.language': 'Language',
    
    // Homepage
    'home.tagline': 'One platform for customers and labour',
    'home.hero.title': 'Plan, budget, and build your dream home with confidence',
    'home.hero.subtitle': 'Get instant budget estimates, live material costing, professional map planning, and connect with skilled labour nearby.',
    'home.calculateBudget': 'Calculate Budget',
    'home.findLabour': 'Find Labour',
    'home.smartCalculator': 'Smart Budget Calculator',
    'home.smartCalculatorDesc': 'Estimate construction cost by area, quality and city factors with a detailed breakdown.',
    'home.mapPlanning': 'Map Planning Service',
    'home.mapPlanningDesc': 'Request professional house plan layouts tailored to your plot and lifestyle.',
    'home.connectBargain': 'Connect & Bargain',
    'home.connectBargainDesc': 'Chat with labour directly to discuss scope and negotiate fair rates.',
    'home.joinToday': 'Join BuildMate Today',
    'home.joinDesc': 'Whether you are planning construction or offering skilled labour services, BuildMate connects you with the right opportunities.',
    'home.signUpCustomer': 'Sign Up as Customer',
    'home.registerLabour': 'Register as Labour',

    // Auth
    'auth.welcome': 'Welcome to BuildMate',
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.fullName': 'Full Name',
    'auth.alreadyAccount': 'Already have an account?',
    'auth.needAccount': 'Need an account?',
  },
  es: {
    // Header
    'header.budgetCalculator': 'Calculadora de Presupuesto',
    'header.materials': 'Materiales',
    'header.mapPlanning': 'Planificación de Mapas',
    'header.findLabour': 'Encontrar Trabajadores',
    'header.account': 'Cuenta',
    'header.registerAsLabour': 'Registrarse como Trabajador',
    'header.signOut': 'Cerrar Sesión',
    'header.getStarted': 'Comenzar',
    'header.language': 'Idioma',
    
    // Homepage
    'home.tagline': 'Una plataforma para clientes y trabajadores',
    'home.hero.title': 'Planifica, presupuesta y construye la casa de tus sueños con confianza',
    'home.hero.subtitle': 'Obtén estimaciones instantáneas de presupuesto, costos de materiales en tiempo real, planificación profesional de mapas y conéctate con trabajadores calificados cercanos.',
    'home.calculateBudget': 'Calcular Presupuesto',
    'home.findLabour': 'Encontrar Trabajadores',
    'home.smartCalculator': 'Calculadora Inteligente de Presupuesto',
    'home.smartCalculatorDesc': 'Estima el costo de construcción por área, calidad y factores de la ciudad con un desglose detallado.',
    'home.mapPlanning': 'Servicio de Planificación de Mapas',
    'home.mapPlanningDesc': 'Solicita diseños profesionales de planos de casas adaptados a tu terreno y estilo de vida.',
    'home.connectBargain': 'Conectar y Negociar',
    'home.connectBargainDesc': 'Chatea directamente con trabajadores para discutir el alcance y negociar tarifas justas.',
    'home.joinToday': 'Únete a BuildMate Hoy',
    'home.joinDesc': 'Ya sea que estés planificando construcción u ofreciendo servicios de trabajo calificado, BuildMate te conecta con las oportunidades correctas.',
    'home.signUpCustomer': 'Registrarse como Cliente',
    'home.registerLabour': 'Registrarse como Trabajador',

    // Auth
    'auth.welcome': 'Bienvenido a BuildMate',
    'auth.signIn': 'Iniciar Sesión',
    'auth.signUp': 'Registrarse',
    'auth.email': 'Correo Electrónico',
    'auth.password': 'Contraseña',
    'auth.fullName': 'Nombre Completo',
    'auth.alreadyAccount': '¿Ya tienes una cuenta?',
    'auth.needAccount': '¿Necesitas una cuenta?',
  },
  hi: {
    // Header
    'header.budgetCalculator': 'बजट कैलकुलेटर',
    'header.materials': 'सामग्री',
    'header.mapPlanning': 'मानचित्र योजना',
    'header.findLabour': 'मजदूर खोजें',
    'header.account': 'खाता',
    'header.registerAsLabour': 'मजदूर के रूप में पंजीकरण',
    'header.signOut': 'साइन आउट',
    'header.getStarted': 'शुरू करें',
    'header.language': 'भाषा',
    
    // Homepage
    'home.tagline': 'ग्राहकों और मजदूरों के लिए एक मंच',
    'home.hero.title': 'आत्मविश्वास के साथ अपने सपनों का घर योजना, बजट और निर्माण करें',
    'home.hero.subtitle': 'तत्काल बजट अनुमान, लाइव सामग्री लागत, पेशेवर मानचित्र योजना प्राप्त करें और आस-पास के कुशल मजदूरों से जुड़ें।',
    'home.calculateBudget': 'बजट की गणना करें',
    'home.findLabour': 'मजदूर खोजें',
    'home.smartCalculator': 'स्मार्ट बजट कैलकुलेटर',
    'home.smartCalculatorDesc': 'क्षेत्र, गुणवत्ता और शहर के कारकों के साथ विस्तृत विवरण के साथ निर्माण लागत का अनुमान लगाएं।',
    'home.mapPlanning': 'मानचित्र योजना सेवा',
    'home.mapPlanningDesc': 'अपने भूखंड और जीवन शैली के अनुकूल पेशेवर घर की योजना लेआउट का अनुरोध करें।',
    'home.connectBargain': 'कनेक्ट और सौदेबाजी',
    'home.connectBargainDesc': 'कार्यक्षेत्र पर चर्चा करने और उचित दरों पर बातचीत करने के लिए सीधे मजदूरों से चैट करें।',
    'home.joinToday': 'आज ही BuildMate में शामिल हों',
    'home.joinDesc': 'चाहे आप निर्माण की योजना बना रहे हों या कुशल श्रम सेवाएं प्रदान कर रहे हों, BuildMate आपको सही अवसरों से जोड़ता है।',
    'home.signUpCustomer': 'ग्राहक के रूप में साइन अप करें',
    'home.registerLabour': 'मजदूर के रूप में पंजीकरण करें',

    // Auth
    'auth.welcome': 'BuildMate में आपका स्वागत है',
    'auth.signIn': 'साइन इन करें',
    'auth.signUp': 'साइन अप करें',
    'auth.email': 'ईमेल',
    'auth.password': 'पासवर्ड',
    'auth.fullName': 'पूरा नाम',
    'auth.alreadyAccount': 'पहले से खाता है?',
    'auth.needAccount': 'खाता चाहिए?',
  },
  ar: {
    // Header
    'header.budgetCalculator': 'حاسبة الميزانية',
    'header.materials': 'المواد',
    'header.mapPlanning': 'تخطيط الخريطة',
    'header.findLabour': 'العثور على العمالة',
    'header.account': 'الحساب',
    'header.registerAsLabour': 'التسجيل كعامل',
    'header.signOut': 'تسجيل الخروج',
    'header.getStarted': 'ابدأ',
    'header.language': 'اللغة',
    
    // Homepage
    'home.tagline': 'منصة واحدة للعملاء والعمالة',
    'home.hero.title': 'خطط وضع الميزانية وابني منزل أحلامك بثقة',
    'home.hero.subtitle': 'احصل على تقديرات فورية للميزانية، وتكاليف المواد المباشرة، والتخطيط المهني للخرائط، وتواصل مع العمالة المهرة القريبة.',
    'home.calculateBudget': 'حساب الميزانية',
    'home.findLabour': 'العثور على العمالة',
    'home.smartCalculator': 'حاسبة الميزانية الذكية',
    'home.smartCalculatorDesc': 'تقدير تكلفة البناء حسب المنطقة والجودة وعوامل المدينة مع تفصيل مفصل.',
    'home.mapPlanning': 'خدمة تخطيط الخريطة',
    'home.mapPlanningDesc': 'اطلب تخطيطات مهنية لخطط المنزل مصممة خصيصاً لقطعة الأرض ونمط حياتك.',
    'home.connectBargain': 'التواصل والمساومة',
    'home.connectBargainDesc': 'تحدث مع العمالة مباشرة لمناقشة النطاق والتفاوض على أسعار عادلة.',
    'home.joinToday': 'انضم إلى BuildMate اليوم',
    'home.joinDesc': 'سواء كنت تخطط للبناء أو تقدم خدمات عمالة ماهرة، BuildMate يربطك بالفرص المناسبة.',
    'home.signUpCustomer': 'التسجيل كعميل',
    'home.registerLabour': 'التسجيل كعامل',

    // Auth
    'auth.welcome': 'مرحباً بك في BuildMate',
    'auth.signIn': 'تسجيل الدخول',
    'auth.signUp': 'التسجيل',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.fullName': 'الاسم الكامل',
    'auth.alreadyAccount': 'هل لديك حساب؟',
    'auth.needAccount': 'تحتاج إلى حساب؟',
  },
  fr: {
    // Header
    'header.budgetCalculator': 'Calculateur de Budget',
    'header.materials': 'Matériaux',
    'header.mapPlanning': 'Planification de Carte',
    'header.findLabour': 'Trouver de la Main-d\'œuvre',
    'header.account': 'Compte',
    'header.registerAsLabour': 'S\'inscrire comme Ouvrier',
    'header.signOut': 'Se Déconnecter',
    'header.getStarted': 'Commencer',
    'header.language': 'Langue',
    
    // Homepage
    'home.tagline': 'Une plateforme pour les clients et la main-d\'œuvre',
    'home.hero.title': 'Planifiez, budgétez et construisez la maison de vos rêves en toute confiance',
    'home.hero.subtitle': 'Obtenez des estimations de budget instantanées, des coûts de matériaux en direct, une planification de carte professionnelle et connectez-vous avec de la main-d\'œuvre qualifiée à proximité.',
    'home.calculateBudget': 'Calculer le Budget',
    'home.findLabour': 'Trouver de la Main-d\'œuvre',
    'home.smartCalculator': 'Calculateur de Budget Intelligent',
    'home.smartCalculatorDesc': 'Estimez le coût de construction par zone, qualité et facteurs de ville avec une répartition détaillée.',
    'home.mapPlanning': 'Service de Planification de Carte',
    'home.mapPlanningDesc': 'Demandez des mises en page de plans de maison professionnels adaptés à votre terrain et style de vie.',
    'home.connectBargain': 'Connecter et Négocier',
    'home.connectBargainDesc': 'Chattez directement avec la main-d\'œuvre pour discuter de la portée et négocier des tarifs équitables.',
    'home.joinToday': 'Rejoignez BuildMate Aujourd\'hui',
    'home.joinDesc': 'Que vous planifiiez une construction ou offriez des services de main-d\'œuvre qualifiée, BuildMate vous connecte aux bonnes opportunités.',
    'home.signUpCustomer': 'S\'inscrire comme Client',
    'home.registerLabour': 'S\'inscrire comme Ouvrier',

    // Auth
    'auth.welcome': 'Bienvenue sur BuildMate',
    'auth.signIn': 'Se Connecter',
    'auth.signUp': 'S\'inscrire',
    'auth.email': 'Email',
    'auth.password': 'Mot de Passe',
    'auth.fullName': 'Nom Complet',
    'auth.alreadyAccount': 'Vous avez déjà un compte ?',
    'auth.needAccount': 'Besoin d\'un compte ?',
  },
};

const LanguageContext = createContext<LanguageContextType>({} as LanguageContextType);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};