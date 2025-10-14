#!/usr/bin/env python3
"""
Main script to create the Halloween pumpkin projection video
"""

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import os
import random
from moviepy.editor import *
from dialogue_script import DIALOGUE_SCENES, SONGS, create_timeline

class PumpkinVideoCreator:
    def __init__(self, width=1920, height=1080, fps=30):
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
                    img = Image.open(asset_path)
                    # Resize to fit half the screen width
                    img = img.resize((self.width//2 - 100, self.height - 200), Image.Resampling.LANCZOS)
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
            
    def create_frame(self, pumpkin1_mouth, pumpkin2_mouth, background_effect="normal"):
        """Create a single frame with both pumpkins"""
        # Create background
        if background_effect == "spooky":
            # Dark purple/black gradient
            background = np.zeros((self.height, self.width, 3), dtype=np.uint8)
            for y in range(self.height):
                intensity = int(30 * (1 - y / self.height))
                background[y, :] = [intensity, 0, intensity + 10]
        else:
            # Standard dark background
            background = np.zeros((self.height, self.width, 3), dtype=np.uint8)
            
        # Convert to PIL for easier compositing
        bg_img = Image.fromarray(background)
        
        # Position pumpkins side by side
        pumpkin1_img = self.pumpkin_assets[1].get(pumpkin1_mouth, self.pumpkin_assets[1]["closed"])
        pumpkin2_img = self.pumpkin_assets[2].get(pumpkin2_mouth, self.pumpkin_assets[2]["closed"])
        
        # Paste pumpkin 1 on the left
        pumpkin1_pos = (50, 100)
        if pumpkin1_img.mode == 'RGBA':
            bg_img.paste(pumpkin1_img, pumpkin1_pos, pumpkin1_img)
        else:
            bg_img.paste(pumpkin1_img, pumpkin1_pos)
            
        # Paste pumpkin 2 on the right
        pumpkin2_pos = (self.width//2 + 50, 100)
        if pumpkin2_img.mode == 'RGBA':
            bg_img.paste(pumpkin2_img, pumpkin2_pos, pumpkin2_img)
        else:
            bg_img.paste(pumpkin2_img, pumpkin2_pos)
            
        # Add some atmospheric effects
        if background_effect == "spooky":
            # Add some random "firefly" effects
            draw = ImageDraw.Draw(bg_img)
            for _ in range(random.randint(5, 15)):
                x = random.randint(0, self.width)
                y = random.randint(0, self.height)
                size = random.randint(2, 6)
                color = (255, 255, random.randint(100, 255))
                draw.ellipse([x-size, y-size, x+size, y+size], fill=color)
        
        return np.array(bg_img)
        
    def animate_dialogue_line(self, speaker, text, duration):
        """Create animation frames for a dialogue line"""
        frames = []
        total_frames = int(duration * self.fps)
        
        # Simple lip sync - alternate mouth shapes based on text
        for frame_num in range(total_frames):
            progress = frame_num / total_frames
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
            if frame_num % 60 == 0:  # Every 2 seconds
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
        
        lyric_frames = []
        current_time = 0
        
        # Calculate timing for each lyric line
        for lyric in song_data["lyrics"]:
            line_frames = int(lyric["duration"] * self.fps)
            lyric_frames.append({
                "text": lyric["line"],
                "start_frame": len(lyric_frames) * line_frames if lyric_frames else 0,
                "duration_frames": line_frames,
                "harmony": lyric["harmony"]
            })
            
        for frame_num in range(total_frames):
            # Determine current lyric
            current_lyric = None
            for lyric in lyric_frames:
                if (lyric["start_frame"] <= frame_num < 
                    lyric["start_frame"] + lyric["duration_frames"]):
                    current_lyric = lyric
                    break
                    
            if current_lyric:
                # Both pumpkins singing
                if current_lyric["harmony"]:
                    # Harmonizing - both sing with slight offset
                    offset = (frame_num - current_lyric["start_frame"]) % 10
                    if offset < 5:
                        pumpkin1_mouth = "singing"
                        pumpkin2_mouth = "open_medium"
                    else:
                        pumpkin1_mouth = "open_medium"
                        pumpkin2_mouth = "singing"
                else:
                    # Solo singing - alternate between pumpkins
                    singer = 1 if (frame_num // 30) % 2 == 0 else 2
                    if singer == 1:
                        pumpkin1_mouth = "singing"
                        pumpkin2_mouth = "closed"
                    else:
                        pumpkin1_mouth = "closed"
                        pumpkin2_mouth = "singing"
            else:
                # No singing - idle
                pumpkin1_mouth = "closed"
                pumpkin2_mouth = "closed"
                
            # Add some rhythmic movement during songs
            background_effect = "spooky" if frame_num % 20 < 10 else "normal"
            frame = self.create_frame(pumpkin1_mouth, pumpkin2_mouth, background_effect)
            frames.append(frame)
            
        return frames
        
    def create_video(self, output_path="halloween_pumpkins.mp4"):
        """Create the complete video"""
        print("Creating Halloween pumpkin projection video...")
        
        timeline, total_duration = create_timeline()
        all_frames = []
        
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
                    all_frames.extend(frames)
                    
            elif item['type'] == 'song':
                song = item['content']
                frames = self.animate_song(song)
                all_frames.extend(frames)
                
        print(f"Generated {len(all_frames)} frames")
        print("Rendering video...")
        
        # Create video using moviepy
        def make_frame(t):
            frame_idx = int(t * self.fps)
            if frame_idx >= len(all_frames):
                frame_idx = len(all_frames) - 1
            return all_frames[frame_idx]
            
        video_duration = len(all_frames) / self.fps
        clip = VideoClip(make_frame, duration=video_duration)
        
        # Write video file
        clip.write_videofile(
            output_path,
            fps=self.fps,
            codec='libx264',
            audio=False,  # We'll add audio separately
            verbose=False,
            logger=None
        )
        
        print(f"Video saved as {output_path}")
        print(f"Duration: {video_duration:.1f} seconds ({video_duration/60:.1f} minutes)")
        
        return output_path

def main():
    creator = PumpkinVideoCreator(width=1920, height=1080, fps=24)
    output_file = creator.create_video("halloween_pumpkins_projection.mp4")
    
    print("\n" + "="*50)
    print("🎃 HALLOWEEN PUMPKIN PROJECTION VIDEO COMPLETE! 🎃")
    print("="*50)
    print(f"Output file: {output_file}")
    print("Ready for projection onto your pumpkins!")
    print("\nTo loop the video, use a media player with loop functionality")
    print("or duplicate the video file to extend the duration.")

if __name__ == "__main__":
    main()