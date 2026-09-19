import subprocess
import os

# Create public dir if not exists
os.makedirs("public", exist_ok=True)

# 1. FEVIQO Icon (Circle green background, white geometric F)
feviqo_icon_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
  <defs>
    <clipPath id="circleClip">
      <circle cx="500" cy="500" r="480" />
    </clipPath>
  </defs>
  <circle cx="500" cy="500" r="480" fill="#16A34A" />
  <g fill="#FFFFFF">
    <!-- Top Parallelogram -->
    <polygon points="328,258 775,258 670,365 254,365" />
    <!-- Middle Trapezoid -->
    <polygon points="402,458 668,458 594,552 446,552" />
    <!-- Bottom Triangle -->
    <polygon points="254,440 400,665 254,810" />
  </g>
</svg>"""

with open("public/feviqo1.svg", "w") as f:
    f.write(feviqo_icon_svg)

# 2. FEVIQO Header Logo (Transparent background with FEVIQO wordmark, green accent on F and Q)
# Let's create an ultra-clean SVG for the header logo
# Dimensions 800 x 200
feviqo_header_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 200" width="800" height="200">
  <!-- F Mark -->
  <g transform="translate(40, 25) scale(0.24)">
    <!-- Top Parallelogram in vibrant Green -->
    <polygon points="328,258 775,258 670,365 254,365" fill="#22C55E" />
    <!-- Middle Trapezoid in White -->
    <polygon points="402,458 668,458 594,552 446,552" fill="#FFFFFF" />
    <!-- Bottom Triangle in White -->
    <polygon points="254,440 400,665 254,810" fill="#FFFFFF" />
  </g>

  <!-- Wordmark E V I Q O -->
  <g fill="#FFFFFF">
    <!-- E -->
    <path d="M 235 62 H 310 V 82 H 262 V 104 H 302 V 122 H 262 V 144 H 312 V 164 H 235 Z" />

    <!-- V -->
    <path d="M 330 62 H 356 L 382 136 L 408 62 H 434 L 396 164 H 368 Z" />

    <!-- I -->
    <rect x="454" y="62" width="24" height="102" />

    <!-- Q Body -->
    <path d="M 545 60 C 515 60 495 80 495 113 C 495 146 515 166 545 166 C 564 166 579 157 588 142 L 572 129 C 566 141 556 147 545 147 C 530 147 519 133 519 113 C 519 93 530 79 545 79 C 560 79 571 93 571 113 C 571 117 570 121 568 125 L 588 136 C 592 129 595 121 595 113 C 595 80 575 60 545 60 Z" />

    <!-- O -->
    <path d="M 670 60 C 640 60 620 80 620 113 C 620 146 640 166 670 166 C 700 166 720 146 720 113 C 720 80 700 60 670 60 Z M 670 79 C 685 79 696 93 696 113 C 696 133 685 147 670 147 C 655 147 644 133 644 113 C 644 93 655 79 670 79 Z" />
  </g>

  <!-- Q Tail in vibrant Green -->
  <polygon points="572,130 594,152 616,152 586,122" fill="#22C55E" />
</svg>"""

with open("public/HEADER-removebg-preview.svg", "w") as f:
    f.write(feviqo_header_svg)

print("SVGs created successfully.")
