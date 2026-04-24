'use client';

import { useEffect, useMemo, useState } from 'react';
import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { supabaseClient } from '@/lib/supabase';
import { DEMO_JOBS } from '@/lib/constants';
import { EmptyState } from '@/components/EmptyState';
import { useLanguage } from '@/components/LanguageProvider';

const styles = StyleSheet.create({
  page: { paddingTop: 34, paddingHorizontal: 34, paddingBottom: 30, backgroundColor: '#ffffff', color: '#0f172a', fontSize: 9.7, lineHeight: 1.4 },
  header: { marginBottom: 14 },
  brand: { fontSize: 21, fontWeight: 800, letterSpacing: 0.1, marginBottom: 7 },
  subtitle: { color: '#64748b', fontSize: 9.5, lineHeight: 1.35, marginBottom: 12 },
  divider: { borderBottom: '1 solid #dbe4ef', marginBottom: 14 },
  metaSection: { marginBottom: 12 },
  metaLine: { marginBottom: 4, fontSize: 10.2 },
  section: { marginBottom: 10 },
  summaryGrid: { flexDirection: 'row', gap: 8, marginTop: 9 },
  summaryCard: { border: '1 solid #e2e8f0', paddingVertical: 7, paddingHorizontal: 8, borderRadius: 5, flexGrow: 1 },
  summaryValue: { fontSize: 11, fontWeight: 700, marginTop: 2 },
  row: { marginBottom: 7, padding: 7, border: '1 solid #e2e8f0', borderRadius: 5 },
  rowMeta: { color: '#475569', marginBottom: 4, fontSize: 9.3 },
  rowText: { marginBottom: 3 },
  label: { fontWeight: 700 },
  hazard: { color: '#b45309', fontWeight: 700, marginTop: 4, fontSize: 9.4 },
  muted: { color: '#64748b', fontSize: 9.2 },
  noteTitle: { fontWeight: 700, marginBottom: 3 },
  noteLine: { borderBottom: '1 solid #cbd5e1', marginTop: 7 },
  signatureLine: { marginTop: 4, fontSize: 9.5 },
  footer: { marginTop: 12, borderTop: '1 solid #e2e8f0', paddingTop: 7, color: '#64748b', fontSize: 8.8 }
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
            <View style={styles.divider} />
          </View>

          <View style={styles.metaSection}>
            <Text style={styles.metaLine}>Project: {jobName}</Text>
            <Text style={styles.metaLine}>Generated: {now.toLocaleDateString()} {now.toLocaleTimeString()}</Text>
            <Text style={styles.muted}>Document type: Daily communication record + safety review</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}><Text style={styles.label}>Entries</Text><Text style={styles.summaryValue}>{entries.length}</Text></View>
              <View style={styles.summaryCard}><Text style={styles.label}>Safety alerts</Text><Text style={styles.summaryValue}>{totalSafetyFlags}</Text></View>
              <View style={styles.summaryCard}><Text style={styles.label}>Languages</Text><Text style={styles.summaryValue}>English / Spanish</Text></View>
            </View>
          </View>

          <View style={styles.section}>
            {entries.map((e) => (
              <View key={e.id} style={styles.row}>
                <Text style={styles.rowMeta}>{new Date(e.created_at).toLocaleString()} • {e.sender_role}</Text>
                <Text style={styles.rowText}><Text style={styles.label}>Original / Original:</Text> {e.original_text}</Text>
                <Text style={styles.rowText}><Text style={styles.label}>Translated / Traducido:</Text> {e.translated_text}</Text>
                {e.safety_flag ? <Text style={styles.hazard}>{safetyWarningText(e)}</Text> : <Text style={styles.muted}>Safety flag: No / Sin alerta</Text>}
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.noteTitle}>Supervisor Notes / Notas del supervisor</Text>
            <Text style={styles.noteLine}> </Text>
            <Text style={styles.noteLine}> </Text>
          </View>

          <Text style={styles.signatureLine}>Foreman Signature / Firma del encargado: ____________________</Text>
          <Text style={styles.signatureLine}>Crew Lead Signature / Firma líder de cuadrilla: ____________________</Text>

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
