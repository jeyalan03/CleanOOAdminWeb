import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";

export default function AssignCollector() {

  const { id } = useParams();   // pickup id
  const navigate = useNavigate();

  const [collectors, setCollectors] = useState([]);
  const [selected, setSelected] = useState("");

  // Load collectors
  useEffect(() => {
    loadCollectors();
  }, []);

  const loadCollectors = async () => {
    try {
      const res = await API.get("/admin/collectors");
      setCollectors(res.data.data || []);
    } catch (error) {
      alert("Failed to load collectors");
    }
  };

  // Assign selected collector
  const assign = async () => {
    if (!selected) {
      alert("Select a collector first");
      return;
    }

    try {
      await API.put(`/admin/pickups/assign/${id}`, {
        collector: selected
      });

      alert("Collector assigned successfully");
      navigate("/pickups");
    } catch (error) {
      alert("Assignment failed");
      console.error(error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] animate-fade-in">
      <div className="card w-96 glass-card shadow-2xl border border-white/5">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4 text-white">Assign Collector</h2>
          <p className="text-sm opacity-70 mb-4 text-gray-300">Select a collector to assign to this pickup request.</p>

          <div className="form-control w-full max-w-xs">
            <label className="label">
              <span className="label-text text-gray-300">Select Collector</span>
            </label>
            <select
              className="select select-bordered bg-white/5 border-white/10 text-white focus:outline-none focus:border-primary"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
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
            <button className="btn btn-primary glass border-0 hover:bg-primary/80 text-white" onClick={assign}>
              Confirm Assignment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
