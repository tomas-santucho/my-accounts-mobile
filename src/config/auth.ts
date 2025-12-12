import { Platform } from 'react-native';

const rawRedirectSignIn = process.env['EXPO_PUBLIC_OAUTH_REDIRECT_SIGN_IN'];
const rawRedirectSignOut = process.env['EXPO_PUBLIC_OAUTH_REDIRECT_SIGN_OUT'];

console.log("Raw EXPO_PUBLIC_OAUTH_REDIRECT_SIGN_IN:", rawRedirectSignIn);
console.log("Raw EXPO_PUBLIC_OAUTH_REDIRECT_SIGN_OUT:", rawRedirectSignOut);
console.log("Platform:", Platform.OS);

// Platform-specific redirect URLs
const getRedirectURLs = () => {
    if (Platform.OS === 'web') {
        // For web development, use localhost
        // In production, this should be your actual domain
        const baseURL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8081';
        return {
            redirectSignIn: [`${baseURL}/`],
            redirectSignOut: [`${baseURL}/`],
        };
    } else {
        // For native (iOS/Android), use deep link scheme
        return {
            redirectSignIn: ["myaccounts://oauthredirect"],
            redirectSignOut: ["myaccounts://signout"],
        };
    }
};

const redirectURLs = getRedirectURLs();
console.log("Using redirect URLs:", redirectURLs);

export const authConfig = {
    userPoolId: process.env['EXPO_PUBLIC_COGNITO_USER_POOL_ID'] || "sa-east-1_PLACEHOLDER",
    userPoolClientId: process.env['EXPO_PUBLIC_COGNITO_APP_CLIENT_ID'] || "PLACEHOLDER",
    region: "sa-east-1",
    domain: process.env['EXPO_PUBLIC_COGNITO_DOMAIN'] || "",
    ...redirectURLs,
};
