import { create } from "zustand";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  sendPasswordResetEmail, 
  onAuthStateChanged,
  User as FirebaseUser,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase";

// Log action types for firestore errors
enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}

// Global Firebase Error Handler to comply with the firebase-integration skill
function handleFirestoreError(error: unknown, opType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType: opType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    }
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

interface AuthState {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  loginWithEmail: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  registerWithEmail: (fullName: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  updateUserProfile: (fullName: string, avatarUrl: string) => Promise<void>;
  initAuthListener: () => () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  isInitialized: false,
  error: null,

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  loginWithEmail: async (email, password, rememberMe) => {
    set({ isLoading: true, error: null });
    try {
      // Configure Firebase Persistence based on "Remember Me" toggle
      await setPersistence(
        auth, 
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Profile will be auto-fetched by onAuthStateChanged listener
      set({ user: userCredential.user, isLoading: false });
    } catch (err: any) {
      let customError = err?.message || "Failed to sign in";
      if (err?.code === "auth/user-not-found") {
        customError = "No account found with this email.";
      } else if (err?.code === "auth/wrong-password") {
        customError = "Incorrect password. Please try again.";
      } else if (err?.code === "auth/invalid-credential") {
        customError = "Invalid email or password credentials.";
      } else if (err?.code === "auth/invalid-email") {
        customError = "Please enter a valid email address.";
      } else if (err?.code === "auth/too-many-requests") {
        customError = "Too many failed attempts. Access temporarily locked.";
      } else if (err?.code === "auth/configuration-not-found") {
        customError = "Email/Password provider not enabled. Please enable 'Email/Password' authentication in your Firebase console.";
      }
      set({ error: customError, isLoading: false });
      throw new Error(customError);
    }
  },

  registerWithEmail: async (fullName, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create profile document in Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        fullName,
        email,
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(fullName)}`,
        createdAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, "users", user.uid), userProfile);
      } catch (fErr) {
        handleFirestoreError(fErr, OperationType.WRITE, `users/${user.uid}`);
      }

      set({ user, profile: userProfile, isLoading: false });
    } catch (err: any) {
      let customError = err?.message || "Failed to register";
      if (err?.code === "auth/email-already-in-use") {
        customError = "This email is already in use.";
      } else if (err?.code === "auth/weak-password") {
        customError = "Password should be at least 6 characters.";
      } else if (err?.code === "auth/configuration-not-found") {
        customError = "Auth provider not enabled. Please enable 'Email/Password' authentication in your Firebase console.";
      }
      set({ error: customError, isLoading: false });
      throw new Error(customError);
    }
  },

  loginWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if profile already exists in Firestore
      const userDocRef = doc(db, "users", user.uid);
      let userDoc;
      try {
        userDoc = await getDoc(userDocRef);
      } catch (fErr) {
        handleFirestoreError(fErr, OperationType.GET, `users/${user.uid}`);
      }

      let userProfile: UserProfile;

      if (!userDoc || !userDoc.exists()) {
        // Create new user profile using Google profile metadata
        userProfile = {
          uid: user.uid,
          fullName: user.displayName || "Fluxel User",
          email: user.email || "",
          avatarUrl: user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.displayName || user.uid)}`,
          createdAt: new Date().toISOString()
        };
        try {
          await setDoc(userDocRef, userProfile);
        } catch (fErr) {
          handleFirestoreError(fErr, OperationType.WRITE, `users/${user.uid}`);
        }
      } else {
        userProfile = userDoc.data() as UserProfile;
      }

      set({ user, profile: userProfile, isLoading: false });
    } catch (err: any) {
      let customError = err?.message || "Failed to connect with Google";
      if (err?.code === "auth/popup-closed-by-user") {
        customError = "Google authentication popup was closed.";
      } else if (err?.code === "auth/popup-blocked") {
        customError = "Google popup was blocked by your browser. Please allow popups.";
      } else if (err?.code === "auth/configuration-not-found") {
        customError = "Google sign-in is not enabled. Please enable 'Google' authentication in your Firebase console.";
      }
      set({ error: customError, isLoading: false });
      throw new Error(customError);
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await signOut(auth);
      set({ user: null, profile: null, isLoading: false });
    } catch (err: any) {
      set({ error: err?.message || "Failed to log out", isLoading: false });
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await sendPasswordResetEmail(auth, email);
      set({ isLoading: false });
    } catch (err: any) {
      let customError = err?.message || "Failed to send login reset email";
      if (err?.code === "auth/user-not-found") {
        customError = "No account registered with this email.";
      }
      set({ error: customError, isLoading: false });
      throw new Error(customError);
    }
  },

  updateUserProfile: async (fullName, avatarUrl) => {
    const { user, profile } = get();
    if (!user || !profile) throw new Error("Authenticated session missing");

    set({ isLoading: true, error: null });
    try {
      const userDocRef = doc(db, "users", user.uid);
      const updatedProfile = {
        ...profile,
        fullName,
        avatarUrl,
        updatedAt: new Date().toISOString(),
      };

      try {
        await updateDoc(userDocRef, {
          fullName,
          avatarUrl,
          updatedAt: new Date().toISOString(),
        });
      } catch (fErr) {
        handleFirestoreError(fErr, OperationType.UPDATE, `users/${user.uid}`);
      }

      set({ profile: updatedProfile, isLoading: false });
    } catch (err: any) {
      set({ error: err?.message || "Failed to update profile", isLoading: false });
      throw err;
    }
  },

  initAuthListener: () => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            set({ 
              user: firebaseUser, 
              profile: userDoc.data() as UserProfile, 
              isLoading: false, 
              isInitialized: true 
            });
          } else {
            // Profile entry missing - bootstrap profile
            const bootstrappedProfile: UserProfile = {
              uid: firebaseUser.uid,
              fullName: firebaseUser.displayName || "Fluxel User",
              email: firebaseUser.email || "",
              avatarUrl: firebaseUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(firebaseUser.uid)}`,
              createdAt: new Date().toISOString()
            };
            
            await setDoc(userDocRef, bootstrappedProfile);
            set({ 
              user: firebaseUser, 
              profile: bootstrappedProfile, 
              isLoading: false, 
              isInitialized: true 
            });
          }
        } catch (err) {
          // If Firestore fails (e.g. read rules lock), fallback to basic auth metadata
          const fallbackProfile: UserProfile = {
            uid: firebaseUser.uid,
            fullName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Auth User",
            email: firebaseUser.email || "",
            avatarUrl: firebaseUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(firebaseUser.uid)}`,
            createdAt: new Date().toISOString()
          };
          set({ 
            user: firebaseUser, 
            profile: fallbackProfile, 
            isLoading: false, 
            isInitialized: true 
          });
        }
      } else {
        set({ user: null, profile: null, isLoading: false, isInitialized: true });
      }
    });
  }
}));
