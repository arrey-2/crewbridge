'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Lang = 'en' | 'es';

type Dict = Record<string, { en: string; es: string }>;

const dictionary: Dict = {
  nav_dashboard: { en: 'Dashboard', es: 'Panel' },
  nav_translate: { en: 'New Translation', es: 'Nueva traducción' },
  nav_logs: { en: 'Job Logs', es: 'Bitácoras' },
  nav_account: { en: 'Account', es: 'Cuenta' },
  nav_templates: { en: 'Templates', es: 'Plantillas' },
  nav_login: { en: 'Log In', es: 'Entrar' },
  nav_signup: { en: 'Get Started', es: 'Empezar' },
  nav_logout: { en: 'Logout', es: 'Salir' },


  auth_email: { en: 'Email', es: 'Correo' },
  auth_password: { en: 'Password', es: 'Contraseña' },
  auth_full_name: { en: 'Full Name', es: 'Nombre completo' },
  auth_confirm_password: { en: 'Confirm Password', es: 'Confirmar contraseña' },
  auth_create_account: { en: 'Create Account', es: 'Crear cuenta' },
  auth_have_account: { en: 'Have an account?', es: '¿Ya tienes cuenta?' },
  auth_no_account: { en: 'No account?', es: '¿No tienes cuenta?' },
  auth_create_one: { en: 'Create one', es: 'Crear cuenta' },
  auth_creating: { en: 'Creating Account...', es: 'Creando cuenta...' },

  dashboard_good_morning: { en: 'Good morning', es: 'Buen día' },
  dash_translations_today: { en: 'Translations today', es: 'Traducciones hoy' },
  dash_active_jobs: { en: 'Active jobs', es: 'Obras activas' },
  dash_pending: { en: 'Pending confirmations', es: 'Confirmaciones pendientes' },
  dash_alerts: { en: 'Safety alerts', es: 'Alertas de seguridad' },
  dash_remaining: { en: 'Remaining today', es: 'Disponibles hoy' },
  dash_open_templates: { en: 'Open Templates', es: 'Abrir plantillas' },
  dash_recent_activity: { en: 'Recent activity', es: 'Actividad reciente' },
  dash_ops_tools: { en: 'Operations tools', es: 'Herramientas operativas' },

  translate_remaining: { en: 'Translations remaining today', es: 'Traducciones disponibles hoy' },
  translate_voice: { en: 'Voice Input', es: 'Entrada por voz' },
  translate_button: { en: 'Translate', es: 'Traducir' },
  translate_original: { en: 'Original', es: 'Original' },
  translate_translated: { en: 'Translated', es: 'Traducido' },
  translate_warning: { en: 'FLAG: This instruction may involve a safety hazard. Verify compliance before proceeding.', es: 'ALERTA: Esta instrucción puede implicar riesgo de seguridad. Verifique cumplimiento antes de continuar.' },
  translate_workflow_helpers: { en: 'Workflow helpers', es: 'Ayudas de flujo' },
  translate_helper_text: { en: 'Use Daily Brief and Safety templates to generate bilingual field communication faster.', es: 'Use plantillas de brief diario y seguridad para generar comunicación bilingüe más rápido.' },
  hero_badge: { en: 'Built for Bilingual Field Operations', es: 'Diseñado para operaciones bilingües en campo' },
  hero_title_a: { en: 'Stop costly miscommunication.', es: 'Evita malentendidos que cuestan caro.' },
  hero_title_b: { en: 'Run every job in two languages.', es: 'Coordina cada obra en dos idiomas.' },
  hero_sub: {
    en: 'CrewBridge combines translation, safety communication, confirmations, templates, and reports so every crew member gets clear instructions the first time.',
    es: 'CrewBridge junta traducción, comunicación de seguridad, confirmaciones, plantillas y reportes para que toda la cuadrilla reciba instrucciones claras desde la primera vez.'
  },
  cta_primary: { en: 'Start Translating', es: 'Empezar a traducir' },
  cta_secondary: { en: 'Try Demo', es: 'Probar demo' },

  home_translate_title: { en: 'Translate', es: 'Traducir' },
  home_translate_desc: { en: 'Owner ↔ worker communication with trade-specific jobsite phrasing.', es: 'Comunicación dueño ↔ trabajador con lenguaje real de obra por oficio.' },
  home_coord_title: { en: 'Coordinate', es: 'Coordinar' },
  home_coord_desc: { en: 'Daily briefs, toolbox talks, and task confirmations in one workflow.', es: 'Brief diario, charla de seguridad y confirmaciones en un mismo flujo.' },
  home_doc_title: { en: 'Document', es: 'Documentar' },
  home_doc_desc: { en: 'Searchable logs and polished bilingual reports for clients and compliance.', es: 'Bitácoras buscables y reportes bilingües listos para cliente y cumplimiento.' },

  home_preview_label: { en: 'Operations Preview', es: 'Vista previa operativa' },
  home_preview_title: { en: 'Everything your foreman needs each morning', es: 'Todo lo que necesita el encargado cada mañana' },
  home_preview_1: { en: 'Daily Brief Generator', es: 'Generador de brief diario' },
  home_preview_2: { en: 'Toolbox Safety Briefs', es: 'Charlas de seguridad tipo toolbox' },
  home_preview_3: { en: 'Crew Confirmations & Clarifications', es: 'Confirmaciones y aclaraciones de cuadrilla' },
  home_preview_4: { en: 'Job Logs + Professional Reports', es: 'Bitácoras de obra + reportes profesionales' },
  home_live_label: { en: 'Live Ops Panel', es: 'Panel operativo en vivo' },
  home_live_owner: { en: 'Owner: Check trench depth before laying pipe.', es: 'Encargado: Revisen la profundidad de la zanja antes de tender la tubería.' },
  home_live_worker: { en: 'Crew: Got it, we’ll verify depth and slope before we set pipe.', es: 'Cuadrilla: Va, verificamos profundidad y pendiente antes de meter tubería.' },
  home_live_safety: { en: '⚠️ Safety flag: Verify controls before starting excavation work.', es: '⚠️ Alerta de seguridad: Verifiquen controles antes de empezar excavación.' },
  home_live_confirm: { en: 'Crew confirmation: Understood', es: 'Confirmación de cuadrilla: Entendido' },
  home_supporting_copy: {
    en: 'Stop paying for rework, delays, and compliance risk caused by language gaps. Run communication, documentation, and safety in one system.',
    es: 'Evita costos por retrabajo, atrasos y riesgos de cumplimiento causados por barreras de idioma. Coordina comunicación, documentación y seguridad en un solo sistema.'
  },
  home_stats_title: { en: 'Why this problem matters', es: 'Por qué este problema importa' },
  home_stat_1_title: { en: 'Workforce reality', es: 'Realidad laboral' },
  home_stat_1_desc: { en: 'Nearly one-third of U.S. construction workers are Hispanic, so bilingual communication is operationally critical.', es: 'Casi un tercio de la fuerza laboral de construcción en EE.UU. es hispana, por eso la comunicación bilingüe es crítica para operar bien.' },
  home_stat_2_title: { en: 'Cost of miscommunication', es: 'Costo de la mala comunicación' },
  home_stat_2_desc: { en: 'Misunderstood instructions can drive schedule delays, rework, and avoidable budget pressure.', es: 'Instrucciones mal entendidas pueden causar atrasos, retrabajo y presión innecesaria en el presupuesto.' },
  home_stat_3_title: { en: 'Safety understanding', es: 'Comprensión de seguridad' },
  home_stat_3_desc: { en: 'Safety training only works when workers clearly understand hazards, controls, and responsibilities.', es: 'La capacitación de seguridad solo funciona cuando la cuadrilla entiende claramente riesgos, controles y responsabilidades.' },
  home_stat_4_title: { en: 'SMB accessibility', es: 'Acceso para contratistas' },
  home_stat_4_desc: { en: 'Small and mid-sized contractors need practical bilingual tools they can deploy without enterprise overhead.', es: 'Los contratistas pequeños y medianos necesitan herramientas bilingües prácticas, sin complejidad de software empresarial.' },
  home_platform_label: { en: 'Platform Depth', es: 'Profundidad de la plataforma' },
  home_platform_title: { en: 'Built for field operations, not one-off translation.', es: 'Creado para operaciones de obra, no para traducciones aisladas.' },
  home_platform_desc: { en: 'From first instruction to signed report, CrewBridge keeps bilingual communication tied to safety, accountability, and schedule execution.', es: 'Desde la primera instrucción hasta el reporte firmado, CrewBridge conecta la comunicación bilingüe con seguridad, responsabilidad y cumplimiento del programa.' },
  home_module_daily_title: { en: 'Daily Briefs', es: 'Briefs diarios' },
  home_module_daily_desc: { en: 'Create a bilingual plan every morning with task sequencing, crew ownership, and required tools.', es: 'Crea un plan bilingüe cada mañana con secuencia de tareas, responsables y herramientas necesarias.' },
  home_module_safety_title: { en: 'Safety Talks', es: 'Charlas de seguridad' },
  home_module_safety_desc: { en: 'Run toolbox talks in both languages with clear hazard controls and signed acknowledgment.', es: 'Realiza charlas tipo toolbox en ambos idiomas con controles claros y acuse firmado.' },
  home_module_logs_title: { en: 'Crew Logs', es: 'Bitácoras de cuadrilla' },
  home_module_logs_desc: { en: 'Capture who said what, when, and where for every critical instruction and confirmation.', es: 'Registra quién dijo qué, cuándo y dónde para cada instrucción y confirmación crítica.' },
  home_module_reports_title: { en: 'Reports', es: 'Reportes' },
  home_module_reports_desc: { en: 'Export polished bilingual PDFs for owners, inspectors, and general contractor documentation.', es: 'Exporta PDFs bilingües profesionales para clientes, inspectores y documentación del contratista general.' },
  home_module_templates_title: { en: 'Templates', es: 'Plantillas' },
  home_module_templates_desc: { en: 'Standardize repeat workflows across trades so every superintendent starts from proven language.', es: 'Estandariza flujos repetitivos por oficio para que cada residente arranque con lenguaje probado.' },
  home_roi_snapshot: { en: 'ROI snapshot: one avoided rework day can cover a month of CrewBridge.', es: 'Vista rápida de ROI: evitar un día de retrabajo puede pagar un mes de CrewBridge.' },
  home_value_chip_1: { en: 'Save supervisor time every shift', es: 'Ahorra tiempo del supervisor en cada turno' },
  home_value_chip_2: { en: 'Reduce rework and missed instructions', es: 'Reduce retrabajo e instrucciones perdidas' },
  home_value_chip_3: { en: 'Improve safety communication quality', es: 'Mejora la calidad de comunicación de seguridad' },
  home_value_chip_4: { en: 'Create daily documentation trails', es: 'Crea evidencia diaria de comunicación' },

  login_title: { en: 'Welcome back', es: 'Bienvenido de nuevo' },
  signup_title: { en: 'Create your CrewBridge account', es: 'Crea tu cuenta de CrewBridge' },
  dashboard_title: { en: 'Operations Dashboard', es: 'Panel de operaciones' },
  templates_title: { en: 'Template Operations', es: 'Plantillas operativas' },
  translate_title: { en: 'Two-way jobsite translation', es: 'Traducción bidireccional de obra' },
  logs_title: { en: 'Job communication logs', es: 'Bitácoras de comunicación' },
  account_title: { en: 'Account & usage', es: 'Cuenta y uso' },
  footer_tag: { en: 'Bridge the language gap on your job site.', es: 'Cierra la brecha de idioma en tu obra.' },

  translate_role_owner: { en: 'Supervisor', es: 'Supervisor' },
  translate_role_worker: { en: 'Crew Lead', es: 'Líder de cuadrilla' },
  translate_project_name: { en: 'Project name', es: 'Nombre del proyecto' },
  translate_instruction_placeholder: { en: 'Enter field instruction', es: 'Escribe la instrucción de campo' },
  translate_input_label: { en: 'Input', es: 'Entrada' },
  translate_characters_remaining: { en: 'characters remaining', es: 'caracteres disponibles' },
  translate_error_generic: { en: 'Translation unavailable. Please try again.', es: 'La traducción no está disponible. Inténtalo de nuevo.' },
  translate_loading: { en: 'Translating for field delivery…', es: 'Traduciendo para entrega en campo…' },
  translate_confirmation_title: { en: 'Crew confirmation', es: 'Confirmación de cuadrilla' },
  translate_confirmation_ok: { en: 'Understood', es: 'Entendido' },
  translate_confirmation_clarify: { en: 'Need clarification', es: 'Necesito aclaración' },
  translate_confirmation_safety: { en: 'Safety issue', es: 'Tema de seguridad' },
  translate_empty_original: { en: 'Enter an instruction to translate.', es: 'Escribe una instrucción para traducir.' },
  translate_empty_result: { en: 'Your translation will appear here.', es: 'Aquí aparecerá la traducción.' },
  translate_template_daily: { en: 'Daily Brief', es: 'Brief diario' },
  translate_template_safety: { en: 'Safety Warning', es: 'Alerta de seguridad' },
  translate_template_task: { en: 'Task Assignment', es: 'Asignación de tarea' },
  translate_demo_badge: { en: 'Demo Mode – Real Translation (Limited Access)', es: 'Modo demo – Traducción real (acceso limitado)' }
};

type Ctx = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: keyof typeof dictionary) => string;
};

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    const saved = localStorage.getItem('cb-lang');
    if (saved === 'en' || saved === 'es') setLang(saved);
  }, []);

  function update(next: Lang) {
    setLang(next);
    localStorage.setItem('cb-lang', next);
  }

  const value = useMemo(
    () => ({
      lang,
      setLang: update,
      t: (key: keyof typeof dictionary) => dictionary[key][lang]
    }),
    [lang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
