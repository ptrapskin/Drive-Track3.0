# GPS Testing Guide for Drive-Track

## Overview
This guide covers comprehensive GPS testing methods for the Drive-Track app to validate the enhanced GPS tracking improvements.

## Testing Scenarios

### 1. Command Line GPS Testing
Use the included `test-gps.sh` script:
```bash
./test-gps.sh
```

### 2. iOS Simulator UI Testing
1. Open iOS Simulator
2. Go to **Device** → **Location** → **Custom Location...**
3. Enter coordinates manually:
   - **San Francisco**: 37.7749, -122.4194
   - **New York**: 40.7128, -74.0060
   - **Los Angeles**: 34.0522, -118.2437

### 3. Predefined Locations in Simulator
Use **Device** → **Location** and select:
- **Apple** (Cupertino)
- **City Bicycle Ride**
- **City Run**
- **Freeway Drive**

## GPS Improvement Validation

### 1. Timeout Testing
**What to test**: 15-second GPS timeout vs previous 30-second timeout
**How to test**:
1. Start a driving session
2. Turn off Location Services: Settings → Privacy & Security → Location Services → OFF
3. Observe error handling (should timeout in ~15 seconds)
4. Turn Location Services back on
5. Verify session recovery

### 2. Accuracy Filtering
**What to test**: Rejection of GPS coordinates with >100m accuracy
**How to test**:
1. Use poor GPS conditions (indoor testing)
2. Monitor console logs for "Low accuracy GPS reading" messages
3. Verify inaccurate positions are filtered out

### 3. Jump Detection
**What to test**: Detection of unrealistic GPS jumps (<0.5 miles apart)
**How to test**:
1. Set location to NYC: `xcrun simctl location [device] set 40.7128,-74.0060`
2. Wait 5 seconds
3. Jump to SF: `xcrun simctl location [device] set 37.7749,-122.4194`
4. Verify jump is detected and filtered

### 4. Memory Management
**What to test**: Proper cleanup of GPS watches and listeners
**How to test**:
1. Start multiple sessions
2. Navigate between pages
3. Check for memory leaks in Safari Web Inspector
4. Verify old GPS watches are cleared

## Real Device Testing

### 1. Physical Device Setup
1. Connect iPhone via cable
2. Build and run: `npm run ios`
3. Go to real-world locations for testing

### 2. Various GPS Conditions
Test in different environments:
- **Urban canyons** (downtown areas with tall buildings)
- **Suburban areas** (typical driving conditions)
- **Rural areas** (open sky, strong GPS signal)
- **Parking garages** (poor/no GPS signal)
- **Tunnels** (complete GPS loss)

### 3. Speed Variations
Test different driving speeds:
- **Parking lot** (< 5 mph)
- **Residential** (15-25 mph)
- **Arterial roads** (25-45 mph)
- **Highway** (55+ mph)

## Error Scenarios to Test

### 1. Permission Denied
1. Deny location permission when prompted
2. Verify graceful error handling
3. Test permission request retry

### 2. GPS Signal Loss
1. Start session with good GPS
2. Enter tunnel or garage
3. Verify session pauses gracefully
4. Exit tunnel and verify session resumes

### 3. Low Battery Mode
1. Enable Low Power Mode on device
2. Test GPS accuracy and frequency
3. Verify app handles reduced GPS precision

### 4. App Backgrounding
1. Start a driving session
2. Background the app
3. Return to app after 1-2 minutes
4. Verify session continuity

## Success Criteria

### ✅ GPS Timeout Improvements
- Faster error detection (15s vs 30s)
- Better user feedback during GPS issues
- Quicker recovery when GPS returns

### ✅ Accuracy Filtering
- Rejection of >100m accuracy readings
- Console logs showing filtered positions
- More stable distance/speed calculations

### ✅ Jump Detection
- Detection of unrealistic position changes
- Smooth session data without GPS artifacts
- Consistent distance calculations

### ✅ Error Recovery
- Graceful handling of permission denied
- Automatic retry mechanisms
- Clear user feedback during issues

## Performance Metrics

Track these metrics during testing:
- **GPS lock time**: Time to first position
- **Update frequency**: Positions per minute
- **Accuracy consistency**: Standard deviation of accuracy values
- **Battery usage**: Power consumption during sessions
- **Memory usage**: RAM consumption over time

## Debugging Tools

### 1. Browser Developer Tools
Open Safari Web Inspector to monitor:
- Console logs for GPS events
- Network requests to Firebase
- Memory usage patterns
- JavaScript errors

### 2. Xcode Console
Monitor device logs for:
- Capacitor plugin messages
- iOS location service events
- App lifecycle events
- Crash reports

### 3. Firebase Console
Check Firestore for:
- Session data quality
- GPS coordinate accuracy
- Timestamp consistency
- Error logging

## Common Issues and Solutions

### Issue: GPS takes too long to start
**Solution**: Check location permissions and GPS timeout settings

### Issue: Inaccurate distance calculations
**Solution**: Verify accuracy filtering and jump detection are working

### Issue: Session data missing GPS points
**Solution**: Check error handling and retry mechanisms

### Issue: High battery usage
**Solution**: Review GPS polling frequency and background behavior

## Next Steps

After GPS testing validation:
1. **Screenshot Capture**: Use demo data with reliable GPS
2. **App Store Submission**: With confidence in GPS reliability
3. **Production Monitoring**: Set up logging for GPS issues
4. **User Feedback**: Monitor reviews for GPS-related complaints
