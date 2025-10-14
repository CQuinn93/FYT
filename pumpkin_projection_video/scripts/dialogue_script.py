#!/usr/bin/env python3
"""
Halloween dialogue and song script for talking pumpkins
"""

# Dialogue scenes for the pumpkins
DIALOGUE_SCENES = [
    {
        "scene": "introduction",
        "duration": 45,
        "lines": [
            {"speaker": 1, "text": "Well hello there, Jack! Ready for another spooky Halloween night?", "duration": 4},
            {"speaker": 2, "text": "Oh my gourd, yes! I've been waiting all year for this moment!", "duration": 4},
            {"speaker": 1, "text": "The trick-or-treaters will be here soon. Should we give them a real scare?", "duration": 5},
            {"speaker": 2, "text": "Absolutely! But first, how about we sing some frightfully fun songs?", "duration": 4},
            {"speaker": 1, "text": "Brilliant idea! Nothing says Halloween like a good old-fashioned pumpkin duet!", "duration": 5},
            {"speaker": 2, "text": "Let's start with something spooky to set the mood...", "duration": 3}
        ]
    },
    {
        "scene": "song1_intro",
        "duration": 15,
        "lines": [
            {"speaker": 1, "text": "How about we sing about our favorite Halloween creatures?", "duration": 4},
            {"speaker": 2, "text": "Perfect! I know just the song. Ready? One, two, three...", "duration": 4}
        ]
    },
    {
        "scene": "intermission1",
        "duration": 30,
        "lines": [
            {"speaker": 2, "text": "That was wonderfully wicked! Did you hear that owl hooting?", "duration": 4},
            {"speaker": 1, "text": "I did! Even the bats are dancing to our tune tonight!", "duration": 4},
            {"speaker": 2, "text": "Speaking of dancing, I saw some ghosts waltzing by earlier.", "duration": 4},
            {"speaker": 1, "text": "Really? Well, we better keep the music going then!", "duration": 3},
            {"speaker": 2, "text": "Agreed! How about something about our spooky home?", "duration": 3}
        ]
    },
    {
        "scene": "song2_intro", 
        "duration": 10,
        "lines": [
            {"speaker": 1, "text": "This one's about our haunted house! Ready?", "duration": 3},
            {"speaker": 2, "text": "Let's make it extra eerie!", "duration": 2}
        ]
    },
    {
        "scene": "intermission2",
        "duration": 35,
        "lines": [
            {"speaker": 1, "text": "I love how our voices echo through the night!", "duration": 4},
            {"speaker": 2, "text": "Me too! I think we're attracting quite an audience of spirits.", "duration": 4},
            {"speaker": 1, "text": "Look! There's a black cat watching us from the fence!", "duration": 4},
            {"speaker": 2, "text": "And I see some glowing eyes in the bushes. How delightfully spooky!", "duration": 5},
            {"speaker": 1, "text": "Should we sing them a lullaby? Something soft and mysterious?", "duration": 4},
            {"speaker": 2, "text": "What a ghoulishly good idea! Let's serenade the shadows.", "duration": 4}
        ]
    },
    {
        "scene": "song3_intro",
        "duration": 8,
        "lines": [
            {"speaker": 1, "text": "This one's for all the creatures of the night...", "duration": 3},
            {"speaker": 2, "text": "A Halloween lullaby it is!", "duration": 2}
        ]
    },
    {
        "scene": "finale",
        "duration": 40,
        "lines": [
            {"speaker": 2, "text": "What a magical Halloween evening this has been!", "duration": 4},
            {"speaker": 1, "text": "Indeed! Our songs have filled the night with spooky joy.", "duration": 4},
            {"speaker": 2, "text": "I can hear the trick-or-treaters approaching down the street!", "duration": 4},
            {"speaker": 1, "text": "Perfect timing! Should we give them one final scare?", "duration": 4},
            {"speaker": 2, "text": "Let's do it together! On the count of three... One... Two...", "duration": 4},
            {"speaker": 1, "text": "BOO! Happy Halloween, everyone!", "duration": 3},
            {"speaker": 2, "text": "Hope you enjoyed our spooky serenade! Come back next year!", "duration": 4},
            {"speaker": 1, "text": "Until then, sweet screams and happy haunting!", "duration": 4}
        ]
    }
]

