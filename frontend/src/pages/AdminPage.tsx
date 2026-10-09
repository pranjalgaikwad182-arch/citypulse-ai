import React, { useState } from 'react';
import { CitizenReport, User } from '../types';
import { api } from '../services/api';
import {
  Lock,
  Unlock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  User as UserIcon,
  Search,
  Image as ImageIcon,
  Volume2
} from 'lucide-react';

interface AdminPageProps {
  reports: CitizenReport[];
  onReportUpdated: (updated: CitizenReport) => void;
  currentUser: User | null;
  authToken: string | null;
  onLogin: (token: string, user: User) => void;
  onLogout: () => void;
  showToast: (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  reports,
  onReportUpdated,
  currentUser,
  authToken,
  onLogin,
  onLogout,
  showToast,
}) => {
  const [email, setEmail] = useState('admin@citypulse.ai');
  const [password, setPassword] = useState('CityPulse@Admin2026');
  const [loginLoading, setLoginLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const [verificationNoteInput, setVerificationNoteInput] = useState<{ [id: number]: string }>({});

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await api.login(email, password);
      onLogin(res.access_token, res.user);
      showToast('Admin Authenticated', `Welcome back, ${res.user.full_name || res.user.email}!`, 'success');
    } catch (err: any) {
      showToast('Login Failed', err.message || 'Incorrect credentials.', 'error');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleQuickDemoAdmin = async () => {
    setEmail('admin@citypulse.ai');
    setPassword('CityPulse@Admin2026');
    setLoginLoading(true);
    try {
      const res = await api.login('admin@citypulse.ai', 'CityPulse@Admin2026');
      onLogin(res.access_token, res.user);
      showToast('Demo Admin Logged In', 'Municipal Moderation Mode activated.', 'success');
    } catch (err: any) {
      showToast('Login Failed', err.message, 'error');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleUpdateStatus = async (reportId: number, newStatus: string) => {
    if (!authToken) {
      showToast('Unauthorized', 'Please authenticate as admin.', 'warning');
      return;
    }
    setActionLoadingId(reportId);
    try {
      const notes = verificationNoteInput[reportId] || `Status updated to ${newStatus} by admin review.`;
      const updated = await api.updateReportStatus(
        reportId,
        { status: newStatus, verification_notes: notes },
        authToken
      );
      onReportUpdated(updated);
      showToast('Status Updated', `Report ${updated.report_code} marked as ${newStatus}.`, 'success');
    } catch (err: any) {
      showToast('Update Failed', err.message || 'Could not update status.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const isAdmin = currentUser && currentUser.role === 'admin';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-cyan-300 text-xs font-semibold mb-3 border border-slate-700">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Municipal Moderation & Dispatch Operations</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Admin & Report Verification Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl">
            Review reported citizen evidence, dispatch road work crews, verify or reject submitted incidents, and manage duplicate flags.
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs font-bold text-emerald-400">Signed In: Admin</div>
              <div className="text-[11px] text-slate-400">{currentUser.email}</div>
            </div>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>

      {!isAdmin ? (
        /* Login Card */
        <div className="max-w-md mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-7 shadow-2xl space-y-5">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 mb-2">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Admin Authentication</h2>
            <p className="text-xs text-slate-400">
              Backend token-based authorization with BCrypt password verification.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-white focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-white focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-lg transition cursor-pointer disabled:opacity-50"
            >
              {loginLoading ? 'Authenticating...' : 'Sign In as Admin'}
            </button>
          </form>

          {/* 1-Click Quick Demo Switcher */}
          <div className="pt-3 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={handleQuickDemoAdmin}
              className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-cyan-400 hover:text-cyan-300 text-xs font-semibold transition cursor-pointer"
            >
              1-Click Demo Login (admin@citypulse.ai)
            </button>
            <div className="text-[10px] text-slate-500 mt-2">
              Seeded Demo Password: <code className="text-slate-400">CityPulse@Admin2026</code>
            </div>
          </div>
        </div>
      ) : (
        /* Moderation Queue */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              Citizen Reports Moderation Queue ({reports.length})
            </h2>
            <span className="text-xs text-slate-400">
              Reporter Privacy Protected (No PII Stored)
            </span>
          </div>

          <div className="space-y-4">
            {reports.map((rep) => {
              const isLoading = actionLoadingId === rep.id;

              return (
                <div
                  key={rep.id}
                  className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-cyan-400">
                        {rep.report_code}
                      </span>
                      <span className="text-xs font-semibold text-white">{rep.title}</span>
                      <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                        {rep.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-mono">
                        Urgency: {(rep.urgency_score * 100).toFixed(0)}%
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          rep.status === 'Verified'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : rep.status === 'Resolved'
                            ? 'bg-blue-950 text-blue-300 border-blue-800'
                            : rep.status === 'Rejected'
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : 'bg-amber-950 text-amber-300 border-amber-800'
                        }`}
                      >
                        {rep.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{rep.description}</p>

                  {/* Evidence media */}
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    {rep.photo_url && (
                      <a
                        href={rep.photo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-cyan-400 hover:underline"
                      >
                        <ImageIcon className="w-4 h-4" /> Attached Photo Evidence
                      </a>
                    )}
                    {rep.audio_url && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[11px]">Audio Note:</span>
                        <audio controls src={rep.audio_url} className="h-7 w-48" />
                      </div>
                    )}
                  </div>

                  {/* Verification note input */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Add municipal inspection note or action taken..."
                      defaultValue={rep.verification_notes || ''}
                      onChange={(e) =>
                        setVerificationNoteInput({ ...verificationNoteInput, [rep.id]: e.target.value })
                      }
                      className="flex-1 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(rep.id, 'Verified')}
                        disabled={isLoading}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition cursor-pointer"
                      >
                        Verify Report
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(rep.id, 'Resolved')}
                        disabled={isLoading}
                        className="px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition cursor-pointer"
                      >
                        Mark Resolved
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(rep.id, 'Rejected')}
                        disabled={isLoading}
                        className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition cursor-pointer"
                      >
                        Reject Spam
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
