# StreamX Product Requirements Document

> **Version**: 2.0  
> **Date**: February 3, 2026  
> **Focus**: Local-first, continuous playback experience

---

## 1. Summary

**StreamX** is a self-hosted Progressive Web App for streaming your personal media library from your home lab to any device—car, headphones, speakers, anywhere.

| | |
|---|---|
| **Problem** | You own media files but have no simple way to stream them on the go with a seamless, uninterrupted experience |
| **Solution** | A PWA that runs on your home server, lets you upload media, and provides continuous playback across all your devices |
| **Core Value** | Your music and videos, everywhere, with zero subscriptions and full control |

---

## 2. Core Principles

1. **Local-first**: Works offline, syncs when connected. Playback state persists locally.
2. **Continuous playback**: Queue keeps playing. Resume where you left off. No interruptions.
3. **Zero friction upload**: Drag, drop, done. Smart metadata extraction handles the rest.
4. **Any device**: Install as PWA on phone, tablet, laptop. Stream from your home lab.

---

## 3. Features

### 3.1 Progressive Web App (PWA)

| Requirement | Description |
|-------------|-------------|
| **Installable** | Add to home screen on iOS, Android, desktop |
| **Offline playback state** | Queue, position, and preferences cached locally |
| **Background audio** | Music continues when screen is off or app is backgrounded |
| **Media session API** | Lock screen controls, headphone buttons, car stereo integration |
| **Responsive** | Works on phone (320px) to desktop (1920px+) |

**Acceptance Criteria**:
- Passes Lighthouse PWA audit
- Service worker caches app shell and playback state
- `manifest.json` configured with icons, theme color, display: standalone
- Media Session API shows now playing info on lock screen

---

### 3.2 Media Upload

| Requirement | Description |
|-------------|-------------|
| **Drag & drop** | Drop files anywhere to upload |
| **File picker** | Click to browse and select files |
| **Batch upload** | Multiple files at once |
| **Progress indicator** | Show upload progress per file |
| **Supported formats** | MP3, WAV, FLAC, M4A, OGG (audio); MP4, WebM, MKV, MOV (video) |

**Acceptance Criteria**:
- Files upload to SelfDB storage bucket
- Record created in media table with extracted metadata
- Upload resumes if connection drops (chunked upload)
- Clear error messages for unsupported formats

---

### 3.3 Smart Metadata Extraction

| Media Type | Cover Art Logic |
|------------|-----------------|
| **Audio (MP3, etc.)** | Extract embedded album art → if none, use generic music icon |
| **Video** | Generate thumbnail from video frame (first frame or 10% in) |

| Field | Source |
|-------|--------|
| **Title** | ID3 tag → filename (without extension) |
| **Artist** | ID3 tag → "Unknown Artist" |
| **Album** | ID3 tag → null |
| **Duration** | Extracted from file |
| **Cover** | Embedded art / generated thumbnail / fallback icon |

**Acceptance Criteria**:
- MP3 with embedded art displays that art
- MP3 without art shows music icon placeholder
- Video generates thumbnail on upload (server-side or client-side canvas)
- Duration displays as mm:ss

---

### 3.4 Streaming & Playback

| Requirement | Description |
|-------------|-------------|
| **Stream from anywhere** | Access your library via home lab URL (local or tunneled) |
| **Persistent player** | Bottom player bar always visible, survives navigation |
| **Queue management** | Add to queue, play next, reorder, clear |
| **Shuffle & Repeat** | Shuffle on/off, Repeat (off / all / one) |
| **Skip controls** | Previous, Next with long-press to seek |
| **Volume control** | Slider + mute toggle |
| **Seek** | Drag progress bar or tap to jump |

**Acceptance Criteria**:
- Clicking a track plays it immediately
- Queue persists in localStorage and syncs to backend when online
- Shuffle randomizes remaining queue, keeps history
- Repeat-one loops current track; Repeat-all loops queue
- Skip previous: if >3s in, restart track; else go to previous

---

### 3.5 Continuous Playback Experience

This is the **core differentiator**. Users want music that just keeps playing.

| Feature | Behavior |
|---------|----------|
| **Auto-play next** | When track ends, next in queue plays automatically |
| **Gapless playback** | Preload next track to minimize gaps (where browser allows) |
| **Resume playback** | On app open, resume from exact position in current track |
| **Queue persistence** | Queue saved locally; restored on refresh/reopen |
| **Background play** | Audio continues with screen off (mobile PWA) |
| **Lock screen controls** | Play/pause, skip via Media Session API |
| **Headphone/Bluetooth controls** | Respond to hardware play/pause/skip buttons |
| **Car mode** | Large touch targets, simplified UI (future enhancement) |

**Acceptance Criteria**:
- Closing browser tab and reopening resumes playback position
- Queue order matches what user set
- Lock screen shows: cover art, title, artist, play/pause, skip buttons
- Bluetooth headphone buttons work for play/pause/skip

---

### 3.6 Video Playback

| Requirement | Description |
|-------------|-------------|
| **Full-screen player** | Immersive video experience |
| **Resume position** | Continue watching from where you stopped |
| **Progress on thumbnail** | Visual indicator of watch progress |
| **Controls** | Play/pause, seek, volume, fullscreen |

**Acceptance Criteria**:
- Video position saved every 10 seconds
- "Continue Watching" shows videos with saved position
- After 95% watched, mark complete and clear position
- Fullscreen works on mobile and desktop

---

## 4. Data Model

### Media Item
```
id: UUID
title: string
artist: string
type: 'audio' | 'video'
url: string (storage path)
cover: string (storage path or URL)
duration: integer (seconds)
created_at: timestamp
```

### Playback State (localStorage + optional backend sync)
```
current_track_id: UUID
position_seconds: integer
queue: UUID[]
queue_index: integer
shuffle: boolean
repeat: 'off' | 'all' | 'one'
volume: float (0-1)
```

### Watch Progress (for video resume)
```
media_id: UUID
position_seconds: integer
completed: boolean
updated_at: timestamp
```

---

## 5. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | Playback starts < 500ms; PWA loads < 2s on 3G |
| **Offline** | App shell cached; playback state available offline |
| **Privacy** | All data on your server; no external tracking |
| **Accessibility** | Keyboard controls; screen reader labels |

---

## 6. Out of Scope (for MVP)

- Multi-user / authentication
- Transcoding / adaptive bitrate
- Playlists (queue is sufficient for MVP)
- Lyrics / subtitles
- Chromecast / AirPlay
- Offline media download

---

## 7. Milestones

| # | Milestone | Deliverables |
|---|-----------|--------------|
| 1 | **PWA Foundation** | Service worker, manifest, installable, responsive |
| 2 | **Smart Upload** | Drag/drop upload, metadata extraction, thumbnail generation |
| 3 | **Continuous Playback** | Queue, shuffle, repeat, skip, resume, background audio |
| 4 | **Media Session** | Lock screen controls, Bluetooth/headphone support |
| 5 | **Video Resume** | Watch progress, continue watching, fullscreen player |

---

## 8. Success Metrics

| Metric | Target |
|--------|--------|
| Playback start time | < 500ms |
| Resume accuracy | Within 1 second of saved position |
| PWA install rate | 50%+ of users install to home screen |
| Session length | 30+ minutes average |

---

*StreamX: Your media. Your server. Everywhere.*
