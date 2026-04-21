'use client';

import { useEffect, useMemo, useState } from 'react';
import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { supabaseClient } from '@/lib/supabase';
import { DEMO_JOBS } from '@/lib/constants';
import { EmptyState } from '@/components/EmptyState';
import { useLanguage } from '@/components/LanguageProvider';

const styles = StyleSheet.create({ page: { padding: 24, backgroundColor: '#fff', color: '#111827', fontSize: 10 }, title: { fontSize: 16, marginBottom: 8 }, row: { marginBottom: 6, paddingBottom: 6, borderBottom: '1 solid #d1d5db' }, hazard: { color: '#b45309' } });

export default function LogsPage() {
  const { t } = useLanguage();
  const [rows, setRows] = useState<any[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const isDemo = document.cookie.includes('cb-demo=1');
    if (isDemo) { setRows(DEMO_JOBS.flatMap((job) => job.entries.map((entry, index) => ({ id: `${job.id}-${index}`, job_name: job.name, created_at: new Date().toISOString(), ...entry })))); return; }
    (async () => {
      const { data: auth } = await supabaseClient.auth.getUser();
      if (!auth.user) return;
      const { data } = await supabaseClient.from('translations').select('*').eq('user_id', auth.user.id).order('created_at', { ascending: false });
      setRows(data ?? []);
    })();
  }, []);

  const filtered = useMemo(() => rows.filter((r) => `${r.job_name} ${new Date(r.created_at).toLocaleDateString()}`.toLowerCase().includes(query.toLowerCase())), [rows, query]);
  const byJob = useMemo(() => filtered.reduce<Record<string, any[]>>((acc, row) => ((acc[row.job_name] = [...(acc[row.job_name] || []), row]), acc), {}), [filtered]);

  async function exportJobPdf(jobName: string) {
    const entries = byJob[jobName] || [];
    const blob = await pdf(<Document><Page size="A4" style={styles.page}><Text style={styles.title}>CrewBridge | Job Log</Text><Text>Job: {jobName}</Text><View style={{ marginTop: 10 }}>{entries.map((e) => <View key={e.id} style={styles.row}><Text>{new Date(e.created_at).toLocaleString()} | {e.sender_role}</Text><Text>Original: {e.original_text}</Text><Text>Translated: {e.translated_text}</Text>{e.safety_flag ? <Text style={styles.hazard}>FLAGGED SAFETY CONTENT</Text> : null}</View>)}</View></Page></Document>).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${jobName.replace(/\s+/g, '_')}_crewbridge_logs.pdf`; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="glass p-5"><h1 className="text-2xl font-semibold">{t('logs_title')}</h1><input placeholder="Search by job name or date" value={query} onChange={(e) => setQuery(e.target.value)} className="mt-3 w-full md:w-96" /></div>
      {Object.keys(byJob).length === 0 ? <EmptyState message="No translation logs yet. Create your first translation to build your job log." ctaHref="/translate" ctaLabel="Go to Translate" /> : Object.entries(byJob).map(([jobName, entries]) => (
        <section key={jobName} className="glass p-5">
          <div className="mb-3 flex items-center justify-between"><h2 className="text-xl font-semibold">{jobName}</h2><button onClick={() => exportJobPdf(jobName)} className="rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 px-3 py-2 font-semibold">Export PDF</button></div>
          <div className="space-y-3">{entries.map((entry) => <div key={entry.id} className="rounded-xl border border-white/10 bg-slate-900/60 p-4 text-sm"><p className="text-slate-400">{new Date(entry.created_at).toLocaleString()} • {entry.sender_role}</p><p><span className="font-semibold">Original:</span> {entry.original_text}</p><p><span className="font-semibold">Translated:</span> {entry.translated_text}</p>{entry.safety_flag && <p className="mt-1 text-amber-400">FLAG: This instruction may involve a safety hazard. Verify compliance before proceeding.</p>}</div>)}</div>
        </section>
      ))}
    </div>
  );
}
