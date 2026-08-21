import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import Layout from "../components/Layout";

/**
 * Payment shape from the backend
 */
interface Payment {
  id: number;
  venue_id: number;
  package_id: number;
  phone_number: string;
  amount: number;
  status: "pending" | "success" | "failed" | "cancelled";
  mpesa_receipt_number: string | null;
  mac_address: string | null;
  created_at: string;
}

interface Venue {
  id: number;
  name: string;
}

/**
 * Payments history page for the logged-in venue owner.
 */
export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch venues (for the filter dropdown)
  useEffect(() => {
    api.get("/venues/")
      .then((res) => setVenues(res.data))
      .catch(() => {});
  }, []);

  // Fetch payments (re-runs when filter changes)
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError("");

        const params = selectedVenue ? { venue_id: selectedVenue } : {};
        const res = await api.get("/payments/", { params });
        setPayments(res.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to load payments");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [selectedVenue]);

  const getVenueName = (venueId: number) => {
    return venues.find((v) => v.id === venueId)?.name || `Venue #${venueId}`;
  };

  const statusStyles: Record<string, string> = {
    success: "bg-emerald-500/15 text-emerald-400",
    pending: "bg-yellow-500/15 text-yellow-400",
    failed: "bg-red-500/15 text-red-400",
    cancelled: "bg-slate-600/50 text-slate-400",
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="text-slate-400 mt-1">Transaction history across your venues</p>
        </div>

        {/* Venue Filter */}
        <div className="w-full sm:w-56">
          <select
            value={selectedVenue}
            onChange={(e) => setSelectedVenue(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Venues</option>
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-slate-400 py-12 text-center">Loading payments...</div>
      )}

      {/* Empty State */}
      {!loading && !error && payments.length === 0 && (
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 px-6 py-16 text-center">
          <p className="text-lg font-medium text-slate-300">No payments yet</p>
          <p className="text-slate-500 mt-2 text-sm">
            Payments will appear here once customers start buying packages.
          </p>
        </div>
      )}

      {/* Payments Table */}
      {!loading && payments.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-800 text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Venue</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Receipt</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {payments.map((payment) => (
                <tr key={payment.id} className="bg-slate-800/50 hover:bg-slate-800 transition">
                  <td className="px-4 py-3 text-slate-300">#{payment.id}</td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/venues/${payment.venue_id}`}
                      className="text-emerald-400 hover:underline"
                    >
                      {getVenueName(payment.venue_id)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{payment.phone_number}</td>
                  <td className="px-4 py-3 font-medium text-white">
                    KES {Number(payment.amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                        statusStyles[payment.status] || statusStyles.cancelled
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                    {payment.mpesa_receipt_number || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {new Date(payment.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}