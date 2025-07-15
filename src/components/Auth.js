import React, { useState } from 'react';
import { auth, googleProvider, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FcGoogle } from 'react-icons/fc';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const message = location.state?.message;
  const action = location.state?.action;

  const checkUserProfile = async (userId) => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists();
  };

  const createInitialUserProfile = async (user) => {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      email: user.email,
      createdAt: new Date(),
      // Set empty/default values for required profile fields
      displayName: user.displayName || '',
      phoneNumber: user.phoneNumber || '',
      location: '',
      profileComplete: false
    });
  };

  const handlePostAuth = async (user, isNewUser = false) => {
    try {
      const hasProfile = await checkUserProfile(user.uid);
      
      if (!hasProfile) {
        await createInitialUserProfile(user);
        toast.success('Please complete your profile to continue');
        navigate('/profile', { replace: true });
      } else {
        const destination = location.state?.from || '/';
        navigate(destination, { replace: true });
      }
    } catch (error) {
      console.error('Profile check error:', error);
      toast.error(error.message || 'Error checking profile status');
      navigate('/profile', { replace: true });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const isNewUser = result._tokenResponse.isNewUser;
      
      if (isNewUser) {
        toast.success('Account created successfully with Google!');
      } else {
        toast.success('Successfully logged in with Google!');
      }
      
      await handlePostAuth(result.user, isNewUser);
    } catch (error) {
      console.error('Google auth error:', error);
      toast.error('Failed to login with Google');
    }
  };

  const handleSuccessfulAuth = () => {
    if (action === 'message') {
      navigate('/messages', {
        state: {
          recipientEmail: location.state?.recipientEmail,
          initialMessage: message
        },
        replace: true
      });
    } else {
      navigate(from, { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Clear previous errors

    try {
      if (isLogin) {
        try {
          await signInWithEmailAndPassword(auth, email, password);
          handleSuccessfulAuth();
        } catch (error) {
          switch (error.code) {
            case 'auth/user-not-found':
              setError('No account found with this email. Please register first.');
              break;
            case 'auth/wrong-password':
              setError('Invalid email or password combination');
              break;
            case 'auth/invalid-email':
              setError('Please enter a valid email address');
              break;
            case 'auth/too-many-requests':
              setError('Too many attempts. Please try again in a few minutes');
              break;
            default:
              setError('Unable to sign in. Please check your credentials.');
          }
        }
      } else {
        try {
          const result = await createUserWithEmailAndPassword(auth, email, password);
          await handlePostAuth(result.user, true);
        } catch (error) {
          switch (error.code) {
            case 'auth/email-already-in-use':
              setError('An account already exists with this email');
              break;
            case 'auth/weak-password':
              setError('Password should be at least 6 characters long');
              break;
            default:
              setError('Error creating account. Please try again.');
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
          {isLogin ? 'Login' : 'Register'}
        </h2>

        <button
          onClick={handleGoogleSignIn}
          className="w-full mb-4 flex items-center justify-center bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
        >
          <FcGoogle className="w-6 h-6 mr-2" />
          <span>Continue with Google</span>
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Show error message if exists */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              <span>{isLogin ? 'Login' : 'Register'}</span>
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="text-blue-600 hover:underline text-sm md:text-base"
          >
            {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
