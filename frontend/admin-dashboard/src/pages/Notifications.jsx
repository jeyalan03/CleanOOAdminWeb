import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Notifications() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("all");
  const [targetValue, setTargetValue] = useState("");
  const [feedback, setFeedback] = useState({ message: "", type: "" });

  const [zones, setZones] = useState([]);
  const [households, setHouseholds] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("inbox"); // 'inbox' | 'broadcast'
  const [alerts, setAlerts] = useState([]);



  const loadHistory = useCallback(async () => {
    try {
      const res = await API.get("/admin/notifications");
      const all = res.data.data || [];
      setLogs(all.filter(n => n.type !== "admin_alert"));
      setAlerts(all.filter(n => n.type === "admin_alert"));
    } catch {
      // Silent fail
    }
  }, []);

  const loadLists = useCallback(async () => {
    try {
      const [h, c] = await Promise.all([
        API.get("/admin/households"),
        API.get("/admin/collectors")
      ]);

      setHouseholds(h.data.data || []);
      setCollectors(c.data.data || []);
      const z = [...new Set((h.data.data || []).map(h => h.zone).filter(Boolean))];
      setZones(z);

    } catch {
      setFeedback({ message: "Failed to load lists", type: "error" });
    }
  }, []);

  useEffect(() => {
    loadHistory();
    loadLists();
  }, [loadHistory, loadLists]);

  const sendNotification = async (e) => {
    e.preventDefault();

    if (!title || !message) {
      setFeedback({ message: "Title & message required", type: "warning" });
      return;
    }

    try {
      await API.post("/admin/notifications/send", {
        title,
        message,
        target,
        targetValue
      });
      setFeedback({ message: "Notification sent", type: "success" });
      setTimeout(() => setFeedback({ message: "", type: "" }), 3000);
      setTitle("");
      setMessage("");
      setTarget("all");
      setTargetValue("");
      loadHistory();
    } catch {
      setFeedback({ message: "Failed to send", type: "error" });
    }
  };

  return (
    <div className="p-2 lg:p-8 animate-fade-in space-y-8 min-h-full">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 overflow-hidden relative p-1">
        <div className="relative z-10">

          <h2 className="text-4xl font-black text-white tracking-tight">Notification <span className="text-gradient">Center</span></h2>
        </div>

        <div className="flex bg-black/40 p-1 rounded-xl">
          <button
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'inbox' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('inbox')}
          >
            Inbox {alerts.filter(a => !a.isRead).length > 0 && <span className="badge badge-warning badge-xs ml-2">{alerts.filter(a => !a.isRead).length}</span>}
          </button>
          <button
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'broadcast' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('broadcast')}
          >
            Broadcast
          </button>
        </div>
      </div>

      {feedback.message && <div className={`alert ${feedback.type === 'success' ? 'alert-success' : feedback.type === 'warning' ? 'alert-warning' : 'alert-error'} shadow-lg mb-4 text-sm py-2 rounded-xl`}><span>{feedback.message}</span></div>}

      {activeTab === 'inbox' ? (
        <div className="glass-card rounded-3xl p-8 border border-white/5 shadow-2xl min-h-[50vh]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">System Alerts</h3>
            <button
              className="btn btn-sm btn-ghost text-primary"
              onClick={async () => {
                await API.put("/admin/notifications/mark-read");
                loadHistory(); // refresh local list
                window.dispatchEvent(new Event("refreshSidebar")); // update sidebar immediately
              }}
            >
              Mark All Read
            </button>
          </div>

          <div className="space-y-4">
            {alerts.length === 0 && <p className="text-center text-gray-500 py-10">No alerts.</p>}
            {alerts.map(alert => (
              <div
                key={alert._id}
                onClick={() => {
                  const t = alert.title.toLowerCase();
                  if (t.includes("pickup") || t.includes("request")) navigate("/pickups");
                  else if (t.includes("complaint") || t.includes("issue")) navigate("/complaints");
                  else if (t.includes("reward") || t.includes("payment")) navigate("/rewards");
                }}
                className={`p-4 rounded-xl border cursor-pointer hover:scale-[1.01] active:scale-[0.99] ${alert.isRead ? 'border-white/5 bg-white/5 opacity-60' : 'border-primary/30 bg-primary/10'} transition-all`}
              >
                <div className="flex justify-between items-start">
                  <h4 className={`font-bold ${alert.isRead ? 'text-gray-300' : 'text-white'}`}>{alert.title}</h4>
                  <span className="text-xs text-gray-500">{new Date(alert.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-gray-400 text-sm mt-1">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* SEND FORM */}
          <div className="lg:col-span-1">
            <div className="glass p-6 rounded-3xl sticky top-8 border border-white/5 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                New Message
              </h3>
              <form onSubmit={sendNotification} className="flex flex-col gap-4">
                <div className="form-control w-full">
                  <label className="label"><span className="label-text text-gray-400">Title</span></label>
                  <input className="input input-bordered w-full bg-black/20 border-white/10 text-white focus:border-primary/50" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Subject" />
                </div>

                <div className="form-control w-full">
                  <label className="label"><span className="label-text text-gray-400">Details</span></label>
                  <textarea className="textarea textarea-bordered h-32 bg-black/20 border-white/10 text-white focus:border-primary/50" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your message..." />
                </div>

                <div className="form-control w-full">
                  <label className="label"><span className="label-text text-gray-400">Audience</span></label>
                  <select className="select select-bordered w-full bg-black/20 border-white/10 text-white focus:border-primary/50" value={target} onChange={(e) => { setTarget(e.target.value); setTargetValue(""); }}>
                    <option value="all" className="bg-gray-900">All Users</option>
                    <option value="all_households" className="bg-gray-900">All Households</option>
                    <option value="all_collectors" className="bg-gray-900">All Collectors</option>
                    <option value="zone" className="bg-gray-900">Specific Zone</option>
                    <option value="single_household" className="bg-gray-900">Single Household</option>
                    <option value="single_collector" className="bg-gray-900">Single Collector</option>
                  </select>
                </div>

                {/* Dynamic Target Selection */}
                {["zone", "single_household", "single_collector"].includes(target) && (
                  <div className="form-control w-full animate-fade-in-up">
                    <label className="label"><span className="label-text text-primary">Select Specific Target</span></label>
                    <select className="select select-bordered w-full bg-black/40 border-primary/30 text-white focus:border-primary" value={targetValue} onChange={e => setTargetValue(e.target.value)}>
                      <option value="" className="bg-gray-900">Choose...</option>
                      {target === "zone" && zones.map(z => <option key={z} value={z} className="bg-gray-900">{z}</option>)}
                      {target === "single_household" && households.map(h => <option key={h._id} value={h._id} className="bg-gray-900">{h.name}</option>)}
                      {target === "single_collector" && collectors.map(c => <option key={c._id} value={c._id} className="bg-gray-900">{c.name}</option>)}
                    </select>
                  </div>
                )}

                <button className="btn btn-primary w-full mt-4 shadow-lg shadow-primary/20">Send Notification</button>
              </form>
            </div>
          </div>

          {/* HISTORY LOG */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-3xl overflow-hidden border border-white/5 shadow-2xl h-[75vh]">
              <div className="p-6 border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-10">
                <h3 className="font-bold text-white text-lg">Notification Log</h3>
              </div>
              <div className="overflow-y-auto h-full p-0">
                <table className="table w-full">
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {logs.length === 0 && (
                      <tr><td className="text-center py-20 text-gray-500">No transmissions recorded.</td></tr>
                    )}
                    {logs.map(n => (
                      <tr key={n._id} className="hover:bg-white/5 transition-colors">
                        <td className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="bg-white/5 p-3 rounded-full text-gray-400">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-white text-lg">{n.title}</h4>
                                <span className="text-xs text-gray-500 font-mono">{new Date(n.createdAt).toLocaleString()}</span>
                              </div>
                              <p className="text-gray-400 text-sm mb-3">{n.message}</p>
                              <div className="flex gap-2">
                                <div className="badge badge-outline border-white/20 text-xs text-gray-400">{n.target.replace('_', ' ')}</div>
                                {n.targetValue && <div className="badge badge-ghost text-xs bg-white/5">{n.targetValue}</div>}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
