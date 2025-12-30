import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink
} from "firebase/auth";
import { auth } from "../firebase";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const navigate = useNavigate();

  // Handle Magic Link Sign-in on Page Load
  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let emailForSignIn = window.localStorage.getItem('emailForSignIn');
      if (!emailForSignIn) {
        emailForSignIn = window.prompt('Please provide your email for confirmation');
      }

      signInWithEmailLink(auth, emailForSignIn, window.location.href)
        .then(() => {
          window.localStorage.removeItem('emailForSignIn');
          navigate("/");
        })
        .catch((error) => {
          console.error("Error signing in with email link", error);
          alert("Error verifying login link: " + error.message);
        });
    }
  }, [navigate]);

  const login = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // RBAC VERIFICATION
      try {
        await API.post("/admin/check-email", { email }); // Reuse check-email route which now enforces RBAC
        navigate("/");
      } catch (rbacError) {
        console.error("RBAC Failed:", rbacError);
        auth.signOut(); // Logout immediately
        alert(rbacError.response?.data?.message || "Access Denied: Not an Admin");
      }
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        alert("Incorrect Email or Password");
      } else if (error.code === 'auth/too-many-requests') {
        alert("Too many failed attempts. Please try again later.");
      } else {
        alert("Login failed: " + error.message);
      }
    }
  };

  /* SEND MAGIC LINK HANDLER */
  const handleSendLink = async (e) => {
    e.preventDefault();
    if (!resetEmail) return alert("Please enter your email");

    try {
      // 1. Verify existence in Backend first
      await API.post("/admin/check-email", { email: resetEmail });

      // 2. If successful, proceed to send link
      const actionCodeSettings = {
        url: window.location.origin + '/login', // Redirect back to login page
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, resetEmail, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', resetEmail);
      alert("Login link sent to " + resetEmail + ". Check your inbox!");
      setIsResetOpen(false);
      setResetEmail("");

    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 404) {
        alert("Access Denied: This email is not a registered Admin account.");
      } else {
        alert("Failed to send link: " + (error.response?.data?.message || error.message));
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white font-sans relative">

      {/* LEFT SIDE - FORM */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-10 relative z-10">

        <div className="w-full max-w-md">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-500 mb-2 tracking-tight">
            CleanOO
          </h1>

          <p className="text-gray-400 mb-10 text-lg">Recycle • Reduce • Reward ♻️</p>

          <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 backdrop-blur-sm bg-opacity-90">
            <h2 className="text-2xl font-bold mb-6 text-gray-100">Admin Login</h2>

            <form onSubmit={login} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Email Address</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5 ml-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-200 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" /><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg transform transition hover:scale-[1.02] active:scale-95 duration-200 mt-2"
              >
                Sign In
              </button>
            </form>

            <button
              className="mt-6 text-sm text-gray-400 hover:text-cyan-400 transition-colors w-full text-center"
              onClick={() => setIsResetOpen(true)}
            >
              Get Login Link
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - DECORATIVE */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-gray-900 to-gray-800 items-center justify-center relative overflow-hidden">
        {/* Abstract shapes or gradient overlay */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

        <div className="relative z-10 text-center p-12 max-w-lg">
          <div className="mb-8 flex justify-center">
            <span className="text-6xl">🌍</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-6">Cleaner Cities, Better Future</h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            Monitor waste collection in real-time, manage fleet efficiency, and reward community participation—all from one powerful dashboard.
          </p>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {isResetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-gray-800 p-8 rounded-3xl w-full max-w-md border border-white/10 shadow-2xl relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              onClick={() => setIsResetOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-6 flex justify-center text-cyan-400 bg-cyan-500/10 w-16 h-16 rounded-full items-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h3 className="text-2xl font-bold text-center text-white mb-2">Get Login Link</h3>
            <p className="text-gray-400 text-center mb-6 text-sm">Enter your email. We'll send you a direct Magic Link to login instantly.</p>

            <form onSubmit={handleSendLink} className="space-y-4">
              <input
                type="email"
                className="input bg-gray-900 border border-gray-700 w-full text-white focus:outline-none focus:border-cyan-500"
                placeholder="Enter email address"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                autoFocus
              />
              <button className="btn w-full bg-cyan-600 hover:bg-cyan-500 text-white border-0">Send Login Link</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
