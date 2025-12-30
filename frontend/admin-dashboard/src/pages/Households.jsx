import { useEffect, useState } from "react";
import API from "../services/api";

import TablePagination from "../components/TablePagination"; // Import

export default function Households() {

  const [households, setHouseholds] = useState([]);
  const [editData, setEditData] = useState(null);

  const [historyData, setHistoryData] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // 🆕 SEARCH & FILTER
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // 📄 PAGINATION
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    loadHouseholds();
  }, []);

  const loadHouseholds = async () => {
    const res = await API.get("/admin/households");
    setHouseholds(res.data.data || []);
  };

  const toggleStatus = async (id, current) => {
    const status = current === "active" ? "blocked" : "active";
    await API.put(`/admin/households/${id}`, { status });
    loadHouseholds();
  };

  const deleteHousehold = async (id) => {
    if (!window.confirm("Delete this household?")) return;
    await API.delete(`/admin/households/${id}`);
    loadHouseholds();
  };

  const saveEdit = async () => {
    await API.put(`/admin/households/${editData._id}`, editData);
    setEditData(null);
    loadHouseholds();
  };

  const loadHistory = async (id) => {
    const res = await API.get(`/admin/households/${id}/history`);
    setHistoryData(res.data.data || []);
    setShowHistory(true);
  };

  // 🧠 FILTER LOGIC
  const filteredHouseholds = households.filter(h => {
    const text =
      `${h.name} ${h.email} ${h.phone} ${h.zone}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const statusMatch =
      statusFilter === "all" || h.status === statusFilter;

    return text && statusMatch;
  });

  // 📄 PAGINATION SLICE
  const paginatedHouseholds = filteredHouseholds.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <div className="p-2 lg:p-8 animate-fade-in space-y-8 min-h-full">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 overflow-hidden relative p-1">
        <div className="relative z-10">

          <h2 className="text-4xl font-black text-white tracking-tight">Household <span className="text-gradient">Management</span></h2>
        </div>
        <div className="badge badge-lg glass-strong text-xs font-mono p-4 border-white/10 shadow-xl">
          TOTAL USERS: {households.length}
        </div>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="glass p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between relative overflow-visible z-20">

        {/* Search Input */}
        <div className="relative w-full sm:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search residents..."
            className="input input-bordered w-full pl-10 bg-black/20 border-white/10 focus:border-primary/50 text-white placeholder-gray-500 rounded-xl transition-all focus:bg-black/40"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="select select-bordered w-full sm:w-48 bg-black/20 border-white/10 text-white focus:border-primary/50 rounded-xl"
        >
          <option value="all" className="bg-gray-900">All Statuses</option>
          <option value="active" className="bg-gray-900">🟢 Active</option>
          <option value="blocked" className="bg-gray-900">🔴 Blocked</option>
        </select>
      </div>

      {/* TABLE DATA */}
      <div className="glass-card rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="table w-full">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-white/5 bg-black/20 text-gray-400 text-sm uppercase tracking-wider">
                <th className="py-6 pl-8">Resident</th>
                <th className="py-6">Contact Info</th>
                <th className="py-6">Address</th>
                <th className="py-6">Zone</th>
                <th className="py-6">Status</th>
                <th className="py-6">Rewards</th>
                <th className="py-6 text-right pr-8">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {paginatedHouseholds.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-20 text-gray-500">
                    No households found matching your search.
                  </td>
                </tr>
              ) : (
                paginatedHouseholds.map((h, i) => (
                  <tr key={h._id} className="hover:bg-white/5 transition-colors group">
                    {/* Name & Avatar */}
                    <td className="pl-8 py-4">
                      <div className="flex items-center gap-4">
                        <div className="avatar placeholder">
                          <div className="bg-white/10 text-white rounded-full w-10">
                            <span className="text-xs font-bold">{h.name.charAt(0)}</span>
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-white text-lg">{h.name}</div>
                          <div className="text-xs text-gray-500 font-mono">ID: {h._id.slice(-6)}</div>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-300 text-sm flex items-center gap-2">
                          📧 {h.email}
                        </span>
                        <span className="text-gray-400 text-xs flex items-center gap-2">
                          📞 {h.phone}
                        </span>
                      </div>
                    </td>

                    {/* Address */}
                    <td className="py-4">
                      <div className="max-w-xs text-sm text-gray-400 truncate" title={h.address}>
                        {h.address}
                      </div>
                    </td>

                    {/* Zone */}
                    <td className="py-4">
                      <div className="badge badge-outline text-gray-300 border-white/20 p-3 text-xs font-mono">
                        {h.zone}
                      </div>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-4">
                      <button
                        onClick={() => toggleStatus(h._id, h.status)}
                        className={`badge border-0 p-3 font-bold text-xs cursor-pointer transition-all hover:scale-105 active:scale-95 ${h.status === "active"
                          ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                          : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          }`}
                      >
                        {h.status.toUpperCase()}
                      </button>
                    </td>

                    {/* Points */}
                    <td className="py-4">
                      <div className="text-warning font-black text-xl flex items-center gap-1">
                        {h.points} <span className="text-xs font-normal text-warning/50">pts</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="pr-8 text-right py-4">
                      <div className="flex items-center justify-end gap-2">

                        {/* Edit Button */}
                        <button
                          onClick={() => setEditData(h)}
                          className="btn btn-sm btn-circle btn-ghost text-white/60 hover:text-white hover:bg-blue-500/20"
                          title="Edit Details"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>

                        {/* History Button */}
                        <button
                          onClick={() => loadHistory(h._id)}
                          className="btn btn-sm btn-circle btn-ghost text-white/60 hover:text-white hover:bg-purple-500/20"
                          title="View History"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => deleteHousehold(h._id)}
                          className="btn btn-sm btn-circle btn-ghost text-white/60 hover:text-error hover:bg-red-500/20"
                          title="Delete User"
                        >
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
            count={filteredHouseholds.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
          />
        </div>
      </div>

      {/* EDIT MODAL */}
      <dialog id="edit_modal" className={`modal backdrop-blur-sm ${editData ? 'modal-open' : ''}`}>
        <div className="modal-box glass-strong border border-white/10 text-white rounded-3xl max-w-lg shadow-2xl">
          <h3 className="font-black text-2xl mb-6 text-white">Edit Household</h3>
          {editData && (
            <div className="space-y-4">
              <div className="form-control w-full">
                <label className="label"><span className="label-text text-gray-400">Full Name</span></label>
                <input value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} className="input input-bordered w-full bg-black/20 focus:bg-black/40 border-white/10 text-white focus:border-primary" />
              </div>

              <div className="form-control w-full">
                <label className="label"><span className="label-text text-gray-400">Email Address</span></label>
                <input value={editData.email} onChange={e => setEditData({ ...editData, email: e.target.value })} className="input input-bordered w-full bg-black/20 focus:bg-black/40 border-white/10 text-white focus:border-primary" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control w-full">
                  <label className="label"><span className="label-text text-gray-400">Phone</span></label>
                  <input value={editData.phone} onChange={e => setEditData({ ...editData, phone: e.target.value })} className="input input-bordered w-full bg-black/20 focus:bg-black/40 border-white/10 text-white focus:border-primary" />
                </div>
                <div className="form-control w-full">
                  <label className="label"><span className="label-text text-gray-400">Zone</span></label>
                  <input value={editData.zone} onChange={e => setEditData({ ...editData, zone: e.target.value })} className="input input-bordered w-full bg-black/20 focus:bg-black/40 border-white/10 text-white focus:border-primary" />
                </div>
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
            <h3 className="font-black text-2xl text-white">Collection History</h3>
            <button className="btn btn-sm btn-circle btn-ghost" onClick={() => setShowHistory(false)}>✕</button>
          </div>

          <div className="overflow-x-auto h-72 rounded-xl border border-white/5 bg-black/20">
            <table className="table table-pin-rows">
              <thead className="text-gray-400 bg-white/5">
                <tr><th>Date</th><th>Collector</th><th>Waste Type</th><th>Weight</th><th>Points</th><th>Points Status</th><th>Status</th></tr>
              </thead>
              <tbody className="text-gray-300">
                {historyData.length > 0 ? (
                  historyData.map((h, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors border-white/5">
                      <td className="font-mono text-xs text-gray-400">{new Date(h.requestDate).toLocaleDateString()}</td>
                      <td>{h.assignedCollector?.name || <span className="opacity-50 italic">Unassigned</span>}</td>
                      <td>
                        <span className={`badge badge-sm badge-outline ${h.wasteType === 'Organic' ? 'badge-success' : 'badge-warning'}`}>
                          {h.wasteType}
                        </span>
                      </td>
                      <td>
                        <span className="font-mono text-gray-300">{h.weight ? `${h.weight} kg` : '-'}</span>
                      </td>
                      <td>
                        <span className="font-bold text-warning">{h.points > 0 ? `+${h.points}` : '-'}</span>
                      </td>
                      <td>
                        {h.points > 0 ? (
                          <div className={`badge badge-sm border-0 font-bold text-[10px] uppercase ${h.isRedeemed ? 'bg-blue-500/10 text-blue-500' :
                              h.isExpired ? 'bg-red-500/10 text-red-500' :
                                h.rewardStatus === 'approved' ? 'bg-green-500/10 text-green-500' :
                                  h.rewardStatus === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                    'bg-gray-500/10 text-gray-500'
                            }`}>
                            {h.isRedeemed ? 'Used' : h.isExpired ? 'Expired' : h.rewardStatus || 'Pending'}
                          </div>
                        ) : <span className="text-gray-600 text-xs">-</span>}
                      </td>
                      <td>
                        <div className={`badge badge-sm border-0 font-bold ${h.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          h.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>{h.status}</div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4" className="text-center py-8 text-gray-500">No history available for this user.</td></tr>
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
