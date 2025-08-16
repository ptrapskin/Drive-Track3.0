#!/bin/bash

# GPS Testing Script for Drive-Track iOS App
# This script provides various GPS testing scenarios

DEVICE_ID_IPHONE="823A1523-235E-414D-BF4E-93B54F053CCD"  # iPhone 16 Pro Max
DEVICE_ID_IPAD="EF3C8A54-DD01-44E9-B99F-7F03BE2A7E92"   # iPad Pro 13-inch

echo "🗺️  Drive-Track GPS Testing Script"
echo "=================================="

# Function to set location on device
set_location() {
    local device=$1
    local lat=$2
    local lon=$3
    local description=$4
    
    echo "📍 Setting location: $description ($lat, $lon)"
    xcrun simctl location "$device" set "$lat,$lon"
    sleep 2
}

# Function to simulate driving route
simulate_drive() {
    local device=$1
    echo "🚗 Simulating driving route on device..."
    
    # Start at home (example coordinates)
    set_location "$device" "40.7128" "-74.0060" "Starting Point (NYC)"
    sleep 5
    
    # Residential driving (slow speeds)
    set_location "$device" "40.7130" "-74.0058" "Residential Street 1"
    sleep 8
    set_location "$device" "40.7133" "-74.0055" "Residential Street 2"
    sleep 8
    set_location "$device" "40.7136" "-74.0052" "Residential Street 3"
    sleep 8
    
    # Arterial road (medium speeds)
    set_location "$device" "40.7140" "-74.0045" "Arterial Road 1"
    sleep 5
    set_location "$device" "40.7145" "-74.0035" "Arterial Road 2"
    sleep 5
    set_location "$device" "40.7150" "-74.0025" "Arterial Road 3"
    sleep 5
    
    # Highway driving (high speeds)
    set_location "$device" "40.7160" "-74.0000" "Highway Entry"
    sleep 4
    set_location "$device" "40.7180" "-73.9950" "Highway 1"
    sleep 3
    set_location "$device" "40.7200" "-73.9900" "Highway 2"
    sleep 3
    set_location "$device" "40.7220" "-73.9850" "Highway 3"
    sleep 3
    
    echo "✅ Drive simulation complete!"
}

# Function to test GPS error scenarios
test_gps_errors() {
    local device=$1
    echo "⚠️  Testing GPS error scenarios..."
    
    # Test no location (permission denied scenario)
    echo "🚫 Testing no GPS signal..."
    xcrun simctl location "$device" clear
    sleep 10
    
    # Restore location
    echo "📡 Restoring GPS signal..."
    set_location "$device" "40.7128" "-74.0060" "GPS Restored"
}

# Function to test accuracy scenarios
test_accuracy_scenarios() {
    local device=$1
    echo "🎯 Testing GPS accuracy scenarios..."
    
    # Poor accuracy simulation (jumping coordinates)
    echo "📍 Simulating poor GPS accuracy (jumping coordinates)..."
    set_location "$device" "40.7128" "-74.0060" "Accurate Position"
    sleep 3
    set_location "$device" "40.7500" "-74.5000" "GPS Jump (should be filtered)"
    sleep 3
    set_location "$device" "40.7130" "-74.0058" "Back to Accurate"
    sleep 3
}

# Menu system
show_menu() {
    echo ""
    echo "Select GPS test scenario:"
    echo "1) Set static location (San Francisco)"
    echo "2) Set static location (New York)"
    echo "3) Simulate realistic driving route"
    echo "4) Test GPS error scenarios"
    echo "5) Test accuracy filtering"
    echo "6) Clear GPS location"
    echo "7) Run on iPad instead of iPhone"
    echo "8) Exit"
    echo ""
}

# Main menu loop
while true; do
    show_menu
    read -p "Choose option (1-8): " choice
    
    case $choice in
        1)
            set_location "$DEVICE_ID_IPHONE" "37.7749" "-122.4194" "San Francisco, CA"
            ;;
        2)
            set_location "$DEVICE_ID_IPHONE" "40.7128" "-74.0060" "New York, NY"
            ;;
        3)
            simulate_drive "$DEVICE_ID_IPHONE"
            ;;
        4)
            test_gps_errors "$DEVICE_ID_IPHONE"
            ;;
        5)
            test_accuracy_scenarios "$DEVICE_ID_IPHONE"
            ;;
        6)
            echo "🚫 Clearing GPS location..."
            xcrun simctl location "$DEVICE_ID_IPHONE" clear
            ;;
        7)
            echo "📱 Switching to iPad Pro 13-inch..."
            DEVICE_ID_IPHONE="$DEVICE_ID_IPAD"
            echo "Now testing on iPad!"
            ;;
        8)
            echo "👋 Exiting GPS testing..."
            break
            ;;
        *)
            echo "❌ Invalid option. Please choose 1-8."
            ;;
    esac
done

echo "GPS testing script completed!"
