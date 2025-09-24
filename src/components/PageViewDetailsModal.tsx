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
import { Globe, Clock, Monitor, Smartphone, Tablet, X } from "lucide-react";

interface PageViewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageView: {
    page: string;
    time: string;
    location: string;
    data?: any;
  } | null;
}

const PageViewDetailsModal: React.FC<PageViewDetailsModalProps> = ({
  isOpen,
  onClose,
  pageView
}) => {
  if (!pageView) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="font-modern text-xl">
            Page View Details
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Page Information */}
          <Card>
            <CardHeader>
              <CardTitle className="font-modern text-lg flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Page Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Page:</span>
                <Badge variant="secondary" className="font-modern">
                  {pageView.page}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Visited:</span>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{pageView.time}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Location:</span>
                <span className="font-medium">{pageView.location}</span>
              </div>
            </CardContent>
          </Card>

          {/* Additional Data */}
          {pageView.data && (
            <Card>
              <CardHeader>
                <CardTitle className="font-modern text-lg">Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pageView.data.source && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Referrer:</span>
                    <span className="font-medium">{pageView.data.source}</span>
                  </div>
                )}
                {pageView.data.device && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Device:</span>
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(pageView.data.device)}
                      <span className="font-medium">{pageView.data.device}</span>
                    </div>
                  </div>
                )}
                {pageView.data.browser && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Browser:</span>
                    <span className="font-medium">{pageView.data.browser}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Usage Note */}
          <div className="text-center text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg">
            This represents a single page view from your website visitors.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PageViewDetailsModal;