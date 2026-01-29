import { useEffect, useState, useRef } from "react";
import API from "../services/api";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth } from "../firebase";
import ConfirmModal from "../components/ConfirmModal";

export default function Settings() {

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");

  const [rewards, setRewards] = useState({});
  const [profile, setProfile] = useState({
    name: "",
    email: "", // kept for structure but unused
    image: null
  });
  const [passwords, setPasswords] = useState({ old: "", new: "", confirm: "", showOld: false, showNew: false, showConfirm: false });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [partners, setPartners] = useState([]);
  const [newPartner, setNewPartner] = useState({ name: "", type: "" });

  // Feedback States
  const [partnerFeedback, setPartnerFeedback] = useState({ message: "", type: "" });
  const [categoryFeedback, setCategoryFeedback] = useState({ message: "", type: "" });
  const [rewardFeedback, setRewardFeedback] = useState({ message: "", type: "" });
  const [profileFeedback, setProfileFeedback] = useState({ message: "", type: "" });
  const [passwordFeedback, setPasswordFeedback] = useState({ message: "", type: "" });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    isDangerous: false,
    confirmText: "Confirm"
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await API.get("/admin/settings");
      setCategories(res.data.categories || []);
      setRewards(res.data.rewards || {});
      setProfile(res.data.profile || {});
      setPartners(res.data.partners || []);
      console.log("Settings Profile Data:", res.data.profile); // DEBUG
      if (res.data.profile?.image) {
        const img = res.data.profile.image;
        setImagePreview(img.startsWith("http") ? img : `http://localhost:5000/uploads/${img}`);
      }
    } catch {
      // Silent fail
    }
  };

  // PARTNERS
  const addPartner = async () => {
    if (!newPartner.name || !newPartner.type) return;
    setPartnerFeedback({ message: "", type: "" });
    try {
      const res = await API.post("/admin/settings/partners", newPartner);
      setPartners(res.data.partners);
      setNewPartner({ name: "", type: "" });
      setPartnerFeedback({ message: "Partner added successfully", type: "success" });
    } catch {
      setPartnerFeedback({ message: "Failed to add partner", type: "error" });
    }
  };

  const removePartner = async (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Remove Partner?",
      message: "This partner will be removed from the list.",
      confirmText: "Remove",
      isDangerous: true,
      onConfirm: async () => {
        setPartnerFeedback({ message: "", type: "" });
        try {
          const res = await API.delete(`/admin/settings/partners/${id}`);
          setPartners(res.data.partners);
          setPartnerFeedback({ message: "Partner removed successfully", type: "success" });
        } catch {
          setPartnerFeedback({ message: "Failed to remove partner", type: "error" });
        }
      }
    });
  };

  // CATEGORY
  const addCategory = async () => {
    if (!newCategory) return;
    setCategoryFeedback({ message: "", type: "" });
    try {
      await API.post("/admin/settings/categories", { name: newCategory });
      setNewCategory("");
      loadSettings();
      setCategoryFeedback({ message: "Category added", type: "success" });
    } catch {
      setCategoryFeedback({ message: "Failed to add category", type: "error" });
    }
  };

  const removeCategory = async (name) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Category?",
      message: `Are you sure you want to delete "${name}"?`,
      confirmText: "Delete",
      isDangerous: true,
      onConfirm: async () => {
        setCategoryFeedback({ message: "", type: "" });
        try {
          await API.delete(`/admin/settings/categories/${name}`);
          loadSettings();
          setCategoryFeedback({ message: "Category deleted", type: "success" });
        } catch {
          setCategoryFeedback({ message: "Failed to delete category", type: "error" });
        }
      }
    });
  };

  // REWARD
  // Debounce Ref to prevent excessive API calls
  const debounceRef = useRef(null);

  const updateReward = async (type, val) => {
    // 1. Optimistic Update (Instant)
    setRewards(prev => ({ ...prev, [type]: val }));

    // 2. Debounced API Call
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        await API.put("/admin/settings/rewards", { type, val });
        // No need to reloadSettings() here as we already have the value
        setRewardFeedback({ message: "Rewards updated", type: "success" });
        setTimeout(() => setRewardFeedback({ message: "", type: "" }), 2000);
      } catch {
        setRewardFeedback({ message: "Failed to update reward", type: "error" });
        loadSettings(); // Revert on failure
      }
    }, 500); // 500ms delay
  };

  // PROFILE
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const updateGeneralProfile = async () => {
    try {
      const formData = new FormData();
      formData.append("name", profile.name);
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      await API.put("/admin/settings/profile", formData);

      // SYNC WITH FIREBASE AUTH - Handled by Backend now
      if (auth.currentUser) {
        await auth.currentUser.reload();
      }

      setProfileFeedback({ message: "Profile updated successfully", type: "success" });
      loadSettings(); // Reload to get confirmed changes
      // window.location.reload(); // Removed force reload to show success message

      // Update sidebar locally if context exists, otherwise a simple reload might be needed eventually, 
      // but let's prioritize the feedback message first.
      setTimeout(() => window.location.reload(), 1000);

    } catch (err) {
      console.error(err);
      setProfileFeedback({ message: err.response?.data?.message || "Failed to update profile", type: "error" });
    }
  };

  const updatePassword = async () => {
    setPasswordFeedback({ message: "", type: "" });
    if (!passwords.new) {
      setPasswordFeedback({ message: "Please enter a new password.", type: "warning" });
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setPasswordFeedback({ message: "New passwords do not match!", type: "error" });
      return;
    }
    if (!passwords.old) {
      setPasswordFeedback({ message: "Please enter your current password to change it.", type: "warning" });
      return;
    }

    // 🔒 VERIFY OLD PASSWORD
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, passwords.old);
      await reauthenticateWithCredential(auth.currentUser, credential);
    } catch (err) {
      console.error("Re-auth failed", err);
      setPasswordFeedback({ message: "Incorrect Current Password", type: "error" });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("password", passwords.new);
      formData.append("oldPassword", passwords.old);

      await API.put("/admin/settings/profile", formData);

      setPasswordFeedback({ message: "Password updated successfully", type: "success" });
      setPasswords({ old: "", new: "", confirm: "", showOld: false, showNew: false, showConfirm: false });

      // SYNC WITH FIREBASE AUTH
      if (auth.currentUser) {
        try {
          await auth.currentUser.reload();
          loadSettings();
        } catch (reloadErr) {
          console.warn("User reload failed after password change (expected due to token invalidation):", reloadErr);
        }
      }

    } catch (err) {
      console.error(err);
      setPasswordFeedback({ message: err.response?.data?.message || "Failed to update password", type: "error" });
    }
  };

  return (
    <div className="p-2 lg:p-8 animate-fade-in space-y-8 min-h-full">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 overflow-hidden relative p-1">
        <div className="relative z-10">

          <h2 className="text-4xl font-black text-white tracking-tight">System <span className="text-gradient">Settings</span></h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ADMIN PROFILE CARD */}
        <div className="glass-card rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">

          <h3 className="card-title text-2xl text-white mb-6">Administrator Profile</h3>
          {profileFeedback.message && <div className={`alert ${profileFeedback.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg mb-4 text-sm py-2 rounded-xl`}><span>{profileFeedback.message}</span></div>}
          <div className="flex flex-col gap-8 relative z-10 items-center">

            {/* PROFILE IMAGE */}
            <div className="form-control flex flex-col items-center justify-center">
              <label className="label w-full text-center block mb-2"><span className="label-text text-gray-400 font-bold uppercase text-xs tracking-wider">Profile Photo</span></label>
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 glass shadow-2xl">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5 text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 opacity-50" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                    </div>
                  )}
                </div>
                <label className="absolute bottom-1 right-1 p-2 bg-primary text-black rounded-full cursor-pointer hover:bg-white hover:scale-110 transition-all shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>
            </div>

            {/* DISPLAY NAME */}
            <div className="flex flex-col gap-4 justify-center w-full">
              <div className="form-control">
                <label className="label"><span className="label-text text-gray-400 font-bold uppercase text-xs tracking-wider">Display Name</span></label>
                <input
                  className="input input-lg glass bg-black/20 border-white/10 text-white focus:border-primary w-full"
                  placeholder="Admin Name"
                  value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
            </div>

            <button className="btn btn-primary glass border-0 hover:bg-primary/80 px-8 w-full" onClick={updateGeneralProfile}>Save Profile Changes</button>

          </div>
        </div>

        {/* SECURITY / PASSWORD CARD */}
        <div className="glass-card rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col">
          <h3 className="card-title text-2xl text-white mb-6">Security</h3>
          {passwordFeedback.message && <div className={`alert ${passwordFeedback.type === 'success' ? 'alert-success' : passwordFeedback.type === 'warning' ? 'alert-warning' : 'alert-error'} shadow-lg mb-4 text-sm py-2 rounded-xl text-white border-0`}><span>{passwordFeedback.message}</span></div>}
          <div className="space-y-4 max-w-2xl mx-auto">
            {/* CURRENT PASSWORD */}
            <div className="form-control relative">
              <label className="label"><span className="label-text text-gray-400 font-bold uppercase text-xs tracking-wider">Current Password</span></label>
              <div className="relative">
                <input
                  type={passwords.showOld ? "text" : "password"}
                  className="input glass bg-black/20 border-white/10 text-white focus:border-primary w-full pr-10"
                  placeholder="Enter current password"
                  value={passwords.old}
                  onChange={e => setPasswords({ ...passwords, old: e.target.value })}
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  onClick={() => setPasswords({ ...passwords, showOld: !passwords.showOld })}
                >
                  {passwords.showOld ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" /><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" /></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* NEW PASSWORD */}
              <div className="form-control relative">
                <label className="label"><span className="label-text text-gray-400 font-bold uppercase text-xs tracking-wider">New Password</span></label>
                <div className="relative">
                  <input
                    type={passwords.showNew ? "text" : "password"}
                    className="input glass bg-black/20 border-white/10 text-white focus:border-primary w-full pr-10"
                    placeholder="Enter new password"
                    value={passwords.new}
                    onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    onClick={() => setPasswords({ ...passwords, showNew: !passwords.showNew })}
                  >
                    {passwords.showNew ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" /><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" /></svg>
                    )}
                  </button>
                </div>
              </div>
              {/* CONFIRM PASSWORD */}
              <div className="form-control relative">
                <label className="label"><span className="label-text text-gray-400 font-bold uppercase text-xs tracking-wider">Confirm</span></label>
                <div className="relative">
                  <input
                    type={passwords.showConfirm ? "text" : "password"}
                    className="input glass bg-black/20 border-white/10 text-white focus:border-primary w-full pr-10"
                    placeholder="Enter confirm password"
                    value={passwords.confirm}
                    onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    onClick={() => setPasswords({ ...passwords, showConfirm: !passwords.showConfirm })}
                  >
                    {passwords.showConfirm ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" /><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" /></svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <button className="btn btn-primary glass border-0 hover:bg-primary/80 px-8" onClick={updatePassword}>Update Password</button>
          </div>
        </div>

        {/* WASTE CATEGORIES CARD */}
        <div className="glass-card rounded-3xl p-8 border border-white/5 shadow-xl flex flex-col h-full">
          <h3 className="card-title text-xl text-primary mb-2 flex items-center gap-2">
            <span className="bg-primary/20 p-2 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg></span>
            Waste Categories
          </h3>
          <p className="text-gray-400 text-sm mb-6">Manage the types of waste accepted by the system.</p>
          {categoryFeedback.message && <div className={`alert ${categoryFeedback.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg mb-4 text-sm py-2 rounded-xl`}><span>{categoryFeedback.message}</span></div>}

          <div className="flex gap-2 mb-6">
            <input
              className="input input-bordered flex-1 bg-black/20 border-white/10 text-white focus:border-primary"
              placeholder="New category name..."
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCategory()}
            />
            <button className="btn btn-primary glass border-0" onClick={addCategory}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[600px] bg-black/20 rounded-xl p-2 space-y-1 custom-scrollbar">
            {categories.map(c => (
              <div key={c} className="flex justify-between items-center p-3 hover:bg-white/5 rounded-lg group transition-all">
                <span className="text-gray-300 font-medium pl-2 border-l-2 border-transparent group-hover:border-primary transition-all">{c}</span>
                <button onClick={() => removeCategory(c)} className="btn btn-ghost btn-sm btn-circle text-error opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
              </div>
            ))}
            {categories.length === 0 && <p className="text-center text-gray-600 py-4 italic">No categories defined.</p>}
          </div>
        </div>

        {/* REWARDS CONFIG CARD */}
        <div className="glass-card rounded-3xl p-8 border border-white/5 shadow-xl flex flex-col h-full">
          <h3 className="card-title text-xl text-amber-400 mb-2 flex items-center gap-2">
            <span className="bg-amber-500/10 p-2 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 5a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1V8a1 1 0 011-1zm5-5a1 1 0 011 1v1h1a1 1 0 010 2h-1v1a1 1 0 01-2 0V6h-1a1 1 0 010-2h1V3a1 1 0 011-1zm0 5a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1V8a1 1 0 011-1z" clipRule="evenodd" /></svg></span>
            Reward Values
          </h3>
          <p className="text-gray-400 text-sm mb-6">Set base point values per kg/unit for each waste type.</p>
          {rewardFeedback.message && <div className={`alert ${rewardFeedback.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg mb-4 text-sm py-2 rounded-xl`}><span>{rewardFeedback.message}</span></div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            {Object.keys(rewards).map(k => (
              <div key={k} className="form-control bg-black/20 p-3 rounded-xl border border-white/5">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-gray-200 capitalize tracking-wide text-sm">{k}</span>
                  <span className="text-[10px] text-amber-500 font-mono tracking-tighter">PTS/UNIT</span>
                </div>
                <div className="flex items-center justify-between bg-black/40 rounded-lg p-1">
                  <button
                    onClick={() => updateReward(k, Number(rewards[k]) - 1)}
                    className="btn btn-sm btn-square btn-ghost text-white hover:bg-white/10"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                  </button>

                  <input
                    type="number"
                    className="input input-sm glass bg-transparent border-0 text-center text-white focus:outline-none w-full text-lg font-bold font-mono h-8 appearance-none"
                    value={rewards[k]}
                    onChange={(e) => updateReward(k, e.target.value)}
                  />

                  <button
                    onClick={() => updateReward(k, Number(rewards[k]) + 1)}
                    className="btn btn-sm btn-square btn-ghost text-white hover:bg-white/10"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                  </button>
                </div>
              </div>
            ))}
            {Object.keys(rewards).length === 0 && <p className="text-center text-gray-600 py-4 italic col-span-2">No reward configurations found.</p>}
          </div>
        </div>



        {/* PARTNERS / TIE-UPS SECTION */}
        <div className="glass-card rounded-3xl p-8 border border-white/5 shadow-xl col-span-1 lg:col-span-2">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-purple-500/10 p-3 rounded-xl text-purple-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <div>
              <h3 className="card-title text-2xl text-purple-400">Company Tie-ups <span className="text-gray-500 text-lg font-normal">/ Redemption Partners</span></h3>
              <p className="text-gray-400 text-sm mt-1">Manage external partners where households can redeem their points (Supermarkets, Telecoms, etc).</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ADD NEW PARTNER - RECTANGLE STYLE */}
            <div className="lg:col-span-1 bg-[#0F111A] p-6 rounded-2xl border border-white/5 h-full">
              <h4 className="text-white font-bold mb-6 text-lg">Add New Partner</h4>
              {partnerFeedback.message && <div className={`alert ${partnerFeedback.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg mb-4 text-sm py-2 rounded-xl`}><span>{partnerFeedback.message}</span></div>}
              <div className="space-y-6">
                <div className="form-control">
                  <label className="label uppercase text-xs font-bold text-gray-500 tracking-wider mb-1">Company Name</label>
                  <input
                    className="input bg-[#1a1b2e] border-none text-white w-full rounded-xl focus:ring-2 focus:ring-purple-500/50 placeholder-gray-600"
                    placeholder="e.g. Keells Super"
                    value={newPartner.name}
                    onChange={e => setNewPartner({ ...newPartner, name: e.target.value })}
                  />
                </div>
                <div className="form-control">
                  <label className="label uppercase text-xs font-bold text-gray-500 tracking-wider mb-1">Service Type</label>
                  <select
                    className="select bg-[#1a1b2e] border-none text-white w-full rounded-xl focus:ring-2 focus:ring-purple-500/50"
                    value={newPartner.type}
                    onChange={e => setNewPartner({ ...newPartner, type: e.target.value })}
                  >
                    <option value="" disabled>Select Type</option>
                    <option value="Supermarket">Supermarket</option>
                    <option value="Telecom">Telecom Network</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Retail">Retail Store</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="pt-4">
                  <button
                    className="btn btn-primary w-full rounded-xl border-0 hover:brightness-110 transition-all font-bold"
                    onClick={addPartner}
                    disabled={!newPartner.name || !newPartner.type}
                  >
                    Add Partner
                  </button>
                </div>
              </div>
            </div>

            {/* LIST PARTNERS - RECTANGLE STYLE */}
            <div className="lg:col-span-2">
              {partners.length === 0 ? (
                <div className="h-full min-h-[300px] border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-gray-500 gap-4 hover:border-white/20 transition-colors">
                  <div className="p-4 bg-white/5 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  </div>
                  <p className="font-medium">No partners added yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {partners.map(p => (
                    <div key={p._id} className="flex items-center justify-between p-4 rounded-2xl bg-[#0F111A] border border-white/5 hover:border-purple-500/30 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold 
                            ${p.type === 'Supermarket' ? 'bg-green-500/10 text-green-400' :
                            p.type === 'Telecom' ? 'bg-blue-500/10 text-blue-400' :
                              'bg-purple-500/10 text-purple-400'}`}>
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <h5 className="text-white font-bold">{p.name}</h5>
                          <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">{p.type}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removePartner(p._id)}
                        className="btn btn-square btn-ghost btn-sm text-error opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div >
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
