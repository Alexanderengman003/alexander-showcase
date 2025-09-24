import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Globe, Clock, Monitor, Smartphone, X, RefreshCw, MousePointer, Filter, Mail, Palette, Eye, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventType: string;
  eventDisplayName: string;
  timeRange: string;
}

interface EventDetail {
  id: string;
  created_at: string;
  event_data: any;
  page_path: string;
  session_id: string;
  session_data?: {
    device_type: string;
    browser: string;
    country: string;
    referrer: string;
  };
}

export const EventDetailsModal = ({ isOpen, onClose, eventType, eventDisplayName, timeRange }: EventDetailsModalProps) => {
  const [eventDetails, setEventDetails] = useState<EventDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEvents, setTotalEvents] = useState(0);

  const timeRanges = [
    { value: "1d", label: "24h", days: 1 },
    { value: "7d", label: "7 days", days: 7 },
    { value: "30d", label: "30 days", days: 30 },
    { value: "90d", label: "90 days", days: 90 },
    { value: "180d", label: "6 months", days: 180 },
    { value: "365d", label: "1 year", days: 365 },
    { value: "all", label: "All data", days: 0 }
  ];

  // Convert display names back to database event types
  const getEventTypeFromDisplay = (displayName: string): string => {
    const eventMap: { [key: string]: string } = {
      'Cv Download Click': 'cv_download_click',
      'Professional Filters Applied': 'professional_filters_applied',
      'Contact Form Submit': 'contact_form_submit',
      'Contact Form Submission': 'contact_form_submit',
      'Theme Toggle': 'theme_toggle',
      'Theme Change': 'theme_change',
      'Page View': 'page_view',
      'Button Click': 'button_click',
      'Form Submit': 'form_submit',
      'Navigation': 'navigation',
      'Filter Applied': 'filter_applied'
    };

    // Try exact match first
    if (eventMap[displayName]) {
      return eventMap[displayName];
    }

    // Try converting display name back to snake_case
    return displayName.toLowerCase().replace(/\s+/g, '_');
  };

  const getEventIcon = (eventType: string) => {
    if (eventType.includes('download') || eventType.includes('cv')) {
      return <Download className="h-5 w-5 text-primary" />;
    }
    if (eventType.includes('filter')) {
      return <Filter className="h-5 w-5 text-primary" />;
    }
    if (eventType.includes('contact') || eventType.includes('form')) {
      return <Mail className="h-5 w-5 text-primary" />;
    }
    if (eventType.includes('theme')) {
      return <Palette className="h-5 w-5 text-primary" />;
    }
    if (eventType.includes('view')) {
      return <Eye className="h-5 w-5 text-primary" />;
    }
    return <MousePointer className="h-5 w-5 text-primary" />;
  };

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      const selectedRange = timeRanges.find(range => range.value === timeRange);
      const days = selectedRange?.days || 7;
      const shouldFilterByDate = days > 0;
      
      let startDate: string | undefined;
      if (shouldFilterByDate) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        startDate = date.toISOString();
      }

      const dbEventType = getEventTypeFromDisplay(eventDisplayName);

      // Build candidate event_type variants to support legacy and new naming
      const titleCase = eventDisplayName; // e.g., "Filter Applied"
      const lower = titleCase.toLowerCase(); // e.g., "filter applied"
      const snake = lower.replace(/\s+/g, '_'); // e.g., "filter_applied"
      const pascalSpaced = titleCase
        .split(' ')
        .map((w, i) => (i === 0 ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase()))
        .join(' '); // e.g., "Filter applied"

      const candidates = Array.from(new Set([dbEventType, titleCase, pascalSpaced, lower, snake]));

      // Get events for this specific type (match any candidate)
      let eventsQuery = supabase
        .from('analytics_events')
        .select('*')
        .in('event_type', candidates)
        .order('created_at', { ascending: false });

      if (startDate) {
        eventsQuery = eventsQuery.gte('created_at', startDate);
      }

      const { data: events, error: eventsError } = await eventsQuery;

      if (eventsError) throw eventsError;

      setTotalEvents(events?.length || 0);

      if (events && events.length > 0) {
        // Get session details for each event
        const sessionIds = events.map(event => event.session_id).filter(Boolean);
        
        if (sessionIds.length > 0) {
          const { data: sessions, error: sessionsError } = await supabase
            .from('analytics_sessions')
            .select('session_id, device_type, browser, country, referrer')
            .in('session_id', sessionIds);

          if (sessionsError) throw sessionsError;

          // Combine event and session data
          const enrichedEvents = events.map(event => {
            const sessionData = sessions?.find(session => session.session_id === event.session_id);
            return {
              ...event,
              session_data: sessionData
            };
          });

          setEventDetails(enrichedEvents);
        } else {
          setEventDetails(events);
        }
      } else {
        setEventDetails([]);
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
      setEventDetails([]);
      setTotalEvents(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && eventDisplayName) {
      fetchEventDetails();
    }
  }, [isOpen, eventDisplayName, timeRange]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getDeviceIcon = (deviceType: string) => {
    if (deviceType === 'mobile' || deviceType === 'tablet') {
      return <Smartphone className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const formatEventData = (eventData: any, eventType: string) => {
    if (!eventData) return 'N/A';
    
    if (eventType.includes('filter') && eventData.area) {
      return `Area: ${eventData.area}`;
    }
    if (eventType.includes('filter') && eventData.technologies) {
      return `Tech: ${eventData.technologies.join(', ')}`;
    }
    if (eventType.includes('theme') && eventData.theme) {
      return `Theme: ${eventData.theme}`;
    }
    if (eventData.source) {
      return `Source: ${eventData.source}`;
    }
    if (typeof eventData === 'object') {
      return JSON.stringify(eventData);
    }
    return eventData.toString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-modern">
            {getEventIcon(eventType)}
            {eventDisplayName} Details
          </DialogTitle>
          <DialogDescription className="font-modern">
            Detailed information about {eventDisplayName.toLowerCase()} events in the selected time period
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="font-modern">Loading event data...</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 overflow-hidden">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium font-modern">Total Events</CardTitle>
                  {getEventIcon(eventType)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-modern">{totalEvents}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium font-modern">Unique Countries</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-modern">
                    {new Set(eventDetails.map(event => event.session_data?.country).filter(Boolean)).size}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium font-modern">Device Types</CardTitle>
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-modern">
                    {new Set(eventDetails.map(event => event.session_data?.device_type).filter(Boolean)).size}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium font-modern">Browsers</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-modern">
                    {new Set(eventDetails.map(event => event.session_data?.browser).filter(Boolean)).size}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Table */}
            <Card className="flex-1 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-modern">Event History</CardTitle>
                  <CardDescription className="font-modern">
                    Chronological list of all {eventDisplayName.toLowerCase()} events
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchEventDetails}
                  className="font-modern"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent className="overflow-auto max-h-[400px]">
                {eventDetails.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-modern w-32">Date & Time</TableHead>
                        <TableHead className="font-modern w-24">Location</TableHead>
                        <TableHead className="font-modern w-20">Device</TableHead>
                        <TableHead className="font-modern w-20">Browser</TableHead>
                        <TableHead className="font-modern w-24">Section</TableHead>
                        <TableHead className="font-modern w-32">Item</TableHead>
                        <TableHead className="font-modern w-24">Referrer</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {eventDetails.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell className="font-medium font-modern text-xs">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="whitespace-nowrap">{formatDate(event.created_at)}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              <span className="font-modern">
                                {event.session_data?.country || 'Unknown'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getDeviceIcon(event.session_data?.device_type || '')}
                              <span className="font-modern capitalize">
                                {event.session_data?.device_type || 'Unknown'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-modern">
                              {event.session_data?.browser || 'Unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-modern text-sm">
                            {event.event_data?.section || 'N/A'}
                          </TableCell>
                          <TableCell className="font-modern text-sm">
                            {event.event_data?.item || 'N/A'}
                          </TableCell>
                          <TableCell className="font-modern text-sm text-muted-foreground">
                            {event.session_data?.referrer ? (
                              <a
                                href={event.session_data.referrer}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary underline-offset-4 hover:underline"
                              >
                                {new URL(event.session_data.referrer).hostname}
                              </a>
                            ) : (
                              'Direct'
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {getEventIcon(eventType)}
                    <p className="font-modern mt-2">No {eventDisplayName.toLowerCase()} events in this time period</p>
                    <p className="text-xs mt-1 font-modern">Events will appear here when users interact with your site</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline" className="font-modern">
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};