import React, { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { pdf } from '@react-pdf/renderer';
import { Session, UserProfile } from '@/lib/types';
import DrivingLogsPDF from '@/components/pdf-generator';

interface UsePDFGeneratorOptions {
  sessions: Session[];
  userProfile: UserProfile | null;
  dateRange?: {
    start: string;
    end: string;
  };
}

interface PDFGeneratorReturn {
  isGenerating: boolean;
  error: string | null;
  generateAndDownloadPDF: (fileName?: string) => Promise<void>;
  generateAndSharePDF: (fileName?: string) => Promise<void>;
  generatePDFBlob: () => Promise<Blob>;
}

export const usePDFGenerator = ({
  sessions,
  userProfile,
  dateRange
}: UsePDFGeneratorOptions): PDFGeneratorReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePDFBlob = async (): Promise<Blob> => {
    setIsGenerating(true);
    setError(null);

    try {
      const document = React.createElement(DrivingLogsPDF, {
        sessions,
        userProfile,
        dateRange
      });

      const blob = await pdf(document).toBlob();
      return blob;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate PDF';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAndDownloadPDF = async (fileName = 'driving-log.pdf'): Promise<void> => {
    try {
      const blob = await generatePDFBlob();

      if (Capacitor.isNativePlatform()) {
        // Mobile: Save to device file system
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Data = (reader.result as string).split(',')[1];
          
          try {
            await Filesystem.writeFile({
              path: fileName,
              data: base64Data,
              directory: Directory.Documents,
            });

            console.log('PDF saved to Documents folder');
          } catch (fileError) {
            console.error('Error saving PDF:', fileError);
            setError('Failed to save PDF to device');
          }
        };
        reader.readAsDataURL(blob);
      } else {
        // Web: Download file
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error generating PDF:', err);
    }
  };

  const generateAndSharePDF = async (fileName = 'driving-log.pdf'): Promise<void> => {
    try {
      const blob = await generatePDFBlob();

      if (Capacitor.isNativePlatform()) {
        // Mobile: Save temporarily and share
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Data = (reader.result as string).split(',')[1];
          
          try {
            const tempFileName = `temp_${fileName}`;
            const result = await Filesystem.writeFile({
              path: tempFileName,
              data: base64Data,
              directory: Directory.Cache,
            });

            await Share.share({
              title: 'Driving Log Report',
              text: 'Here is my driving log report from Drive-Track',
              url: result.uri,
              dialogTitle: 'Share Driving Log'
            });

            // Clean up temp file
            await Filesystem.deleteFile({
              path: tempFileName,
              directory: Directory.Cache,
            });
          } catch (shareError) {
            console.error('Error sharing PDF:', shareError);
            setError('Failed to share PDF');
          }
        };
        reader.readAsDataURL(blob);
      } else {
        // Web: Download file (fallback)
        await generateAndDownloadPDF(fileName);
      }
    } catch (err) {
      console.error('Error generating PDF for sharing:', err);
    }
  };

  return {
    isGenerating,
    error,
    generateAndDownloadPDF,
    generateAndSharePDF,
    generatePDFBlob
  };
};

// Utility function to generate filename with date range
export const generatePDFFileName = (
  userProfile: UserProfile | null,
  dateRange?: { start: string; end: string }
): string => {
  const userName = userProfile?.name ? 
    userProfile.name.replace(/[^a-zA-Z0-9]/g, '_') : 
    'DrivingLog';
  
  if (dateRange) {
    const startDate = new Date(dateRange.start).toISOString().split('T')[0];
    const endDate = new Date(dateRange.end).toISOString().split('T')[0];
    return `${userName}_DrivingLog_${startDate}_to_${endDate}.pdf`;
  }
  
  const currentDate = new Date().toISOString().split('T')[0];
  return `${userName}_DrivingLog_${currentDate}.pdf`;
};
