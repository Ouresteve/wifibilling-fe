import { useEffect, useState } from "react";
import api from "../api/client";

/**
 * Summary data returned by /dashboard/summary
 */
interface Summary {
  total_venues: number;
  total_revenue: number;
  successful_payments: number;
  active_sessions: number;
  total_devices_online: number;
}

/**
 * Main dashboard overview page.
 * Shows high-level stats for the logged-in venue owner.
 */
export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/dashboard/summary");
        setSummary(res.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return <div className="text-slate-400 py-12 text-center">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-400 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-slate-400 mt-1">Overview of your hotspot business</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Total Venues */}
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <p className="text-sm text-slate-400 mb-1">Total Venues</p>
          <p className="text-3xl font-bold tracking-tight">
            {summary?.total_venues ?? 0}
          </p>
        </div>

        {/* Revenue */}
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <p className="text-sm text-slate-400 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold tracking-tight text-emerald-400">
            KES {Number(summary?.total_revenue ?? 0).toLocaleString()}
          </p>
        </div>

        {/* Successful Payments */}
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <p className="text-sm text-slate-400 mb-1">Successful Payments</p>
          <p className="text-3xl font-bold tracking-tight">
            {summary?.successful_payments ?? 0}
          </p>
        </div>

        {/* Devices Online */}
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <p className="text-sm text-slate-400 mb-1">Devices Online</p>
          <p className="text-3xl font-bold tracking-tight text-blue-400">
            {summary?.total_devices_online ?? 0}
          </p>
        </div>
      </div>
    </div>
  );
}