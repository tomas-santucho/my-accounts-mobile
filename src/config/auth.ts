export const authConfig = {
    userPoolId: process.env['EXPO_PUBLIC_COGNITO_USER_POOL_ID'] || "sa-east-1_PLACEHOLDER",
    userPoolClientId: process.env['EXPO_PUBLIC_COGNITO_APP_CLIENT_ID'] || "PLACEHOLDER",
    region: "sa-east-1",
    domain: process.env['EXPO_PUBLIC_COGNITO_DOMAIN'] || "",
    redirectSignIn: (process.env['EXPO_PUBLIC_OAUTH_REDIRECT_SIGN_IN'] || "").split(','),
    redirectSignOut: (process.env['EXPO_PUBLIC_OAUTH_REDIRECT_SIGN_OUT'] || "").split(','),
};
