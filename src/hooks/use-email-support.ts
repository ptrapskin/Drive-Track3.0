import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { useToast } from '@/hooks/use-toast';

interface EmailData {
  to: string;
  subject: string;
  body: string;
}

export const useEmailSupport = () => {
  const { toast } = useToast();

  const openEmail = async ({ to, subject, body }: EmailData) => {
    try {
      if (Capacitor.isNativePlatform()) {
        // On mobile, try different approaches
        const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        try {
          // First, try to open with Browser plugin (better error handling)
          await Browser.open({ 
            url: mailtoUrl,
            presentationStyle: 'popover'
          });
        } catch (browserError) {
          console.warn('Browser plugin failed, trying window.open:', browserError);
          
          // Fallback to window.open
          const opened = window.open(mailtoUrl, '_system');
          
          if (!opened) {
            // If that fails, show manual instructions
            showManualEmailInstructions({ to, subject, body });
          }
        }
      } else {
        // On web, use window.open
        const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        const opened = window.open(mailtoUrl, '_blank');
        
        if (!opened) {
          showManualEmailInstructions({ to, subject, body });
        }
      }
    } catch (error) {
      console.error('Email opening failed:', error);
      showManualEmailInstructions({ to, subject, body });
    }
  };

  const showManualEmailInstructions = ({ to, subject, body }: EmailData) => {
    // Copy email content to clipboard if possible
    if (navigator.clipboard) {
      const emailContent = `To: ${to}\nSubject: ${subject}\n\n${body}`;
      navigator.clipboard.writeText(emailContent).then(() => {
        toast({
          title: "Email Content Copied",
          description: `Please paste this into your email app and send to ${to}`,
          duration: 8000,
        });
      }).catch(() => {
        showEmailModal({ to, subject, body });
      });
    } else {
      showEmailModal({ to, subject, body });
    }
  };

  const showEmailModal = ({ to, subject, body }: EmailData) => {
    toast({
      title: "Email App Not Available",
      description: `Please manually email ${to} with the subject "${subject}"`,
      duration: 10000,
    });
  };

  return { openEmail };
};
