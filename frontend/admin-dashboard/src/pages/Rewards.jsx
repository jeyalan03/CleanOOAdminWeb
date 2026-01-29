import { useEffect, useState } from "react";
import API from "../services/api";
import ConfirmModal from "../components/ConfirmModal";

import TablePagination from "../components/TablePagination"; // Import

export default function Rewards() {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ message: "", type: "" });

  // 📄 PAGINATION
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    isDangerous: false,
    confirmText: "Confirm"
  });

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/rewards");
      setRewards(res.data.data || []);
    } catch {
      // Fail silently
    }
    setLoading(false);
  };

  // 📄 PAGINATION SLICE
  const paginatedRewards = rewards.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const approve = async (id) => {
    const reward = rewards.find(r => r._id === id);
    if (!reward) return;

    // Calculate Expiry Date (Created Date + 6 Months)
    const expiryDate = new Date(reward.createdAt);
    expiryDate.setMonth(expiryDate.getMonth() + 6);

    setConfirmModal({
      isOpen: true,
      title: "Approve Reward?",
      message: `Points will be credited. Expiry: ${expiryDate.toLocaleDateString()}`,
      confirmText: "Approve",
      isDangerous: false,
      onConfirm: async () => {
        try {
          await API.put(`/admin/rewards/approve/${id}`);
          window.dispatchEvent(new Event("refreshSidebar")); // 🚀 Update Sidebar Badge
          loadRewards(); // Refresh list to show status change
          setFeedback({ message: "Reward approved", type: "success" });
          setTimeout(() => setFeedback({ message: "", type: "" }), 3000);
        } catch (err) {
          setFeedback({ message: "Failed to approve", type: "error" });
        }
      }
    });
  };

  const reject = async (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Reject Reward?",
      message: "This request will be rejected permanently.",
      confirmText: "Reject",
      isDangerous: true,
      onConfirm: async () => {
        try {
          await API.put(`/admin/rewards/reject/${id}`);
          loadRewards();
          window.dispatchEvent(new Event("refreshSidebar")); // 🚀 Update Sidebar Badge
          setFeedback({ message: "Reward rejected", type: "success" });
          setTimeout(() => setFeedback({ message: "", type: "" }), 3000);
        } catch (err) {
          setFeedback({ message: "Failed to reject", type: "error" });
        }
      }
    });
  };

  const totalPointsDistributed = rewards
    .filter(r => r.status === 'approved')
    .reduce((acc, curr) => acc + (curr.points || 0), 0);

  return (
    <div className="p-2 lg:p-8 animate-fade-in space-y-8 min-h-full">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 overflow-hidden relative p-1">
        <div className="relative z-10">

          <h2 className="text-4xl font-black text-white tracking-tight">Reward <span className="text-gradient-gold">Center</span></h2>
        </div>

        {/* STATS */}
        <div className="flex gap-4">
          <div className="badge badge-lg glass-strong text-xs font-mono p-4 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)] text-amber-400">
            PENDING: {rewards.filter(r => r.status === 'pending').length}
          </div>

          <div className="glass-strong rounded-xl p-3 px-6 flex flex-col items-end border border-amber-500/20 shadow-lg">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Total Distributed</span>
            <span className="text-2xl font-black text-amber-400">{totalPointsDistributed.toLocaleString()} <span className="text-sm text-gray-500">PTS</span></span>
          </div>
        </div>
      </div>


      {feedback.message && <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg mb-4 text-sm py-2 rounded-xl`}><span>{feedback.message}</span></div>}

      {loading && <div className="text-center py-10"><span className="loading loading-spinner loading-lg text-primary"></span></div>}

      <div className="glass-card rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
        <div className="overflow-x-auto h-[75vh]">
          <table className="table w-full relative">
            <thead>
              <tr className="border-b border-white/5 bg-black/20 text-gray-400 text-sm uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md">
                <th className="py-6 pl-8">Beneficiary</th>
                <th className="py-6">Recyclable Item</th>
                <th className="py-6">Weight</th>
                <th className="py-6">Points Value</th>
                <th className="py-6">Verified Date</th>
                <th className="py-6">Expiry Date</th>
                <th className="py-6">Status</th>
                <th className="py-6 text-right pr-8">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 text-gray-300">
              {paginatedRewards.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="text-center py-20 opacity-50 text-lg">
                    No reward records found.
                  </td>
                </tr>
              )}

              {paginatedRewards.map((r) => (
                <tr key={r._id} className="hover:bg-white/5 border-b border-white/5 transition-colors group">

                  {/* Beneficiary */}
                  <td className="pl-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className="avatar placeholder">
                        <div className="bg-amber-500/10 text-amber-400 w-10 h-10 rounded-full border border-amber-500/20">
                          <span className="font-bold">{r.household?.name ? r.household.name.charAt(0) : '$'}</span>
                        </div>
                      </div>
                      <div className="font-bold text-white">{r.household?.name || "Unknown"}</div>
                    </div>
                  </td>

                  {/* Waste Type */}
                  <td className="py-4">
                    <div className="badge badge-outline border-white/20 text-gray-300 font-mono text-xs">
                      {r.wasteType}
                    </div>
                  </td>

                  {/* Weight */}
                  <td className="py-4">
                    <span className="font-mono text-gray-300">
                      {r.pickup?.weight ? `${r.pickup.weight} kg` : '-'}
                    </span>
                  </td>

                  {/* Points */}
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 font-black text-lg">+{r.points}</span>
                      <span className="text-[10px] text-gray-500 font-bold bg-amber-500/10 px-1 rounded">PTS</span>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="py-4 text-sm font-mono text-gray-400">
                    {r.pickup?.requestDate
                      ? new Date(r.pickup.requestDate).toLocaleDateString()
                      : "—"}
                  </td>

                  {/* Expiry Date */}
                  <td className="py-4 text-sm font-mono text-gray-400">
                    {(() => {
                      if (!r.createdAt) return "—";
                      const exp = new Date(r.createdAt);
                      exp.setMonth(exp.getMonth() + 6);
                      return exp.toLocaleDateString();
                    })()}
                  </td>

                  {/* Status */}
                  <td className="py-4">
                    <div className={`badge border-0 font-bold uppercase tracking-wider text-[10px] p-3 ${r.status === "approved" ? "bg-emerald-500/20 text-emerald-400" :
                      r.status === "rejected" ? "bg-red-500/20 text-red-400" :
                        "bg-amber-500/20 text-amber-400 animate-pulse"
                      }`}>
                      {r.status}
                    </div>
                  </td>

                  {/* Action */}
                  <td className="pr-8 text-right py-4">
                    {r.status === "pending" ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => approve(r._id)}
                          className="btn btn-sm btn-ghost btn-circle text-emerald-400 hover:bg-emerald-500/20 tooltip tooltip-left"
                          data-tip="Approve"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        </button>
                        <button
                          onClick={() => reject(r._id)}
                          className="btn btn-sm btn-ghost btn-circle text-red-400 hover:bg-red-500/20 tooltip tooltip-left"
                          data-tip="Reject"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-600 font-mono">CLOSED</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <TablePagination
            count={rewards.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
          />
        </div>
      </div>
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isDangerous={confirmModal.isDangerous}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
      />
    </div >
  );
}
