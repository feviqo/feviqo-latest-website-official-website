from PIL import Image
import glob
import colorsys
import os

for path in sorted(glob.glob('downloaded_images/*.*')):
    try:
        im = Image.open(path)
        # Convert first frame to RGB
        im.seek(0)
        rgb_im = im.convert('RGB')
        w, h = rgb_im.size
        pixels = list(rgb_im.getdata())
        
        # Count purple/violet/magenta pixels:
        # In HSV, purple is roughly hue 0.65 to 0.88 (234 to 316 deg) with decent saturation > 0.25 and value > 0.2
        purple_count = 0
        total = len(pixels)
        for r, g, b in pixels:
            h_val, s_val, v_val = colorsys.rgb_to_hsv(r/255.0, g/255.0, b/255.0)
            if 0.65 <= h_val <= 0.88 and s_val >= 0.20 and v_val >= 0.15:
                purple_count += 1
                
        pct = (purple_count / total) * 100.0
        if pct > 0.5:
            print(f"{os.path.basename(path)}: {pct:.2f}% purple pixels (size {w}x{h})")
    except Exception as e:
        print(f"Error {path}: {e}")

