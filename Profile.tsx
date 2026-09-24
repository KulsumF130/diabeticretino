import React, { useState } from "react";
import { UserCheck, Shield, Lock, AlertCircle, CheckCircle, Save } from "lucide-react";
import { User } from "../types";

interface ProfileProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

export default function Profile({ user, onUpdateUser }: ProfileProps) {
  const [name, setName] = useState(user.name);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password && password !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          name,
          password: password || undefined
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile.");
      }

      onUpdateUser(data);
      setSuccess("Your clinical security profile has been updated successfully.");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-12 px-4 sm:px-0" id="profile-workspace">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
        {/* Banner header */}
        <div className="bg-slate-900 text-white px-6 py-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="font-sans font-bold text-lg text-slate-100">User Security Profile</h3>
            <p className="text-xs text-slate-400 mt-0.5">Edit clinical credentials & security passwords</p>
          </div>
          <UserCheck className="h-5 w-5 text-sky-400" />
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6" id="profile-edit-form">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-start gap-2.5">
              <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {/* Read only email info */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Clinical Registry Email</span>
              <span className="text-sm font-bold text-slate-700 block font-mono">{user.email}</span>
            </div>
            {user.is_admin ? (
              <span className="bg-rose-500/15 text-rose-500 text-[10px] px-2.5 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
                Admin Profile
              </span>
            ) : (
              <span className="bg-sky-500/15 text-sky-500 text-[10px] px-2.5 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
                Standard Profile
              </span>
            )}
          </div>

          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Full Clinical Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all outline-none"
              required
            />
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h4 className="font-sans font-bold text-sm text-slate-800">Change Security Password</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Leave password fields blank if you do not want to alter your login credentials.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-lg shadow-sky-500/10 transition-colors cursor-pointer text-sm flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? "Persisting profile..." : "Save Profile Updates"}
          </button>
        </form>
      </div>
    </div>
  );
}
