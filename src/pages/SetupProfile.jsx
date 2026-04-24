import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createUserProfile } from "../lib/users";

export default function SetupProfile() {
  const { user, profile, setProfile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: "", middleName: "", lastName: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user === null) navigate("/login");
    if (profile) navigate("/");
  }, [user, profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const p = await createUserProfile(
        user.$id,
        form.firstName.trim(),
        form.middleName.trim(),
        form.lastName.trim()
      );
      setProfile(p);
      navigate("/");
    } catch {
      setError("Failed to save. Please try again.");
      setSaving(false);
    }
  };

  if (user === undefined) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 w-full max-w-sm">
        <h1 className="font-heading text-2xl font-bold mb-1">Welcome!</h1>
        <p className="text-gray-500 text-sm mb-6">Tell us your name to get started.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
            <input
              required
              type="text"
              value={form.firstName}
              onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Middle Name <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={form.middleName}
              onChange={(e) => setForm((p) => ({ ...p, middleName: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
            <input
              required
              type="text"
              value={form.lastName}
              onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-black text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
