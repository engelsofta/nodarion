"""Render the 54-second captioned screenshot tour; requires Pillow and imageio-ffmpeg."""
from pathlib import Path
import os
import sys

from PIL import Image, ImageDraw, ImageFont, ImageOps

sys.path.insert(0, str(Path(os.environ.get('TEMP', '/tmp')) / 'nodarion-demo-deps'))
sys.path.insert(0, str(Path.home() / 'AppData/Local/Temp/nodarion-demo-deps'))
import imageio_ffmpeg

HERE = Path(__file__).resolve().parent
IMAGES = HERE.parent / 'images'
W, H, FPS = 1280, 720, 12
BG, GOLD, TEXT, MUTED = '#181918', '#d4a33f', '#f4f3ee', '#bfc2bc'
FONT = Path('C:/Windows/Fonts/segoeui.ttf')
BOLD = Path('C:/Windows/Fonts/segoeuib.ttf')
def font(size, bold=False):
    return ImageFont.truetype(str(BOLD if bold else FONT), size)

SCENES = [
    (7, 'Your network. One clear view.', 'Nodarion for Home Assistant', None,
     ['Discover devices. Follow changes. Inspect DNS activity.', 'Available directly in HACS.']),
    (12, '01  Spot new devices', 'Device discovery across your configured IPv4 networks', 'teilnehmeruebersicht.png',
     ['Combine reachability, device status and FRITZ!Box Mesh details.']),
    (12, '02  Monitor important devices', 'Offline alerts and a persistent event log', 'teilnehmeruebersicht.png',
     ['Review online/offline transitions and Mesh handovers.']),
    (12, '03  Understand DNS activity', 'Connect AdGuard Home for queries and filter reasons', 'dns-live.png',
     ['Inspect allowed and blocked queries in the same panel.']),
    (11, 'Get started in HACS', 'Search Nodarion. Download. Restart. Add the integration.', None,
     ['Basic scanning works without FRITZ!Box or AdGuard.', 'AI reports are optional; monitoring works without AI.', 'github.com/engelsofta/nodarion']),
]

def render(index, local, duration):
    _, title, subtitle, shot, lines = SCENES[index]
    frame = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(frame)
    d.text((42, 22), 'ENGELSOFT  /  NODARION', font=font(18, True), fill=GOLD)
    d.text((42, 64), title, font=font(42, True), fill=TEXT)
    d.text((42, 122), subtitle, font=font(23), fill=MUTED)
    if shot:
        source = Image.open(IMAGES / shot).convert('RGB')
        # Fit the complete source image; the original examples remain unmodified.
        tile = ImageOps.contain(source, (1196, 438))
        frame.paste(tile, ((W-tile.width)//2, 174+(438-tile.height)//2))
        d.text((42, 625), lines[0], font=font(22), fill=TEXT)
    else:
        for j, line in enumerate(lines):
            d.text((42, 245+j*72), line, font=font(30 if j < 2 else 26), fill=TEXT if j < 2 else GOLD)
        d.rounded_rectangle((42, 510, 570, 586), radius=18, fill=GOLD)
        d.text((66, 528), 'LOCAL NETWORK MONITORING', font=font(26, True), fill=BG)
    d.text((42, 678), 'Anonymized screenshot tour | Earlier UI version | No live recording', font=font(16), fill=MUTED)
    d.text((1150, 678), f'{index+1:02d} / 05', font=font(16), fill=GOLD)
    progress=(sum(s[0] for s in SCENES[:index])+local)/sum(s[0] for s in SCENES)
    d.rectangle((0, H-5, int(W*progress), H), fill=GOLD)
    return frame

def main():
    output=HERE/'nodarion-demo.en.mp4'
    writer=imageio_ffmpeg.write_frames(str(output), (W,H), fps=FPS, codec='libx264',
        pix_fmt_in='rgb24', pix_fmt_out='yuv420p', quality=8,
        output_params=['-movflags', '+faststart'], macro_block_size=16)
    writer.send(None)
    try:
        for index, scene in enumerate(SCENES):
            duration=scene[0]
            for n in range(duration*FPS):
                frame=render(index,n/FPS,duration)
                writer.send(frame.tobytes())
            render(index,duration/2,duration).save(HERE/f'preview-{index+1}.jpg',quality=90)
    finally:
        writer.close()
    (HERE/'nodarion-demo.en.srt').write_text('''1
00:00:00,000 --> 00:00:07,000
Nodarion brings local network monitoring into Home Assistant. Available directly in HACS.

2
00:00:07,000 --> 00:00:19,000
Discover devices across configured IPv4 networks. Add FRITZ!Box for router and Mesh details.

3
00:00:19,000 --> 00:00:31,000
Monitor important devices, receive offline alerts, and review state changes and Mesh handovers.

4
00:00:31,000 --> 00:00:43,000
Connect AdGuard Home to inspect DNS queries, blocked domains and filter reasons.

5
00:00:43,000 --> 00:00:54,000
Search Nodarion in HACS, download, restart Home Assistant, and add the integration. AI is optional.
''',encoding='utf-8')
    print(f'{output}: 54 seconds, {W}x{H}, {FPS} fps, {output.stat().st_size} bytes')

if __name__=='__main__':
    main()
