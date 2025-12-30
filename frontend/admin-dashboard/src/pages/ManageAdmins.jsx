import { useState, useEffect } from "react";
import API from "../services/api";

export default function ManageAdmins() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Fetch Admins
  const fetchAdmins = async () => {
    try {
      setFetching(true);
      const res = await API.get("/admin/list");
      if (res.data.success) {
        setAdmins(res.data.admins);
      }
    } catch (err) {
      console.error("Failed to fetch admins", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/admin/create", formData);
      alert("Admin account created successfully!");
      setFormData({ name: "", email: "", password: "" });
      fetchAdmins(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2 lg:p-8 animate-fade-in min-h-full">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight">Manage <span className="text-gradient">Admins</span></h2>
          
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* LEFT: CREATE ADMIN CARD */}
          <div className="glass-card rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden h-fit">
            <h3 className="card-title text-2xl text-white mb-6">Create New Admin</h3>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* NAME */}
              <div className="form-control">
                <label className="label"><span className="label-text text-gray-400 font-bold uppercase text-xs tracking-wider">Display Name</span></label>
                <input
                  type="text"
                  required
                  className="input input-lg glass bg-black/20 border-white/10 text-white focus:border-primary w-full"
                  placeholder="Enter name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* EMAIL */}
              <div className="form-control">
                <label className="label"><span className="label-text text-gray-400 font-bold uppercase text-xs tracking-wider">Email Address</span></label>
                <input
                  type="email"
                  required
                  className="input input-lg glass bg-black/20 border-white/10 text-white focus:border-primary w-full"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {/* PASSWORD */}
              <div className="form-control">
                <label className="label"><span className="label-text text-gray-400 font-bold uppercase text-xs tracking-wider">Password</span></label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    className="input input-lg glass bg-black/20 border-white/10 text-white focus:border-primary w-full pr-12"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                <label className="label"><span className="label-text-alt text-gray-500">Must be at least 6 characters</span></label>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary glass border-0 hover:bg-primary/80 px-8 w-full btn-lg text-white"
                >
                  {loading ? <span className="loading loading-spinner"></span> : "Create Admin Account"}
                </button>
              </div>

            </form>
          </div>

          {/* RIGHT: EXISTING ADMINS LIST */}
          <div className="glass-card rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden h-fit">
            <div className="flex justify-between items-center mb-6">
              <h3 className="card-title text-2xl text-white">Existing Administrators</h3>
              <button
                onClick={fetchAdmins}
                className="btn btn-circle btn-ghost btn-sm text-gray-400 hover:text-white"
                title="Refresh List"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            </div>

            {fetching ? (
              <div className="flex justify-center py-10">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {admins.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No admins found.</p>
                ) : (
                  admins.map(admin => (
                    <div key={admin.uid} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">

                      {/* AVATAR */}
                      <div className="avatar placeholder">
                        <div className="bg-neutral text-neutral-content rounded-full w-12 border border-white/10">
                          {admin.photoURL ? (
                            <img src={admin.photoURL} alt={admin.displayName} />
                          ) : (
                            <span className="text-lg font-bold">{admin.displayName ? admin.displayName.charAt(0).toUpperCase() : "A"}</span>
                          )}
                        </div>
                      </div>

                      {/* DETAILS */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-bold truncate">{admin.displayName || "Unknown Name"}</h4>
                        <p className="text-gray-400 text-sm truncate">{admin.email}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Last Login: {admin.metadata?.lastSignInTime ? new Date(admin.metadata.lastSignInTime).toLocaleDateString() : "Never"}
                        </p>
                      </div>

                      {/* BADGE */}
                      <div className="badge badge-success badge-outline gap-1 text-xs font-bold">
                        Admin
                      </div>

                    </div>
                  ))
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
