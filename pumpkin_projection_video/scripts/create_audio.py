#!/usr/bin/env python3
"""
Create basic audio track for the pumpkin video
"""

import numpy as np
from pydub import AudioSegment
from pydub.generators import Sine, WhiteNoise
import os

def create_spooky_tone(frequency, duration_ms, fade_in=100, fade_out=100):
    """Create a spooky tone with harmonics"""
    # Base tone
    tone = Sine(frequency).to_audio_segment(duration=duration_ms)
    
    # Add harmonics for spookier sound
    harmonic1 = Sine(frequency * 1.5).to_audio_segment(duration=duration_ms) - 20
    harmonic2 = Sine(frequency * 2).to_audio_segment(duration=duration_ms) - 30
    
    # Mix harmonics
    spooky_tone = tone.overlay(harmonic1).overlay(harmonic2)
    
    # Apply fades
    spooky_tone = spooky_tone.fade_in(fade_in).fade_out(fade_out)
    
    return spooky_tone

def create_wind_sound(duration_ms):
    """Create wind sound effect"""
    # Generate white noise and filter it
    wind = WhiteNoise().to_audio_segment(duration=duration_ms)
    
    # Apply low-pass filter effect by reducing high frequencies
    wind = wind - 25  # Reduce volume
    wind = wind.low_pass_filter(800)  # Filter high frequencies
    
    return wind

def create_background_ambience(duration_minutes=8.5):
    """Create spooky background ambience"""
    duration_ms = int(duration_minutes * 60 * 1000)
    
    # Base wind sound
    wind = create_wind_sound(duration_ms)
    
    # Add occasional spooky tones
    ambience = wind
    
    # Add random spooky sounds throughout
    for i in range(0, duration_ms, 15000):  # Every 15 seconds
        if np.random.random() > 0.7:  # 30% chance
            # Random spooky tone
            freq = np.random.choice([100, 150, 200, 250])
            tone_duration = np.random.randint(1000, 3000)
            spooky_tone = create_spooky_tone(freq, tone_duration)
            
            # Random position within the 15-second window
            position = i + np.random.randint(0, min(10000, duration_ms - i))
            if position < duration_ms:
                ambience = ambience.overlay(spooky_tone, position=position)
    
    return ambience

def create_simple_music_track(duration_minutes=8.5):
    """Create a simple musical background"""
    duration_ms = int(duration_minutes * 60 * 1000)
    
    # Create a simple chord progression in a minor key
    # Using frequencies for Am, F, C, G progression
    chord_notes = {
        'Am': [220, 261.63, 329.63],  # A, C, E
        'F': [174.61, 220, 261.63],   # F, A, C
        'C': [261.63, 329.63, 392],   # C, E, G
        'G': [196, 246.94, 293.66]    # G, B, D
    }
    
    chord_progression = ['Am', 'F', 'C', 'G']
    chord_duration = 4000  # 4 seconds per chord
    
    music = AudioSegment.silent(duration=100)  # Start with silence
    
    current_pos = 0
    while current_pos < duration_ms:
        for chord_name in chord_progression:
            if current_pos >= duration_ms:
                break
                
            # Create chord
            chord_tones = []
            for freq in chord_notes[chord_name]:
                tone = Sine(freq).to_audio_segment(duration=chord_duration)
                tone = tone - 25  # Reduce volume
                tone = tone.fade_in(200).fade_out(200)
                chord_tones.append(tone)
            
            # Mix chord tones
            chord = chord_tones[0]
            for tone in chord_tones[1:]:
                chord = chord.overlay(tone)
            
            # Add to music track
            if len(music) <= current_pos:
                music += AudioSegment.silent(duration=current_pos - len(music))
                music += chord
            else:
                music = music.overlay(chord, position=current_pos)
            
            current_pos += chord_duration
    
    return music[:duration_ms]  # Trim to exact duration

def create_complete_audio_track():
    """Create the complete audio track for the video"""
    print("Creating background ambience...")
    ambience = create_background_ambience()
    
    print("Creating simple music track...")
    music = create_simple_music_track()
    
    # Mix ambience and music
    print("Mixing audio tracks...")
    # Make music quieter than ambience
    music = music - 15
    
    # Combine tracks
    final_audio = ambience.overlay(music)
    
    # Normalize audio
    final_audio = final_audio.normalize()
    
    return final_audio

def main():
    os.makedirs("audio", exist_ok=True)
    
    print("Generating Halloween audio track...")
    audio_track = create_complete_audio_track()
    
    # Export audio
    output_path = "audio/halloween_background.wav"
    audio_track.export(output_path, format="wav")
    
    print(f"Audio track saved as {output_path}")
    print(f"Duration: {len(audio_track)/1000:.1f} seconds")
    
    return output_path

if __name__ == "__main__":
    main()