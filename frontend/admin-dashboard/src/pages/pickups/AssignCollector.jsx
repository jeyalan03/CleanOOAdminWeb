import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";

export default function AssignCollector() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [, setRequest] = useState(null);

  const [collectors, setCollectors] = useState([]);
  const [selectedCollector, setSelectedCollector] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pickupRes, collectorsRes] = await Promise.all([
          API.get(`/pickups/${id}`),
          API.get("/collectors")
        ]);
        setRequest(pickupRes.data.data);
        setCollectors(collectorsRes.data.data);
      } catch (err) {
        console.error(err);
        const status = err.response?.status;
        const msg = err.response?.data?.message || err.message;
        setError(`Failed to load data: ${status} - ${msg}`);
      }
    };
    fetchData();
  }, [id]);

  const handleAssign = async () => {
    setError("");
    setSuccess("");
    if (!selectedCollector) return setError("Please select a collector");
    try {
      await API.put(`/pickups/assign/${id}`, { collector: selectedCollector });
      setSuccess("Collector assigned successfully");
      setTimeout(() => {
        navigate("/pickups");
      }, 1500);
    } catch (err) {
      console.error(err);
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.message;
      setError(`Assignment failed: ${status} - ${msg}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] animate-fade-in">
      <div className="card w-96 glass-card shadow-2xl border border-white/5">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4 text-white">Assign Collector</h2>
          <p className="text-sm opacity-70 mb-4 text-gray-300">Select a collector to assign to this pickup request.</p>

          <div className="form-control w-full max-w-xs">
            {success && (
              <div className="mb-2 p-2 rounded-lg bg-green-500/10 border border-green-500/50 text-green-200 text-xs flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {success}
              </div>
            )}
            {error && (
              <div className="mb-2 p-2 rounded-lg bg-red-500/10 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
            <label className="label">
              <span className="label-text text-gray-300">Select Collector</span>
            </label>
            <select
              className="select select-bordered bg-white/5 border-white/10 text-white focus:outline-none focus:border-primary"
              value={selectedCollector}
              onChange={(e) => setSelectedCollector(e.target.value)}
            >
              <option value="" className="bg-gray-800">-- Choose Collector --</option>
              {collectors.map(c => (
                <option key={c._id} value={c._id} className="bg-gray-800">
                  {c.name} ({c.zone || "No Zone"})
                </option>
              ))}
            </select>
          </div>

          <div className="card-actions justify-end mt-8">
            <button className="btn btn-ghost text-white hover:bg-white/10" onClick={() => navigate("/pickups")}>
              Cancel
            </button>
            <button className="btn btn-primary glass border-0 hover:bg-primary/80 text-white" onClick={handleAssign}>
              Confirm Assignment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
