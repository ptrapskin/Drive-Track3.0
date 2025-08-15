'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Share, FileText, Loader2 } from 'lucide-react';
import { usePDFGenerator, generatePDFFileName } from '@/hooks/use-pdf-generator';
import { Session, UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface PDFExportComponentProps {
  sessions: Session[];
  userProfile: UserProfile | null;
  dateRange?: {
    start: string;
    end: string;
  };
  className?: string;
}

export const PDFExportComponent: React.FC<PDFExportComponentProps> = ({
  sessions,
  userProfile,
  dateRange,
  className = ''
}) => {
  const { toast } = useToast();
  
  const {
    isGenerating,
    error,
    generateAndDownloadPDF,
    generateAndSharePDF
  } = usePDFGenerator({
    sessions,
    userProfile,
    dateRange
  });

  const fileName = generatePDFFileName(userProfile, dateRange);

  const handleDownload = async () => {
    try {
      await generateAndDownloadPDF(fileName);
      toast({
        title: "PDF Generated",
        description: "Your driving log has been saved to your device.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      await generateAndSharePDF(fileName);
      toast({
        title: "PDF Ready to Share",
        description: "Your driving log is ready to share.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to share PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate summary stats
  const totalHours = sessions.reduce((acc, session) => acc + (session.duration / 3600), 0);
  const totalMiles = sessions.reduce((acc, session) => acc + session.miles, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <CardTitle>Export Driving Log</CardTitle>
        </div>
        <CardDescription>
          Generate a PDF report of your driving sessions
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {sessions.length}
            </div>
            <div className="text-sm text-gray-600">Sessions</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {totalHours.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Hours</div>
          </div>
        </div>

        {/* Date Range */}
        {dateRange && (
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
            </Badge>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleDownload}
            disabled={isGenerating || sessions.length === 0}
            className="flex-1"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isGenerating ? 'Generating...' : 'Download PDF'}
          </Button>
          
          <Button
            onClick={handleShare}
            disabled={isGenerating || sessions.length === 0}
            variant="outline"
            className="flex-1"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Share className="h-4 w-4 mr-2" />
            )}
            Share PDF
          </Button>
        </div>

        {sessions.length === 0 && (
          <p className="text-sm text-gray-500 text-center">
            No driving sessions to export
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PDFExportComponent;
