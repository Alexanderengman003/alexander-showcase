import { supabase } from "@/integrations/supabase/client";

// Generate or get session ID from localStorage with proper session management
let sessionCreationInProgress = false;

const getSessionId = (): string => {
  let sessionId = localStorage.getItem('portfolio_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('portfolio_session_id', sessionId);
    console.log('Generated new session ID:', sessionId);
  } else {
    console.log('Using existing session ID:', sessionId);
  }
  return sessionId;
};

// Ensure session exists in database - prevent race conditions and duplicates
const ensureSessionExists = async (sessionId: string, geoData: { country?: string; city?: string }) => {
  // Prevent concurrent session creation
  if (sessionCreationInProgress) {
    // Wait for the other creation to complete
    await new Promise(resolve => setTimeout(resolve, 200));
    return;
  }

  try {
    const { data: existingSession, error: sessionError } = await supabase
      .from('analytics_sessions')
      .select('id, first_visit_at')
      .eq('session_id', sessionId)
      .maybeSingle();

    // Only create session if it doesn't exist and there's no error
    if (!existingSession && !sessionError) {
      console.log('Creating new session for sessionId:', sessionId);
      
      // Set flag to prevent concurrent creation
      sessionCreationInProgress = true;
      
      try {
        // Double-check to prevent race condition duplicates
        const { data: doubleCheck } = await supabase
          .from('analytics_sessions')
          .select('id')
          .eq('session_id', sessionId)
          .maybeSingle();
        
        if (!doubleCheck) {
          await supabase
            .from('analytics_sessions')
            .insert({
              session_id: sessionId,
              device_type: getDeviceType(),
              browser: getBrowser(),
              referrer: document.referrer || null,
              country: geoData.country || null,
            });
        }
      } finally {
        sessionCreationInProgress = false;
      }
    } else if (existingSession) {
      console.log('Using existing session:', sessionId);
      
      // Check if this session is very recent (within 5 minutes) to avoid counting page refreshes as new sessions
      const sessionAge = new Date().getTime() - new Date(existingSession.first_visit_at).getTime();
      const fiveMinutesInMs = 5 * 60 * 1000;
      
      if (sessionAge < fiveMinutesInMs) {
        console.log('Session is recent, treating as same session');
      }
    }
  } catch (error) {
    sessionCreationInProgress = false;
    throw error;
  }
};

// Detect device type
const getDeviceType = (): string => {
  const userAgent = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
    return 'mobile';
  }
  return 'desktop';
};

// Get browser name
const getBrowser = (): string => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Other';
};

// Get operating system
const getOperatingSystem = (): string => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Other';
};

// Get geographical information based on IP
const getGeolocation = async (): Promise<{ country?: string; city?: string }> => {
  try {
    console.log('Calling Supabase Edge Function for geolocation...');
    const response = await supabase.functions.invoke('get-geolocation');
    console.log('Geolocation response:', response);
    
    if (response.data) {
      return {
        country: response.data.country || null,
        city: response.data.city || null
      };
    }
  } catch (error) {
    console.warn('Failed to get geolocation:', error);
  }
  return {};
};

// Get current theme
const getCurrentTheme = (): string => {
  const root = document.documentElement;
  return root.classList.contains('dark') ? 'dark' : 'light';
};

// Track page view
export const trackPageView = async (pagePath: string, pageTitle: string) => {
  try {
    const sessionId = getSessionId();
    
    // Get geographical information
    const { country, city } = await getGeolocation();
    
    // Ensure session exists (handles race conditions)
    await ensureSessionExists(sessionId, { country, city });

    // Track the page view
    await supabase
      .from('analytics_page_views')
      .insert({
        page_path: pagePath,
        page_title: pageTitle,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
        device_type: getDeviceType(),
        browser: getBrowser(),
        operating_system: getOperatingSystem(),
        session_id: sessionId,
        country: country || null,
        city: city || null,
      });

  } catch (error) {
    console.error('Error tracking page view:', error);
  }
};

