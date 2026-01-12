import cv2
import mediapipe as mp
import numpy as np
import math

class PushupDetector:
    def __init__(self):
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        self.mp_drawing = mp.solutions.drawing_utils
        
        # Pushup tracking variables
        self.counter = 0
        self.stage = None  # "up" or "down"
        self.feedback = ""
        
    def calculate_angle(self, a, b, c):
        """Calculate angle between three points"""
        a = np.array(a)
        b = np.array(b)
        c = np.array(c)
        
        radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
        angle = np.abs(radians * 180.0 / np.pi)
        
        if angle > 180.0:
            angle = 360 - angle
            
        return angle
    
    def check_body_alignment(self, shoulder, hip, ankle):
        """Check if body is straight (plank position)"""
        # Calculate if shoulder-hip-ankle are roughly in a line
        angle = self.calculate_angle(shoulder, hip, ankle)
        # Good plank form: angle should be between 160-180 degrees
        return 160 <= angle <= 180
    
    def process_frame(self, frame):
        """Process a single frame and detect pushup"""
        # Convert to RGB
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False
        
        # Make detection
        results = self.pose.process(image)
        
        # Convert back to BGR
        image.flags.writeable = True
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
        
        try:
            if results.pose_landmarks:
                landmarks = results.pose_landmarks.landmark
                
                # Get coordinates
                shoulder = [
                    landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                    landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER.value].y
                ]
                elbow = [
                    landmarks[self.mp_pose.PoseLandmark.LEFT_ELBOW.value].x,
                    landmarks[self.mp_pose.PoseLandmark.LEFT_ELBOW.value].y
                ]
                wrist = [
                    landmarks[self.mp_pose.PoseLandmark.LEFT_WRIST.value].x,
                    landmarks[self.mp_pose.PoseLandmark.LEFT_WRIST.value].y
                ]
                hip = [
                    landmarks[self.mp_pose.PoseLandmark.LEFT_HIP.value].x,
                    landmarks[self.mp_pose.PoseLandmark.LEFT_HIP.value].y
                ]
                ankle = [
                    landmarks[self.mp_pose.PoseLandmark.LEFT_ANKLE.value].x,
                    landmarks[self.mp_pose.PoseLandmark.LEFT_ANKLE.value].y
                ]
                
                # Calculate elbow angle
                angle = self.calculate_angle(shoulder, elbow, wrist)
                
                # Check body alignment
                is_aligned = self.check_body_alignment(shoulder, hip, ankle)
                
                # Pushup logic
                if angle > 160:  # Arms extended (up position)
                    self.stage = "up"
                    self.feedback = "Good! Now go down"
                    
                if angle < 90 and self.stage == "up":  # Arms bent (down position)
                    self.stage = "down"
                    if is_aligned:
                        self.counter += 1
                        self.feedback = "✓ Perfect rep!"
                    else:
                        self.feedback = "Keep your body straight!"
                
                # Visual feedback on frame
                # Draw angle
                cv2.putText(image, f'Angle: {int(angle)}', 
                           (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, 
                           (255, 255, 255), 2, cv2.LINE_AA)
                
                # Draw counter
                cv2.putText(image, f'Count: {self.counter}', 
                           (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 1.5, 
                           (0, 255, 0), 3, cv2.LINE_AA)
                
                # Draw feedback
                cv2.putText(image, self.feedback, 
                           (50, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.8, 
                           (255, 255, 0), 2, cv2.LINE_AA)
                
                # Draw stage
                cv2.putText(image, f'Stage: {self.stage}', 
                           (50, 200), cv2.FONT_HERSHEY_SIMPLEX, 1, 
                           (255, 0, 255), 2, cv2.LINE_AA)
                
                # Draw body alignment status
                alignment_text = "Body: Aligned ✓" if is_aligned else "Body: Not Straight!"
                color = (0, 255, 0) if is_aligned else (0, 0, 255)
                cv2.putText(image, alignment_text, 
                           (50, 250), cv2.FONT_HERSHEY_SIMPLEX, 0.8, 
                           color, 2, cv2.LINE_AA)
                
                # Draw pose landmarks
                self.mp_drawing.draw_landmarks(
                    image, 
                    results.pose_landmarks, 
                    self.mp_pose.POSE_CONNECTIONS,
                    self.mp_drawing.DrawingSpec(color=(245,117,66), thickness=2, circle_radius=2),
                    self.mp_drawing.DrawingSpec(color=(245,66,230), thickness=2, circle_radius=2)
                )
                
        except Exception as e:
            cv2.putText(image, f'Error: {str(e)}', 
                       (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.7, 
                       (0, 0, 255), 2, cv2.LINE_AA)
        
        return image, self.counter
    
    def reset_counter(self):
        """Reset the pushup counter"""
        self.counter = 0
        self.stage = None
        self.feedback = ""
    
    def __del__(self):
        """Cleanup"""
        self.pose.close()


# Example usage for testing
if __name__ == "__main__":
    detector = PushupDetector()
    cap = cv2.VideoCapture(0)  # Use 0 for webcam
    
    print("Starting pushup detector...")
    print("Press 'r' to reset counter")
    print("Press 'q' to quit")
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        # Process frame
        processed_frame, count = detector.process_frame(frame)
        
        # Display
        cv2.imshow('FitLock - Pushup Detector', processed_frame)
        
        # Controls
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('r'):
            detector.reset_counter()
            print("Counter reset!")
    
    cap.release()
    cv2.destroyAllWindows()
