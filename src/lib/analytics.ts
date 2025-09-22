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

// Ensure session exists in database - prevent race conditions
const ensureSessionExists = async (sessionId: string, geoData: { country?: string; city?: string }) => {
  // Prevent concurrent session creation
  if (sessionCreationInProgress) {
    // Wait a bit for the other creation to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    return;
  }

  try {
    const { data: existingSession, error: sessionError } = await supabase
      .from('analytics_sessions')
      .select('id')
      .eq('session_id', sessionId)
      .maybeSingle();

    // Only create session if it doesn't exist and there's no error
    if (!existingSession && !sessionError) {
      console.log('Creating new session for sessionId:', sessionId);
      
      // Set flag to prevent concurrent creation
      sessionCreationInProgress = true;
      
      try {
        await supabase
          .from('analytics_sessions')
          .insert({
            session_id: sessionId,
            device_type: getDeviceType(),
            browser: getBrowser(),
            referrer: document.referrer || null,
            country: geoData.country || null,
          });
      } finally {
        sessionCreationInProgress = false; // Always reset the flag
      }
    } else if (existingSession) {
      console.log('Using existing session:', sessionId);
    }
  } catch (error) {
    sessionCreationInProgress = false; // Reset on error
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

// Track custom events (like contact form submission, CV download)
export const trackEvent = async (eventType: string, eventData?: any, pagePath?: string) => {
  try {
    const sessionId = getSessionId();
    
    await supabase
      .from('analytics_events')
      .insert({
        event_type: eventType,
        event_data: eventData || null,
        session_id: sessionId,
        page_path: pagePath || window.location.pathname,
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
    // Get total page views
    let pageViewsQuery = supabase.from('analytics_page_views').select('*');
    if (shouldFilterByDate) {
      pageViewsQuery = pageViewsQuery.gte('created_at', startDate.toISOString());
    }
    const { data: pageViews, error: pvError } = await pageViewsQuery;

    if (pvError) throw pvError;

    // Get unique sessions
    let sessionsQuery = supabase.from('analytics_sessions').select('*');
    if (shouldFilterByDate) {
      sessionsQuery = sessionsQuery.gte('first_visit_at', startDate.toISOString());
    }
    const { data: sessions, error: sessionsError } = await sessionsQuery;

    if (sessionsError) throw sessionsError;

    // Get events for theme tracking
    let eventsQuery = supabase.from('analytics_events').select('*');
    if (shouldFilterByDate) {
      eventsQuery = eventsQuery.gte('created_at', startDate.toISOString());
    }
    const { data: events, error: eventsError } = await eventsQuery;

    if (eventsError) throw eventsError;

    // Calculate stats
    const totalViews = pageViews?.length || 0;
    const uniqueVisitors = sessions?.length || 0;
    
    // Calculate bounce rate (sessions with only 1 page view)
    const bounceCount = sessions?.filter(session => session.page_views_count === 1).length || 0;
    const bounceRate = uniqueVisitors > 0 ? (bounceCount / uniqueVisitors) * 100 : 0;

    // Calculate average session duration
    const totalDuration = sessions?.reduce((sum, session) => {
      const duration = new Date(session.last_activity_at).getTime() - new Date(session.first_visit_at).getTime();
      return sum + Math.max(0, duration / 1000); // Convert to seconds
    }, 0) || 0;
    const avgSessionTime = uniqueVisitors > 0 ? Math.round(totalDuration / uniqueVisitors) : 0;

    // Top pages - normalize page names properly
    const pageStats = pageViews?.reduce((acc: any, view) => {
      let page = view.page_path === '/' ? 'Home' : view.page_path.replace('/', '').replace('#', '');
      // Normalize common variations to prevent duplicates
      page = page.toLowerCase() === 'home' || page === '' ? 'Home' : page;
      // Capitalize first letter for consistency
      if (page !== 'Home') {
        page = page.charAt(0).toUpperCase() + page.slice(1);
      }
      acc[page] = (acc[page] || 0) + 1;
      return acc;
    }, {}) || {};

    const topPages = Object.entries(pageStats)
      .map(([page, views]) => ({
        page,
        views: views as number,
        percentage: totalViews > 0 ? ((views as number / totalViews) * 100).toFixed(1) : '0'
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

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

    // Professional filter tracking stats  
    const filterEvents = events?.filter(event => event.event_type === 'professional_filters_applied') || [];
    const filterStats = filterEvents.reduce((acc: any, event) => {
      const eventData = event.event_data as any;
      if (eventData) {
        // Track area filters
        if (eventData.area && eventData.area !== 'All') {
          const key = `Area: ${eventData.area}`;
          acc[key] = (acc[key] || 0) + 1;
        }
        // Track technology filters
        if (eventData.technologies && eventData.technologies.length > 0) {
          eventData.technologies.forEach((tech: string) => {
            const key = `Skill: ${tech}`;
            acc[key] = (acc[key] || 0) + 1;
          });
        }
        // Track software filters
        if (eventData.software && eventData.software.length > 0) {
          eventData.software.forEach((software: string) => {
            const key = `Software: ${software}`;
            acc[key] = (acc[key] || 0) + 1;
          });
        }
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

    // Recent activity - include both page views and events (respecting time filter)
    const recentPageViews = pageViews
      ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) // Sort by newest first
      .slice(0, 50) // Take most recent 50 from filtered data
      .map(view => ({
        action: 'Page view',
        page: view.page_path === '/' ? 'Home' : view.page_path,
        time: getTimeAgo(new Date(view.created_at)),
        location: view.city && view.country ? `${view.city}, ${view.country}` : view.country || 'Unknown',
        type: 'page_view',
        timestamp: view.created_at
      })) || [];

    const recentEvents = events
      ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) // Sort by newest first
      .slice(0, 50) // Take most recent 50 from filtered data
      .map(event => ({
        action: event.event_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        page: event.page_path || 'Unknown',
        time: getTimeAgo(new Date(event.created_at)),
        location: 'Event', // Events don't have location data
        type: 'event',
        data: event.event_data,
        timestamp: event.created_at
      })) || [];

    // Combine activity without sorting - maintain chronological order from database
    const combinedActivity = [...recentPageViews, ...recentEvents]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 100);

    // Event statistics
    const eventStats = events?.reduce((acc: any, event) => {
      const eventType = event.event_type;
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

    // Country statistics
    const countryStats = pageViews?.reduce((acc: any, view) => {
      const country = view.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {}) || {};

    const topCountries = Object.entries(countryStats)
      .map(([country, visits]) => ({
        country,
        visits: visits as number,
        percentage: totalViews > 0 ? (((visits as number) / totalViews) * 100).toFixed(1) : '0'
      }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5);

    return {
      totalViews,
      uniqueVisitors,
      bounceRate: Math.round(bounceRate * 10) / 10,
      avgSessionTime: formatDuration(avgSessionTime),
      topPages,
      deviceTypes,
      filterUsage,
      trafficData,
      recentActivity: combinedActivity,
      topCountries,
      topEvents,
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