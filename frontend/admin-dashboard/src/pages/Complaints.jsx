import { useEffect, useState } from "react";
import API from "../services/api";

import TablePagination from "../components/TablePagination"; // Import

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  // 📄 PAGINATION
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      const res = await API.get("/admin/complaints");
      setComplaints(res.data.data || []);
    } catch {
      alert("Failed to load complaints");
    }
  };

  // 📄 PAGINATION SLICE
  const paginatedComplaints = complaints.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const acknowledgeComplaint = async (id) => {
    try {
      await API.put(`/admin/complaints/${id}`, {
        adminNote: "Thank you for contacting. We will soon solve the issue, thank you."
      });
      loadComplaints();
    } catch {
      alert("Failed to send reply");
    }
  };

  const markResolved = async (id) => {
    // Just mark as resolved
    try {
      await API.put(`/admin/complaints/${id}`, {
        status: "resolved"
      });
      loadComplaints();
      window.dispatchEvent(new Event("refreshSidebar"));
    } catch {
      alert("Failed to update complaint");
    }
  };

  const pendingCount = complaints.filter(c => c.status !== 'resolved').length;

  return (
    <div className="p-2 lg:p-8 animate-fade-in space-y-8 min-h-full">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 overflow-hidden relative p-1">
        <div className="relative z-10">

          <h2 className="text-4xl font-black text-white tracking-tight">Complaints <span className="text-gradient">Tracker</span></h2>
        </div>
        <div className="flex gap-4">
          <div className="badge badge-lg glass-strong text-xs font-mono p-4 border-white/10 shadow-xl text-error">
            PENDING: {pendingCount}
          </div>
          <div className="badge badge-lg glass-strong text-xs font-mono p-4 border-white/10 shadow-xl">
            TOTAL: {complaints.length}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="glass-card rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
        <div className="overflow-x-auto h-[75vh]">
          <table className="table w-full relative">
            <thead>
              <tr className="border-b border-white/5 bg-black/20 text-gray-400 text-sm uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md">
                <th className="py-6 pl-8">User Profile</th>
                <th className="py-6">Complaint</th>
                <th className="py-6 text-center">Evidence</th>
                <th className="py-6">Status</th>
                <th className="py-6">Admin Note</th>
                <th className="py-6 text-right pr-8">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {paginatedComplaints.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-20 opacity-50 text-lg">
                    No complaints found. Good job! 🎉
                  </td>
                </tr>
              ) : (
                paginatedComplaints.map(c => (
                  <tr key={c._id} className="hover:bg-white/5 border-b border-white/5 transition-colors group">

                    {/* User Profile */}
                    <td className="pl-8 py-4">
                      <div className="flex items-center gap-4">
                        <div className={`avatar placeholder`}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${c.userType === 'collector' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                            {c.user?.name ? c.user.name.charAt(0) : '?'}
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-white text-base">{c.user?.name || "Unknown"}</div>
                          <div className={`badge badge-xs text-[10px] uppercase font-bold mt-1 border-0 ${c.userType === 'collector' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'}`}>
                            {c.userType}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Complaint */}
                    <td className="py-4">
                      <div className="max-w-md">
                        <p className="text-gray-300 text-sm leading-relaxed">{c.message}</p>
                        <span className="text-[10px] text-gray-500 font-mono mt-1 block">{new Date(c.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </td>

                    {/* Evidence */}
                    <td className="py-4 text-center">
                      <div className="flex justify-center">
                        {c.image ? (
                          <div className="avatar hover:z-20 transition-transform hover:scale-110" onClick={() => setPreviewImage(c.image)}>
                            <div className="w-12 h-12 rounded-xl ring-1 ring-white/10 cursor-pointer shadow-lg bg-black/50">
                              <img src={`http://localhost:5000/uploads/${c.image}`} alt="Evidence" className="object-cover" />
                            </div>
                          </div>
                        ) : <span className="text-xs text-gray-600 italic">No Image</span>}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4">
                      <div className={`badge border-0 font-bold uppercase tracking-wider text-[10px] p-3 ${c.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400 animate-pulse'
                        }`}>
                        {c.status}
                      </div>
                    </td>

                    {/* Note */}
                    <td className="py-4">
                      {c.adminNote ? (
                        <span className="text-sm text-gray-400 italic">"{c.adminNote}"</span>
                      ) : (
                        <span className="text-white/10 text-xs opacity-50">Pending Reply</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="pr-8 text-right py-4">
                      <div className="flex gap-2 justify-end">
                        {/* Acknowledge Button */}
                        {c.status !== "resolved" && !c.adminNote && (
                          <button
                            onClick={() => acknowledgeComplaint(c._id)}
                            className="btn btn-sm glass text-blue-400 hover:bg-blue-500/20 border-blue-500/30 gap-2 font-bold"
                            title="Send Auto-Reply"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            Reply
                          </button>
                        )}

                        {/* Resolve Button */}
                        {c.status !== "resolved" ? (
                          <button
                            onClick={() => markResolved(c._id)}
                            className="btn btn-sm glass text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/30 gap-2 font-bold"
                            title="Mark Resolved"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                            Resolve
                          </button>
                        ) : (
                          <span className="text-emerald-500 flex items-center gap-1 text-xs font-bold px-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            Done
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <TablePagination
            count={complaints.length}
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
    </div>
  );
}
