import React, { createContext, useContext, useEffect, useState } from 'react';
import { Amplify } from 'aws-amplify';
import { getCurrentUser, signIn, signOut, signUp, fetchAuthSession, signInWithRedirect, SignInInput, SignUpInput } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { authConfig } from '../config/auth';

console.log("Configuring Amplify with:", JSON.stringify(authConfig, null, 2));

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: authConfig.userPoolId,
            userPoolClientId: authConfig.userPoolClientId,
            loginWith: {
                oauth: {
                    domain: authConfig.domain,
                    scopes: ['email', 'profile', 'openid'],
                    redirectSignIn: authConfig.redirectSignIn,
                    redirectSignOut: authConfig.redirectSignOut,
                    responseType: 'code',
                }
            }
        }
    }
});

interface AuthContextType {
    user: any | null;
    isLoading: boolean;
    signIn: (input: SignInInput) => Promise<any>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    signUp: (input: SignUpInput) => Promise<any>;
    getToken: () => Promise<string | undefined>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log('[AuthContext] Component mounted, checking for user...');
        checkUser();

        // Listen for auth events (important for OAuth redirect)
        const hubListener = Hub.listen('auth', ({ payload }) => {
            console.log('[AuthContext] Auth Hub Event:', payload.event, payload);
            switch (payload.event) {
                case 'signInWithRedirect':
                    console.log('[AuthContext] OAuth sign-in successful, checking user...');
                    checkUser();
                    break;
                case 'signInWithRedirect_failure':
                    console.error('[AuthContext] OAuth sign-in failed:', payload.data);
                    setUser(null);
                    setIsLoading(false);
                    break;
                case 'customOAuthState':
                    console.log('[AuthContext] Custom OAuth state:', payload.data);
                    checkUser();
                    break;
                case 'tokenRefresh':
                    console.log('[AuthContext] Token refreshed');
                    break;
                case 'tokenRefresh_failure':
                    console.error('[AuthContext] Token refresh failed:', payload.data);
                    break;
            }
        });

        return () => hubListener();
    }, []);

    const checkUser = async () => {
        console.log('[AuthContext] checkUser() called');
        try {
            console.log('[AuthContext] Attempting to get current user...');
            const currentUser = await getCurrentUser();
            console.log('[AuthContext] Current user found:', currentUser);

            console.log('[AuthContext] Fetching auth session for ID token...');
            const session = await fetchAuthSession();
            console.log('[AuthContext] Session fetched:', session);

            // Extract attributes from ID token payload instead of calling fetchUserAttributes
            const idToken = session.tokens?.idToken;
            const attributes = idToken?.payload ? {
                email: idToken.payload['email'] as string,
                name: idToken.payload['name'] as string,
                sub: idToken.payload['sub'] as string,
            } : {};
            console.log('[AuthContext] User attributes from ID token:', attributes);

            const userData = { ...currentUser, attributes };
            setUser(userData);
            console.log('[AuthContext] User state updated:', userData);
        } catch (error) {
            console.log('[AuthContext] No user found or error:', error);
            setUser(null);
        } finally {
            setIsLoading(false);
            console.log('[AuthContext] checkUser() completed');
        }
    };

    const handleSignIn = async (input: SignInInput) => {
        const result = await signIn(input);
        await checkUser();
        return result;
    };

    const handleSignOut = async () => {
        await signOut();
        setUser(null);
    };

    const handleSignUp = async (input: SignUpInput) => {
        return await signUp(input);
    };

    const getToken = async () => {
        try {
            const session = await fetchAuthSession();
            return session.tokens?.accessToken?.toString();
        } catch (error) {
            return undefined;
        }
    };

    const handleSignInWithGoogle = async () => {
        console.log("Initiating Google Sign In...");
        console.log("Current Auth Config:", JSON.stringify(authConfig, null, 2));
        try {
            // Check if user is already authenticated and sign out first if needed
            try {
                await getCurrentUser();
                console.log("User already authenticated, signing out first...");
                await signOut();
                setUser(null);
            } catch (error) {
                // No user authenticated, proceed with sign in
                console.log("No existing session found, proceeding with Google sign-in");
            }

            await signInWithRedirect({ provider: 'Google' });
            console.log("Google Sign In initiated successfully");
        } catch (error) {
            console.error("Google Sign In error:", error);
            console.error("Error details:", JSON.stringify(error, null, 2));
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            signIn: handleSignIn,
            signInWithGoogle: handleSignInWithGoogle,
            signOut: handleSignOut,
            signUp: handleSignUp,
            getToken
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
