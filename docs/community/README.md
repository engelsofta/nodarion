# Nodarion community launch material

- `forum-post.en.md`: English introduction for Home Assistant Community → Custom Integrations.
- `reddit-post.en.md`: English update for r/homeassistant → Show & Tell. An earlier introduction already exists, so this version leads with network segments and native AdGuard entities.
- `nodarion-demo.en.mp4`: 54-second, silent, captioned screenshot tour, 1280 × 720, H.264.
- `nodarion-demo.en.gif`: the same tour as five timed scenes for the forum's image-only upload support.
- `nodarion-demo.en.srt`: optional English subtitles.
- `preview-*.jpg`: scene previews for visual review.

The tour uses the existing anonymized device and DNS screenshots. They show an earlier UI version; the video labels this throughout. It illustrates existing core features and does not simulate clicks or new VLAN controls. There is no private network recording or audio.

## Rebuild

Use Python with Pillow and imageio-ffmpeg installed, then run `python docs/community/build_demo.py` from the repository root. The renderer uses Windows Segoe UI fonts. Duration, dimensions and all 648 frames were checked by decoding the generated MP4.

## Publication

Published on 2026-10-09:

- [Home Assistant Community introduction](https://community.home-assistant.io/t/nodarion-network-monitoring-with-fritz-box-mesh-and-adguard-home-in-one-ha-panel/1028102), including the GIF tour.
- [r/homeassistant update](https://www.reddit.com/r/homeassistant/comments/1x1u8xv/nodarion_update_multiple_network_segments_and/), including the MP4 tour.

The README installation paths now describe the standard HACS catalog. Repository changes still need to be published; installed-tag README changes require a subsequent release to reach existing HACS installations.

When posting, attach the MP4 after the introduction and retain its anonymization/version note. Check for existing project threads before creating another introduction. Do not use these prepared texts as automated answers to community support questions.
