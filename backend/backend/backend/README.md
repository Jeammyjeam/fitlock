💪 FitLock - Earn Your Apps with Pushups
imahw....
FitLock is a revolutionary fitness motivation app that locks your favorite apps until you complete your workout! Using AI-powered computer vision, it counts your pushups in real-time and only unlocks your selected apps once you hit your goal.
🎯 Features
🔒 Custom App Locking - Choose which apps to lock
🎁 Reward System - Select apps to unlock after workout
📹 AI Pose Detection - Real-time pushup counting with MediaPipe
✅ Form Validation - Ensures proper pushup technique
📊 Live Progress - Visual counter and progress tracking
🎨 Modern UI - Beautiful gradient design with animations
🏆 Motivational Feedback - Celebration screen on completion
🚀 Quick Start
Prerequisites
Python 3.8 or higher
Webcam/Camera access
Modern web browser (Chrome, Firefox, Edge)
Installation
Clone the repository
git clone https://github.com/yourusername/fitlock.git
cd fitlock
Install Python dependencies
cd backend
pip install -r requirements.txt
Start the backend server
python app.py
Server will run on http://localhost:5000
Open the frontend
cd ../frontend
# Open index.html in your browser
# OR use a local server:
python -m http.server 8000
# Then visit http://localhost:8000
📁 Project Structure
fitlock/
├── backend/
│   ├── app.py                 # Flask API server
│   ├── pushup_detector.py     # Computer vision detection logic
│   └── requirements.txt       # Python dependencies
├── frontend/
│   └── index.html            # Web interface (React app)
├── .gitignore
├── LICENSE
└── README.md
🎮 How to Use
Step 1: Select Apps to Lock
Choose which apps you want to restrict (e.g., Instagram, TikTok, YouTube)
Step 2: Choose Your Rewards
Select which apps you'll unlock after completing your workout
Step 3: Set Your Goal
Choose how many pushups you need to complete (10-100)
Step 4: Start Workout
Allow camera access when prompted
Position yourself in the camera frame
Get into pushup position
The AI will automatically count your reps!
Step 5: Unlock Apps
Complete your goal and celebrate! 🎉
🔧 Testing the Detector
Test the pushup detection standalone (without the web UI):
cd backend
python pushup_detector.py
Controls:
Press r to reset counter
Press q to quit
🧠 How It Works
Computer Vision Pipeline
Camera Capture - Captures video frames from browser
Pose Detection - MediaPipe identifies 33 body landmarks
Angle Calculation - Measures elbow angle (shoulder-elbow-wrist)
State Machine - Tracks "up" (>160°) and "down" (<90°) positions
Form Validation - Verifies body alignment (shoulder-hip-ankle straight)
Counter Update - Increments on valid rep completion
Pushup Detection Algorithm
Elbow Angle > 160° → "UP" position (arms extended)
         ↓
Elbow Angle < 90° + Body Aligned → "DOWN" position → COUNT +1
         ↓
Return to "UP" position
🌐 API Endpoints
Method
Endpoint
Description
GET
/
Server status
GET
/api/count
Get current pushup count
POST
/api/reset
Reset counter to 0
POST
/api/process-frame
Process video frame
POST
/api/session/start
Start workout session
POST
/api/session/complete
Check if session complete
📱 Mobile App (Coming Soon!)
We're working on native Android and iOS apps! The mobile version will include:
True app locking functionality
Background processing
Notification system
Streak tracking
Social challenges
🤝 Contributing
Contributions are welcome! Here's how you can help:
Fork the project
Create your feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add some AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature)
Open a Pull Request
🐛 Known Issues
Camera requires HTTPS in production environments
Backend must be running for detection to work
Browser must support WebRTC for camera access
Current version doesn't actually lock apps (requires OS-level permissions)
📝 Roadmap
[ ] React Native mobile app with actual app locking
[ ] Multiple exercise types (squats, planks, sit-ups, burpees)
[ ] Daily streak tracking and statistics
[ ] Social features and friend challenges
[ ] Wearable device integration (Apple Watch, Fitbit)
[ ] Custom workout routines
[ ] Leaderboard system
[ ] Voice feedback option
🛠️ Technologies Used
Backend: Python, Flask, OpenCV, MediaPipe
Frontend: HTML, CSS, JavaScript, React, Tailwind CSS
AI/ML: MediaPipe Pose Detection
Computer Vision: OpenCV
📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
🙏 Acknowledgments
MediaPipe - Google's ML solution for pose estimation
OpenCV - Open source computer vision library
Flask - Lightweight Python web framework
Tailwind CSS - Utility-first CSS framework
📧 Contact & Support
Project Link: https://github.com/Jeammyjeam/fitlock
Report Issues: GitHub Issues
Made with 💪 and ❤️
Stay Strong, Stay Focused!
