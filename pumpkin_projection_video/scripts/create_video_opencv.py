#!/usr/bin/env python3
"""
Create Halloween pumpkin projection video using OpenCV
"""

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import os
import random
from dialogue_script import DIALOGUE_SCENES, SONGS, create_timeline

class PumpkinVideoCreator:
    def __init__(self, width=1920, height=1080, fps=24):
        self.width = width
        self.height = height
        self.fps = fps
        self.pumpkin_assets = {}
        self.load_pumpkin_assets()
        
    def load_pumpkin_assets(self):
        """Load all pumpkin face assets"""
        mouth_shapes = ["closed", "open_small", "open_medium", "open_wide", "singing"]
        
        for pumpkin_id in [1, 2]:
            self.pumpkin_assets[pumpkin_id] = {}
            for mouth_shape in mouth_shapes:
                asset_path = f"assets/pumpkin_{pumpkin_id}_{mouth_shape}.png"
                if os.path.exists(asset_path):
                    img = cv2.imread(asset_path, cv2.IMREAD_UNCHANGED)
                    if img is not None:
                        # Resize to fit half the screen width
                        target_width = self.width//2 - 100
                        target_height = self.height - 200
                        img = cv2.resize(img, (target_width, target_height))
                        self.pumpkin_assets[pumpkin_id][mouth_shape] = img
                    
    def get_mouth_shape_for_phoneme(self, char):
        """Map characters to mouth shapes for basic lip sync"""
        vowels = "aeiouAEIOU"
        consonants_open = "bpmBPM"
        consonants_wide = "fvFV"
        
        if char in vowels:
            return "open_medium"
        elif char in consonants_open:
            return "closed"
        elif char in consonants_wide:
            return "open_wide"
        elif char.isalpha():
            return "open_small"
        else:
            return "closed"
            
    def overlay_image_alpha(self, img, img_overlay, x, y):
        """Overlay an image with alpha channel"""
        if img_overlay.shape[2] == 4:  # Has alpha channel
            alpha_s = img_overlay[:, :, 3] / 255.0
            alpha_l = 1.0 - alpha_s
            
            y1, y2 = max(0, y), min(img.shape[0], y + img_overlay.shape[0])
            x1, x2 = max(0, x), min(img.shape[1], x + img_overlay.shape[1])
            
            y1_o, y2_o = max(0, -y), min(img_overlay.shape[0], img.shape[0] - y)
            x1_o, x2_o = max(0, -x), min(img_overlay.shape[1], img.shape[1] - x)
            
            if y1 >= y2 or x1 >= x2:
                return img
                
            for c in range(0, 3):
                img[y1:y2, x1:x2, c] = (alpha_s[y1_o:y2_o, x1_o:x2_o] * img_overlay[y1_o:y2_o, x1_o:x2_o, c] +
                                       alpha_l[y1_o:y2_o, x1_o:x2_o] * img[y1:y2, x1:x2, c])
        else:
            # No alpha channel, simple overlay
            y1, y2 = max(0, y), min(img.shape[0], y + img_overlay.shape[0])
            x1, x2 = max(0, x), min(img.shape[1], x + img_overlay.shape[1])
            
            y1_o, y2_o = max(0, -y), min(img_overlay.shape[0], img.shape[0] - y)
            x1_o, x2_o = max(0, -x), min(img_overlay.shape[1], img.shape[1] - x)
            
            if y1 < y2 and x1 < x2:
                img[y1:y2, x1:x2] = img_overlay[y1_o:y2_o, x1_o:x2_o]
                
        return img
            
    def create_frame(self, pumpkin1_mouth, pumpkin2_mouth, background_effect="normal"):
        """Create a single frame with both pumpkins"""
        # Create background
        if background_effect == "spooky":
            # Dark purple/black gradient
            background = np.zeros((self.height, self.width, 3), dtype=np.uint8)
            for y in range(self.height):
                intensity = int(30 * (1 - y / self.height))
                background[y, :] = [intensity + 10, 0, intensity]  # BGR format
        else:
            # Standard dark background
            background = np.zeros((self.height, self.width, 3), dtype=np.uint8)
            
        # Get pumpkin images
        pumpkin1_img = self.pumpkin_assets[1].get(pumpkin1_mouth, 
                                                 self.pumpkin_assets[1].get("closed"))
        pumpkin2_img = self.pumpkin_assets[2].get(pumpkin2_mouth, 
                                                 self.pumpkin_assets[2].get("closed"))
        
        if pumpkin1_img is not None:
            # Position pumpkin 1 on the left
            self.overlay_image_alpha(background, pumpkin1_img, 50, 100)
            
        if pumpkin2_img is not None:
            # Position pumpkin 2 on the right
            self.overlay_image_alpha(background, pumpkin2_img, self.width//2 + 50, 100)
            
        # Add some atmospheric effects
        if background_effect == "spooky":
            # Add some random "firefly" effects
            for _ in range(random.randint(5, 15)):
                x = random.randint(0, self.width-10)
                y = random.randint(0, self.height-10)
                size = random.randint(2, 6)
                color = (random.randint(100, 255), 255, 255)  # BGR format
                cv2.circle(background, (x, y), size, color, -1)
        
        return background
        
    def animate_dialogue_line(self, speaker, text, duration):
        """Create animation frames for a dialogue line"""
        frames = []
        total_frames = int(duration * self.fps)
        
        # Simple lip sync - alternate mouth shapes based on text
        for frame_num in range(total_frames):
            progress = frame_num / total_frames if total_frames > 0 else 0
            char_index = int(progress * len(text)) if text else 0
            
            if char_index < len(text):
                current_char = text[char_index]
                mouth_shape = self.get_mouth_shape_for_phoneme(current_char)
            else:
                mouth_shape = "closed"
                
            # Determine which pumpkin is speaking
            if speaker == 1:
                pumpkin1_mouth = mouth_shape
                pumpkin2_mouth = "closed"
            else:
                pumpkin1_mouth = "closed"
                pumpkin2_mouth = mouth_shape
                
            # Add some random blinking/idle animation for non-speaking pumpkin
            if frame_num % 60 == 0:  # Every 2.5 seconds at 24fps
                if speaker == 1:
                    pumpkin2_mouth = random.choice(["closed", "open_small"])
                else:
                    pumpkin1_mouth = random.choice(["closed", "open_small"])
                    
            frame = self.create_frame(pumpkin1_mouth, pumpkin2_mouth)
            frames.append(frame)
            
        return frames
        
    def animate_song(self, song_data):
        """Create animation frames for a song"""
        frames = []
        total_frames = int(song_data["duration"] * self.fps)
        
        for frame_num in range(total_frames):
            # Determine singing pattern
            # Both pumpkins singing with alternating emphasis
            cycle_length = 60  # 2.5 seconds at 24fps
            cycle_pos = frame_num % cycle_length
            
            if cycle_pos < 15:
                pumpkin1_mouth = "singing"
                pumpkin2_mouth = "open_medium"
            elif cycle_pos < 30:
                pumpkin1_mouth = "open_medium"
                pumpkin2_mouth = "singing"
            elif cycle_pos < 45:
                pumpkin1_mouth = "singing"
                pumpkin2_mouth = "singing"
            else:
                pumpkin1_mouth = "open_small"
                pumpkin2_mouth = "open_small"
                
            # Add some rhythmic background effects during songs
            background_effect = "spooky" if (frame_num // 12) % 2 == 0 else "normal"
            frame = self.create_frame(pumpkin1_mouth, pumpkin2_mouth, background_effect)
            frames.append(frame)
            
        return frames
        
    def create_video(self, output_path="halloween_pumpkins.mp4"):
        """Create the complete video"""
        print("Creating Halloween pumpkin projection video...")
        
        timeline, total_duration = create_timeline()
        
        # Initialize video writer
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_path, fourcc, self.fps, (self.width, self.height))
        
        frame_count = 0
        
        for item in timeline:
            print(f"Processing {item['type']}: {item['content'].get('scene', item['content'].get('title', 'Unknown'))}")
            
            if item['type'] == 'dialogue':
                scene = item['content']
                for line in scene['lines']:
                    frames = self.animate_dialogue_line(
                        line['speaker'], 
                        line['text'], 
                        line['duration']
                    )
                    for frame in frames:
                        out.write(frame)
                        frame_count += 1
                    
            elif item['type'] == 'song':
                song = item['content']
                frames = self.animate_song(song)
                for frame in frames:
                    out.write(frame)
                    frame_count += 1
                
        out.release()
        
        video_duration = frame_count / self.fps
        print(f"Video saved as {output_path}")
        print(f"Generated {frame_count} frames")
        print(f"Duration: {video_duration:.1f} seconds ({video_duration/60:.1f} minutes)")
        
        return output_path

def main():
    creator = PumpkinVideoCreator(width=1920, height=1080, fps=24)
    output_file = creator.create_video("Halloween_Pumpkin_Projection_Video.mp4")
    
    print("\n" + "="*50)
    print("🎃 HALLOWEEN PUMPKIN PROJECTION VIDEO COMPLETE! 🎃")
    print("="*50)
    print(f"Output file: {output_file}")
    print("Ready for projection onto your pumpkins!")
    print("\nProjection Tips:")
    print("• Use a bright projector (3000+ lumens recommended)")
    print("• Project onto carved pumpkins for best effect")
    print("• Place projector 6-10 feet away from pumpkins")
    print("• Use loop mode in your media player for continuous playback")
    print("• Dim surrounding lights for maximum spooky effect")

if __name__ == "__main__":
    main()