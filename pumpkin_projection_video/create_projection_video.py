#!/usr/bin/env python3
"""
Master script to create the complete Halloween pumpkin projection video
"""

import os
import sys
sys.path.append('scripts')

from scripts.create_video import PumpkinVideoCreator
from scripts.create_audio import create_complete_audio_track
from moviepy.editor import VideoFileClip, AudioFileClip, CompositeVideoClip

def create_final_video():
    """Create the final video with audio"""
    print("🎃 Starting Halloween Pumpkin Projection Video Creation 🎃")
    print("="*60)
    
    # Step 1: Create video
    print("\n1. Creating animated video...")
    creator = PumpkinVideoCreator(width=1920, height=1080, fps=24)
    video_path = creator.create_video("temp_video.mp4")
    
    # Step 2: Create audio
    print("\n2. Creating spooky audio track...")
    audio_track = create_complete_audio_track()
    audio_path = "audio/halloween_background.wav"
    os.makedirs("audio", exist_ok=True)
    audio_track.export(audio_path, format="wav")
    
    # Step 3: Combine video and audio
    print("\n3. Combining video and audio...")
    video_clip = VideoFileClip(video_path)
    audio_clip = AudioFileClip(audio_path)
    
    # Trim audio to match video length or loop it
    video_duration = video_clip.duration
    if audio_clip.duration < video_duration:
        # Loop audio if it's shorter than video
        loops_needed = int(video_duration / audio_clip.duration) + 1
        audio_clip = audio_clip.loop(loops_needed)
    
    # Trim audio to exact video length
    audio_clip = audio_clip.subclip(0, video_duration)
    
    # Combine
    final_video = video_clip.set_audio(audio_clip)
    
    # Step 4: Export final video
    output_path = "Halloween_Pumpkin_Projection_Video.mp4"
    print(f"\n4. Exporting final video to {output_path}...")
    
    final_video.write_videofile(
        output_path,
        fps=24,
        codec='libx264',
        audio_codec='aac',
        verbose=False,
        logger=None
    )
    
    # Clean up temporary files
    if os.path.exists(video_path):
        os.remove(video_path)
    
    print("\n" + "="*60)
    print("🎃 SUCCESS! Halloween Pumpkin Projection Video Complete! 🎃")
    print("="*60)
    print(f"📁 Output file: {output_path}")
    print(f"⏱️  Duration: {video_duration:.1f} seconds ({video_duration/60:.1f} minutes)")
    print(f"📺 Resolution: 1920x1080 (Full HD)")
    print(f"🎬 Frame rate: 24 fps")
    print("\n🎯 PROJECTION TIPS:")
    print("• Use a bright projector (3000+ lumens recommended)")
    print("• Project onto carved pumpkins for best effect")
    print("• Place projector 6-10 feet away from pumpkins")
    print("• Use loop mode in your media player for continuous playback")
    print("• Dim surrounding lights for maximum spooky effect")
    
    return output_path

def create_looping_version(original_path, loop_count=3):
    """Create a longer looping version of the video"""
    print(f"\n5. Creating {loop_count}x looping version for extended playback...")
    
    original_clip = VideoFileClip(original_path)
    looped_clip = original_clip.loop(loop_count)
    
    loop_output_path = f"Halloween_Pumpkin_Projection_Video_{loop_count}x_Loop.mp4"
    looped_clip.write_videofile(
        loop_output_path,
        fps=24,
        codec='libx264',
        audio_codec='aac',
        verbose=False,
        logger=None
    )
    
    print(f"📁 Looped version saved as: {loop_output_path}")
    print(f"⏱️  Total duration: {looped_clip.duration:.1f} seconds ({looped_clip.duration/60:.1f} minutes)")
    
    return loop_output_path

if __name__ == "__main__":
    try:
        # Create main video
        main_video = create_final_video()
        
        # Create looping version
        looped_video = create_looping_version(main_video, loop_count=3)
        
        print(f"\n🎉 Both videos created successfully!")
        print(f"   • Single loop: {main_video}")
        print(f"   • Triple loop: {looped_video}")
        
    except Exception as e:
        print(f"\n❌ Error creating video: {str(e)}")
        import traceback
        traceback.print_exc()