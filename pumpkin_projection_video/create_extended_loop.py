#!/usr/bin/env python3
"""
Create extended looping versions of the Halloween pumpkin video
"""

import cv2
import os

def create_looped_video(input_path, output_path, loop_count=3):
    """Create a looped version of the video"""
    print(f"Creating {loop_count}x looped version...")
    
    # Open input video
    cap = cv2.VideoCapture(input_path)
    
    # Get video properties
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    print(f"Original video: {total_frames} frames, {fps} fps, {width}x{height}")
    
    # Create output video
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    # Read all frames from original video
    frames = []
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        frames.append(frame)
    
    cap.release()
    
    # Write looped frames
    for loop in range(loop_count):
        print(f"Writing loop {loop + 1}/{loop_count}...")
        for frame in frames:
            out.write(frame)
    
    out.release()
    
    # Get output file size
    output_size = os.path.getsize(output_path) / (1024 * 1024)  # MB
    total_duration = (total_frames * loop_count) / fps
    
    print(f"Created: {output_path}")
    print(f"Size: {output_size:.1f} MB")
    print(f"Duration: {total_duration:.1f} seconds ({total_duration/60:.1f} minutes)")

def main():
    input_file = "Halloween_Pumpkin_Projection_Video.mp4"
    
    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found!")
        return
    
    # Create different looped versions
    versions = [
        (2, "Halloween_Pumpkin_Projection_Video_2x_Loop.mp4"),
        (3, "Halloween_Pumpkin_Projection_Video_3x_Loop.mp4"),
        (4, "Halloween_Pumpkin_Projection_Video_Extended.mp4")
    ]
    
    for loop_count, output_file in versions:
        create_looped_video(input_file, output_file, loop_count)
        print()

if __name__ == "__main__":
    main()