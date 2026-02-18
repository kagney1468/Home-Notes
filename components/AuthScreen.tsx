
import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  signInWithPopup
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { Mail, Lock, Loader2, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationEmailSent, setVerificationEmailSent] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        const sentEmail = userCredential.user.email;
        await signOut(auth);
        setVerificationEmailSent(sentEmail);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
          await sendEmailVerification(userCredential.user);
          const sentEmail = userCredential.user.email;
          await signOut(auth);
          setVerificationEmailSent(sentEmail);
        }
      }
    } catch (err: any) {
      if (isSignUp && err.code === 'auth/email-already-in-use') {
        setError("User already exists. Please sign in");
      } else if (!isSignUp && (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-email')) {
        setError("Email or password is incorrect");
      } else {
        setError(err.message || "An error occurred during authentication");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  const resetToLogin = () => {
    setVerificationEmailSent(null);
    setIsSignUp(false);
    setError(null);
  };

  if (verificationEmailSent) {
    return (
      <div className="bg-white rounded-[2rem] p-8 shadow-2xl border border-slate-100 text-center animate-in zoom-in duration-300">
        <div className="mb-6 flex justify-center">
          <div className="bg-blue-50 p-4 rounded-full text-blue-600">
            <CheckCircle2 size={48} />
          </div>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Check your inbox</h3>
        <p className="text-slate-600 mb-8 leading-relaxed">
          We have sent a verification email to <span className="font-bold text-slate-900">{verificationEmailSent}</span>. Please verify it to unlock property insights.
        </p>
        <button
          onClick={resetToLogin}
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
        >
          Return to Login
          <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-2xl border border-slate-100 animate-in fade-in duration-500">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-slate-900">
          {isSignUp ? "Join NestCheck UK" : "Sign in to Analyze"}
        </h3>
        <p className="text-sm text-slate-500 mt-1">Please verify your details to continue</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 text-red-700 text-sm">
          <AlertCircle className="shrink-0" size={18} />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-4">
        <div>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all text-sm"
              placeholder="Email address"
            />
          </div>
        </div>

        <div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all text-sm"
              placeholder="Password"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : (isSignUp ? "Create Account" : "Sign In")}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-slate-400"><span className="bg-white px-4">OR</span></div>
      </div>

      <button
        onClick={handleGoogleSignIn}
        disabled={loading || googleLoading}
        className="w-full bg-white border border-slate-200 text-slate-700 py-3.5 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
      >
        {googleLoading ? <Loader2 className="animate-spin" size={20} /> : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google Sign-In
          </>
        )}
      </button>

      <div className="mt-6 pt-6 border-t border-slate-100 text-center">
        <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm font-bold text-blue-600 hover:text-blue-700">
          {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
        </button>
      </div>
    </div>
  );
};
