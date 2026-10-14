"use client";

import { useEffect, useRef } from "react";
import type { ExperienceLocation, ProjectId, View } from "@/lib/experience/navigation";
import { RELIEF_HOME_CAMERA, RELIEF_HOME_TARGET } from "@/lib/experience/reliefGeometry";

export type RenderStatus = "loading" | "ready" | "fallback";

export default function GalleryScene({ location, paused, onStatus }: { location: ExperienceLocation; paused: boolean; onStatus: (status: RenderStatus) => void }) {
  const hostRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    let dispose = () => {};
    const initialize = async () => {
      const [T,{ OrbitControls },{ buildGallery }] = await Promise.all([
        import("three"), import("three/addons/controls/OrbitControls.js"), import("./buildGallery"),
      ]);
      if (cancelled) return;
      const compact = matchMedia("(max-width: 767px)");
      const motion = matchMedia("(prefers-reduced-motion: reduce)");
      let renderer: InstanceType<typeof T.WebGLRenderer>;
      try { renderer = new T.WebGLRenderer({ antialias:true, powerPreference:compact.matches?"low-power":"high-performance" }); } catch { onStatus("fallback"); return; }
      renderer.setPixelRatio(Math.min(devicePixelRatio,compact.matches?1:1.5));
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.4;
      renderer.shadowMap.enabled = !compact.matches;
      renderer.shadowMap.type = T.PCFSoftShadowMap;
      renderer.debug.onShaderError=()=>{throw new Error("Relief shader compilation failed");};
      let gallery: Awaited<ReturnType<typeof buildGallery>>;
      try { gallery = await buildGallery(T,renderer,compact.matches); } catch { renderer.dispose(); onStatus("fallback"); return; }
      if (cancelled) { gallery.dispose(); renderer.dispose(); return; }
      const camera = new T.PerspectiveCamera(45,1,.1,220);
      camera.position.set(...RELIEF_HOME_CAMERA);
      const controls = new OrbitControls(camera,renderer.domElement);
      controls.enableZoom = false; controls.enablePan = false;
      controls.enableDamping = true; controls.dampingFactor = .065;
      controls.minPolarAngle = .4; controls.maxPolarAngle = 1.6;
      controls.minAzimuthAngle = -1.4; controls.maxAzimuthAngle = 1.4;
      controls.target.set(...RELIEF_HOME_TARGET);
      controls.enabled = false;
      host.appendChild(renderer.domElement);
      const desiredCamera = camera.position.clone();
      const desiredTarget = controls.target.clone();
      const pointer = { x:0,y:0 };
      let activeView: View = "home";
      let transitioning = true;
      let currentKey = "";
      let frame = 0;
      let previous = 0;
      let time = 0;
      let lost = false;
      const frozen = () => motion.matches || host.dataset.paused === "true";
      const updateDestination = () => {
        const key = `${host.dataset.view}:${host.dataset.project}:${compact.matches}`;
        if (key === currentKey) return;
        currentKey = key; activeView = (host.dataset.view ?? "home") as View;
        gallery.setView(activeView==="project");
        transitioning = true; controls.enabled = false;
        const project = (host.dataset.project ?? "ediflow") as ProjectId;
        if (activeView === "project") {
          const exhibit = gallery.exhibits[project];
          const scale = compact.matches?1.65:1;
          desiredCamera.set(exhibit.position.x+3.8*scale,exhibit.position.y+(project==="futscan"?4:2.5)*scale,exhibit.position.z+7.6*scale);
          desiredTarget.set(exhibit.position.x-(compact.matches?0:1.3),exhibit.position.y+1.1,exhibit.position.z);
        } else if (activeView === "home") {
          desiredCamera.set(compact.matches?7:10,5,compact.matches?30:22); desiredTarget.set(...RELIEF_HOME_TARGET);
        } else {
          desiredCamera.set(activeView==="studio"?8:11,5.4,compact.matches?30:20);
          desiredTarget.set(...RELIEF_HOME_TARGET);
        }
      };
      const tick = (now: number) => {
        const immobile = frozen();
        if (now-previous < 1000/30 && !immobile) { frame = requestAnimationFrame(tick); return; }
        const delta = Math.min((now-previous)/1000,.06); previous = now;
        if (!immobile) time += delta;
        if (transitioning) {
          const alpha = immobile?1:1-Math.exp(-delta*4);
          camera.position.lerp(desiredCamera,alpha); controls.target.lerp(desiredTarget,alpha);
          if (camera.position.distanceTo(desiredCamera)<.015 && controls.target.distanceTo(desiredTarget)<.015) transitioning=false;
        } else if (activeView === "home" && !immobile) {
          camera.position.x += ((compact.matches?7:10)+pointer.x*.1-camera.position.x)*.025;
          camera.position.y += (5+pointer.y*.04-camera.position.y)*.025;
        }
        controls.enabled = activeView==="project" && !transitioning && !immobile;
        controls.update();
        gallery.update(time);
        try { gallery.render(camera,time); } catch {
          lost=true;host.dataset.ready="false";onStatus("fallback");return;
        }
        if (host.dataset.ready !== "true") onStatus("ready");
        host.dataset.ready="true";
        if (!immobile) frame=requestAnimationFrame(tick);
      };
      const synchronize = () => {
        cancelAnimationFrame(frame); updateDestination();
        if (lost || document.hidden) return;
        previous=performance.now(); frame=requestAnimationFrame(tick);
      };
      const resize = () => {
        const { width,height } = host.getBoundingClientRect();
        if (!width || !height) return;
        renderer.setPixelRatio(Math.min(devicePixelRatio,compact.matches?1:1.5));
        renderer.setSize(width,height,false); camera.aspect=width/height;
        const pixels=renderer.getDrawingBufferSize(new T.Vector2());gallery.resize(pixels.x,pixels.y,compact.matches);
        camera.fov=compact.matches?52:45; camera.updateProjectionMatrix(); synchronize();
      };
      const onPointer = (event: PointerEvent) => { if(event.pointerType==="mouse") { pointer.x=event.clientX/innerWidth*2-1; pointer.y=event.clientY/innerHeight*2-1; } };
      const onLost = (event: Event) => { event.preventDefault(); lost=true; cancelAnimationFrame(frame); host.dataset.ready="false"; onStatus("fallback"); };
      const onRestored = () => { lost=false; onStatus("loading"); resize(); };
      const mutations = new MutationObserver(synchronize);
      mutations.observe(host,{attributes:true,attributeFilter:["data-view","data-project","data-paused"]});
      const sizes = new ResizeObserver(resize); sizes.observe(host);
      window.addEventListener("pointermove",onPointer,{passive:true});
      document.addEventListener("visibilitychange",synchronize);
      motion.addEventListener("change",synchronize); compact.addEventListener("change",resize);
      renderer.domElement.addEventListener("webglcontextlost",onLost);
      renderer.domElement.addEventListener("webglcontextrestored",onRestored);
      dispose = () => {
        cancelAnimationFrame(frame); sizes.disconnect(); mutations.disconnect(); controls.dispose();
        window.removeEventListener("pointermove",onPointer); document.removeEventListener("visibilitychange",synchronize);
        motion.removeEventListener("change",synchronize); compact.removeEventListener("change",resize);
        renderer.domElement.removeEventListener("webglcontextlost",onLost); renderer.domElement.removeEventListener("webglcontextrestored",onRestored);
        gallery.dispose(); renderer.dispose(); renderer.domElement.remove();
      };
      resize();
    };
    void initialize().catch(() => { if (!cancelled) onStatus("fallback"); });
    return () => { cancelled=true; dispose(); };
  },[onStatus]);
  return <div ref={hostRef} className="experience-scene" data-view={location.view} data-project={location.project} data-paused={String(paused)} aria-hidden="true" />;
}
