# 3D Flipbook — Three.js & React

A high-performance, interactive photo flipbook built with **Three.js** and **React 19**, featuring custom front and back covers (`front_cover.png` & `back_cover.png`), 21 interior photo pages (`0.jpg` to `20.jpg`) with bottom captions, 3D paper curl physics, plain beige backsides, a mouse-reactive baby blue & pink pastel gradient, and background music player.

![Flipbook](https://img.shields.io/badge/Three.js-0.186-black?logo=threedotjs)
![React](https://img.shields.io/badge/React-19.2-61dafb?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8.3-646cff?logo=vite&logoColor=white)

---

## ✨ Features

- **Front & Back Covers**:
  - **Front Cover**: Uses `src/assets/Photos/front_cover.png` (exact 1080x1350 4:5 ratio) as the opening cover of the flipbook.
  - **Back Cover**: Uses `src/assets/Photos/back_cover.png` (exact 1080x1350 4:5 ratio) as the closing cover of the flipbook.
  - Covers are displayed in their pristine artwork format without text overlays.
- **21 Interior Photo Pages with Audio Captions**:
  - Dynamically loads and renders photos `0.jpg` through `20.jpg` from `src/assets/Photos/`.
  - Linked to exact voice-transcribed captions stored in `src/data/flipbookData.json`.
  - Captions are overlaid on the bottom portion of each photo plane with a soft dark gradient scrim for crystal-clear readability and generous bottom breathing room.
  - Plane meshes are sized at a strict **4:5 aspect ratio** occupying **70% of the screen**.
- **Plain Beige Backsides**:
  - When pages flip over, the back of each turned leaf is finished in a clean, plain warm paper beige (`#f3ebe1`).
- **Sequential Background Music Loop**:
  - Loops continuously through `src/assets/music/`:
    1. *Late-Night Groove*
    2. *Late-Night Groove 2*
  - Floating top controller pill with Play/Pause, skip tracks, volume slider with quick mute, and animated equalizer.
- **Mouse-Reactive Baby Blue & Pink Gradient**:
  - Interactive multi-stop radial gradient that follows the cursor in real-time with smooth 3D camera parallax tilt.
- **Multi-Mode Flipping Interaction**:
  - **Swipe**: Drag left to flip forward, drag right to flip backward.
  - **Screen Clicks**: Click the left half of the screen to go back, right half to go forward.
  - **Bottom Navigation**: Unified bottom pill with `‹ Prev`, contextual page badge (`Front Cover` → `01 / 21` → `Back Cover`), mini progress track, and `Open ›` / `Next ›`.
  - **Keyboard**: Left/Right arrow keys (`←` / `→`).
  - **Sound FX**: Synthetic Web Audio API paper rustle sound on every page turn.

---

## 📖 Flipbook Structure & Captions

| Sequence | Type | Image | Caption |
| :---: | :---: | :---: | :--- |
| **00** | Front Cover | `front_cover.png` | *(Opening book cover)* |
| **01** | Photo 01 | `0.jpg` | *I never knew what I would be getting myself into, or what to expect.* |
| **02** | Photo 02 | `1.jpg` | *But damn, you are gorgeous.* |
| **03** | Photo 03 | `2.jpg` | *The first day we were together didn't really feel real, right? And it all felt like it was very, very familiar.* |
| **04** | Photo 04 | `3.jpg` | *I know it was weird for me to have kissed you on the cheek, literally on our first date, but it just felt so natural to me that I did it.* |
| **05** | Photo 05 | `4.jpg` | *I don't know what I can say about this image, but I think this was the first time I felt like, you know, you made me special.* |
| **06** | Photo 06 | `5.jpg` | *Yeah, this morning, I don't know what I was doing, but yeah, you know, it was the morning and I thought, hey, you know, I don't take pictures often, let me just take a picture.* |
| **07** | Photo 07 | `6.jpg` | *And then there she was in the morning sending me pictures, and who would have thought? She looks gorgeous even in the morning.* |
| **08** | Photo 08 | `7.jpg` | *The only thing I can say about this is that the smile is so warm and so inviting, and the only thing I could think of is like, damn, when is she going to smile at me like that?* |
| **09** | Photo 09 | `8.jpg` | *My woman looks very annoyed, is what I thought to myself.* |
| **10** | Photo 10 | `9.jpg` | *This image alone basically already told me that there's many, many, many, many layers to peel, and it's going to be interesting unraveling all of them.* |
| **11** | Photo 11 | `10.jpg` | *Lady Legasus* |
| **12** | Photo 12 | `11.jpg` | *Yeah, I think you already know what I'm about to say about this one, but damn. Them legs, mmm-mmm-mmm, them legs.* |
| **13** | Photo 13 | `12.jpg` | *Our second time together, but also our first time spending quality time together. I think this was probably the one time where, you know, I definitely knew that this was the coziest I've ever been.* |
| **14** | Photo 14 | `13.jpg` | *Yeah, usually I am not this playful, and somehow somebody's bringing it out of me, and please stop. (laughs) Just please stop.* |
| **15** | Photo 15 | `14.jpg` | *Yeah, I think I knew here and then that I'm not letting this girl go. She's... she's more than special.* |
| **16** | Photo 16 | `15.jpg` | *Okay, here are these two kissing, and like, come on, you guys get a room, get a room.* |
| **17** | Photo 17 | `16.jpg` | *Who... whose hands are who?* |
| **18** | Photo 18 | `17.jpg` | *Smiley face, and need I say more?* |
| **19** | Photo 19 | `18.jpg` | *I bet this is how you look when I compliment you, or if I flatter you.* |
| **20** | Photo 20 | `19.jpg` | *Yeah, when are we getting those cozy... cozy Sunday... like casual Sundays, when are we getting those casual Sundays?* |
| **21** | Photo 21 | `20.jpg` | *Gorgeous with a G.* |
| **22** | Back Cover | `back_cover.png` | *(Closing book cover)* |

---

## 🚀 Getting Started

### 1. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### 2. Build for Production
```bash
npm run build
```
Generates production-ready static bundle in `dist/`.
