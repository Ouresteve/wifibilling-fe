import { useEffect, useState } from "react";
import api from "../api/client";
import Layout from "../components/Layout";

interface MpesaSettings {
  mpesa_shortcode: string | null;
  mpesa_consumer_key: string | null;
  has_consumer_secret: boolean;
  has_passkey: boolean;
  is_configured: boolean;
}

export default function PaymentSettings() {
  const [settings, setSettings] = useState<MpesaSettings | null>(null);
  const [form, setForm] = useState({
    mpesa_shortcode: "",
    mpesa_consumer_key: "",
    mpesa_consumer_secret: "",
    mpesa_passkey: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/auth/mpesa-settings")
      .then((res) => {
        setSettings(res.data);
        setForm({
          mpesa_shortcode: res.data.mpesa_shortcode || "",
          mpesa_consumer_key: res.data.mpesa_consumer_key || "",
          mpesa_consumer_secret: "",
          mpesa_passkey: "",
        });
      })
      .catch(() => setError("Failed to load payment settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const payload: any = {
        mpesa_shortcode: form.mpesa_shortcode.trim() || null,
        mpesa_consumer_key: form.mpesa_consumer_key.trim() || null,
      };
      // Only send secrets if the user typed new ones
      if (form.mpesa_consumer_secret.trim()) {
        payload.mpesa_consumer_secret = form.mpesa_consumer_secret.trim();
      }
      if (form.mpesa_passkey.trim()) {
        payload.mpesa_passkey = form.mpesa_passkey.trim();
      }

      const res = await api.put("/auth/mpesa-settings", payload);
      setSettings(res.data);
      setForm((prev) => ({
        ...prev,
        mpesa_consumer_secret: "",
        mpesa_passkey: "",
      }));
      setMessage("Payment settings saved successfully");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-slate-400 py-12 text-center">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-xl">
        <h1 className="text-2xl font-bold mb-1">Payment Settings</h1>
        <p className="text-slate-400 mb-8">
          Connect your M-Pesa Paybill or Till so customer payments go directly to you.
        </p>

        {/* Status */}
        <div
          className={`mb-6 rounded-lg px-4 py-3 text-sm border ${
            settings?.is_configured
              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
              : "bg-yellow-500/10 border-yellow-500/40 text-yellow-400"
          }`}
        >
          {settings?.is_configured
            ? "Payments connected — money will go to your Paybill/Till"
            : "Payments not fully configured — add your Daraja credentials below"}
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-emerald-400 text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Business Shortcode</label>
            <input
              type="text"
              value={form.mpesa_shortcode}
              onChange={(e) => setForm({ ...form, mpesa_shortcode: e.target.value })}
              placeholder="Paybill or Till number"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Consumer Key</label>
            <input
              type="text"
              value={form.mpesa_consumer_key}
              onChange={(e) => setForm({ ...form, mpesa_consumer_key: e.target.value })}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
              required={!settings?.mpesa_consumer_key}
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1.5">
              Consumer Secret{" "}
              {settings?.has_consumer_secret && (
                <span className="text-slate-500">(leave blank to keep existing)</span>
              )}
            </label>
            <input
              type="password"
              value={form.mpesa_consumer_secret}
              onChange={(e) => setForm({ ...form, mpesa_consumer_secret: e.target.value })}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
              required={!settings?.has_consumer_secret}
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1.5">
              Passkey{" "}
              {settings?.has_passkey && (
                <span className="text-slate-500">(leave blank to keep existing)</span>
              )}
            </label>
            <input
              type="password"
              value={form.mpesa_passkey}
              onChange={(e) => setForm({ ...form, mpesa_passkey: e.target.value })}
            
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
              required={!settings?.has_passkey}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-sm font-medium transition"
          >
            {saving ? "Saving..." : "Save Payment Settings"}
          </button>
        </form>

        <div className="mt-10 rounded-xl border border-slate-700 bg-slate-800/50 p-5 text-sm text-slate-400 space-y-2">
          <p className="font-medium text-slate-300">Where do I get these?</p>
          <p>1. Create an account on the Safaricom Daraja portal</p>
          <p>2. Create an app and select Lipa Na M-Pesa Online</p>
          <p>3. Copy the Consumer Key, Consumer Secret, Shortcode and Passkey</p>
          <p>4. Paste them here. For live payments you will need a real Paybill/Till and go-live approval.</p>
        </div>
      </div>
    </Layout>
  );
}