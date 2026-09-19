#!/bin/bash
set -e

mkdir -p /tmp/feviqo_video
mkdir -p public/videos
mkdir -p public/images

FONT="/usr/share/fonts/truetype/freefont/FreeSansBold.ttf"

# Scene 1: FEVIQO - Performance Creative - Built for Attention (0-4s)
ffmpeg -y -f lavfi -i "color=c=0x061D12:s=1280x720:d=4:r=30" \
  -vf "drawtext=text='FEVIQO':fontfile='$FONT':fontsize=92:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-40, \
       drawtext=text='Performance Creative':fontfile='$FONT':fontsize=36:fontcolor=0x22C55E:x=(w-text_w)/2:y=(h-text_h)/2+45:enable='between(t,1.2,4)', \
       drawtext=text='Built for Attention':fontfile='$FONT':fontsize=28:fontcolor=0x94A3B8:x=(w-text_w)/2:y=(h-text_h)/2+95:enable='between(t,2.2,4)'" \
  -c:v libx264 -pix_fmt yuv420p /tmp/feviqo_video/scene1.mp4

# Scene 2: Search capsule "Make every second count." (4-8s)
ffmpeg -y -f lavfi -i "color=c=0x061D12:s=1280x720:d=4:r=30" \
  -vf "drawbox=x=(w-600)/2:y=(h-80)/2:w=600:h=80:color=0x143B27:t=fill, \
       drawbox=x=(w-600)/2:y=(h-80)/2:w=600:h=80:color=0x22C55E:t=3, \
       drawtext=text='Make every second count.':fontfile='$FONT':fontsize=32:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2, \
       drawtext=text='FEVIQO':fontfile='$FONT':fontsize=36:fontcolor=0x22C55E:x=(w-text_w)/2:y=h/2+90:enable='between(t,2,4)'" \
  -c:v libx264 -pix_fmt yuv420p /tmp/feviqo_video/scene2.mp4

# Scene 3: RAW vs FEVIQO (8-14s)
ffmpeg -y -f lavfi -i "color=c=0x061D12:s=1280x720:d=6:r=30" \
  -vf "drawbox=x=80:y=100:w=520:h=520:color=0x0F172A:t=fill, \
       drawbox=x=80:y=100:w=520:h=520:color=0x334155:t=2, \
       drawtext=text='RAW FOOTAGE':fontfile='$FONT':fontsize=28:fontcolor=0x64748B:x=120:y=130, \
       drawtext=text='Unedited clip':fontfile='$FONT':fontsize=22:fontcolor=0x475569:x=120:y=180, \
       drawtext=text='Flat pacing':fontfile='$FONT':fontsize=20:fontcolor=0x475569:x=120:y=230, \
       drawbox=x=680:y=100:w=520:h=520:color=0x061D12:t=fill, \
       drawbox=x=680:y=100:w=520:h=520:color=0x22C55E:t=4, \
       drawtext=text='MY WORK':fontfile='$FONT':fontsize=32:fontcolor=white:x=720:y=130, \
       drawtext=text='FEVIQO EDIT':fontfile='$FONT':fontsize=22:fontcolor=0x22C55E:x=720:y=175, \
       drawtext=text='Kinetic Captions':fontfile='$FONT':fontsize=24:fontcolor=0xE2E8F0:x=720:y=240, \
       drawtext=text='Hook in first 2s':fontfile='$FONT':fontsize=24:fontcolor=0x22C55E:x=720:y=280, \
       drawtext=text='Audio design & dynamic zooms':fontfile='$FONT':fontsize=20:fontcolor=0x94A3B8:x=720:y=330" \
  -c:v libx264 -pix_fmt yuv420p /tmp/feviqo_video/scene3.mp4

# Scene 4: content people notice - hold attention longer - drive real results (14-19s)
ffmpeg -y -f lavfi -i "color=c=0x061D12:s=1280x720:d=5:r=30" \
  -vf "drawtext=text='content people notice':fontfile='$FONT':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-60:enable='between(t,0,2)', \
       drawtext=text='hold attention longer':fontfile='$FONT':fontsize=56:fontcolor=0x22C55E:x=(w-text_w)/2:y=(h-text_h)/2:enable='between(t,1.8,3.5)', \
       drawtext=text='drive real results':fontfile='$FONT':fontsize=52:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2+60:enable='between(t,3.2,5)'" \
  -c:v libx264 -pix_fmt yuv420p /tmp/feviqo_video/scene4.mp4

