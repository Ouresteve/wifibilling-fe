import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client";
import Layout from "../components/Layout";

/**
 * Venue data shape from the backend
 */
interface Venue {
  id: number;
  name: string;
  slug: string;
  owner_name: string;
  owner_phone: string;
  is_active: boolean;
  created_at: string;
}

/**
 * Package data shape
 */
interface Package {
  id: number;
  venue_id: number;
  name: string;
  duration_minutes: number;
  price: number;
  max_devices: number;
  is_active: boolean;
  created_at: string;
}

/**
 * Form state for creating a new package
 */
interface NewPackageForm {
    name: string;
    duration_minutes: number;
    price: string;
    max_devices: string;
}

/**
 * Venue Detail page
 * Shows information about a single venue and its packages.
 */
export default function VenueDetail() {
  const { id } = useParams<{ id: string }>();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
const [editForm, setEditForm] = useState({
  name: "",
  duration_minutes: "",
  price: "",
  max_devices: "",
  is_active: true,
});
const [editError, setEditError] = useState("");
const [editSubmitting, setEditSubmitting] = useState(false);
  //Modal State
  const [showModal, setShowModal]= useState(false);
  const [form, setForm] = useState<NewPackageForm>({
    name: "",
    duration_minutes: 60,
    price: "",
    max_devices: "1",
  });

  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting]= useState(false);
