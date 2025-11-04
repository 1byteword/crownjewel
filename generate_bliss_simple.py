#!/usr/bin/env python3
"""
Generate a simpler, more recognizable Bliss ASCII art
Focus on the iconic rolling hills
"""

import math

def generate_simple_bliss(width=160, height=40):
    """Generate simple Bliss with recognizable rolling hills"""
    output = []

    for y in range(height):
        line = []

        # Calculate what "layer" we're in based on y position
        sky_end = height * 0.25
        horizon_start = height * 0.4
        hill_peak = height * 0.7

        for x in range(width):
            if y < sky_end:
                # Sky - very sparse
                if (x + y * 7) % 23 == 0:
                    line.append('.')
                else:
                    line.append(' ')

            elif y < horizon_start:
                # Upper atmosphere - sparse clouds
                if (x * 3 + y * 5) % 31 == 0:
                    line.append('~')
                else:
                    line.append(' ')

            else:
                # Hills - create rolling wave pattern
                # Multiple sine waves for rolling hills effect
                wave = math.sin(x * 0.15) * 4 + math.sin(x * 0.08 + 2) * 6
                wave_y = horizon_start + (hill_peak - horizon_start) * 0.5 + wave

                if y < wave_y:
                    # Sky part
                    line.append(' ')
                elif y < wave_y + 3:
                    # Hill crest - lighter
                    line.append('.')
                elif y < wave_y + 8:
                    # Mid hill
                    line.append(':')
                elif y < wave_y + 15:
                    # Lower hill
                    line.append(';')
                else:
                    # Grass
                    line.append('#')

        output.append(''.join(line))

    return output

if __name__ == '__main__':
    ascii_art = generate_simple_bliss()

    for line in ascii_art:
        print(line)

    with open('bliss_simple.txt', 'w', encoding='utf-8') as f:
        f.write('\n'.join(ascii_art))

    print(f"\n✓ Generated {len(ascii_art)} lines")
