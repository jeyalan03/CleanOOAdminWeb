import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { Navigate } from "react-router-dom";

export default function AuthGuard({ children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return unsub;
  }, []);

  if (user === undefined) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <span className="loading loading-ring loading-lg text-primary"></span>
    </div>
  );

  return user ? children : <Navigate to="/login" />;
}
