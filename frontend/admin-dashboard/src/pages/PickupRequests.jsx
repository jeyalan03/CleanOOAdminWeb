import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import ConfirmModal from "../components/ConfirmModal";

import TablePagination from "../components/TablePagination"; // Import

export default function PickupRequests() {

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [feedback, setFeedback] = useState({ message: "", type: "" });

  const [pickups, setPickups] = useState([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // 📄 PAGINATION
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [previewImage, setPreviewImage] = useState(null);

  const navigate = useNavigate();

  // ⚖️ WEIGHT MODAL STATE
  const [weightModalOpen, setWeightModalOpen] = useState(false);
  const [selectedPickupId, setSelectedPickupId] = useState(null);

  // 🗑️ CONFIRM MODAL STATE
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    isDangerous: false,
    confirmText: "Confirm"
  });

  const selectedPickup = pickups.find(p => p._id === selectedPickupId);

  const initiateCompletion = (id) => {
    setSelectedPickupId(id);
    setWeightModalOpen(true);
  };

  const confirmCompletion = async () => {
    // Backend will use existing weight if we don't send one
    await markStatus(selectedPickupId, "completed", null, true); // true = skip confirm
    setWeightModalOpen(false);
    window.dispatchEvent(new Event("refreshSidebar"));
  };

  useEffect(() => {
    loadPickups();
  }, []);

  // LOAD PICKUPS
  const loadPickups = async (opts = {}) => {
    try {
      const res = await API.get("/admin/pickups", { params: opts });
      setPickups(res.data.data || []);
      setPage(0); // Reset URL pagination on new fetch
    } catch {
      setFeedback({ message: "Failed to load pickups", type: "error" });
    }
  };

  // 📄 PAGINATION SLICE
  const paginatedPickups = pickups.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // SEARCH
  const search = (e) => {
    e.preventDefault();
    loadPickups({ q, status: statusFilter, from, to });
  };

  const clear = () => {
    setQ("");
    setStatusFilter("");
    setFrom("");
    setTo("");
    loadPickups({});
  };

  // UPDATE STATUS
  const markStatus = async (id, status, weight = null, skipConfirm = false) => {
    const executeUpdate = async () => {
      try {
        await API.put(`/admin/pickups/status/${id}`, { status, weight });
        loadPickups({ q, status: statusFilter });
        window.dispatchEvent(new Event("refreshSidebar"));
        setFeedback({ message: `Status updated to ${status}`, type: "success" });
        setTimeout(() => setFeedback({ message: "", type: "" }), 3000);
      } catch {
        setFeedback({ message: "Status update failed", type: "error" });
      }
    };

    if (skipConfirm) {
      await executeUpdate();
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Update Status?",
      message: `Are you sure you want to change the status to ${status}?`,
      confirmText: "Yes, Update",
      isDangerous: status === 'cancelled',
      onConfirm: executeUpdate
    });
  };

  // SEND WARNING
  const sendWarning = async (householdId) => {
    setConfirmModal({
      isOpen: true,
      title: "Send Warning?",
      message: "This will send a formal warning to the household. Continue?",
      confirmText: "Send Warning",
      isDangerous: true,
      onConfirm: async () => {
        try {
          await API.put(`/admin/pickups/warning/${householdId}`);
          setFeedback({ message: "Warning sent successfully", type: "success" });
          setTimeout(() => setFeedback({ message: "", type: "" }), 3000);
        } catch {
          setFeedback({ message: "Failed to send warning", type: "error" });
        }
      }
    });
  };

  return (
    <div className="p-2 lg:p-8 animate-fade-in space-y-8 min-h-full">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 overflow-hidden relative p-1">
        <div className="relative z-10">

          <h2 className="text-4xl font-black text-white tracking-tight">Pickup <span className="text-gradient">Requests</span></h2>
        </div>
        <div className="badge badge-lg glass-strong text-xs font-mono p-4 border-white/10 shadow-xl">
          TOTAL REQUESTS: {pickups.length}
        </div>
      </div>

      {/* FEEDBACK STATUS */}
      {feedback.message && <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg mb-4 text-sm py-2 rounded-xl`}><span>{feedback.message}</span></div>}

      {/* SEARCH & FILTERS */}
      <div className="glass p-4 rounded-2xl z-20 relative border border-white/5 overflow-x-auto">
        <form onSubmit={search} className="flex flex-row gap-3 items-center min-w-max">

          {/* Text Search */}
          <div className="relative w-64 xl:w-80 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              placeholder="Search..."
              value={q}
              onChange={e => setQ(e.target.value)}
              className="input input-bordered w-full pl-10 bg-black/20 border-white/10 text-white placeholder-gray-500 rounded-xl focus:border-primary/50 transition-all focus:bg-black/40"
            />
          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="select select-bordered w-36 bg-black/20 border-white/10 text-white rounded-xl focus:border-primary/50"
          >
            <option value="" className="bg-gray-900">All Status</option>
            <option value="pending" className="bg-gray-900">Pending</option>
            <option value="assigned" className="bg-gray-900">Assigned</option>
            <option value="picked" className="bg-gray-900">Picked</option>
            <option value="completed" className="bg-gray-900">Completed</option>
            <option value="cancelled" className="bg-gray-900">Cancelled</option>
          </select>

          {/* Date Group */}
          <div className="flex items-center gap-2 bg-black/20 p-1 px-3 rounded-xl border border-white/5 whitespace-nowrap">
            <input
              type="date"
              value={from}
              onChange={e => setFrom(e.target.value)}
              className="bg-transparent border-0 text-white focus:outline-none w-28 text-xs cursor-pointer"
              title="From Date"
            />
            <span className="text-gray-500">-</span>
            <input
              type="date"
              value={to}
              onChange={e => setTo(e.target.value)}
              className="bg-transparent border-0 text-white focus:outline-none w-28 text-xs cursor-pointer"
              title="To Date"
            />
          </div>

          {/* Buttons */}
          <button type="submit" className="btn btn-primary shadow-lg shadow-primary/20 rounded-xl px-6 whitespace-nowrap">Search</button>
          <button type="button" onClick={clear} className="btn btn-outline border-white/20 text-gray-300 hover:text-white hover:border-white/50 rounded-xl px-4 whitespace-nowrap hover:bg-white/5">Clear</button>

        </form>
      </div>

      {/* GLOBAL ACTIONS */}
      <div className="flex flex-wrap gap-4">
        <button onClick={() => loadPickups()} className="btn btn-sm btn-ghost gap-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Refresh Data
        </button>


      </div>

      {/* TABLE */}
      <div className="glass-card rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
        <div className="overflow-x-auto h-[65vh]">
          <table className="table w-full relative">
            <thead>
              <tr className="border-b border-white/5 bg-black/20 text-gray-400 text-xs uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md">
                <th className="py-4 pl-4">Request</th>
                <th className="py-4">Zone</th>
                <th className="py-4">Location</th>
                <th className="py-4 text-center">H. Ev</th>
                <th className="py-4 text-center">C. Ev</th>
                <th className="py-4">Weight</th>
                <th className="py-4">Assignment</th>
                <th className="py-4">Status</th>
                <th className="py-4 text-right pr-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 text-gray-300 text-xs">
              {paginatedPickups.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-20 opacity-50 text-lg">
                    No pickup requests found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedPickups.map(p => (
                  <tr key={p._id} className="hover:bg-white/5 border-b border-white/5 transition-colors">

                    {/* Request Info */}
                    <td className="pl-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-sm">{p.household?.name || "Unknown"}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="badge badge-xs badge-outline text-[10px] text-gray-400 border-white/20 capitalize">{p.wasteType}</span>
                          <span className="text-[10px] text-gray-500">{new Date(p.requestDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </td>

                    {/* Zone */}
                    <td className="py-3">
                      <span className="badge badge-sm bg-primary/10 text-primary border-0 font-mono">
                        {p.assignedCollector?.zone || (p.household?.zone !== "Unassigned" ? p.household?.zone : "-")}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="py-3">
                      <div className="max-w-[150px] truncate text-gray-400 font-mono" title={p.address}>
                        {p.address}
                      </div>
                    </td>

                    {/* Household Evidence */}
                    <td className="py-3 text-center">
                      <div className="flex justify-center">
                        {p.householdImage ? (
                          <div className="avatar hover:z-20 transition-transform hover:scale-110" onClick={() => setPreviewImage(p.householdImage)}>
                            <div className="w-8 h-8 rounded-lg ring-1 ring-white/10 cursor-pointer shadow-lg">
                              <img src={`http://localhost:5000/uploads/${p.householdImage}`} alt="H" className="object-cover" />
                            </div>
                          </div>
                        ) : <span className="opacity-20">-</span>}
                      </div>
                    </td>

                    {/* Collector Evidence */}
                    <td className="py-3 text-center">
                      <div className="flex justify-center">
                        {p.collectorImage ? (
                          <div className="avatar hover:z-20 transition-transform hover:scale-110" onClick={() => setPreviewImage(p.collectorImage)}>
                            <div className="w-8 h-8 rounded-lg ring-1 ring-primary/30 cursor-pointer shadow-lg">
                              <img src={`http://localhost:5000/uploads/${p.collectorImage}`} alt="C" className="object-cover" />
                            </div>
                          </div>
                        ) : <span className="opacity-20">-</span>}
                      </div>
                    </td>

                    {/* Weight */}
                    <td className="py-3">
                      <span className="font-mono text-gray-300 font-bold">
                        {p.weight ? `${p.weight} kg` : '-'}
                      </span>
                    </td>

                    {/* Assignment */}
                    <td className="py-3">
                      {p.assignedCollector ? (
                        <div className="flex items-center gap-2">
                          <div className="avatar placeholder">
                            <div className="bg-primary/20 text-primary w-6 h-6 rounded-full">
                              <span className="text-[10px]">{p.assignedCollector.name.charAt(0)}</span>
                            </div>
                          </div>
                          <span className="font-medium text-white max-w-[80px] truncate">{p.assignedCollector.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-600 italic">Unassigned</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3">
                      <div className={`badge border-0 font-bold uppercase tracking-wider text-[9px] p-2 ${p.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                        p.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                          p.status === 'assigned' ? 'bg-blue-500/10 text-blue-400' :
                            p.status === 'picked' ? 'bg-purple-500/10 text-purple-400' :
                              'bg-yellow-500/10 text-yellow-400'
                        }`}>
                        {p.status}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="pr-4 text-right py-3">
                      <div className="flex items-center justify-end gap-1">
                        {/* Assign: Only if Pending */}
                        {p.status === 'pending' && (
                          <button onClick={() => navigate(`/pickups/assign/${p._id}`)} className="btn btn-xs glass btn-primary text-white border-0 hover:bg-primary/80" title="Assign Collector">
                            Assign
                          </button>
                        )}

                        {/* Complete: If assigned/picked */}
                        {(p.status === 'assigned' || p.status === 'picked') && (
                          <button onClick={() => initiateCompletion(p._id)} className="btn btn-circle btn-xs btn-ghost text-emerald-400 hover:bg-emerald-500/20" title="Mark Completed">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                          </button>
                        )}

                        {/* Warning */}
                        <button onClick={() => sendWarning(p.household?._id)} className="btn btn-circle btn-xs btn-ghost text-amber-400 hover:bg-amber-500/20" title="Send Warning">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </button>

                        {/* Cancel: If not done */}
                        {p.status !== "completed" && p.status !== "cancelled" && (
                          <button onClick={() => markStatus(p._id, "cancelled")} className="btn btn-circle btn-xs btn-ghost text-red-400 hover:bg-red-500/20" title="Cancel Request">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <TablePagination
            count={pickups.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
          />
        </div>
      </div>

      {/* IMAGE PREVIEW MODAL */}
      <dialog className={`modal backdrop-blur-md ${previewImage ? 'modal-open' : ''}`} onClick={() => setPreviewImage(null)}>
        <div className="modal-box max-w-4xl p-0 overflow-hidden bg-transparent shadow-none relative" onClick={e => e.stopPropagation()}>
          <button className="btn btn-circle btn-sm absolute right-2 top-2 glass text-white z-50" onClick={() => setPreviewImage(null)}>✕</button>
          {previewImage && (
            <img
              src={`http://localhost:5000/uploads/${previewImage}`}
              alt="preview"
              className="w-full h-auto max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
          )}
        </div>

      </dialog>

      {/* WEIGHT INPUT MODAL */}
      <dialog className={`modal backdrop-blur-sm ${weightModalOpen ? 'modal-open' : ''}`}>
        <div className="modal-box glass-card border border-white/10">
          <h3 className="font-bold text-lg text-white mb-4">Complete Pickup</h3>
          <p className="text-gray-400 text-sm mb-4">
            Confirm completion for this request? The weight uploaded by the collector will be used to calculate rewards.
          </p>

          <div className="bg-black/30 p-4 rounded-xl border border-white/5 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-bold uppercase text-xs tracking-wider">Collector's Weight</span>
              <span className="text-2xl font-mono font-black text-emerald-400">
                {selectedPickup?.weight || 0} <span className="text-sm text-gray-500">kg</span>
              </span>
            </div>
            {(!selectedPickup?.weight || selectedPickup.weight <= 0) && (
              <div className="mt-2 text-amber-500 text-xs flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                Warning: No weight recorded by collector yet.
              </div>
            )}
          </div>

          <div className="modal-action">
            <button className="btn btn-ghost text-gray-400" onClick={() => setWeightModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={confirmCompletion}>Confirm & Complete</button>
          </div>
        </div>
      </dialog>
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isDangerous={confirmModal.isDangerous}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
      />
    </div>
  );
}
