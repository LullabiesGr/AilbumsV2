# Supabase Auth Callback Setup

This document explains how to set up the authentication callback for your Supabase Auth integration with the desktop popup flow.

## Files Created

1. **auth-callback.js** - The main JavaScript logic for handling auth callbacks
2. **auth-callback.html** - A complete HTML page that includes the callback logic with UI feedback

## Setup Instructions

### 1. Deploy the Callback Page

Upload the `auth-callback.html` file to your domain at:
```
https://ailbums.pro/auth/callback
```

### 2. Configure Supabase Credentials

In the `auth-callback.html` file, replace the placeholder values with your actual Supabase credentials:

```javascript
const supabaseClient = supabase.createClient(
    'YOUR_SUPABASE_URL',        // Replace with your Supabase project URL
    'YOUR_SUPABASE_ANON_KEY'    // Replace with your Supabase anon key
);
```

### 3. Configure Supabase Auth Settings

In your Supabase dashboard:

1. Go to **Authentication > Settings**
2. Add your callback URL to **Redirect URLs**:
   ```
   https://ailbums.pro/auth/callback
   https://ailbums.pro/auth/callback?desktop=1
   ```

### 4. Update Your Auth Provider Configuration

Make sure your Google OAuth provider is configured with the correct redirect URI:
```
https://ailbums.pro/auth/callback
```

## How It Works

### For Desktop App (Popup Flow)

1. User clicks "Login with Google" in the desktop app
2. App opens popup to `https://ailbums.pro/login?desktop=1`
3. User completes Google OAuth flow
4. Supabase redirects to `https://ailbums.pro/auth/callback?desktop=1`
5. Callback page detects it's in a popup (`window.opener` exists)
6. Retrieves Supabase session with `getSession()`
7. Sends auth data to parent window via `postMessage()`
8. Closes popup window automatically

### For Web App (Normal Flow)

1. User completes OAuth flow
2. Supabase redirects to `https://ailbums.pro/auth/callback`
3. Callback page detects it's NOT in a popup
4. Redirects to dashboard normally

## Security Considerations

- The callback page verifies `window.opener` exists before sending messages
- Uses `postMessage()` for secure cross-window communication
- Includes error handling for failed authentication attempts
- Automatically closes popup windows to prevent lingering auth windows

## Testing

To test the popup flow:

1. Open browser console
2. Run: 
   ```javascript
   const popup = window.open('https://ailbums.pro/login?desktop=1', 'test', 'width=500,height=600');
   window.addEventListener('message', (e) => console.log('Received:', e.data));
   ```
3. Complete the auth flow in the popup
4. Check console for the auth data message

## Troubleshooting

### Common Issues

1. **"No session found"** - Wait longer for session establishment or check Supabase configuration
2. **Popup blocked** - Ensure popups are allowed for your domain
3. **CORS errors** - Verify your domain is added to Supabase allowed origins
4. **Wrong credentials** - Double-check your Supabase URL and anon key

### Debug Mode

Add `?debug=1` to the callback URL to enable console logging:
```
https://ailbums.pro/auth/callback?desktop=1&debug=1
```