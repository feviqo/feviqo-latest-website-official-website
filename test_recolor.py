from PIL import Image
import colorsys
import os

def recolor_purple_to_green(input_path, output_path):
    im = Image.open(input_path)
    # Check if has alpha
    has_alpha = im.mode == 'RGBA'
    im_rgba = im.convert('RGBA')
    pixels = list(im_rgba.getdata())
    
    new_pixels = []
    # Target green hue: #22C55E is approx (34, 197, 94) -> HSV: H=142.1 deg (0.3947), S=0.827, V=0.773
    target_hue = 142.0 / 360.0 # 0.3944
    
    for r, g, b, a in pixels:
        if a == 0:
            new_pixels.append((r, g, b, a))
            continue
            
        h, s, v = colorsys.rgb_to_hsv(r / 255.0, g / 255.0, b / 255.0)
        
        # Check if color is in purple/violet/magenta range
        # Typically between 230 deg (0.64) and 320 deg (0.89)
        # and has noticeable saturation
        if 0.63 <= h <= 0.89 and s > 0.15 and v > 0.10:
            # Smooth transition at the boundaries
            weight = 1.0
            if h < 0.67:
                weight = (h - 0.63) / 0.04
            elif h > 0.85:
                weight = (0.89 - h) / 0.04
            weight = max(0.0, min(1.0, weight))
            
            # Blend hue towards target green
            new_h = (1.0 - weight) * h + weight * target_hue
            
            # Optional: slightly boost vibrancy if needed, but preserve brightness
            new_r, new_g, new_b = colorsys.hsv_to_rgb(new_h, s, v)
            new_pixels.append((int(round(new_r * 255)), int(round(new_g * 255)), int(round(new_b * 255)), a))
        else:
            new_pixels.append((r, g, b, a))
            
    out_im = Image.new('RGBA', im_rgba.size)
    out_im.putdata(new_pixels)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    out_im.save(output_path, 'PNG')
    print(f"Saved {output_path} ({im_rgba.size})")

recolor_purple_to_green('downloaded_images/creating-hard.png.webp', 'public/images/creating-hard.png')
