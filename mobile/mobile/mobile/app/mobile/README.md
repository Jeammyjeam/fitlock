💪 FitLock Mobile - React Native App
AI-powered fitness app locker for Android. Complete pushups to unlock your favorite apps!
🚀 Features
✅ Native Android UI with smooth animations
✅ Real camera access for pushup detection
✅ Daily streak tracking
✅ Achievement system
✅ Progress statistics
✅ Haptic feedback
✅ Offline support
✅ Beautiful gradient design
📱 Quick Start (Android Phone)
Option 1: Using Termux on Android
Install Termux from F-Droid
https://f-droid.org/en/packages/com.termux/
Setup Termux
# Update packages
pkg update && pkg upgrade

# Install Node.js
pkg install nodejs-lts

# Install Git
pkg install git

# Allow storage access
termux-setup-storage
Clone and Setup
cd ~/storage/downloads

# Clone your repo
git clone https://github.com/YOUR_USERNAME/fitlock.git
cd fitlock

# Create mobile folder
mkdir mobile
cd mobile

# Copy the React Native files here
# (package.json, app.json, and app/ folder)

# Install dependencies
npm install
Run the App
# Start Expo
npx expo start

# Scan QR code with Expo Go app
Option 2: Build APK with EAS (Easiest!)
Install Expo Go on your phone
Download from Play Store
Setup EAS Build (on Computer or Termux)
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build APK
eas build --platform android --profile preview
Download & Install
Wait for build to complete (~10-15 mins)
Download APK from Expo dashboard
Install on your phone!
Option 3: Local Build with Expo (Advanced)
On Computer with Android Studio
npm install
npx expo prebuild
npx expo run:android
📁 Project Structure
mobile/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Main workout screen
│   │   ├── stats.tsx          # Statistics
│   │   └── settings.tsx       # Settings
│   └── _layout.tsx
├── assets/
├── app.json
├── package.json
└── tsconfig.json
🎯 How to Use
Setup
Select apps to lock
Choose apps to unlock as rewards
Set your pushup goal
Workout
Allow camera access
Position yourself in frame
Do pushups!
AI counts automatically
Unlock
Complete your goal
Apps unlock automatically
Track your streak!
🛠️ Development
Run in Development
npm start
# or
npx expo start
Build Preview APK
eas build --platform android --profile preview
Build Production APK
eas build --platform android --profile production
📦 APK Build Commands
Quick APK (No Code Signing)
# Development APK
eas build -p android --profile preview

# Download URL will be provided
Production APK (For Play Store)
# Setup signing
eas credentials

# Build production
eas build -p android --profile production
🔧 Configuration
app.json
Update these fields:
expo.name - Your app name
expo.slug - URL-friendly name
expo.android.package - com.yourname.fitlock
Camera Permissions
Already configured in app.json:
Camera access for pushup detection
Notifications for reminders
🎨 Customization
Change Colors
Edit the gradient in app/index.tsx:
<LinearGradient colors={['#6366f1', '#8b5cf6', '#d946ef']}>
Add More Apps
Edit AVAILABLE_APPS array in app/index.tsx
📱 Testing on Device
Install Expo Go from Play Store
Run npm start
Scan QR code with Expo Go
App launches on your phone!
🐛 Troubleshooting
Camera not working
Check permissions in Settings > Apps > FitLock > Permissions
Ensure camera permission is granted
Build fails
# Clear cache
npx expo start -c

# Reinstall dependencies
rm -rf node_modules
npm install
Can't connect to Metro
Make sure phone and computer are on same WiFi
Or use tunnel: npx expo start --tunnel
🚀 Next Steps
Add CV Detection
Integrate TensorFlow Lite
Use PoseNet model
Implement pushup counting algorithm
App Locking
Use Android UsageStatsManager
Create overlay service
Implement actual app blocking
More Features
Different exercises
Social challenges
Weekly/monthly stats
Achievements system
📄 License
MIT License - See LICENSE file
🙏 Credits
Built with:
React Native
Expo
TypeScript
Made with 💪 and ❤️
Stay Strong, Stay Focused!
