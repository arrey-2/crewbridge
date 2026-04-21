'use client';

import { useMemo, useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';

const templates = [
  { id: 'daily', name: 'Daily Job Brief', fields: ['Tasks today', 'Crew assignments', 'Materials', 'Safety reminders'] },
  { id: 'toolbox', name: 'Toolbox Talk', fields: ['Topic', 'Hazards', 'PPE', 'Sign-off area'] },
  { id: 'incident', name: 'Incident Report', fields: ['What happened', 'Who involved', 'Date/Time', 'Corrective action'] },
  { id: 'workorder', name: 'Work Order', fields: ['Task', 'Location', 'Priority', 'Assigned crew'] },
  { id: 'punch', name: 'Punch List', fields: ['Issue', 'Room/Location', 'Responsible trade', 'Status'] },
  { id: 'material', name: 'Material Request', fields: ['Item', 'Quantity', 'Urgency', 'Requester'] }
];

function toSpanishLabel(label: string) {
  const map: Record<string, string> = {
    'Tasks today': 'Tareas de hoy',
    'Crew assignments': 'Asignación de cuadrilla',
    Materials: 'Materiales',
    'Safety reminders': 'Recordatorios de seguridad',
    Topic: 'Tema',
    Hazards: 'Riesgos',
    PPE: 'EPP',
    'Sign-off area': 'Área de firmas',
    'What happened': 'Qué pasó',
    'Who involved': 'Quién participó',
    'Date/Time': 'Fecha/Hora',
    'Corrective action': 'Acción correctiva',
    Task: 'Tarea',
    Location: 'Ubicación',
    Priority: 'Prioridad',
    'Assigned crew': 'Cuadrilla asignada',
    Issue: 'Detalle',
    'Room/Location': 'Cuarto/Ubicación',
    'Responsible trade': 'Oficio responsable',
    Status: 'Estatus',
    Item: 'Material',
    Quantity: 'Cantidad',
    Urgency: 'Urgencia',
    Requester: 'Solicitante'
  };
  return map[label] || label;
}

export default function TemplatesPage() {
  const { lang } = useLanguage();
  const [selected, setSelected] = useState(templates[0]);
  const [values, setValues] = useState<Record<string, string>>({});

  const bilingual = useMemo(() => {
    return selected.fields.map((field) => ({
      field,
      en: values[field] || '—',
      es: values[field] || '—'
    }));
  }, [selected, values]);

  return (
    <div className="space-y-5">
      <div className="glass p-6">
        <h1 className="text-3xl font-semibold">Document Templates</h1>
        <p className="text-slate-300">Generate bilingual field documents in one click, then edit before export.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <aside className="glass p-4">
          <p className="mb-3 text-sm uppercase tracking-widest text-slate-400">Template Library</p>
          <div className="space-y-2">
            {templates.map((t) => (
              <button key={t.id} onClick={() => { setSelected(t); setValues({}); }} className={`w-full rounded-xl px-3 py-2 text-left ${selected.id === t.id ? 'bg-violet-500/30 border border-violet-300/40' : 'border border-white/10 hover:bg-white/5'}`}>
                {t.name}
              </button>
            ))}
          </div>
        </aside>

        <section className="glass p-5 lg:col-span-2">
          <h2 className="text-xl font-semibold">{selected.name}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {selected.fields.map((field) => (
              <label key={field} className="text-sm text-slate-300">
                {lang === 'es' ? toSpanishLabel(field) : field}
                <input className="mt-1 w-full" value={values[field] || ''} onChange={(e) => setValues((prev) => ({ ...prev, [field]: e.target.value }))} />
              </label>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <h3 className="font-semibold">Bilingual Preview</h3>
            <div className="mt-2 space-y-1 text-sm">
              {bilingual.map((line) => (
                <p key={line.field}><span className="text-slate-400">{line.field} / {toSpanishLabel(line.field)}:</span> {line.en} / {line.es}</p>
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-400">Signatures: _____________________ (Foreman)  _____________________ (Crew Lead)</p>
          </div>
        </section>
      </div>
    </div>
  );
}