export const trackEvent = async (eventType: string, eventData?: any, pagePath?: string) => {
  try {
    const sessionId = getSessionId();
    
    // Get current page path more accurately
    const currentPage = pagePath || (() => {
      const hash = window.location.hash;
      const pathname = window.location.pathname;
      
      if (hash && hash.startsWith('#')) {
        // If we have a hash, use that as the page
        return hash;
      } else if (pathname === '/' || pathname === '') {
        // Check if we're in a specific section based on scroll position or URL fragment
        const url = new URL(window.location.href);
        if (url.hash) {
          return url.hash;
        }
        // If no hash, try to determine section from scroll position or just return home
        return '/';
      } else {
        // Otherwise use the pathname
        return pathname;
      }
    })();
    
    await supabase
      .from('analytics_events')
      .insert({
        event_type: eventType,
        event_data: eventData || null,
        session_id: sessionId,
        page_path: currentPage,
      });

  } catch (error) {
    console.error('Error tracking event:', error);
  }
};

// Analytics data fetching functions
export const getAnalyticsStats = async (days: number = 7) => {
  const shouldFilterByDate = days > 0;
  const startDate = new Date();
  if (shouldFilterByDate) {
    startDate.setDate(startDate.getDate() - days);
  }

  try {
    // Get ALL page views (for recent activity - no time filter)
    const { data: allPageViews, error: allPvError } = await supabase.from('analytics_page_views').select('*');
    if (allPvError) throw allPvError;

    // Get ALL events (for recent activity - no time filter)  
    const { data: allEvents, error: allEventsError } = await supabase.from('analytics_events').select('*');
    if (allEventsError) throw allEventsError;

    // Get ALL sessions (for recent activity - no time filter)
    const { data: allSessions, error: allSessionsError } = await supabase.from('analytics_sessions').select('*');
    if (allSessionsError) throw allSessionsError;

    // Filter data for time-based statistics
    let pageViews = allPageViews;
    let events = allEvents;
    let sessions = allSessions;

    if (shouldFilterByDate) {
      pageViews = allPageViews?.filter(view => new Date(view.created_at) >= startDate) || [];
      events = allEvents?.filter(event => new Date(event.created_at) >= startDate) || [];
      sessions = allSessions?.filter(session => new Date(session.first_visit_at) >= startDate) || [];
    }

    // Calculate stats with improved unique visitor counting
    const totalViews = pageViews?.length || 0;
    
    // Group sessions by session_id to ensure true uniqueness
    const uniqueSessionIds = new Set(sessions?.map(session => session.session_id) || []);
    const uniqueVisitors = uniqueSessionIds.size;
    
    // Calculate bounce rate (sessions with only 1 page view)
    const bounceCount = sessions?.filter(session => session.page_views_count === 1).length || 0;
    const bounceRate = uniqueVisitors > 0 ? (bounceCount / uniqueVisitors) * 100 : 0;

    // Calculate average session duration - use duration_seconds field or calculate properly
    const sessionsWithDuration = sessions?.filter(session => session.duration_seconds && session.duration_seconds > 0) || [];
    const totalDuration = sessionsWithDuration.length > 0 
      ? sessionsWithDuration.reduce((sum, session) => sum + session.duration_seconds, 0)
      : sessions?.reduce((sum, session) => {
          const duration = new Date(session.last_activity_at).getTime() - new Date(session.first_visit_at).getTime();
          const durationSeconds = Math.max(0, duration / 1000);
          // Cap session duration at 30 minutes to avoid outliers
          return sum + Math.min(durationSeconds, 1800);
        }, 0) || 0;
    
    const avgSessionTime = uniqueVisitors > 0 ? Math.round(totalDuration / uniqueVisitors) : 0;

    // Top sections - extract sections from page paths and events
    const sectionStats: any = {};
    
    // From page views
    pageViews?.forEach(view => {
      let section = 'Home';
      if (view.page_path && view.page_path !== '/') {
        const path = view.page_path.replace('/#', '').replace('#', '');
        section = path.charAt(0).toUpperCase() + path.slice(1) || 'Home';
      }
      sectionStats[section] = (sectionStats[section] || 0) + 1;
    });
    
    // From events with section data
    events?.forEach(event => {
      const eventData = event.event_data as any;
      if (eventData && eventData.section) {
        const section = eventData.section;
        sectionStats[section] = (sectionStats[section] || 0) + 1;
      }
    });

    const topSections = Object.entries(sectionStats)
      .map(([section, count]) => ({
        section,
        count: count as number,
        percentage: totalViews > 0 ? (((count as number) / totalViews) * 100).toFixed(1) : '0'
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Device types
    const deviceStats = sessions?.reduce((acc: any, session) => {
      const device = session.device_type || 'unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {}) || {};

    const deviceTypes = Object.entries(deviceStats)
      .map(([type, count]) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        count: count as number,
        percentage: uniqueVisitors > 0 ? (((count as number) / uniqueVisitors) * 100).toFixed(1) : '0'
      }))
      .sort((a, b) => b.count - a.count);

    // Filter tracking stats for all sections - updated for new event structure
    const filterEvents = events?.filter(event => event.event_type === 'Filter applied') || [];
    const clickEvents = events?.filter(event => event.event_type === 'Link click') || [];

    const filterStats = filterEvents.reduce((acc: any, event) => {
      const eventData = event.event_data as any;
      if (eventData && eventData.section && eventData.filter) {
        const key = `${eventData.section}: ${eventData.filter} = ${eventData.value || 'N/A'}`;
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    }, {});

    const filterUsage = Object.entries(filterStats)
      .map(([filter, count]) => ({
        filter,
        count: count as number,
        percentage: filterEvents.length > 0 ? (((count as number) / filterEvents.length) * 100).toFixed(1) : '0'
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Click statistics - combine both Click and Link click events
    const allClickEvents = events?.filter(event => 
      event.event_type === 'Link click' || event.event_type === 'Click'
    ) || [];
    
    const clickStats = allClickEvents.reduce((acc: any, event) => {
      const eventData = event.event_data as any;
      if (eventData && eventData.section && eventData.item) {
        const key = `${eventData.section}: ${eventData.item}`;
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    }, {});

    const topClickStats = Object.entries(clickStats)
      .map(([click, count]) => ({
        click,
        count: count as number,
        percentage: allClickEvents.length > 0 ? (((count as number) / allClickEvents.length) * 100).toFixed(1) : '0'
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top filter statistics (top 5)
    const topFilterStats = filterUsage.slice(0, 5);

    // Daily traffic data for charts - ensure all days in range are included
    const dailyTraffic = pageViews?.reduce((acc: any, view) => {
      const date = new Date(view.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {}) || {};

    // Get daily unique visitors
    const dailyVisitors = sessions?.reduce((acc: any, session) => {
      const date = new Date(session.first_visit_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {}) || {};

    // Create complete date range and fill missing days with 0
    const dateRange: string[] = [];
    const endDate = new Date();
    const start = shouldFilterByDate ? new Date(startDate) : new Date('2024-01-01'); // Start from a reasonable date
    
    for (let d = new Date(start); d <= endDate; d.setDate(d.getDate() + 1)) {
      dateRange.push(d.toISOString().split('T')[0]);
    }

    const trafficData = dateRange.map(date => ({
      date,
      views: dailyTraffic[date] || 0,
      visitors: dailyVisitors[date] || 0
    }))
    .filter(item => item.views > 0 || item.visitors > 0) // Only include days with activity
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Debug logging to check data structure
    console.log('Traffic data sample:', trafficData.slice(0, 5));
    console.log('Total traffic data points:', trafficData.length);

    // Recent activity - use ALL data (no time filtering)
    const recentPageViews = allPageViews
      ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) // Sort by newest first
      .map(view => ({
        action: 'Page view',
        page: view.page_path === '/' ? 'Home' : view.page_path,
        time: getTimeAgo(new Date(view.created_at)),
        location: view.city && view.country ? `${view.city}, ${view.country}` : view.country || 'Unknown',
        type: 'page_view',
        data: {
          referrer: view.referrer,
          userAgent: view.user_agent,
          device: view.device_type,
          browser: view.browser,
          operatingSystem: view.operating_system,
          ipAddress: view.ip_address,
          sessionId: view.session_id,
          pageTitle: view.page_title
        },
        timestamp: view.created_at
      })) || [];

    const recentEvents = allEvents
      ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) // Sort by newest first
      .map(event => {
        // Create better display names for events
        let displayAction = event.event_type;
        
        if (event.event_type === 'Link click') {
          displayAction = 'Link click';
        } else if (event.event_type === 'Filter applied') {
          displayAction = 'Filter applied';
        } else {
          // For other events, convert snake_case to Title Case
          displayAction = event.event_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
        
        return {
          action: displayAction,
          page: event.page_path || 'Unknown',
          time: getTimeAgo(new Date(event.created_at)),
          location: 'User Interaction',
          type: 'event',
          data: {
            ...(event.event_data && typeof event.event_data === 'object' ? event.event_data : {}),
            sessionId: event.session_id,
            eventType: event.event_type,
            eventId: event.id
          },
          timestamp: event.created_at
        };
      }) || [];

    // Combine activity without limiting - show ALL data
    const combinedActivity = [...recentPageViews, ...recentEvents]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Event statistics - combine Filter applied and Filter into one category
    const eventStats = events?.reduce((acc: any, event) => {
      let eventType = event.event_type;
      // Normalize event types - combine Filter applied and Filter into just Filter
      if (eventType === 'Filter applied') {
        eventType = 'Filter';
      }
      // Normalize event types - combine Link click and Click into just Click
      if (eventType === 'Link click') {
        eventType = 'Click';
      }
      acc[eventType] = (acc[eventType] || 0) + 1;
      return acc;
    }, {}) || {};

    const topEvents = Object.entries(eventStats)
      .map(([event, count]) => ({
        event: event.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        count: count as number,
        percentage: events?.length > 0 ? (((count as number) / events.length) * 100).toFixed(1) : '0'
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Add device types as interaction cards
    const deviceInteractions = deviceTypes?.map((device: any) => ({
      event: `${device.type} Device`,
      count: device.count,
      percentage: device.percentage
    })) || [];

    // Combine events and device interactions
    const allInteractions = [...topEvents, ...deviceInteractions]
      .sort((a, b) => b.count - a.count);

    // Country statistics
    const countryStats = pageViews?.reduce((acc: any, view) => {
      const country = view.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {}) || {};

    // All countries - show every country that has visited
    const allCountries = Object.entries(countryStats)
      .map(([country, visits]) => ({
        country,
        visits: visits as number,
        percentage: totalViews > 0 ? (((visits as number) / totalViews) * 100).toFixed(1) : '0'
      }))
      .sort((a, b) => b.visits - a.visits); // Sort by most visits first

    // City statistics - show every city that has visited
    const cityStats = pageViews?.reduce((acc: any, view) => {
      const city = view.city || 'Unknown';
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {}) || {};

    const allCities = Object.entries(cityStats)
      .map(([city, visits]) => ({
        city,
        visits: visits as number,
        percentage: totalViews > 0 ? (((visits as number) / totalViews) * 100).toFixed(1) : '0'
      }))
      .sort((a, b) => b.visits - a.visits); // Sort by most visits first

    return {
      totalViews,
      uniqueVisitors,
      bounceRate: Math.round(bounceRate * 10) / 10,
      avgSessionTime: formatDuration(avgSessionTime),
      topSections,
      deviceTypes,
      topFilterStats,
      topClickStats,
      trafficData,
      recentActivity: combinedActivity,
      allCountries,
      allCities,
      topEvents: allInteractions,
      totalEvents: events?.length || 0
    };

  } catch (error) {
    console.error('Error fetching analytics stats:', error);
    return null;
  }
};

// Helper function to format duration
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

// Helper function to get time ago
const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};