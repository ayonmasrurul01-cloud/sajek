import React, { useState } from "react";
import { X, Lock, Mail, UserPlus, LogIn, AlertCircle, ShieldCheck } from "lucide-react";
import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

interface LoginModalProps {
  onClose: () => void;
  onAuthSuccess: (user: any, isAdmin: boolean) => void;
}

export default function LoginModal({ onClose, onAuthSuccess }: LoginModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showConsoleGuide, setShowConsoleGuide] = useState(false);

  // Auto-bootstrap matching users to admins
  const handleAdminRoleBootstrap = async (uid: string, userEmail: string) => {
    // If user's email matches the user runtime email or contains admin, we assign them as admin
    const isAdminUser = 
      userEmail.toLowerCase() === "admin@gmail.com" || 
      userEmail.toLowerCase().includes("admin");

    if (isAdminUser) {
      try {
        const adminDocRef = doc(db, "admins", uid);
        await setDoc(adminDocRef, {
          uid,
          email: userEmail,
          role: "admin",
          createdAt: new Date().toISOString()
        });
        return true;
      } catch (err) {
        console.error("Failed to bootstrap admin role in Firestore: ", err);
      }
    }

    // Double check if admin document exists in Firestore
    try {
      const adminDocSnap = await getDoc(doc(db, "admins", uid));
      return adminDocSnap.exists();
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);
    setShowConsoleGuide(false);

    try {
      if (isSignUp) {
        // Sign Up Flow
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update display name
        if (fullName.trim()) {
          await updateProfile(user, { displayName: fullName.trim() });
        }

        // Bootstrap Admin Check
        const isAdmin = await handleAdminRoleBootstrap(user.uid, user.email || "");
        
        onAuthSuccess(user, isAdmin);
        onClose();
      } else {
        // Sign In Flow
        let userCredential;
        try {
          userCredential = await signInWithEmailAndPassword(auth, email, password);
        } catch (signInErr: any) {
          // Auto-register admin credentials if signing in on a fresh database
          const isTargetAdmin = email.toLowerCase() === "admin@gmail.com";
          if (
            isTargetAdmin &&
            (signInErr.code === "auth/invalid-credential" ||
             signInErr.code === "auth/user-not-found" ||
             signInErr.code === "auth/wrong-password")
          ) {
            console.log("Admin account not found during sign in on fresh database, auto-creating...");
            try {
              userCredential = await createUserWithEmailAndPassword(auth, email, password);
              if (userCredential.user) {
                const displayName = "Admin";
                await updateProfile(userCredential.user, { displayName });
              }
            } catch (signUpErr: any) {
              console.error("Auto-registration failed:", signUpErr);
              throw signInErr; // Fallback to original sign-in error if registration fails too
            }
          } else {
            throw signInErr;
          }
        }
        
        const user = userCredential.user;

        // Bootstrap Admin Check
        const isAdmin = await handleAdminRoleBootstrap(user.uid, user.email || "");

        onAuthSuccess(user, isAdmin);
        onClose();
      }
    } catch (err: any) {
      console.error("Firebase auth error:", err);
      let msg = err.message || "Authentication failed. Please verify credentials.";
      
      const isPrimaryAdmin = email.toLowerCase() === "admin@gmail.com";

      if (err.code === "auth/operation-not-allowed") {
        msg = "Email/Password sign-in is not yet enabled in your Firebase console.";
        setShowConsoleGuide(true);
      } else if (err.code === "auth/email-already-in-use") {
        if (isPrimaryAdmin) {
          msg = `Admin Account '${email}' is already registered in Firebase under a different password. Please sign in with that password, or click the gold button below to bypass Firebase authentication and log in instantly.`;
        } else {
          msg = "This email is already registered. Please sign in instead.";
        }
      } else if (err.code === "auth/weak-password") {
        msg = "Password should be at least 6 characters long.";
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        if (isPrimaryAdmin) {
          msg = `Invalid password for the admin account '${email}'. This email is already registered in Firebase. If you forgot the password, you can sign in with your existing password, or click the gold button below to bypass Firebase authentication and log in instantly.`;
        } else {
          msg = "Invalid email or password. If you are logging in with the Admin account for the first time, make sure to click Sign Up first, or use the Sandbox Bypass.";
        }
      }
      
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Safe Simulated Sandbox Bypass - prevents developer lockout if Firebase config is uninitialized or providers are off
  const handleSandboxBypass = async (role: "admin" | "guest") => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const mockUid = role === "admin" ? "mock-admin-99" : "mock-guest-11";
      
      const hasEmailInput = email && (email.toLowerCase().includes("admin") || email.toLowerCase() === "admin@gmail.com");
      const mockEmail = role === "admin" 
        ? (hasEmailInput ? email.toLowerCase().trim() : "admin@gmail.com") 
        : "guest@meghpunji.com";
      const mockDisplayName = role === "admin" ? "Admin" : "Guest User";

      const mockUser = {
        uid: mockUid,
        email: mockEmail,
        displayName: mockDisplayName,
      };

      // Attempt to save to Firestore admins if admin, to ensure rules pass
      if (role === "admin") {
        try {
          await setDoc(doc(db, "admins", mockUid), {
            uid: mockUid,
            email: mockEmail,
            role: "admin",
            createdAt: new Date().toISOString()
          });
        } catch (dbErr) {
          console.warn("Could not save admin session to Firestore. Proceeding offline.", dbErr);
        }
      }

      localStorage.setItem("meghpunji_sandbox_user", JSON.stringify(mockUser));
      onAuthSuccess(mockUser, role === "admin");
      onClose();
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FAF9F6] border border-black/10 p-6 max-w-md w-full relative space-y-6 animate-fade-in text-[#1A1A1A] shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-black/40 hover:text-black transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand / Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-full bg-gold/10 border border-gold/20 text-gold mb-1">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-light">
            {isSignUp ? "Create Guest Account" : "Access Your Account"}
          </h2>
          <p className="text-[10px] uppercase tracking-widest text-gold font-semibold">
            Meghpunji Resort Sajek
          </p>
        </div>

        {/* Primary Admin Account Info & Auto-Prefill */}
        <div className="bg-gold/5 border border-gold/20 p-3.5 rounded-xl flex flex-col gap-1.5 text-[11px] leading-relaxed">
          <div className="flex items-center justify-between font-semibold text-[#8C763E]">
            <span className="flex items-center gap-1.5 font-sans uppercase tracking-wider text-[10px] font-bold">
              <ShieldCheck className="w-4 h-4 text-gold shrink-0" />
              Primary Admin Account
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setEmail("admin@gmail.com");
                  setPassword("admin123");
                }}
                className="text-[9px] bg-[#1A1A1A] text-white px-2.5 py-1 rounded-md hover:bg-black transition-all uppercase tracking-wider font-bold shadow-sm"
              >
                Prefill Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("guest@gmail.com");
                  setPassword("guest123");
                }}
                className="text-[9px] bg-black/10 text-black px-2.5 py-1 rounded-md hover:bg-black/15 transition-all uppercase tracking-wider font-bold"
              >
                Prefill Guest
              </button>
            </div>
          </div>
          <div className="font-mono text-black/70 text-[10px] space-y-0.5 pt-1">
            <p>User ID: <span className="text-[#1A1A1A] font-semibold">admin@gmail.com</span></p>
            <p>Password: <span className="text-[#1A1A1A] font-semibold">admin123</span></p>
          </div>
          <div className="text-[9px] text-black/50 leading-normal pt-1 border-t border-gold/10">
            Click <strong>Prefill Admin</strong>, then click <strong>Sign Up</strong> if configuring the database for the first time, or <strong>Sign In</strong> to authenticate.
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex flex-col gap-2 rounded-lg">
            <div className="flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <div className="space-y-1">
                <p className="font-semibold">{errorMsg}</p>
                {showConsoleGuide && (
                  <div className="text-[10px] text-red-600 space-y-1 mt-1 border-t border-red-200/50 pt-2 font-mono">
                    <p>1. Go to Firebase Console</p>
                    <p>2. Go to Authentication &gt; Sign-in method</p>
                    <p>3. Enable "Email/Password" provider</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="border-t border-red-200/60 pt-2 flex flex-col gap-1.5">
              <p className="text-[10px] text-red-600 font-medium">Don't want to configure Firebase right now?</p>
              <button
                type="button"
                onClick={() => handleSandboxBypass(email.toLowerCase().includes("admin") || email.toLowerCase() === "admin@gmail.com" ? "admin" : "guest")}
                className="w-full py-2 bg-gold hover:opacity-90 text-[#1A1A1A] text-[10px] font-bold uppercase tracking-wider text-center rounded transition-opacity"
              >
                Bypass & Continue as {email.toLowerCase().includes("admin") || email.toLowerCase() === "admin@gmail.com" ? "Admin" : "Guest"} (Sandbox Mode)
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          {isSignUp && (
            <div className="space-y-1">
              <label className="block text-black/60 text-[10px] uppercase tracking-wider font-semibold">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Masrurul Islam Ayon"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-black/[0.02] border border-black/10 hover:border-gold/40 focus:border-gold focus:ring-1 focus:ring-gold/25 transition-all duration-300 rounded-xl p-3 text-black outline-none placeholder:text-black/30"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-black/60 text-[10px] uppercase tracking-wider font-semibold">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
              <input
                type="email"
                required
                placeholder="e.g. admin@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/[0.02] border border-black/10 hover:border-gold/40 focus:border-gold focus:ring-1 focus:ring-gold/25 transition-all duration-300 rounded-xl p-3 pl-10 text-black outline-none placeholder:text-black/30"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-black/60 text-[10px] uppercase tracking-wider font-semibold">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/[0.02] border border-black/10 hover:border-gold/40 focus:border-gold focus:ring-1 focus:ring-gold/25 transition-all duration-300 rounded-xl p-3 pl-10 text-black outline-none placeholder:text-black/30"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1A1A1A] text-white font-bold py-3 uppercase tracking-widest text-xs hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-2 rounded shadow-lg shadow-black/10"
          >
            {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            {isLoading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg("");
            }}
            className="text-xs text-gold font-semibold hover:underline"
          >
            {isSignUp ? "Already have an account? Sign In" : "Need a guest account? Sign Up"}
          </button>
        </div>

        {/* Instant Sandbox Credentials Bypass */}
        <div className="pt-4 border-t border-black/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase text-black/40 tracking-wider">Dev Sandbox Instant Access</span>
            <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 border border-emerald-100 font-semibold rounded font-mono">Bypass</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <button
              onClick={() => handleSandboxBypass("admin")}
              className="py-2.5 bg-gold/15 border border-gold/30 text-gold-900 font-bold hover:bg-gold/25 transition-all text-center flex items-center justify-center gap-1.5 rounded"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Instant Admin
            </button>
            <button
              onClick={() => handleSandboxBypass("guest")}
              className="py-2.5 bg-black/5 border border-black/10 text-black/80 font-bold hover:bg-black/10 transition-all text-center flex items-center justify-center gap-1.5 rounded"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Instant Guest
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
