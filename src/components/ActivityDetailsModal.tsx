import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Clock, Monitor, Smartphone, Tablet, X, Eye, MousePointer } from "lucide-react";

interface ActivityDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: {
    type: 'event' | 'page_view';
    action: string;
    page: string;
    time: string;
    location: string;
    data?: any;
  } | null;
}

const ActivityDetailsModal: React.FC<ActivityDetailsModalProps> = ({
  isOpen,
  onClose,
  activity
}) => {
  if (!activity) return null;

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getActivityIcon = () => {
    return activity.type === 'event' ? 
      <MousePointer className="h-5 w-5" /> : 
      <Eye className="h-5 w-5" />;
  };

  const getActivityTitle = () => {
    return activity.type === 'event' ? 
      'User Interaction Details' : 
      'Page View Details';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-modern text-xl flex items-center gap-2">
            {getActivityIcon()}
            {getActivityTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Activity Information */}
          <Card>
            <CardHeader>
              <CardTitle className="font-modern text-lg flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Activity Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Type:</span>
                <Badge variant={activity.type === 'event' ? 'default' : 'secondary'} className="font-modern">
                  {activity.type === 'event' ? 'User Interaction' : 'Page View'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Action:</span>
                <Badge variant="outline" className="font-modern">
                  {activity.action}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Page:</span>
                <span className="font-medium">{activity.page}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Time:</span>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{activity.time}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Location:</span>
                <span className="font-medium">{activity.location}</span>
              </div>
            </CardContent>
          </Card>

          {/* Additional Data */}
          {activity.data && (
            <Card>
              <CardHeader>
                <CardTitle className="font-modern text-lg">Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {activity.data.referrer && (
                  <div className="flex items-start justify-between">
                    <span className="text-sm text-muted-foreground">Referrer:</span>
                    <span className="font-medium text-right max-w-md break-all">{activity.data.referrer}</span>
                  </div>
                )}
                {activity.data.pageTitle && (
                  <div className="flex items-start justify-between">
                    <span className="text-sm text-muted-foreground">Page Title:</span>
                    <span className="font-medium text-right max-w-md">{activity.data.pageTitle}</span>
                  </div>
                )}
                {activity.data.device && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Device:</span>
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(activity.data.device)}
                      <span className="font-medium capitalize">{activity.data.device}</span>
                    </div>
                  </div>
                )}
                {activity.data.browser && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Browser:</span>
                    <span className="font-medium">{activity.data.browser}</span>
                  </div>
                )}
                {activity.data.operatingSystem && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">OS:</span>
                    <span className="font-medium">{activity.data.operatingSystem}</span>
                  </div>
                )}
                {activity.data.userAgent && (
                  <div className="flex items-start justify-between">
                    <span className="text-sm text-muted-foreground">User Agent:</span>
                    <span className="font-medium text-xs max-w-md text-right break-all">{activity.data.userAgent}</span>
                  </div>
                )}
                {activity.data.sessionId && (
                  <div className="flex items-start justify-between">
                    <span className="text-sm text-muted-foreground">Session ID:</span>
                    <span className="font-mono text-xs max-w-md text-right break-all">{activity.data.sessionId}</span>
                  </div>
                )}
                {activity.data.ipAddress && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">IP Address:</span>
                    <span className="font-mono text-sm">{activity.data.ipAddress}</span>
                  </div>
                )}
                {activity.data.source && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Source:</span>
                    <span className="font-medium">{activity.data.source}</span>
                  </div>
                )}
                {activity.data.eventType && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Event Type:</span>
                    <span className="font-medium">{activity.data.eventType}</span>
                  </div>
                )}
                {activity.data.category && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Category:</span>
                    <span className="font-medium">{activity.data.category}</span>
                  </div>
                )}
                {activity.data.previousMode && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Previous Mode:</span>
                    <span className="font-medium">{activity.data.previousMode}</span>
                  </div>
                )}
                {activity.data.viewMode && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">View Mode:</span>
                    <span className="font-medium">{activity.data.viewMode}</span>
                  </div>
                )}
                {activity.data.institution && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Institution:</span>
                    <span className="font-medium">{activity.data.institution}</span>
                  </div>
                )}
                {activity.data.sessionDuration && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Session Duration:</span>
                    <span className="font-medium">{Math.round(activity.data.sessionDuration / 1000)}s</span>
                  </div>
                )}
                {activity.data.timestamp && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Event Timestamp:</span>
                    <span className="font-medium text-xs">{new Date(activity.data.timestamp).toLocaleString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Usage Note */}
          <div className="text-center text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg">
            This represents a single {activity.type === 'event' ? 'user interaction' : 'page view'} from your website visitors.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityDetailsModal;