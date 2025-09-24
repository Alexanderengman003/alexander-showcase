import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Globe, Clock, Monitor, Smartphone, X, RefreshCw, Link, Home, ExternalLink } from "lucide-react";
import { getReferrerStats } from "@/lib/analytics";

interface ReferrerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeRange: string;
}

export const ReferrerDetailsModal = ({ isOpen, onClose, timeRange }: ReferrerDetailsModalProps) => {
  const [referrerData, setReferrerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const timeRanges = [
    { value: "1d", label: "24h", days: 1 },
    { value: "7d", label: "7 days", days: 7 },
    { value: "30d", label: "30 days", days: 30 },
    { value: "90d", label: "90 days", days: 90 },
    { value: "180d", label: "6 months", days: 180 },
    { value: "365d", label: "1 year", days: 365 },
    { value: "all", label: "All data", days: 0 }
  ];

  const fetchReferrerData = async () => {
    setLoading(true);
    try {
      const selectedRange = timeRanges.find(range => range.value === timeRange);
      const days = selectedRange?.days || 7;
      const data = await getReferrerStats(days);
      setReferrerData(data);
    } catch (error) {
      console.error('Error fetching referrer data:', error);
      setReferrerData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReferrerData();
    }
  }, [isOpen, timeRange]);

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

  const getReferrerIcon = (referrer: string) => {
    if (referrer === 'Direct') {
      return <Home className="h-4 w-4 text-primary" />;
    }
    return <Link className="h-4 w-4 text-primary" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-modern">
            <Globe className="h-5 w-5 text-primary" />
            Traffic Sources Details
          </DialogTitle>
          <DialogDescription className="font-modern">
            How users found your site - based on first visit per session only
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="font-modern">Loading referrer data...</span>
            </div>
          </div>
        ) : referrerData ? (
          <div className="flex flex-col gap-6 overflow-hidden">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium font-modern">Total Sessions</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-modern">{referrerData.totalSessions}</div>
                  <p className="text-xs text-muted-foreground">First visits only</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium font-modern">Direct</CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-modern">{referrerData.directPercentage}%</div>
                  <p className="text-xs text-muted-foreground">No referrer</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium font-modern">LinkedIn</CardTitle>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-modern">{referrerData.linkedinPercentage}%</div>
                  <p className="text-xs text-muted-foreground">From LinkedIn</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium font-modern">Other</CardTitle>
                  <Link className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-modern">{referrerData.otherPercentage}%</div>
                  <p className="text-xs text-muted-foreground">Other sources</p>
                </CardContent>
              </Card>
            </div>

            {/* Referrer Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Referrer Sources */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-modern flex items-center gap-2">
                    <Link className="h-5 w-5" />
                    Traffic Sources
                  </CardTitle>
                  <CardDescription className="font-modern">
                    Breakdown by referrer source
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-h-[300px] overflow-y-auto">
                  {referrerData.detailedStats.length > 0 ? (
                    <div className="space-y-3">
                      {referrerData.detailedStats.map((stat: any, index: number) => (
                        <div key={stat.referrer} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-semibold text-primary">{index + 1}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getReferrerIcon(stat.referrer)}
                              <span className="font-medium font-modern">{stat.referrer}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold font-modern">{stat.count}</div>
                            <div className="text-xs text-muted-foreground">{stat.percentage}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <Globe className="h-6 w-6 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No referrer data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-modern flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Sessions
                  </CardTitle>
                  <CardDescription className="font-modern">
                    Latest user sessions by referrer
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-h-[300px] overflow-y-auto">
                  {referrerData.sessionsData.length > 0 ? (
                    <div className="space-y-2">
                      {referrerData.sessionsData.slice(0, 10).map((session: any) => (
                        <div key={session.session_id} className="flex items-center justify-between text-sm p-2 rounded bg-muted/30">
                          <div className="flex items-center gap-2">
                            {getReferrerIcon(session.referrer_display)}
                            <span className="font-medium">{session.referrer_display}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {session.country || 'Unknown'}
                            </Badge>
                            <span>{formatDate(session.first_visit_at)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <Clock className="h-6 w-6 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No session data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Detailed User Sessions Table */}
            <Card className="flex-1 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-modern">User Session Details</CardTitle>
                  <CardDescription className="font-modern">
                    How users found your site with session information
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchReferrerData}
                  className="font-modern"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent className="overflow-auto max-h-[300px]">
                {referrerData.sessionsData.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-modern w-32">First Visit</TableHead>
                        <TableHead className="font-modern w-32">Referrer Source</TableHead>
                        <TableHead className="font-modern w-24">Location</TableHead>
                        <TableHead className="font-modern w-20">Device</TableHead>
                        <TableHead className="font-modern w-20">Browser</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {referrerData.sessionsData.map((session: any) => (
                        <TableRow key={session.session_id}>
                          <TableCell className="font-medium font-modern text-xs">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span>{formatDate(session.first_visit_at)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getReferrerIcon(session.referrer_display)}
                              <span className="font-modern text-sm">
                                {session.referrer ? (
                                  <a
                                    href={session.referrer}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-primary underline-offset-4 hover:underline"
                                  >
                                    {session.referrer_display}
                                  </a>
                                ) : (
                                  'Direct'
                                )}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              <span className="font-modern text-sm">
                                {session.country || 'Unknown'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getDeviceIcon(session.device_type || '')}
                              <span className="font-modern text-sm capitalize">
                                {session.device_type || 'Unknown'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-modern text-xs">
                              {session.browser || 'Unknown'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="font-modern">No session data available</p>
                    <p className="text-xs mt-1 font-modern">Session data will appear here when users visit your site</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium font-modern mb-2">No Referrer Data Available</h3>
            <p className="font-modern">Traffic source data will appear here when users visit your site</p>
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