# Scene 5: Unlimited Video Editing Service card (19-25s)
ffmpeg -y -f lavfi -i "color=c=0x061D12:s=1280x720:d=6:r=30" \
  -vf "drawbox=x=(w-900)/2:y=(h-460)/2:w=900:h=460:color=0x0F291E:t=fill, \
       drawbox=x=(w-900)/2:y=(h-460)/2:w=900:h=460:color=0x22C55E:t=2, \
       drawtext=text='Dedicated Editors  *  24h Turnaround  *  Flat Monthly Rate':fontfile='$FONT':fontsize=22:fontcolor=0x22C55E:x=(w-text_w)/2:y=(h-460)/2+50, \
       drawtext=text='Unlimited Video Editing Service':fontfile='$FONT':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=(h-460)/2+110, \
       drawtext=text='Tailored for modern-day video editing by FEVIQO':fontfile='$FONT':fontsize=26:fontcolor=0x94A3B8:x=(w-text_w)/2:y=(h-460)/2+190, \
       drawtext=text='Create top-tier video content without the hassle of managing':fontfile='$FONT':fontsize=22:fontcolor=0xCBD5E1:x=(w-text_w)/2:y=(h-460)/2+240, \
       drawtext=text='4.9 / 5.0 Rating  *  500+ Projects Delivered':fontfile='$FONT':fontsize=24:fontcolor=0x22C55E:x=(w-text_w)/2:y=(h-460)/2+330" \
  -c:v libx264 -pix_fmt yuv420p /tmp/feviqo_video/scene5.mp4

# Scene 6: Creators Montage - 10 year old strategies, text 21 messages (25-31s)
ffmpeg -y -f lavfi -i "color=c=0x061D12:s=1280x720:d=6:r=30" \
  -vf "drawtext=text='Your content deserves to perform':fontfile='$FONT':fontsize=46:fontcolor=white:x=(w-text_w)/2:y=120, \
       drawbox=x=120:y=200:w=480:h=380:color=0x11271C:t=fill, \
       drawbox=x=120:y=200:w=480:h=380:color=0x22C55E:t=2, \
       drawtext=text='Shorts & TikTok':fontfile='$FONT':fontsize=28:fontcolor=0x22C55E:x=150:y=240, \
       drawtext=text='High Retention Hooks':fontfile='$FONT':fontsize=24:fontcolor=white:x=150:y=290, \
       drawtext=text='+800K Views average':fontfile='$FONT':fontsize=22:fontcolor=0x94A3B8:x=150:y=340, \
       drawbox=x=680:y=200:w=480:h=380:color=0x11271C:t=fill, \
       drawbox=x=680:y=200:w=480:h=380:color=0x22C55E:t=2, \
       drawtext=text='Long Form & YouTube':fontfile='$FONT':fontsize=28:fontcolor=0x22C55E:x=710:y=240, \
       drawtext=text='Pacing & Story Structure':fontfile='$FONT':fontsize=24:fontcolor=white:x=710:y=290, \
       drawtext=text='Chapters, VFX & Sound Design':fontfile='$FONT':fontsize=22:fontcolor=0x94A3B8:x=710:y=340" \
  -c:v libx264 -pix_fmt yuv420p /tmp/feviqo_video/scene6.mp4

# Scene 7: Multi-panel editorial grid (31-37s)
ffmpeg -y -f lavfi -i "color=c=0x061D12:s=1280x720:d=6:r=30" \
  -vf "drawtext=text='Editing that performs':fontfile='$FONT':fontsize=52:fontcolor=white:x=(w-text_w)/2:y=100, \
       drawtext=text='Create.  Impact.  Convert.':fontfile='$FONT':fontsize=36:fontcolor=0x22C55E:x=(w-text_w)/2:y=170, \
       drawtext=text='Transform raw footage into high-impact creative':fontfile='$FONT':fontsize=26:fontcolor=0x94A3B8:x=(w-text_w)/2:y=260, \
       drawtext=text='Purposeful storytelling  *  Stronger hooks  *  Seamless pacing':fontfile='$FONT':fontsize=24:fontcolor=0xCBD5E1:x=(w-text_w)/2:y=320, \
       drawtext=text='Made To Be Remembered':fontfile='$FONT':fontsize=40:fontcolor=white:x=(w-text_w)/2:y=430" \
  -c:v libx264 -pix_fmt yuv420p /tmp/feviqo_video/scene7.mp4