# Halloween songs for the pumpkins to sing
SONGS = [
    {
        "title": "Creatures of the Night",
        "duration": 120,  # 2 minutes
        "lyrics": [
            {"line": "In the shadows where the moonlight gleams", "duration": 4, "harmony": False},
            {"line": "Dance the ghosts and ghouls of dreams", "duration": 4, "harmony": False},
            {"line": "Witches fly on broomsticks high", "duration": 4, "harmony": True},
            {"line": "Underneath the starlit sky", "duration": 4, "harmony": True},
            {"line": "Bats are swooping all around", "duration": 4, "harmony": False},
            {"line": "Making such a spooky sound", "duration": 4, "harmony": False},
            {"line": "Werewolves howling at the moon", "duration": 4, "harmony": True},
            {"line": "Halloween will be here soon", "duration": 4, "harmony": True},
            {"line": "Creatures of the night unite", "duration": 4, "harmony": True},
            {"line": "On this most enchanted night", "duration": 4, "harmony": True},
            {"line": "Spiders weaving webs so fine", "duration": 4, "harmony": False},
            {"line": "In the twisted old grapevine", "duration": 4, "harmony": False},
            {"line": "Skeletons dance bone to bone", "duration": 4, "harmony": True},
            {"line": "In the graveyard all alone", "duration": 4, "harmony": True},
            {"line": "Come and join our spooky song", "duration": 4, "harmony": True},
            {"line": "Halloween night is never wrong!", "duration": 4, "harmony": True}
        ]
    },
    {
        "title": "The Haunted House",
        "duration": 100,  # 1 minute 40 seconds
        "lyrics": [
            {"line": "There's a house upon the hill so high", "duration": 4, "harmony": False},
            {"line": "Where the ravens come to cry", "duration": 4, "harmony": False},
            {"line": "Creaking floors and squeaking doors", "duration": 4, "harmony": True},
            {"line": "Ancient secrets it still stores", "duration": 4, "harmony": True},
            {"line": "Windows glow with eerie light", "duration": 4, "harmony": False},
            {"line": "Phantoms waltz throughout the night", "duration": 4, "harmony": False},
            {"line": "Chains that rattle in the hall", "duration": 4, "harmony": True},
            {"line": "Ghostly whispers through the wall", "duration": 4, "harmony": True},
            {"line": "In our haunted house so dear", "duration": 4, "harmony": True},
            {"line": "We gather spirits far and near", "duration": 4, "harmony": True},
            {"line": "Cobwebs hanging from above", "duration": 4, "harmony": False},
            {"line": "This spooky place is what we love", "duration": 4, "harmony": False},
            {"line": "Come inside if you dare", "duration": 4, "harmony": True},
            {"line": "But beware of what lurks there!", "duration": 4, "harmony": True}
        ]
    },
    {
        "title": "Halloween Lullaby",
        "duration": 90,  # 1 minute 30 seconds
        "lyrics": [
            {"line": "Sleep now little ghostly one", "duration": 5, "harmony": False},
            {"line": "Your haunting day is done", "duration": 5, "harmony": False},
            {"line": "Dream of pumpkins in the patch", "duration": 5, "harmony": True},
            {"line": "And magic spells to catch", "duration": 5, "harmony": True},
            {"line": "Moonbeams dance on spider silk", "duration": 5, "harmony": False},
            {"line": "Soft as phantom milk", "duration": 5, "harmony": False},
            {"line": "Stars are twinkling overhead", "duration": 5, "harmony": True},
            {"line": "Time for sleepy head", "duration": 5, "harmony": True},
            {"line": "Close your eyes my little sprite", "duration": 5, "harmony": True},
            {"line": "Until tomorrow's fright", "duration": 5, "harmony": True},
            {"line": "In your dreams you'll float and fly", "duration": 5, "harmony": False},
            {"line": "Through the midnight sky", "duration": 5, "harmony": False},
            {"line": "Rest now till the dawn breaks through", "duration": 5, "harmony": True},
            {"line": "Sweet dreams will come to you", "duration": 5, "harmony": True}
        ]
    }
]

def get_total_video_duration():
    """Calculate total duration of all scenes and songs"""
    total = 0
    
    # Add dialogue scenes
    for scene in DIALOGUE_SCENES:
        total += scene["duration"]
    
    # Add songs
    for song in SONGS:
        total += song["duration"]
    
    return total

def create_timeline():
    """Create a timeline of all events in the video"""
    timeline = []
    current_time = 0
    
    # Interleave dialogue and songs
    timeline.append({"type": "dialogue", "content": DIALOGUE_SCENES[0], "start": current_time})
    current_time += DIALOGUE_SCENES[0]["duration"]
    
    timeline.append({"type": "dialogue", "content": DIALOGUE_SCENES[1], "start": current_time})
    current_time += DIALOGUE_SCENES[1]["duration"]
    
    timeline.append({"type": "song", "content": SONGS[0], "start": current_time})
    current_time += SONGS[0]["duration"]
    
    timeline.append({"type": "dialogue", "content": DIALOGUE_SCENES[2], "start": current_time})
    current_time += DIALOGUE_SCENES[2]["duration"]
    
    timeline.append({"type": "dialogue", "content": DIALOGUE_SCENES[3], "start": current_time})
    current_time += DIALOGUE_SCENES[3]["duration"]
    
    timeline.append({"type": "song", "content": SONGS[1], "start": current_time})
    current_time += SONGS[1]["duration"]
    
    timeline.append({"type": "dialogue", "content": DIALOGUE_SCENES[4], "start": current_time})
    current_time += DIALOGUE_SCENES[4]["duration"]
    
    timeline.append({"type": "dialogue", "content": DIALOGUE_SCENES[5], "start": current_time})
    current_time += DIALOGUE_SCENES[5]["duration"]
    
    timeline.append({"type": "song", "content": SONGS[2], "start": current_time})
    current_time += SONGS[2]["duration"]
    
    timeline.append({"type": "dialogue", "content": DIALOGUE_SCENES[6], "start": current_time})
    current_time += DIALOGUE_SCENES[6]["duration"]
    
    return timeline, current_time

if __name__ == "__main__":
    timeline, total_duration = create_timeline()
    print(f"Total video duration: {total_duration} seconds ({total_duration/60:.1f} minutes)")
    print("\nTimeline:")
    for item in timeline:
        print(f"{item['start']:3d}s - {item['type']}: {item['content'].get('scene', item['content'].get('title', 'Unknown'))}")