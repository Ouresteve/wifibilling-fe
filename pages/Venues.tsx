import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import Layout from "../components/Layout";

interface Venue {
  id: number;
  name: string;
  slug: string;
  owner_name: string;
  owner_phone: string;
  is_active: boolean;
  created_at: string;
}

interface VenueForm {
  name: string;
  slug: string;
  owner_name: string;
  owner_phone: string;
}

/**
 * Generate a URL-friendly slug from a name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function Venues() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingVenue, setEditingVenue] = useState<Venue | null>(null); 
  const [editForm, setEditForm] = useState({
  name: "",
  owner_phone: "",
  is_active: true,
 });
 const [editError, setEditError] = useState("");
 const [editSubmitting, setEditSubmitting] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<VenueForm>({
    name: "",
    slug: "",
    owner_name: "",
    owner_phone: "",
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/venues/");
      setVenues(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load venues");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);






  const openEditVenue = (venue: Venue) => {
  setEditingVenue(venue);
  setEditForm({
    name: venue.name,
    owner_phone: venue.owner_phone || "",
    is_active: venue.is_active,
  });
  setEditError("");
};

const handleUpdateVenue = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!editingVenue) return;
  setEditError("");

  if (!editForm.name.trim()) {
    setEditError("Venue name is required");
    return;
  }

  try {
    setEditSubmitting(true);
    await api.patch(`/venues/${editingVenue.id}`, {
      name: editForm.name.trim(),
      owner_phone: editForm.owner_phone.trim() || null,
      is_active: editForm.is_active,
    });
    setEditingVenue(null);
    await fetchVenues();
  } catch (err: any) {
    const detail = err.response?.data?.detail;
    setEditError(typeof detail === "string" ? detail : "Failed to update venue");
  } finally {
    setEditSubmitting(false);
  }
};


  /**
   * Auto-generate slug when name changes (only if user hasn't manually edited slug)
   */




  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      // Only auto-update slug if it was empty or matched the previous auto-generated value
      slug: prev.slug === "" || prev.slug === generateSlug(prev.name)
        ? generateSlug(name)
        : prev.slug,
    }));
  };

  const handleCreateVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      setFormError("Venue name is required");
      return;
    }
    if (!form.slug.trim()) {
      setFormError("Slug is required");
      return;
    }
    

    try {
      setSubmitting(true);
      await api.post("/venues/", {
        name: form.name.trim(),
        slug: form.slug.trim().toLowerCase(),
        owner_name: form.owner_name.trim(),
        owner_phone: form.owner_phone.trim(),
      });

      // Reset and close
      setForm({ name: "", slug: "", owner_name: "", owner_phone: "" });
      setShowModal(false);
      await fetchVenues();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setFormError(typeof detail === "string" ? detail : "Failed to create venue");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Venues</h1>
          <p className="text-slate-400 mt-1">Manage your hotspot locations</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition"
        >
          + Add Venue
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-slate-400 py-12 text-center">Loading venues...</div>
      )}

      {/* Empty State */}
      {!loading && !error && venues.length === 0 && (
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 px-6 py-16 text-center">
          <p className="text-lg font-medium text-slate-300">No venues yet</p>
          <p className="text-slate-500 mt-2 text-sm">
            Create your first venue to start accepting payments.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-6 inline-flex px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-sm font-medium transition"
          >
            + Create Venue
          </button>
        </div>
      )}

      {/* Venues Grid */}
      {!loading && venues.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {venues.map((venue) => (
            <div
              key={venue.id}
              className="rounded-xl border border-slate-700 bg-slate-800 p-5 hover:border-slate-600 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-lg leading-tight">{venue.name}</h3>
                  <p className="text-sm text-slate-400 mt-1">/portal/{venue.slug}</p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    venue.is_active
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-slate-600/50 text-slate-400"
                  }`}
                >
                  {venue.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-700 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Owner</span>
                  <span className="text-slate-200">{venue.owner_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Support Contact</span>
                  <span className="text-slate-200">{venue.owner_phone}</span>
                </div>
              </div>

             <div className="mt-5 flex gap-2">
  <Link
    to={`/venues/${venue.id}`}
    className="flex-1 text-center text-sm font-medium py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition"
  >
    View
  </Link>
  <button
    onClick={() => openEditVenue(venue)}
    className="flex-1 text-center text-sm font-medium py-2 rounded-lg border border-slate-600 hover:bg-slate-700 transition"
  >
    Edit
  </button>
</div>
            </div>
          ))}
        </div>
      )}

      {/* ====================== */}
      {/* Add Venue Modal        */}
      {/* ====================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)} />

          <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-1">Add Venue</h3>
            <p className="text-sm text-slate-400 mb-6">
              Create a new hotspot location
            </p>

            {formError && (
              <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-red-400 text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateVenue} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Venue Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Sunrise Hostel"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1.5">
                  Slug <span className="text-slate-500">(for portal URL)</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">/portal/</span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="sunrise-hostel"
                    className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

             
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Support Contact<span className="text-slate-500"> (optional)</span></label>
                <input
                  type="tel"
                  value={form.owner_phone}
                  onChange={(e) => setForm({ ...form, owner_phone: e.target.value })}
                  placeholder="e.g. 0712345678"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                  
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-slate-600 text-sm font-medium hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-sm font-medium transition"
                >
                  {submitting ? "Creating..." : "Create Venue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}




      {editingVenue && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/60" onClick={() => setEditingVenue(null)} />

    <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-xl">
      <h3 className="text-lg font-semibold mb-1">Edit Venue</h3>
      <p className="text-sm text-slate-400 mb-6">Update venue details</p>

      {editError && (
        <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-red-400 text-sm">
          {editError}
        </div>
      )}

      <form onSubmit={handleUpdateVenue} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-300 mb-1.5">Venue Name</label>
          <input
            type="text"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1.5">
            Support Phone <span className="text-slate-500">(optional)</span>
          </label>
          <input
            type="tel"
            value={editForm.owner_phone}
            onChange={(e) => setEditForm({ ...editForm, owner_phone: e.target.value })}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="venue_is_active"
            checked={editForm.is_active}
            onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
            className="rounded border-slate-600"
          />
          <label htmlFor="venue_is_active" className="text-sm text-slate-300">
            Active
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => setEditingVenue(null)}
            className="flex-1 py-2.5 rounded-lg border border-slate-600 text-sm font-medium hover:bg-slate-700 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={editSubmitting}
            className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-sm font-medium transition"
          >
            {editSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

    </Layout>
  );
}