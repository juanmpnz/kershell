"""Render Kershell's original, seamless ambient film (offline only).

Requires Python, numpy, Pillow and ffmpeg. No browser renderer or network assets.
Run from repository root: python scripts/render-brand-film.py
"""
from pathlib import Path
import subprocess
import numpy as np
from PIL import Image

WIDTH, HEIGHT, FPS, SECONDS = 1440, 900, 24, 20
DEST = Path('apps/site/public/film')
DEST.mkdir(parents=True, exist_ok=True)
y, x = np.mgrid[0:HEIGHT, 0:WIDTH].astype(np.float32)
x /= WIDTH
y /= HEIGHT
TAU = np.pi * 2
# Broad, curved optical folds. All temporal terms complete a whole cycle.
def frame(phase):
    bend = .11*np.sin(TAU*(y*.48+x*.19)+.22*np.sin(phase))
    u = x*.88+y*.55+bend+.025*np.sin(phase)
    bands = np.cos(TAU*(u*3.05+.018*np.sin(TAU*y+phase)))
    body = np.maximum(0, bands)**2.5
    edge = np.exp(-((bands-.91)/.055)**2)
    ripple = .5+.5*np.sin(TAU*(y*.65-x*.4)+phase)
    lighting = np.exp(-((x-.78)**2/.46+(y-.44)**2/.52))
    lime = np.exp(-((u-.83-.025*np.sin(phase))/.1)**2)
    brightness = (.045+.14*body+.085*edge)*lighting
    rgb = np.stack([brightness*.78,brightness*.95,brightness*.85],axis=-1)
    glint = lime*(.07*body+.13*edge)*(.65+.35*ripple)*lighting
    rgb += glint[...,None]*np.array([.68,1,.22],dtype=np.float32)
    # Gentle white grazing highlights on the right, with a quiet reading area.
    white = edge*np.exp(-((x-.85)**2/.1+(y-.32)**2/.18))*.18
    rgb += white[...,None]*np.array([.85,.93,.81],dtype=np.float32)
    rgb += np.array([.015,.02,.019],dtype=np.float32)
    vignette = np.clip(1-.45*((x-.58)**2+(y-.5)**2),.3,1)
    rgb *= vignette[...,None]
    return (np.clip(rgb,0,1)*255).astype(np.uint8)

Image.fromarray(frame(0)).save(DEST/'kershell-ambient-poster.webp',quality=92)
cmd=['ffmpeg','-y','-hide_banner','-loglevel','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{WIDTH}x{HEIGHT}','-r',str(FPS),'-i','-','-an','-c:v','libx264','-preset','medium','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',str(DEST/'kershell-ambient.mp4')]
process=subprocess.Popen(cmd,stdin=subprocess.PIPE)
for i in range(FPS*SECONDS):
    process.stdin.write(frame(TAU*i/(FPS*SECONDS)).tobytes())
    if i%120==0:print(f'Rendered {i}/{FPS*SECONDS}',flush=True)
process.stdin.close()
assert process.wait()==0
subprocess.run(['ffmpeg','-y','-hide_banner','-loglevel','error','-i',str(DEST/'kershell-ambient.mp4'),'-vf','crop=600:900:600:0,scale=600:900','-an','-c:v','libx264','-preset','medium','-crf','22','-pix_fmt','yuv420p','-movflags','+faststart',str(DEST/'kershell-ambient-mobile.mp4')],check=True)
Image.fromarray(frame(0)).crop((600,0,1200,900)).save(DEST/'kershell-ambient-mobile-poster.webp',quality=90)
print('Ambient film ready',flush=True)
