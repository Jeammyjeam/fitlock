from flask import Flask, Response, jsonify, request
from flask_cors import CORS
import cv2
import base64
import numpy as np
from pushup_detector import PushupDetector
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Initialize detector
detector = PushupDetector()

@app.route('/')
def index():
    return jsonify({
        "status": "running",
        "message": "FitLock API Server",
        "endpoints": {
            "GET /api/count": "Get current pushup count",
            "POST /api/reset": "Reset pushup counter",
            "POST /api/process-frame": "Process video frame"
        }
    })

@app.route('/api/count', methods=['GET'])
def get_count():
    """Get current pushup count"""
    return jsonify({
        "count": detector.counter,
        "stage": detector.stage,
        "feedback": detector.feedback
    })

@app.route('/api/reset', methods=['POST'])
def reset_counter():
    """Reset the pushup counter"""
    detector.reset_counter()
    return jsonify({
        "status": "success",
        "message": "Counter reset to 0"
    })

@app.route('/api/process-frame', methods=['POST'])
def process_frame():
    """
    Process a video frame and return pushup count
    Expects: { "frame": "base64_encoded_image" }
    Returns: { "count": int, "stage": str, "feedback": str, "processed_frame": "base64_image" }
    """
    try:
        data = request.get_json()
        
        if 'frame' not in data:
            return jsonify({"error": "No frame provided"}), 400
        
        # Decode base64 image
        frame_data = data['frame'].split(',')[1] if ',' in data['frame'] else data['frame']
        frame_bytes = base64.b64decode(frame_data)
        frame_array = np.frombuffer(frame_bytes, dtype=np.uint8)
        frame = cv2.imdecode(frame_array, cv2.IMREAD_COLOR)
        
        if frame is None:
            return jsonify({"error": "Invalid frame data"}), 400
        
        # Process frame
        processed_frame, count = detector.process_frame(frame)
        
        # Encode processed frame back to base64
        _, buffer = cv2.imencode('.jpg', processed_frame)
        processed_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return jsonify({
            "count": count,
            "stage": detector.stage,
            "feedback": detector.feedback,
            "processed_frame": f"data:image/jpeg;base64,{processed_base64}"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/video-feed')
def video_feed():
    """
    Stream video feed with pushup detection
    This can be used for a simple webcam stream
    """
    def generate_frames():
        cap = cv2.VideoCapture(0)
        
        while True:
            success, frame = cap.read()
            if not success:
                break
            
            # Process frame
            processed_frame, _ = detector.process_frame(frame)
            
            # Encode frame
            ret, buffer = cv2.imencode('.jpg', processed_frame)
            frame_bytes = buffer.tobytes()
            
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        
        cap.release()
    
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/session/start', methods=['POST'])
def start_session():
    """Start a new workout session"""
    data = request.get_json()
    goal = data.get('goal', 20)
    locked_apps = data.get('locked_apps', [])
    unlock_apps = data.get('unlock_apps', [])
    
    detector.reset_counter()
    
    return jsonify({
        "status": "success",
        "message": "Session started",
        "goal": goal,
        "locked_apps": locked_apps,
        "unlock_apps": unlock_apps
    })

@app.route('/api/session/complete', methods=['POST'])
def complete_session():
    """Check if session is complete"""
    data = request.get_json()
    goal = data.get('goal', 20)
    
    is_complete = detector.counter >= goal
    
    return jsonify({
        "complete": is_complete,
        "count": detector.counter,
        "goal": goal,
        "remaining": max(0, goal - detector.counter)
    })

if __name__ == '__main__':
    print("🚀 Starting FitLock API Server...")
    print("📹 Camera detection enabled")
    print("🌐 Server running on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
