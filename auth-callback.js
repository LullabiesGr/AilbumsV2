// Supabase Auth Callback Handler
// This script should be included on your auth callback page at https://ailbums.pro/auth/callback

(async function() {
  try {
    // Check if this is running in a popup window
    const isPopup = window.opener && window.opener !== window;
    const urlParams = new URLSearchParams(window.location.search);
    const isDesktop = urlParams.get('desktop') === '1';
    
    if (isPopup && isDesktop) {
      // This is a popup window from the desktop app
      console.log('Detected popup window for desktop auth');
      
      // Initialize Supabase client (replace with your actual Supabase config)
      const { createClient } = supabase;
      const supabaseClient = createClient(
        'YOUR_SUPABASE_URL', 
        'YOUR_SUPABASE_ANON_KEY'
      );
      
      // Get the current session
      const { data: { session }, error } = await supabaseClient.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        // Send error to parent window
        window.opener.postMessage({
          error: error.message || 'Authentication failed'
        }, '*');
        window.close();
        return;
      }
      
      if (session && session.access_token && session.user) {
        console.log('Session found, sending to parent window');
        
        // Prepare user data
        const userData = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email,
          picture: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture
        };
        
        // Send authentication data to parent window
        window.opener.postMessage({
          token: session.access_token,
          user: userData,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at
        }, '*');
        
        console.log('Auth data sent to parent window');
        
        // Close the popup window
        window.close();
      } else {
        console.log('No session found');
        // Send error to parent window
        window.opener.postMessage({
          error: 'No authentication session found'
        }, '*');
        window.close();
      }
    } else {
      // Not a popup or not desktop - redirect to dashboard normally
      console.log('Not a popup window, redirecting to dashboard');
      window.location.href = '/dashboard';
    }
  } catch (error) {
    console.error('Auth callback error:', error);
    
    if (window.opener) {
      // Send error to parent window if it's a popup
      window.opener.postMessage({
        error: error.message || 'Authentication failed'
      }, '*');
      window.close();
    } else {
      // Redirect to error page or login page
      window.location.href = '/login?error=auth_failed';
    }
  }
})();