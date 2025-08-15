import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { Session, UserProfile } from '@/lib/types';

// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  userInfo: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 5,
  },
  userInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1e293b',
  },
  userInfoText: {
    fontSize: 11,
    marginBottom: 3,
    color: '#475569',
  },
  summary: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#eff6ff',
    borderRadius: 5,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1e40af',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  summaryLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  sessionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1e293b',
  },
  sessionItem: {
    marginBottom: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 5,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionDate: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  sessionDuration: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: 'bold',
  },
  sessionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  sessionDetail: {
    fontSize: 10,
    color: '#64748b',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#94a3b8',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
});

interface DrivingLogsPDFProps {
  sessions: Session[];
  userProfile: UserProfile | null;
  dateRange?: {
    start: string;
    end: string;
  };
}

// PDF Document Component
const DrivingLogsPDF: React.FC<DrivingLogsPDFProps> = ({ 
  sessions, 
  userProfile, 
  dateRange 
}) => {
  // Calculate summary statistics
  const totalHours = sessions.reduce((acc, session) => acc + (session.duration / 3600), 0);
  const totalMiles = sessions.reduce((acc, session) => acc + session.miles, 0);
  const nightHours = sessions.filter(session => session.timeOfDay === 'Night')
    .reduce((acc, session) => acc + (session.duration / 3600), 0);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Drive-Track Driving Log</Text>
          <Text style={styles.subtitle}>
            {dateRange 
              ? `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`
              : 'Complete Driving History'
            }
          </Text>
        </View>

        {/* User Information */}
        {userProfile && (
          <View style={styles.userInfo}>
            <Text style={styles.userInfoTitle}>Driver Information</Text>
            <Text style={styles.userInfoText}>
              Name: {userProfile.name || 'Not provided'}
            </Text>
            <Text style={styles.userInfoText}>
              Email: {userProfile.email || 'Not provided'}
            </Text>
            {userProfile.dateOfBirth && (
              <Text style={styles.userInfoText}>
                Date of Birth: {formatDate(userProfile.dateOfBirth)}
              </Text>
            )}
            {userProfile.permitDate && (
              <Text style={styles.userInfoText}>
                Permit Date: {formatDate(userProfile.permitDate)}
              </Text>
            )}
          </View>
        )}

        {/* Summary Statistics */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Summary Statistics</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{sessions.length}</Text>
              <Text style={styles.summaryLabel}>Total Sessions</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totalHours.toFixed(1)}</Text>
              <Text style={styles.summaryLabel}>Total Hours</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totalMiles.toFixed(1)}</Text>
              <Text style={styles.summaryLabel}>Total Miles</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{nightHours.toFixed(1)}</Text>
              <Text style={styles.summaryLabel}>Night Hours</Text>
            </View>
          </View>
        </View>

        {/* Sessions List */}
        <Text style={styles.sessionsTitle}>Driving Sessions</Text>
        
        {sessions.map((session, index) => (
          <View key={session.id} style={styles.sessionItem}>
            <View style={styles.sessionHeader}>
              <Text style={styles.sessionDate}>
                {formatDate(session.date)}
              </Text>
              <Text style={styles.sessionDuration}>
                {formatDuration(session.duration)}
              </Text>
            </View>
            
            <View style={styles.sessionDetails}>
              <Text style={styles.sessionDetail}>
                Miles: {session.miles.toFixed(1)}
              </Text>
              <Text style={styles.sessionDetail}>
                Weather: {session.weather}
              </Text>
              <Text style={styles.sessionDetail}>
                Time: {session.timeOfDay}
              </Text>
              <Text style={styles.sessionDetail}>
                Roads: {session.roadTypes.join(', ')}
              </Text>
            </View>
          </View>
        ))}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated on {new Date().toLocaleDateString()} by Drive-Track App
        </Text>
      </Page>
    </Document>
  );
};

// Component for PDF Download Link
interface PDFDownloadComponentProps {
  sessions: Session[];
  userProfile: UserProfile | null;
  dateRange?: {
    start: string;
    end: string;
  };
  fileName?: string;
  children: React.ReactNode;
}

export const PDFDownloadComponent: React.FC<PDFDownloadComponentProps> = ({
  sessions,
  userProfile,
  dateRange,
  fileName = 'driving-log.pdf',
  children
}) => {
  return (
    <PDFDownloadLink
      document={
        <DrivingLogsPDF 
          sessions={sessions} 
          userProfile={userProfile}
          dateRange={dateRange}
        />
      }
      fileName={fileName}
    >
      {({ blob, url, loading, error }) => {
        if (loading) return 'Generating PDF...';
        if (error) return 'Error generating PDF';
        return children;
      }}
    </PDFDownloadLink>
  );
};

export default DrivingLogsPDF;
