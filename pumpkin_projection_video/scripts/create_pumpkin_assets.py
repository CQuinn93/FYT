#!/usr/bin/env python3
"""
Create animated pumpkin face assets for projection video
"""

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import os

def create_pumpkin_face(width=800, height=600, pumpkin_id=1, mouth_shape="closed"):
    """Create a pumpkin face with different expressions"""
    
    # Create black background
    img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Pumpkin colors - different for each pumpkin
    if pumpkin_id == 1:
        pumpkin_color = (255, 140, 0)  # Orange
        glow_color = (255, 165, 0, 100)
    else:
        pumpkin_color = (255, 120, 0)  # Slightly different orange
        glow_color = (255, 140, 0, 100)
    
    # Pumpkin body (oval shape)
    pumpkin_x = width // 4
    pumpkin_y = height // 6
    pumpkin_w = width // 2
    pumpkin_h = height * 2 // 3
    
    # Draw pumpkin with segments
    for i in range(5):
        segment_width = pumpkin_w // 5
        x_offset = i * segment_width
        draw.ellipse([
            pumpkin_x + x_offset, pumpkin_y,
            pumpkin_x + x_offset + segment_width + 20, pumpkin_y + pumpkin_h
        ], fill=pumpkin_color, outline=(200, 100, 0), width=2)
    
    # Eyes
    eye_y = pumpkin_y + pumpkin_h // 3
    eye_size = 60
    
    # Left eye (triangle)
    left_eye_x = pumpkin_x + pumpkin_w // 3
    draw.polygon([
        (left_eye_x, eye_y),
        (left_eye_x - eye_size//2, eye_y + eye_size),
        (left_eye_x + eye_size//2, eye_y + eye_size)
    ], fill=(0, 0, 0), outline=(255, 255, 0), width=3)
    
    # Right eye (triangle)
    right_eye_x = pumpkin_x + 2 * pumpkin_w // 3
    draw.polygon([
        (right_eye_x, eye_y),
        (right_eye_x - eye_size//2, eye_y + eye_size),
        (right_eye_x + eye_size//2, eye_y + eye_size)
    ], fill=(0, 0, 0), outline=(255, 255, 0), width=3)
    
    # Nose (small triangle)
    nose_x = pumpkin_x + pumpkin_w // 2
    nose_y = eye_y + eye_size + 20
    nose_size = 30
    draw.polygon([
        (nose_x, nose_y),
        (nose_x - nose_size//2, nose_y + nose_size),
        (nose_x + nose_size//2, nose_y + nose_size)
    ], fill=(0, 0, 0), outline=(255, 255, 0), width=2)
    
    # Mouth - different shapes for animation
    mouth_x = pumpkin_x + pumpkin_w // 2
    mouth_y = nose_y + nose_size + 30
    mouth_width = 120
    mouth_height = 40
    
    if mouth_shape == "closed":
        # Closed mouth - thin line
        draw.line([
            (mouth_x - mouth_width//2, mouth_y),
            (mouth_x + mouth_width//2, mouth_y)
        ], fill=(0, 0, 0), width=8)
        draw.line([
            (mouth_x - mouth_width//2, mouth_y),
            (mouth_x + mouth_width//2, mouth_y)
        ], fill=(255, 255, 0), width=4)
        
    elif mouth_shape == "open_small":
        # Small open mouth - oval
        draw.ellipse([
            mouth_x - mouth_width//4, mouth_y - mouth_height//4,
            mouth_x + mouth_width//4, mouth_y + mouth_height//4
        ], fill=(0, 0, 0), outline=(255, 255, 0), width=3)
        
    elif mouth_shape == "open_medium":
        # Medium open mouth
        draw.ellipse([
            mouth_x - mouth_width//3, mouth_y - mouth_height//3,
            mouth_x + mouth_width//3, mouth_y + mouth_height//3
        ], fill=(0, 0, 0), outline=(255, 255, 0), width=3)
        
    elif mouth_shape == "open_wide":
        # Wide open mouth
        draw.ellipse([
            mouth_x - mouth_width//2, mouth_y - mouth_height//2,
            mouth_x + mouth_width//2, mouth_y + mouth_height//2
        ], fill=(0, 0, 0), outline=(255, 255, 0), width=3)
        
    elif mouth_shape == "singing":
        # Singing mouth - rounded
        draw.ellipse([
            mouth_x - mouth_width//3, mouth_y - mouth_height//2,
            mouth_x + mouth_width//3, mouth_y + mouth_height//2
        ], fill=(0, 0, 0), outline=(255, 255, 0), width=3)
    
    # Add some glow effect around the pumpkin
    glow_img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_img)
    
    for i in range(10):
        alpha = max(0, 50 - i * 5)
        glow_draw.ellipse([
            pumpkin_x - i*3, pumpkin_y - i*3,
            pumpkin_x + pumpkin_w + i*3, pumpkin_y + pumpkin_h + i*3
        ], fill=(*glow_color[:3], alpha))
    
    # Composite glow with main image
    final_img = Image.alpha_composite(glow_img, img)
    
    return final_img

def create_all_pumpkin_assets():
    """Create all pumpkin face variations"""
    
    os.makedirs("pumpkin_projection_video/assets", exist_ok=True)
    
    mouth_shapes = ["closed", "open_small", "open_medium", "open_wide", "singing"]
    
    for pumpkin_id in [1, 2]:
        for mouth_shape in mouth_shapes:
            img = create_pumpkin_face(pumpkin_id=pumpkin_id, mouth_shape=mouth_shape)
            filename = f"pumpkin_projection_video/assets/pumpkin_{pumpkin_id}_{mouth_shape}.png"
            img.save(filename)
            print(f"Created: {filename}")

if __name__ == "__main__":
    create_all_pumpkin_assets()
    print("All pumpkin assets created successfully!")