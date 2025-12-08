// Improved network check with multiple endpoints and better error handling
// Uses multiple fetch attempts to check internet connectivity

// Specific check for Google services availability
export async function checkGoogleServicesAvailability(timeoutMs: number = 3000): Promise<boolean> {
  // Google services specific endpoints
  const googleEndpoints = [
    'https://www.googleapis.com/generate_204',
    'https://firebaseinstallations.googleapis.com/generate_204',
    'https://firestore.googleapis.com/generate_204',
    'https://firebase-settings.crashlytics.com/generate_204'
  ];
  
  const endpointTimeoutMs = Math.min(timeoutMs / 2, 1500);
  
  for (const endpoint of googleEndpoints) {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
    }, endpointTimeoutMs);
    
    try {
      const resp = await fetch(endpoint, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      clearTimeout(timer);
      
      if (resp.ok) {
        console.log(`Google services check succeeded with ${endpoint}`);
        return true;
      }
    } catch (error) {
      console.log(`Google services check failed for ${endpoint}:`, error);
    } finally {
      clearTimeout(timer);
    }
  }
  
  console.warn('All Google services connectivity checks failed');
  return false;
}
