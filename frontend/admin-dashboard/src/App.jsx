import { Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import AuthGuard from "./AuthGuard";
import Dashboard from "./pages/Dashboard";
import Households from "./pages/Households";
import Collectors from "./pages/Collectors";
import PickupRequests from "./pages/PickupRequests";
import Complaints from "./pages/Complaints";
import Rewards from "./pages/Rewards";
import Notifications from "./pages/Notifications";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import AssignCollector from "./pages/pickups/AssignCollector";
import Settings from "./pages/Settings";
import ManageAdmins from "./pages/ManageAdmins";

import API from "./services/api";
import { useEffect, useState } from "react";

export default function App() {
  const [counts, setCounts] = useState({
    pickups: 0,
    complaints: 0,
    rewards: 0,
    notifications: 0
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Auth Listener
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // Initial fetch
    fetchCounts();
    // Poll every 30s
    const interval = setInterval(fetchCounts, 30000);

    // Event Listener for Instant Update
    window.addEventListener("refreshSidebar", fetchCounts);

    return () => {
      clearInterval(interval);
      window.removeEventListener("refreshSidebar", fetchCounts);
      unsubscribe();
    };
  }, []);

  const fetchCounts = async () => {
    try {
      const res = await API.get("/admin/sidebar/stats");
      if (res.data.success) {
        setCounts(res.data.counts);
      }
    } catch (e) {
      console.error("Badge fetch error", e);
    }
  };
  return (
    <Routes>
      {/* LOGIN */}
      <Route path="/login" element={<Login />} />

      {/* PROTECTED ADMIN AREA */}
      <Route
        path="/*"
        element={
          <AuthGuard>
            <div className="flex h-screen overflow-hidden bg-transparent">

              {/* 🌟 GLASS SIDEBAR */}
              <div className="hidden lg:flex flex-col w-72 glass-strong z-20 m-4 rounded-3xl overflow-hidden shadow-2xl">
                {/* Sidebar Title */}
                <div className="p-8 pb-4">
                  <h1 className="text-3xl font-black tracking-tighter">
                    <span className="text-white">Clean</span>
                    <span className="text-gradient">OO</span>
                  </h1>
                  <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-semibold">Admin Workspace</p>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-4 px-4 space-y-2">
                  <NavLink to="/">Dashboard</NavLink>
                  <div className="h-px bg-white/5 my-2"></div>
                  <NavLink to="/households">Households</NavLink>
                  <NavLink to="/collectors">Collectors</NavLink>
                  <NavLink to="/pickups" badge={counts.pickups}>Pickup Requests</NavLink>
                  <NavLink to="/complaints" badge={counts.complaints}>Complaints</NavLink>
                  <NavLink to="/rewards" badge={counts.rewards}>Rewards</NavLink>
                  <div className="h-px bg-white/5 my-2"></div>
                  <NavLink to="/notifications" badge={counts.notifications} badgeColor="warning">Notifications</NavLink>
                  <NavLink to="/admins">Manage Admins</NavLink>
                  <NavLink to="/settings">Settings</NavLink>
                </div>

                {/* User Profile Footer */}
                <div className="p-4 bg-black/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="avatar online placeholder">
                      <div className="bg-neutral text-neutral-content rounded-full w-10">
                        {user?.photoURL ? (
                          <img src={user.photoURL} alt={user.displayName} />
                        ) : (
                          <span className="text-sm">{user?.displayName ? user.displayName.charAt(0).toUpperCase() : "A"}</span>
                        )}
                      </div>
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-white truncate">{user?.displayName || "Admin User"}</p>
                      <p className="text-xs text-success">Online</p>
                    </div>
                  </div>
                  <button
                    onClick={() => signOut(auth)}
                    className="btn btn-error btn-outline btn-sm w-full glass hover:bg-error hover:text-white border-0 bg-white/5"
                  >
                    Logout
                  </button>
                </div>
              </div>

              {/* MOBILE DRAWER */}
              <div className="drawer lg:hidden absolute inset-0 z-50 pointer-events-none">
                <input id="my-drawer-2" type="checkbox" className="drawer-toggle pointer-events-auto" />
                <div className="drawer-side pointer-events-auto">
                  <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
                  <ul className="menu p-4 w-72 min-h-full bg-base-100 text-base-content glass-strong h-full">
                    {/* Mobile Menu Content */}
                    <li className="mb-6"><span className="text-2xl font-black">Smart<span className="text-primary">Waste</span></span></li>
                    <li><Link to="/">Dashboard</Link></li>
                    <li><Link to="/households">Households</Link></li>
                    <li><Link to="/collectors">Collectors</Link></li>
                    <li><Link to="/pickups">Pickups</Link></li>
                    <li><Link to="/complaints">Complaints</Link></li>
                    <li><Link to="/rewards">Rewards</Link></li>
                    <li><Link to="/admins">Manage Admins</Link></li>
                    <li><Link to="/settings">Settings</Link></li>
                    <li className="mt-auto"><button onClick={() => signOut(auth)}>Logout</button></li>
                  </ul>
                </div>
              </div>

              {/* 🚀 MAIN CONTENT AREA */}
              <div className="flex-1 flex flex-col h-screen overflow-hidden relative">

                {/* BLUR NAVBAR */}
                <div className="w-full h-20 lg:hidden flex items-center justify-between px-8 z-10 sticky top-0">
                  <div className="flex items-center gap-4">
                    <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost lg:hidden text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </label>
                  </div>

                </div>

                {/* SCROLLABLE PAGE CONTENT */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-8 pt-0 scroll-smooth">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/households" element={<Households />} />
                    <Route path="/collectors" element={<Collectors />} />
                    <Route path="/pickups" element={<PickupRequests />} />
                    <Route path="/complaints" element={<Complaints />} />
                    <Route path="/pickups/assign/:id" element={<AssignCollector />} />
                    <Route path="/rewards" element={<Rewards />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/admins" element={<ManageAdmins />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </div>
              </div>

            </div>
          </AuthGuard>
        }
      />

    </Routes>
  );
}

function NavLink({ to, children, badge, badgeColor = "error" }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 font-medium hover:pl-6 focus:bg-white/10 group"
    >
      <div className="flex items-center gap-3">
        {children}
      </div>
      {badge > 0 && (
        <span className={`badge badge-sm border-0 font-bold text-white ${badgeColor === 'warning' ? 'bg-warning text-black' : 'bg-red-500'}`}>
          {badge}
        </span>
      )}
    </Link>
  );
}
