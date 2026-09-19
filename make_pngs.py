import zlib
import struct
import math

def write_png(filename, width, height, rgba_data):
    # PNG signature
    png = b'\x89PNG\r\n\x1a\n'
    
    # IHDR
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data)
    png += struct.pack('>I', len(ihdr_data)) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc)
    
    # IDAT
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # filter type 0 (None)
        start = y * width * 4
        raw_data.extend(rgba_data[start:start + width * 4])
        
    compressed = zlib.compress(bytes(raw_data), level=9)
    idat_crc = zlib.crc32(b'IDAT' + compressed)
    png += struct.pack('>I', len(compressed)) + b'IDAT' + compressed + struct.pack('>I', idat_crc)
    
    # IEND
    iend_crc = zlib.crc32(b'IEND')
    png += struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc)
    
    with open(filename, 'wb') as f:
        f.write(png)
    print(f"Generated {filename} ({width}x{height})")

def point_in_poly(x, y, poly):
    n = len(poly)
    inside = False
    p1x, p1y = poly[0]
    for i in range(n + 1):
        p2x, p2y = poly[i % n]
        if y > min(p1y, p2y):
            if y <= max(p1y, p2y):
                if x <= max(p1x, p2x):
                    if p1y != p2y:
                        xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                    if p1x == p2x or x <= xinters:
                        inside = not inside
        p1x, p1y = p2x, p2y
    return inside

# 1. Create feviqo1.png (512x512)
w1, h1 = 512, 512
buf1 = bytearray(w1 * h1 * 4)

poly1 = [(p[0] * w1 / 1000.0, p[1] * h1 / 1000.0) for p in [(328, 258), (775, 258), (670, 365), (254, 365)]]
poly2 = [(p[0] * w1 / 1000.0, p[1] * h1 / 1000.0) for p in [(402, 458), (668, 458), (594, 552), (446, 552)]]
poly3 = [(p[0] * w1 / 1000.0, p[1] * h1 / 1000.0) for p in [(254, 440), (400, 665), (254, 810)]]

cx, cy, radius = w1 / 2.0, h1 / 2.0, w1 * 0.485

for y in range(h1):
    for x in range(w1):
        idx = (y * w1 + x) * 4
        dx = x - cx
        dy = y - cy
        dist = math.sqrt(dx*dx + dy*dy)
        if dist <= radius:
            # Check if in white shapes
            if point_in_poly(x, y, poly1) or point_in_poly(x, y, poly2) or point_in_poly(x, y, poly3):
                buf1[idx] = 255
                buf1[idx+1] = 255
                buf1[idx+2] = 255
                buf1[idx+3] = 255
            else:
                buf1[idx] = 22     # #16A34A (22, 163, 74) or (34, 197, 94)
                buf1[idx+1] = 163
                buf1[idx+2] = 74
                buf1[idx+3] = 255
        else:
            # transparent
            buf1[idx+3] = 0

write_png("public/feviqo1.png", w1, h1, buf1)