// Fetch venue and packages data
const fetchData = async () => {
        if (!id) return;
      try {
        setLoading(true);
        setError("");

        // Fetch venue and its packages in parallel
        const [venueRes, packagesRes] = await Promise.all([
          api.get(`/venues/${id}`),
          api.get(`/packages/?venue_id=${id}`),
        ]);

        setVenue(venueRes.data);
        setPackages(packagesRes.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to load venue details");
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
     fetchData();


  }, [id]);


  const openEditPackage = (pkg: Package) => {
  setEditingPackage(pkg);
  setEditForm({
    name: pkg.name,
    duration_minutes: String(pkg.duration_minutes),
    price: String(pkg.price),
    max_devices: String(pkg.max_devices),
    is_active: pkg.is_active,
  });
  setEditError("");
};

const handleUpdatePackage = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!editingPackage) return;
  setEditError("");

  try {
    setEditSubmitting(true);
    await api.patch(`/packages/${editingPackage.id}`, {
      name: editForm.name.trim(),
      duration_minutes: Number(editForm.duration_minutes),
      price: Number(editForm.price),
      max_devices: Number(editForm.max_devices),
      is_active: editForm.is_active,
    });
    setEditingPackage(null);
    await fetchData();
  } catch (err: any) {
    setEditError(err.response?.data?.detail || "Failed to update package");
  } finally {
    setEditSubmitting(false);
  }
};

  /**
   * Helper to display duration in a human-readable way
   */
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`;
    }

    const days = Math.floor(minutes / 1440);
    const remainingHours = Math.floor((minutes % 1440) / 60);
    const remainingMinutes = minutes % 60;
    return [
      `${days} day${days === 1 ? "" : "s"}`,
      remainingHours ? `${remainingHours} hr` : "",
      remainingMinutes ? `${remainingMinutes} min` : "",
    ]
      .filter(Boolean)
      .join(" ");
  };
  /**
   * Handle package creation
   */
const handleCreatePackage = async (e: React.FormEvent)=> {
    e.preventDefault();
    setFormError("");

    //Basic validation
    if (!form.name.trim()) {
      setFormError("Package name is required");
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      setFormError("Price must be greater than 0");
      return;
    }
    if (!form.duration_minutes || Number(form.duration_minutes) <= 0) {
      setFormError("Duration must be greater than 0");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/packages/", {
        venue_id: Number(id),
        name: form.name.trim(),
        duration_minutes: Number(form.duration_minutes),
        price: Number(form.price),
        max_devices: Number(form.max_devices) || 1,
      });

      // Reset form and close modal
      setForm({ name: "", duration_minutes: 60, price: "", max_devices: "1" });
      setShowModal(false);

      // Refresh packages list
      await fetchData();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || "Failed to create package");
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) {
    return (
      <Layout>
        <div className="text-slate-400 py-12 text-center">Loading venue...</div>
      </Layout>
    );
  }

  if (error || !venue) {
    return (
      <Layout>
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-400 text-sm">
          {error || "Venue not found"}
        </div>
        <Link to="/venues" className="inline-block mt-4 text-sm text-emerald-400 hover:underline">
          ← Back to Venues
        </Link>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Breadcrumb / Back */}
      <div className="mb-6">
        <Link to="/venues" className="text-sm text-slate-400 hover:text-white transition">
          ← Back to Venues
        </Link>
      </div>

      {/* Venue Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{venue.name}</h1>
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
          <p className="text-slate-400 mt-1">
            Portal: <span className="text-slate-300">/portal/{venue.slug}</span>
          </p>
        </div>
      </div>

      {/* Venue Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <p className="text-xs text-slate-400 mb-1">Owner</p>
          <p className="font-medium">{venue.owner_name}</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <p className="text-xs text-slate-400 mb-1">Phone</p>
          <p className="font-medium">{venue.owner_phone}</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <p className="text-xs text-slate-400 mb-1">Created</p>
          <p className="font-medium">
            {new Date(venue.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Packages Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-semibold">Packages</h2>
          <p className="text-sm text-slate-400">Internet packages for this venue</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition"
          
        >
          + Add Package
        </button>
      </div>

      {packages.length === 0 ? (
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 px-6 py-12 text-center">
          <p className="text-slate-300 font-medium">No packages yet</p>
          <p className="text-slate-500 text-sm mt-1">
            Add packages so customers can buy internet access.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-800 text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Duration</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Devices</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {packages.map((pkg) => (
                <tr key={pkg.id} className="bg-slate-800/50 hover:bg-slate-800 transition">
                  <td className="px-4 py-3 font-medium text-white">{pkg.name}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {formatDuration(pkg.duration_minutes)}
                  </td>
                  <td className="px-4 py-3 text-emerald-400 font-medium">
                    KES {Number(pkg.price).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{pkg.max_devices}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        pkg.is_active
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-slate-600/50 text-slate-400"
                      }`}
                    >
                      {pkg.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                      

                     
                <td className="px-4 py-3 text-right space-x-2">
                <button
                        onClick={() => openEditPackage(pkg)}
                        className="text-xs text-slate-300 hover:text-white transition"
                >
                Edit
                </button>
                </td>

                  
                </tr>
              ))}
              
            </tbody>
          </table>
        </div>
      )}
      {/* ====================== */}
      {/* Add Package Modal      */}
      {/* ====================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowModal(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-1">Add Package</h3>
            <p className="text-sm text-slate-400 mb-6">
              Create a new internet package for {venue.name}
            </p>

            {formError && (
              <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-red-400 text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreatePackage} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Package Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. 1 Hour, Daily Pass, Stream Footer"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Duration (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.duration_minutes}
                    onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Max Devices</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={form.max_devices}
                    onChange={(e) => setForm({ ...form, max_devices: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Price (KES)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="e.g. 20"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                  required
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
                  {submitting ? "Creating..." : "Create Package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}







      {editingPackage && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/60" onClick={() => setEditingPackage(null)} />
    <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-xl">
      <h3 className="text-lg font-semibold mb-1">Edit Package</h3>
      <p className="text-sm text-slate-400 mb-6">Update package details</p>

      {editError && (
        <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-red-400 text-sm">
          {editError}
        </div>
      )}

      <form onSubmit={handleUpdatePackage} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-300 mb-1.5">Package Name</label>
          <input
            type="text"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Duration (min)</label>
            <input
              type="number"
              min="1"
              value={editForm.duration_minutes}
              onChange={(e) => setEditForm({ ...editForm, duration_minutes: e.target.value })}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Max Devices</label>
            <input
              type="number"
              min="1"
              max="10"
              value={editForm.max_devices}
              onChange={(e) => setEditForm({ ...editForm, max_devices: e.target.value })}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1.5">Price (KES)</label>
          <input
            type="number"
            min="1"
            value={editForm.price}
            onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            checked={editForm.is_active}
            onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
            className="rounded border-slate-600"
          />
          <label htmlFor="is_active" className="text-sm text-slate-300">Active</label>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => setEditingPackage(null)}
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