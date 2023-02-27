# CognitoDemo

Cognito Login SPA w/ Vite, Cloudscape Design, Zustand

## Running

1. Copy .env to .env.local
2. Create a user pool in the AWS Console
3. Add an App Client app integration
4. Create a validated user in the user pool
5. Paste the user pool and client app IDs into .env.local
6. Run `npm install`
7. Run `npm run dev`
8. Login, follow the password reset prompt
9. Verify the JWT in jwt.io
