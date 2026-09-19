import os
import colorsys
from PIL import Image, ImageSequence

TARGET_HEX = '#22C55E'  # FEVIQO Brand Green
tr = int(TARGET_HEX[1:3], 16) / 255.0
tg = int(TARGET_HEX[3:5], 16) / 255.0
tb = int(TARGET_HEX[5:7], 16) / 255.0
target_h, _, _ = colorsys.rgb_to_hsv(tr, tg, tb)

def recolor_frame(im):
    rgba = im.convert('RGBA')
    w, h = rgba.size
    pixels = rgba.load()

    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a < 15:
                continue

            # PRESERVE BLACK & DARK SHADOWS:
            # Simple black shadows or dark neutral shadows must NEVER be tinted green!
            if max(r, g, b) < 60:
                continue

            h_val, s_val, v_val = colorsys.rgb_to_hsv(r / 255.0, g / 255.0, b / 255.0)
            deg = h_val * 360.0

            # STRICT BRAND PALETTE:
            # Only recolor cyan, blue, indigo, and purple (195° to 305°)
            # Excludes 310°-360° and 0°-60° to protect red, pink, warm undertones, and lips
            if not (195.0 <= deg <= 305.0):
                continue

            # PRESERVE FACES & SKIN:
            # Human skin and faces consistently have r > b
            # In purple/blue brand elements, blue is dominant over red
            if r > b * 1.02:
                continue

            # Ensure sufficient saturation and brightness
            if s_val < 0.22 or v_val < 0.26:
                continue

            # Smooth feathering weights to avoid pixelated edges
            if deg < 210.0:
                w_hue = (deg - 195.0) / 15.0
            elif deg > 290.0:
                w_hue = (305.0 - deg) / 15.0
            else:
                w_hue = 1.0

            if s_val < 0.30:
                w_sat = (s_val - 0.22) / 0.08
            else:
                w_sat = 1.0

            if v_val < 0.34:
                w_val = (v_val - 0.26) / 0.08
            else:
                w_val = 1.0

            weight = w_hue * w_sat * w_val
            if weight <= 0.01:
                continue

            new_s = max(0.45, min(1.0, s_val * 1.05))
            gr, gg, gb = colorsys.hsv_to_rgb(target_h, new_s, v_val)

            # RGB space cross-fade blending
            out_r = int((1.0 - weight) * r + weight * (gr * 255.0) + 0.5)
            out_g = int((1.0 - weight) * g + weight * (gg * 255.0) + 0.5)
            out_b = int((1.0 - weight) * b + weight * (gb * 255.0) + 0.5)

            pixels[x, y] = (out_r, out_g, out_b, a)

    return rgba

os.makedirs('public/images', exist_ok=True)

static_list = [
    'creating-hard.png.webp',
    'creative1.png.webp',
    'creative2.png.webp',
    'creative3.png.webp',
    'tools1.png.webp',
    'image-328.png.webp',
]

for name in static_list:
    src = os.path.join('downloaded_images', name)
    if os.path.exists(src):
        dst = os.path.join('public/images', name.replace('.webp', '.png').replace('.png.png', '.png'))
        im = Image.open(src)
        recolored = recolor_frame(im)
        recolored.save(dst, 'PNG', optimize=True)
        print(f"Processed {name} -> {dst}")

# Now process animated Landing-Gif-2-1.gif.webp
anim_src = 'downloaded_images/Landing-Gif-2-1.gif.webp'
if os.path.exists(anim_src):
    anim_im = Image.open(anim_src)
    n_frames = getattr(anim_im, 'n_frames', 1)
    print(f"Processing animated {anim_src} with {n_frames} frames...")
    durations = []
    processed_frames = []
    for idx, frame in enumerate(ImageSequence.Iterator(anim_im)):
        durations.append(frame.info.get('duration', 40))
        processed_frames.append(recolor_frame(frame))
        if (idx + 1) % 20 == 0:
            print(f"  Processed {idx + 1}/{n_frames} frames...")

    anim_dst = 'public/images/Landing-Gif-2-1.webp'
    processed_frames[0].save(
        anim_dst,
        save_all=True,
        append_images=processed_frames[1:],
        duration=durations,
        loop=0,
        optimize=True
    )
    print(f"Saved animated {anim_dst}")

print("All asset recoloring with shadow & face preservation complete!")
