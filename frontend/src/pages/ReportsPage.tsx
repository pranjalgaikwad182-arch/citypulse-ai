import React, { useState } from 'react';
import { CitizenReport, DuplicateCheckResult } from '../types';
import { api } from '../services/api';
import { AudioRecorder } from '../components/AudioRecorder';
import {
  FileText,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  Volume2,
  Clock,
  MapPin,
  Send,
  Eye,
  ShieldAlert,
  Search
} from 'lucide-react';

interface ReportsPageProps {
  reports: CitizenReport[];
  onReportCreated: (newReport: CitizenReport) => void;
  showToast: (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  reports,
  onReportCreated,
  showToast,
}) => {
  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Pothole & Roadwork');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [address, setAddress] = useState('FC Road, Deccan Gymkhana, Pune');
  const [lat, setLat] = useState(18.5199);
  const [lng, setLng] = useState(73.8407);
  const [reporterName, setReporterName] = useState('Civic Resident');

  // Media
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  // Duplicate Check Feedback
  const [duplicateWarning, setDuplicateWarning] = useState<DuplicateCheckResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter State
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const categories = [
    'Pothole & Roadwork',
    'Waterlogging',
    'Broken Streetlight',
    'Accident',
    'Road Closure',
    'Harassment / Unsafe Condition',
    'Other Hazard',
  ];

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        showToast('Image Too Large', 'Please select an image smaller than 10MB.', 'warning');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleCheckDuplicates = async () => {
    if (description.length < 10) return;
    try {
      const fd = new FormData();
      fd.append('description', description);
      fd.append('lat', lat.toString());
      fd.append('lng', lng.toString());
      fd.append('severity', severity);

      const res = await api.checkDuplicate(fd);
      if (res.has_duplicates) {
        setDuplicateWarning(res);
      } else {
        setDuplicateWarning(null);
      }
      if (res.inferred_category && res.inferred_category !== 'Other Hazard') {
        setCategory(res.inferred_category);
      }
    } catch (err) {
      console.warn('Duplicate check failed:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !address.trim()) {
      showToast('Missing Fields', 'Please fill in the title, description, and address.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('category', category);
      fd.append('description', description);
      fd.append('severity', severity);
      fd.append('lat', lat.toString());
      fd.append('lng', lng.toString());
      fd.append('address', address);
      fd.append('reporter_name', reporterName || 'Anonymous Citizen');

      if (photoFile) fd.append('photo', photoFile);
      if (audioFile) fd.append('audio', audioFile);

      const newRep = await api.submitReport(fd);
      onReportCreated(newRep);
      showToast(
        'Report Submitted',
        `Your incident has been registered as ${newRep.report_code}. Status: Submitted.`,
        'success'
      );

      // Reset form
      setTitle('');
      setDescription('');
      setPhotoFile(null);
      setPhotoPreview(null);
      setAudioFile(null);
      setDuplicateWarning(null);
    } catch (err: any) {
      showToast('Submission Failed', err.message || 'Unable to submit report.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    const matchCat = filterCategory === 'All' || r.category === filterCategory;
    const matchStat = filterStatus === 'All' || r.status === filterStatus;
    return matchCat && matchStat;
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl border border-cyan-900/40 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-semibold mb-3">
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span>Citizen Incident Reporting & Verification</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Report Urban Hazards with Photos & Voice Notes
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
          Help keep Pune safe and functional. Report potholes, flash floods, broken streetlights, or roadwork barricades.
          Our NLP engine analyzes urgency, suggests categories, and flags duplicate submissions in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Report Submission Form */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Submit Incident Report
            </h2>
            <span className="text-xs text-slate-400">Anonymous & Sensitive</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Incident Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Deep pothole crater near Goodluck Chowk"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-white focus:outline-none"
                required
              />
            </div>

            {/* Category & Severity Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 px-3 py-2.5 rounded-xl text-xs text-slate-200 focus:outline-none cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Severity *
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 px-3 py-2.5 rounded-xl text-xs text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="Low">Low (Informational)</option>
                  <option value="Medium">Medium (Caution Needed)</option>
                  <option value="High">High (Immediate Hazard)</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Description *
                </label>
                <span className="text-[10px] text-slate-500">NLP categorizer active</span>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleCheckDuplicates}
                placeholder="Describe what occurred, hazards for two-wheelers, landmarks nearby..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 p-3 rounded-xl text-xs sm:text-sm text-white focus:outline-none"
                required
              />
            </div>

            {/* Duplicate Incident Warning Banner */}
            {duplicateWarning && duplicateWarning.has_duplicates && (
              <div className="p-3.5 bg-amber-950/40 border border-amber-800/80 rounded-xl space-y-1.5 text-xs text-amber-200">
                <div className="font-semibold flex items-center gap-1.5 text-amber-300">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Potential Duplicate Incident Detected:
                </div>
                <p className="text-[11px] text-slate-300">
                  A similar incident was recently reported within {duplicateWarning.suggested_duplicates[0].distance_km}km: "
                  {duplicateWarning.suggested_duplicates[0].title}". You may still submit this report to provide additional evidence.
                </p>
              </div>
            )}

            {/* Location Address & Coords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Location / Street *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street name & Landmark in Pune"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Reporter Name / Handle
                </label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="Anonymous or Name"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Photo Attachment */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Photograph Evidence (Optional)
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white cursor-pointer transition">
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Choose Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
                {photoFile && (
                  <span className="text-xs text-slate-400 truncate max-w-xs">
                    {photoFile.name} ({(photoFile.size / 1024).toFixed(0)} KB)
                  </span>
                )}
              </div>
              {photoPreview && (
                <div className="mt-2 relative w-32 h-20 rounded-xl overflow-hidden border border-slate-800">
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(null);
                    }}
                    className="absolute top-1 right-1 bg-black/80 text-white rounded-full p-1 text-[10px]"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Voice Note Recorder (Browser MediaRecorder) */}
            <AudioRecorder onAudioRecorded={(file) => setAudioFile(file)} />

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Registering Report...' : 'Submit Incident to CityPulse'}</span>
            </button>
          </form>
        </div>

        {/* Right: Live Reports Tracker */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                Citizen Reports Tracking Log
              </h2>
              <span className="text-xs text-slate-400">
                Track verification progress across civic departments
              </span>
            </div>

            {/* Filter status */}
            <div className="flex items-center gap-2 text-xs">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-300 focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Verified">Verified</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* List of Reports */}
          <div className="space-y-3.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredReports.map((rep) => {
              const statusBadge =
                rep.status === 'Verified'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : rep.status === 'Resolved'
                  ? 'bg-blue-950 text-blue-300 border-blue-800'
                  : rep.status === 'Under Review'
                  ? 'bg-purple-950 text-purple-300 border-purple-800'
                  : 'bg-amber-950 text-amber-300 border-amber-800';

              return (
                <div
                  key={rep.id}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-cyan-400 font-bold">
                      {rep.report_code}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusBadge}`}>
                      {rep.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-white">{rep.title}</h4>
                    <span className="text-[11px] text-cyan-400 font-medium">{rep.category}</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{rep.description}</p>

                  {/* Media attachments */}
                  <div className="flex items-center gap-3 text-xs">
                    {rep.photo_url && (
                      <a
                        href={rep.photo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-cyan-400 hover:underline text-[11px]"
                      >
                        <ImageIcon className="w-3.5 h-3.5" /> View Photo
                      </a>
                    )}
                    {rep.audio_url && (
                      <audio controls src={rep.audio_url} className="h-7 w-48 rounded" />
                    )}
                  </div>

                  {rep.verification_notes && (
                    <div className="p-2 rounded-lg bg-slate-950 text-[10px] text-slate-400 border border-slate-800">
                      <strong className="text-slate-300">Verification: </strong>
                      {rep.verification_notes}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-[200px]">{rep.address}</span>
                    </div>
                    <span>{new Date(rep.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
