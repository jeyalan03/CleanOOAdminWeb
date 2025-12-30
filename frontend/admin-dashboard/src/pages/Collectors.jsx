import { useEffect, useState } from "react";
import API from "../services/api";

import TablePagination from "../components/TablePagination"; // Import

export default function Collectors() {

  const [collectors, setCollectors] = useState([]);
  const [search, setSearch] = useState("");

  // 📄 PAGINATION
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [newCollector, setNewCollector] = useState({
    name: "",
    email: "",
    phone: "",
    zone: "",
    password: "" // Temp Password
  });

  const [editData, setEditData] = useState(null);

  const [historyData, setHistoryData] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadCollectors();
  }, []);

  const loadCollectors = async () => {
    try {
      const res = await API.get("/admin/collectors");
      setCollectors(res.data.data || []);
    } catch {
      // Fail silently or log
    }
  };

  const addCollector = async (e) => {
    e.preventDefault();
    try {
      await API.post("/admin/collectors", newCollector);
      setNewCollector({ name: "", email: "", phone: "", zone: "", password: "" });
      loadCollectors();
      setShowAddModal(false);
      alert("Collector added successfully");
    } catch (error) {
      const message = error.response?.data?.message || "Failed to add collector";
      alert(message);
    }
  };

  const deleteCollector = async (id) => {
    if (!window.confirm("Delete collector permanently?")) return;
    await API.delete(`/admin/collectors/${id}`);
    loadCollectors();
  };

  const toggleStatus = async (id, currentStatus) => {
    // Assuming API toggles automatically or we send new status
    await API.put(`/admin/collectors/status/${id}`);
    loadCollectors();
  };

  const saveEdit = async () => {
    try {
      await API.put(`/admin/collectors/${editData._id}`, editData);
      setEditData(null);
      loadCollectors();
      alert("Updated successfully");
    } catch (error) {
      alert("Update failed");
    }
  };

  const loadHistory = async (id) => {
    const res = await API.get(`/admin/collectors/${id}/history`);
    setHistoryData(res.data.data || []);
    setShowHistory(true);
  };

  const filteredCollectors = collectors.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.zone || "").toLowerCase().includes(search.toLowerCase())
  );

  // 📄 PAGINATION SLICE
  const paginatedCollectors = filteredCollectors.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <div className="p-2 lg:p-8 animate-fade-in space-y-8 min-h-full">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 overflow-hidden relative p-1">
        <div className="relative z-10">

          <h2 className="text-4xl font-black text-white tracking-tight">Collector <span className="text-gradient">Management</span></h2>
        </div>
        <div className="badge badge-lg glass-strong text-xs font-mono p-4 border-white/10 shadow-xl">
          TOTAL AGENTS: {collectors.length}
        </div>
      </div>

      {/* SEARCH & ADD BAR */}
      <div className="glass p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between z-20 relative border border-white/5">

        {/* Search */}
        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="input input-bordered w-full pl-10 bg-black/20 border-white/10 focus:border-primary/50 text-white placeholder-gray-500 rounded-xl transition-all focus:bg-black/40"
            placeholder="Search Collectors..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Add Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary shadow-lg shadow-primary/20 rounded-xl px-8"
        >
          <span className="text-xl mr-1">+</span> Add Collector
        </button>
      </div>

      {/* TABLE */}
      <div className="glass-card rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="table w-full">
            {/* Header */}
            <thead>
              <tr className="border-b border-white/5 bg-black/20 text-gray-400 text-sm uppercase tracking-wider">
                <th className="py-6 pl-8">Collector Profile</th>
                <th className="py-6">Details</th>
                <th className="py-6">Zone</th>
                <th className="py-6">Status</th>
                <th className="py-6 text-right pr-8">Actions</th>
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-white/5">
              {paginatedCollectors.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-20 text-gray-500">
                    No collectors found.
                  </td>
                </tr>
              ) : (
                paginatedCollectors.map(c => (
                  <tr key={c._id} className="hover:bg-white/5 transition-colors group">

                    {/* Name */}
                    <td className="pl-8 py-4">
                      <div className="flex items-center gap-4">
                        <div className="avatar placeholder">
                          <div className="bg-white/10 text-white rounded-full w-12 border border-white/10 group-hover:border-primary/50 transition-colors">
                            <span className="text-sm font-bold">{c.name.charAt(0)}</span>
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-white text-lg">{c.name}</div>
                          <div className="text-xs text-gray-500 font-mono">ID: {c._id.slice(-6)}</div>
                        </div>
                      </div>
                    </td>

                    {/* Details */}
                    <td className="py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-300 text-sm flex items-center gap-2">
                          📧 {c.email}
                        </span>
                        <span className="text-gray-400 text-xs flex items-center gap-2">
                          📞 {c.phone}
                        </span>
                      </div>
                    </td>

                    {/* Zone */}
                    <td>
                      <div className="badge badge-lg badge-outline text-gray-300 border-white/20 font-mono">
                        {c.zone}
                      </div>
                    </td>

                    {/* Status */}
                    <td>
                      <button
                        onClick={() => toggleStatus(c._id)}
                        className={`badge badge-lg border-0 font-bold cursor-pointer transition-all hover:scale-105 active:scale-95 ${c.status === "available" || c.status === "on_duty" || c.status === "active"
                          ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                          : "bg-gray-700/50 text-gray-400 hover:bg-gray-700/70"
                          }`}
                      >
                        {c.status || "Unknown"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="pr-8 text-right py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit */}
                        <button onClick={() => setEditData(c)} className="btn btn-sm btn-circle btn-ghost text-white/60 hover:text-white hover:bg-white/10">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>

                        {/* History */}
                        <button onClick={() => loadHistory(c._id)} className="btn btn-sm btn-circle btn-ghost text-white/60 hover:text-white hover:bg-white/10">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </button>

                        {/* Delete */}
                        <button onClick={() => deleteCollector(c._id)} className="btn btn-sm btn-circle btn-ghost text-white/60 hover:text-error hover:bg-red-500/20">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <TablePagination
            count={filteredCollectors.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
          />
        </div>
      </div>

      {/* ADD MODAL */}
      <dialog id="add_modal" className={`modal backdrop-blur-sm ${showAddModal ? 'modal-open' : ''}`}>
        <div className="modal-box glass-strong border border-white/10 text-white rounded-3xl max-w-lg shadow-2xl">
          <h3 className="font-black text-2xl mb-6 text-white">Add New Collector</h3>
          <form onSubmit={addCollector} className="space-y-4">
            <div className="form-control w-full">
              <label className="label"><span className="label-text text-gray-400">Full Name</span></label>
              <input
                required
                value={newCollector.name}
                onChange={e => setNewCollector({ ...newCollector, name: e.target.value })}
                className="input input-bordered w-full bg-black/20 focus:bg-black/40 border-white/10 text-white focus:border-primary"
                placeholder="Enter Fullname"
              />
            </div>

            <div className="form-control w-full">
              <label className="label"><span className="label-text text-gray-400">Email Address</span></label>
              <input
                required
                type="email"
                value={newCollector.email}
                onChange={e => setNewCollector({ ...newCollector, email: e.target.value })}
                className="input input-bordered w-full bg-black/20 focus:bg-black/40 border-white/10 text-white focus:border-primary"
                placeholder="Enter E-mail"
              />
            </div>

            <div className="form-control w-full">
              <label className="label"><span className="label-text text-gray-400">Temporary Password</span></label>
              <input
                required
                type="text" // Visible so admin knows what they typed
                value={newCollector.password}
                onChange={e => setNewCollector({ ...newCollector, password: e.target.value })}
                className="input input-bordered w-full bg-black/20 focus:bg-black/40 border-white/10 text-white focus:border-primary"
                placeholder="Enter Temporary Password"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-control w-full">
                <label className="label"><span className="label-text text-gray-400">Phone</span></label>
                <input
                  required
                  value={newCollector.phone}
                  onChange={e => setNewCollector({ ...newCollector, phone: e.target.value })}
                  className="input input-bordered w-full bg-black/20 focus:bg-black/40 border-white/10 text-white focus:border-primary"
                  placeholder=" Enter Phone Number"
                />
              </div>
              <div className="form-control w-full">
                <label className="label"><span className="label-text text-gray-400">Zone</span></label>
                <input
                  required
                  value={newCollector.zone}
                  onChange={e => setNewCollector({ ...newCollector, zone: e.target.value })}
                  className="input input-bordered w-full bg-black/20 focus:bg-black/40 border-white/10 text-white focus:border-primary"
                  placeholder="Enter Zone"
                />
              </div>
            </div>

            <div className="modal-action mt-8">
              <button
                type="button"
                className="btn btn-ghost text-gray-400 hover:text-white"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary px-8">Save Collector</button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button type="button" onClick={() => setShowAddModal(false)}>close</button>
        </form>
      </dialog>

      {/* EDIT MODAL */}
      <dialog id="edit_modal" className={`modal backdrop-blur-sm ${editData ? 'modal-open' : ''}`}>
        <div className="modal-box glass-strong border border-white/10 text-white rounded-3xl max-w-lg shadow-2xl">
          <h3 className="font-black text-2xl mb-6 text-white">Edit Collector</h3>
          {editData && (
            <div className="space-y-4">
              <div className="form-control w-full">
                <label className="label"><span className="label-text text-gray-400">Name</span></label>
                <input value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} className="input input-bordered w-full bg-black/20 focus:bg-black/40 border-white/10 text-white focus:border-primary" />
              </div>
              <div className="form-control w-full">
                <label className="label"><span className="label-text text-gray-400">Email</span></label>
                <input value={editData.email} onChange={e => setEditData({ ...editData, email: e.target.value })} className="input input-bordered w-full bg-black/20 focus:bg-black/40 border-white/10 text-white focus:border-primary" />
              </div>
              <div className="form-control w-full">
                <label className="label"><span className="label-text text-gray-400">Phone</span></label>
                <input value={editData.phone} onChange={e => setEditData({ ...editData, phone: e.target.value })} className="input input-bordered w-full bg-black/20 focus:bg-black/40 border-white/10 text-white focus:border-primary" />
              </div>
              <div className="form-control w-full">
                <label className="label"><span className="label-text text-gray-400">Zone</span></label>
                <input value={editData.zone} onChange={e => setEditData({ ...editData, zone: e.target.value })} className="input input-bordered w-full bg-black/20 focus:bg-black/40 border-white/10 text-white focus:border-primary" />
              </div>
            </div>
          )}
          <div className="modal-action mt-8">
            <button className="btn btn-ghost text-gray-400 hover:text-white" onClick={() => setEditData(null)}>Cancel</button>
            <button className="btn btn-primary px-8" onClick={saveEdit}>Save Changes</button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setEditData(null)}>close</button>
        </form>
      </dialog>

      {/* HISTORY MODAL */}
      <dialog id="history_modal" className={`modal backdrop-blur-sm ${showHistory ? 'modal-open' : ''}`}>
        <div className="modal-box w-11/12 max-w-4xl glass-strong border border-white/10 text-white rounded-3xl shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-2xl text-white">Work History</h3>
            <button className="btn btn-sm btn-circle btn-ghost" onClick={() => setShowHistory(false)}>✕</button>
          </div>

          <div className="overflow-x-auto h-72 rounded-xl border border-white/5 bg-black/20">
            <table className="table table-pin-rows">
              <thead className="text-gray-400 bg-white/5">
                <tr><th>Date</th><th>Household</th><th>Waste Type</th><th>Status</th></tr>
              </thead>
              <tbody className="text-gray-300">
                {historyData.length > 0 ? (
                  historyData.map((h, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors border-white/5">
                      <td className="font-mono text-xs text-gray-400">{new Date(h.requestDate).toLocaleDateString()}</td>
                      <td>{h.household?.name || "N/A"}</td>
                      <td>
                        <span className={`badge badge-sm badge-outline`}>
                          {h.wasteType}
                        </span>
                      </td>
                      <td>
                        <div className={`badge badge-sm border-0 font-bold ${h.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                          }`}>{h.status}</div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4" className="text-center py-8 text-gray-500">No work history found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="modal-action">
            <button className="btn btn-ghost" onClick={() => setShowHistory(false)}>Close Overview</button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setShowHistory(false)}>close</button>
        </form>
      </dialog>

    </div>
  );
}


