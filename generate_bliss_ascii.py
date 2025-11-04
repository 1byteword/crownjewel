#!/usr/bin/env python3
"""
Generate ASCII art version of the Bliss wallpaper
Creates a simplified representation: sky at top, rolling hills below
"""

def generate_bliss_ascii(width=120, height=40):
    """Generate ASCII representation of Bliss wallpaper"""
    output = []

    # ASCII characters from lightest to darkest for different layers
    sky_chars = [' ', '.', '·', '˚', '∘']
    cloud_chars = [' ', '~', '≈', '∼']
    hill_chars = [' ', '.', ':', ';', '/', '\\', '|', '#']
    grass_chars = ['/', '\\', '|', ';', ',', "'", '"', '#']

    for y in range(height):
        line = []
        for x in range(width):
            # Determine what layer we're in based on y position
            if y < height * 0.3:  # Sky (top 30%)
                # Add some stars/dots randomly
                import random
                if random.random() < 0.05:
                    line.append(random.choice(['.', '˚', '*']))
                else:
                    line.append(' ')

            elif y < height * 0.4:  # Cloud layer
                import random
                if random.random() < 0.08:
                    line.append(random.choice(['~', '∼', '≈']))
                else:
                    line.append(' ')

            elif y < height * 0.6:  # Upper hills (lighter green)
                # Create rolling hills with sine wave
                import math
                wave1 = int(3 * math.sin(x * 0.3 + y * 0.2))
                wave2 = int(2 * math.sin(x * 0.5 - y * 0.1))
                intensity = (y - height * 0.4) / (height * 0.2) + (wave1 + wave2) * 0.1

                char_idx = int(intensity * (len(hill_chars) - 1))
                char_idx = max(0, min(char_idx, len(hill_chars) - 1))
                line.append(hill_chars[char_idx])

            else:  # Lower hills/grass (darker green)
                import math
                wave1 = int(4 * math.sin(x * 0.2 + y * 0.3))
                wave2 = int(3 * math.sin(x * 0.4 - y * 0.15))
                intensity = (y - height * 0.6) / (height * 0.4) + (wave1 + wave2) * 0.15

                char_idx = int(intensity * (len(grass_chars) - 1))
                char_idx = max(0, min(char_idx, len(grass_chars) - 1))
                line.append(grass_chars[char_idx])

        output.append(''.join(line))

    return output

if __name__ == '__main__':
    # Generate the ASCII art
    ascii_art = generate_bliss_ascii(width=200, height=50)

    # Print it
    for line in ascii_art:
        print(line)

    # Also save to file for easy embedding
    with open('bliss_ascii.txt', 'w', encoding='utf-8') as f:
        f.write('\n'.join(ascii_art))

    print(f"\nGenerated {len(ascii_art)} lines of ASCII art")
    print(f"Saved to bliss_ascii.txt")