# Scene 8: Kinetic typography concentric orb (37-44s)
ffmpeg -y -f lavfi -i "color=c=0x061D12:s=1280x720:d=7:r=30" \
  -vf "drawtext=text='Create Something Worth Watching':fontfile='$FONT':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=140, \
       drawtext=text='Hook  *  Engage  *  Retain  *  Convert  *  Grow':fontfile='$FONT':fontsize=32:fontcolor=0x22C55E:x=(w-text_w)/2:y=220, \
       drawtext=text='Precision Editing':fontfile='$FONT':fontsize=26:fontcolor=0x64748B:x=(w-text_w)/2:y=310, \
       drawtext=text='Content Strategy':fontfile='$FONT':fontsize=34:fontcolor=0x22C55E:x=(w-text_w)/2:y=360, \
       drawtext=text='Purposeful Editing':fontfile='$FONT':fontsize=40:fontcolor=white:x=(w-text_w)/2:y=420, \
       drawtext=text='Premium Visuals  *  High Retention':fontfile='$FONT':fontsize=28:fontcolor=0x94A3B8:x=(w-text_w)/2:y=480" \
  -c:v libx264 -pix_fmt yuv420p /tmp/feviqo_video/scene8.mp4

# Scene 9: Watch what good editing can do - Final FEVIQO signature (44-52s)
ffmpeg -y -f lavfi -i "color=c=0x061D12:s=1280x720:d=8:r=30" \
  -vf "drawtext=text='Watch what good editing can do':fontfile='$FONT':fontsize=42:fontcolor=white:x=(w-text_w)/2:y=160:enable='between(t,0,3)', \
       drawtext=text='PERFORM':fontfile='$FONT':fontsize=64:fontcolor=0x22C55E:x=(w-text_w)/2:y=240:enable='between(t,1.5,4)', \
       drawtext=text='FEVIQO':fontfile='$FONT':fontsize=96:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-30:enable='gte(t,3.5)', \
       drawtext=text='The Content Growth Partner for US Brands':fontfile='$FONT':fontsize=30:fontcolor=0x22C55E:x=(w-text_w)/2:y=(h-text_h)/2+60:enable='gte(t,4)'" \
  -c:v libx264 -pix_fmt yuv420p /tmp/feviqo_video/scene9.mp4

# Concatenate all scenes into master video
cat << 'EOF' > /tmp/feviqo_video/list.txt
file '/tmp/feviqo_video/scene1.mp4'
file '/tmp/feviqo_video/scene2.mp4'
file '/tmp/feviqo_video/scene3.mp4'
file '/tmp/feviqo_video/scene4.mp4'
file '/tmp/feviqo_video/scene5.mp4'
file '/tmp/feviqo_video/scene6.mp4'
file '/tmp/feviqo_video/scene7.mp4'
file '/tmp/feviqo_video/scene8.mp4'
file '/tmp/feviqo_video/scene9.mp4'
EOF

# Add high quality synth soundscape / beat
ffmpeg -y -f concat -safe 0 -i /tmp/feviqo_video/list.txt \
  -f lavfi -i "sine=frequency=120:duration=50" \
  -c:v libx264 -crf 20 -preset fast -pix_fmt yuv420p \
  -c:a aac -b:a 192k -shortest \
  public/videos/hero-showcase.mp4

# Also compile WebM
ffmpeg -y -i public/videos/hero-showcase.mp4 \
  -c:v libvpx-vp9 -b:v 1500k -c:a libopus \
  public/videos/hero-showcase.webm

# Copy to hero-preview.mp4
cp public/videos/hero-showcase.mp4 public/hero-preview.mp4

# Generate master poster frame at 1s
ffmpeg -y -i public/videos/hero-showcase.mp4 -ss 00:00:01.000 -vframes 1 public/images/hero-poster.webp
ffmpeg -y -i public/videos/hero-showcase.mp4 -ss 00:00:01.000 -vframes 1 public/images/hero-poster.jpg

echo "FEVIQO Hero Video generated successfully!"
