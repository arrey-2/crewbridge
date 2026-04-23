'use client';

import { useEffect, useMemo, useState } from 'react';
import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { supabaseClient } from '@/lib/supabase';
import { DEMO_JOBS } from '@/lib/constants';
import { EmptyState } from '@/components/EmptyState';
import { useLanguage } from '@/components/LanguageProvider';

const styles = StyleSheet.create({
  page: { padding: 28, backgroundColor: '#ffffff', color: '#0f172a', fontSize: 10, lineHeight: 1.45 },
  header: { borderBottom: '1 solid #cbd5e1', paddingBottom: 10, marginBottom: 10 },
  brand: { fontSize: 17, fontWeight: 700 },
  subtitle: { color: '#475569', marginTop: 2 },
  section: { marginBottom: 10 },
  summaryGrid: { flexDirection: 'row', gap: 10, marginTop: 8 },
  summaryCard: { border: '1 solid #e2e8f0', padding: 6, borderRadius: 4, flexGrow: 1 },
  row: { marginBottom: 8, padding: 8, border: '1 solid #e2e8f0', borderRadius: 4 },
  rowMeta: { color: '#475569', marginBottom: 3 },
  label: { fontWeight: 700 },
  hazard: { color: '#b45309', fontWeight: 700, marginTop: 4 },
  muted: { color: '#64748b' },
  noteLine: { borderBottom: '1 solid #cbd5e1', marginTop: 8 },
  footer: { marginTop: 14, borderTop: '1 solid #e2e8f0', paddingTop: 8, color: '#64748b', fontSize: 9 }
});

export default function LogsPage() {
  const { t } = useLanguage();
  const [rows, setRows] = useState<any[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const isDemo = document.cookie.includes('cb-demo=1');
    if (isDemo) {
      setRows(DEMO_JOBS.flatMap((job) => job.entries.map((entry, index) => ({ id: `${job.id}-${index}`, job_name: job.name, created_at: new Date().toISOString(), ...entry }))));
      return;
    }
    (async () => {
      const { data: auth } = await supabaseClient.auth.getUser();
      if (!auth.user) return;
      const { data } = await supabaseClient.from('translations').select('*').eq('user_id', auth.user.id).order('created_at', { ascending: false });
      setRows(data ?? []);
    })();
  }, []);

  const filtered = useMemo(() => rows.filter((r) => `${r.job_name} ${new Date(r.created_at).toLocaleDateString()}`.toLowerCase().includes(query.toLowerCase())), [rows, query]);
  const byJob = useMemo(() => filtered.reduce<Record<string, any[]>>((acc, row) => ((acc[row.job_name] = [...(acc[row.job_name] || []), row]), acc), {}), [filtered]);

  function safetyWarningText(entry: any) {
    const spanish = 'Advertencia de Seguridad: Verifique cumplimiento antes de continuar.';
    const english = 'Safety Warning: Verify compliance before proceeding.';
    const isSpanishContext = entry.target_language === 'Spanish' || entry.source_language === 'Spanish';
    return isSpanishContext ? `${spanish} / ${english}` : english;
  }

  async function exportJobPdf(jobName: string) {
    const entries = byJob[jobName] || [];
    const now = new Date();
    const totalSafetyFlags = entries.filter((entry) => entry.safety_flag).length;

    const blob = await pdf(
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.brand}>CrewBridge • Premium Bilingual Operations Report</Text>
            <Text style={styles.subtitle}>Field Communication, Safety, and Accountability Summary / Resumen de comunicación, seguridad y responsabilidad</Text>
          </View>

          <View style={styles.section}>
            <Text>Project: {jobName}</Text>
            <Text>Generated: {now.toLocaleDateString()} {now.toLocaleTimeString()}</Text>
            <Text style={styles.muted}>Document type: Daily communication record + safety review</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}><Text style={styles.label}>Entries</Text><Text>{entries.length}</Text></View>
              <View style={styles.summaryCard}><Text style={styles.label}>Safety alerts</Text><Text>{totalSafetyFlags}</Text></View>
              <View style={styles.summaryCard}><Text style={styles.label}>Languages</Text><Text>English / Spanish</Text></View>
            </View>
          </View>

          <View style={styles.section}>
            {entries.map((e) => (
              <View key={e.id} style={styles.row}>
                <Text style={styles.rowMeta}>{new Date(e.created_at).toLocaleString()} • {e.sender_role}</Text>
                <Text><Text style={styles.label}>Original / Original:</Text> {e.original_text}</Text>
                <Text><Text style={styles.label}>Translated / Traducido:</Text> {e.translated_text}</Text>
                {e.safety_flag ? <Text style={styles.hazard}>{safetyWarningText(e)}</Text> : <Text style={styles.muted}>Safety flag: No / Sin alerta</Text>}
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Supervisor Notes / Notas del supervisor</Text>
            <Text style={styles.noteLine}> </Text>
            <Text style={styles.noteLine}> </Text>
            <Text style={styles.noteLine}> </Text>
          </View>

          <Text>Foreman Signature / Firma del encargado: ____________________</Text>
          <Text style={{ marginTop: 4 }}>Crew Lead Signature / Firma líder de cuadrilla: ____________________</Text>

          <Text style={styles.footer}>Generated by CrewBridge • Bilingual operations platform for construction teams.</Text>
        </Page>
      </Document>
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${jobName.replace(/\s+/g, '_')}_crewbridge_report.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="glass p-5 md:p-6">
        <h1 className="text-2xl font-semibold">{t('logs_title')}</h1>
        <p className="text-slate-400">Search activity and export premium bilingual field reports for clients, compliance, and internal QA.</p>
        <input placeholder="Search by job name or date" value={query} onChange={(e) => setQuery(e.target.value)} className="mt-3 w-full md:w-96" />
      </div>
      {Object.keys(byJob).length === 0 ? <EmptyState message="No translation logs yet. Create your first translation to build your job log." ctaHref="/translate" ctaLabel="Go to Translate" /> : Object.entries(byJob).map(([jobName, entries]) => (
        <section key={jobName} className="glass p-5 md:p-6">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold">{jobName}</h2>
            <button onClick={() => exportJobPdf(jobName)} className="btn-primary px-4 py-2 text-sm">Export Premium PDF</button>
          </div>
          <div className="space-y-3">{entries.map((entry) => <div key={entry.id} className="rounded-xl border border-white/10 bg-slate-900/60 p-4 text-sm"><p className="text-slate-400">{new Date(entry.created_at).toLocaleString()} • {entry.sender_role}</p><p><span className="font-semibold">Original:</span> {entry.original_text}</p><p><span className="font-semibold">Translated:</span> {entry.translated_text}</p>{entry.safety_flag && <p className="mt-1 text-amber-400">FLAG: This instruction may involve a safety hazard. Verify compliance before proceeding.</p>}</div>)}</div>
        </section>
      ))}
    </div>
  );
}
