#!/usr/bin/env python3
"""
Helper script to download a video from a Google Drive public link directly to the hero video destination.
Handles standard Drive URLs, confirm tokens for large files, and redirects.
"""

import sys
import os
import re
import urllib.request
import urllib.parse
import http.cookiejar
import subprocess

def extract_drive_file_id(url_or_id):
    url_or_id = url_or_id.strip()
    # Match /file/d/<id>/
    m = re.search(r'/file/d/([a-zA-Z0-9_-]+)', url_or_id)
    if m:
        return m.group(1)
    # Match id=<id>
    m = re.search(r'[?&]id=([a-zA-Z0-9_-]+)', url_or_id)
    if m:
        return m.group(1)
    # If raw id
    if re.match(r'^[a-zA-Z0-9_-]{20,}$', url_or_id):
        return url_or_id
    return None

def download_drive_file(file_id, output_path):
    cj = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
    opener.addheaders = [
        ('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    ]

    base_url = "https://drive.google.com/uc?export=download"
    url = f"{base_url}&id={file_id}"

    print(f"Connecting to Google Drive for file ID: {file_id}...")
    response = opener.open(url)
    
    # Peek at initial content/headers
    content_type = response.headers.get('Content-Type', '')
    
    if 'text/html' in content_type:
        content = response.read()
        decoded = content.decode('utf-8', errors='ignore')
        
        if "the owner hasn't given you permission to download this file" in decoded:
            raise PermissionError("Google Drive download permission is disabled. In Drive, open Share -> click ⚙️ Settings icon -> check 'Viewers and commenters can see the option to download, print, and copy'.")
        
        # Check for confirmation token or modern action link
        confirm_token = None
        token_match = re.search(r'confirm=([0-9A-Za-z_]+)', decoded)
        if token_match:
            confirm_token = token_match.group(1)
            download_url = f"{base_url}&id={file_id}&confirm={confirm_token}"
        else:
            # Check for form action link
            action_match = re.search(r'action="([^"]+)"', decoded)
            uuid_match = re.search(r'name="uuid" value="([^"]+)"', decoded)
            if action_match and uuid_match:
                action_url = action_match.group(1).replace('&amp;', '&')
                uuid_val = uuid_match.group(1)
                download_url = f"{action_url}&uuid={uuid_val}"
            elif action_match:
                download_url = action_match.group(1).replace('&amp;', '&')
            else:
                download_url = f"{base_url}&id={file_id}&confirm=t"
        
        print(f"Large file download detected, proceeding with token/action...")
        response = opener.open(download_url)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    temp_path = output_path + ".tmp"
    total_downloaded = 0
    
    with open(temp_path, 'wb') as f:
        while True:
            chunk = response.read(1024 * 1024) # 1MB chunks
            if not chunk:
                break
            f.write(chunk)
            total_downloaded += len(chunk)
            print(f"Downloaded {total_downloaded // (1024*1024)} MB...", end='\r')

    # Verify not HTML error
    with open(temp_path, 'rb') as f:
        first_bytes = f.read(512)
        if b'<!DOCTYPE html>' in first_bytes or b'<html' in first_bytes:
            first_text = first_bytes.decode('utf-8', errors='ignore')
            if "permission" in first_text.lower():
                os.remove(temp_path)
                raise PermissionError("Download permission blocked by Google Drive.")

    os.replace(temp_path, output_path)
    file_size = os.path.getsize(output_path)
    print(f"\nDownloaded {file_size // (1024*1024)} MB to {output_path}")

    # Also duplicate to alternative names
    alt_paths = [
        "public/videos/Sequence 01.mp4",
        "public/videos/hero-showcase.mp4",
        "public/hero-preview.mp4"
    ]
    for alt in alt_paths:
        try:
            with open(alt, 'wb') as f:
                f.write(content)
        except Exception as e:
            pass

    # Extract poster frame using ffmpeg if available
    try:
        subprocess.run([
            "ffmpeg", "-y", "-ss", "00:00:01.000", "-i", output_path,
            "-vframes", "1", "-q:v", "2", "public/images/hero-poster.jpg"
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        subprocess.run([
            "ffmpeg", "-y", "-ss", "00:00:01.000", "-i", output_path,
            "-vframes", "1", "-q:v", "2", "public/images/hero-poster.webp"
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print("Updated hero poster frames.")
    except Exception as e:
        print(f"Could not generate poster: {e}")

    return file_size

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 download_drive_video.py <GoogleDriveLinkOrID> [outputPath]")
        sys.exit(1)

    drive_input = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else "public/videos/Sequence-01.mp4"
    fid = extract_drive_file_id(drive_input)
    if not fid:
        print(f"Error: Could not extract Google Drive file ID from '{drive_input}'")
        sys.exit(1)

    try:
        download_drive_file(fid, out)
        print("SUCCESS")
    except Exception as err:
        print(f"Failed to download: {err}")
        sys.exit(1)
