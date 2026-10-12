"use client";

import { useEffect, useRef } from "react";

export type GalleryProject = "ediflow" | "operational" | "futscan" | "campos";

/** Hybrid gallery: the reference art plate plus separate, spatial glass exhibits. */
export default function CinematicScene({ paused, activeProject }: { paused: boolean; activeProject: GalleryProject | null }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = ref.current;
    const section = host?.closest<HTMLElement>(".cinema-hero");
    if (!host || !section) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const compact = matchMedia("(max-width: 767px)");
    let cancelled = false;
    let cleanup = () => {};
    let initializing = false;
    let running = false;

    const initialize = async () => {
      if (cancelled || initializing || running || motion.matches || compact.matches) return;
      initializing = true;
      try {
        const THREE = await import("three");
        const texture = await new THREE.TextureLoader().loadAsync("/art/gallery.webp");
        if (cancelled || motion.matches || compact.matches) { texture.dispose(); initializing = false; return; }
        let renderer: InstanceType<typeof THREE.WebGLRenderer>;
        try {
          renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
        } catch { texture.dispose(); initializing = false; return; }
        texture.colorSpace = THREE.SRGBColorSpace;
        renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
        renderer.setClearColor(0x000000, 0);
        renderer.toneMapping = THREE.NoToneMapping;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 60);
        camera.position.z = 10;
        const plateGeometry = new THREE.PlaneGeometry(1, 1);
        const plateMaterial = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
        const plate = new THREE.Mesh(plateGeometry, plateMaterial);
        plate.position.z = -6;
        scene.add(plate);
        const accent = new THREE.Color(getComputedStyle(host).getPropertyValue("--accent").trim());
        const definitions: Array<{ id: GalleryProject; depth: number; corners: Array<[number, number]> }> = [
          { id: "operational", depth: 1.5, corners: [[.745,.078],[.955,.016],[.955,.575],[.745,.597]] },
          { id: "ediflow", depth: -.5, corners: [[.586,.481],[.681,.482],[.681,.657],[.586,.66]] },
          { id: "futscan", depth: 2, corners: [[.068,.333],[.114,.364],[.114,.571],[.068,.542]] },
          { id: "campos", depth: .5, corners: [[.287,.604],[.384,.638],[.384,.711],[.287,.68]] },
        ];
        const panels = definitions.map(definition => {
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(12), 3));
          geometry.setAttribute("uv", new THREE.Float32BufferAttribute(definition.corners.flatMap(([u,v]) => [u,1-v]), 2));
          geometry.setIndex([0,2,1,0,3,2]);
          const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, toneMapped: false });
          const mesh = new THREE.Mesh(geometry, material);
          const outlineGeometry = new THREE.BufferGeometry();
          outlineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(15), 3));
          const outlineMaterial = new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: .07, depthTest: false });
          const outline = new THREE.Line(outlineGeometry, outlineMaterial);
          mesh.add(outline); scene.add(mesh);
          return { ...definition, geometry, material, mesh, outlineGeometry, outlineMaterial };
        });
        host.appendChild(renderer.domElement);
        running = true; initializing = false;
        let frame = 0;
        let last = 0;
        let progress = 0;
        let desiredProgress = 0;
        let visible = true;
        let contextLost = false;
        const pointer = { x: 0, y: 0 };
        const onScroll = () => {
          const rect = section.getBoundingClientRect();
          desiredProgress = THREE.MathUtils.clamp(-rect.top / Math.max(rect.height - innerHeight, 1), 0, 1);
        };
        const draw = (now: number) => {
          frame = requestAnimationFrame(draw);
          if (now - last < 1000 / 30) return;
          last = now;
          progress += (desiredProgress - progress) * .045;
          camera.position.x += (pointer.x * .065 - camera.position.x) * .035;
          camera.position.y += (pointer.y * .035 - camera.position.y) * .035;
          camera.position.z += (10 - progress * 1.15 - camera.position.z) * .035;
          camera.lookAt(0,0,-6);
          panels.forEach(panel => {
            const selected = host.dataset.project === panel.id;
            panel.outlineMaterial.opacity += ((selected ? .6 : .045) - panel.outlineMaterial.opacity) * .05;
            panel.mesh.position.z += ((selected ? .07 : 0) - panel.mesh.position.z) * .04;
          });
          section.style.setProperty("--hero-progress", String(progress));
          renderer.render(scene, camera);
          host.dataset.ready = "true";
        };
        const synchronize = () => {
          cancelAnimationFrame(frame);
          if (motion.matches || compact.matches) {
            host.dataset.ready = "false";
            section.style.removeProperty("--hero-progress");
            return;
          }
          if (document.hidden || !visible || contextLost || host.dataset.paused === "true") return;
          last = performance.now(); frame = requestAnimationFrame(draw);
        };
        const resize = () => {
          const { width, height } = host.getBoundingClientRect();
          if (!width || !height) return;
          renderer.setSize(width,height,false); camera.aspect = width / height; camera.updateProjectionMatrix();
          const imageAspect = 1585 / 992;
          const tangent = Math.tan(THREE.MathUtils.degToRad(45 / 2));
          // Match CSS object-fit: cover before introducing the depth separation.
          const hAtTen = Math.max(2 * tangent * 10, 2 * tangent * 10 * camera.aspect / imageAspect);
          const wAtTen = hAtTen * imageAspect;
          plate.scale.set(wAtTen * 1.6,hAtTen * 1.6,1);
          panels.forEach(panel => {
            const scale = (10 - panel.depth) / 10;
            const vertices = panel.corners.flatMap(([u,v]) => [(u-.5)*wAtTen*scale,(.5-v)*hAtTen*scale,panel.depth]);
            const position = panel.geometry.getAttribute("position");
            vertices.forEach((value,index) => { position.array[index] = value; });
            position.needsUpdate = true;
            panel.geometry.computeBoundingSphere();
            const outlinePosition = panel.outlineGeometry.getAttribute("position");
            [...vertices,...vertices.slice(0,3)].forEach((value,index) => { outlinePosition.array[index] = value; });
            outlinePosition.needsUpdate = true;
            panel.outlineGeometry.computeBoundingSphere();
          });
          onScroll(); synchronize();
        };
        const onPointer = (event: PointerEvent) => {
          if (event.pointerType !== "mouse") return;
          pointer.x = event.clientX / innerWidth * 2 - 1;
          pointer.y = event.clientY / innerHeight * 2 - 1;
        };
        const loseContext = (event: Event) => { event.preventDefault(); contextLost = true; host.dataset.ready = "false"; synchronize(); };
        const restoreContext = () => { contextLost = false; resize(); };
        const observer = new IntersectionObserver(([entry]) => { visible = entry?.isIntersecting ?? false; synchronize(); });
        observer.observe(section);
        const controls = new MutationObserver(synchronize);
        controls.observe(host,{ attributes: true, attributeFilter: ["data-paused","data-project"] });
        const sizes = new ResizeObserver(resize); sizes.observe(host);
        window.addEventListener("scroll",onScroll,{ passive: true });
        window.addEventListener("pointermove",onPointer,{ passive: true });
        document.addEventListener("visibilitychange",synchronize);
        motion.addEventListener("change",synchronize); compact.addEventListener("change",synchronize);
        renderer.domElement.addEventListener("webglcontextlost",loseContext);
        renderer.domElement.addEventListener("webglcontextrestored",restoreContext);
        cleanup = () => {
          cancelAnimationFrame(frame); observer.disconnect(); sizes.disconnect(); controls.disconnect();
          window.removeEventListener("scroll",onScroll); window.removeEventListener("pointermove",onPointer);
          document.removeEventListener("visibilitychange",synchronize);
          motion.removeEventListener("change",synchronize); compact.removeEventListener("change",synchronize);
          renderer.domElement.removeEventListener("webglcontextlost",loseContext);
          renderer.domElement.removeEventListener("webglcontextrestored",restoreContext);
          panels.forEach(panel => { panel.geometry.dispose(); panel.material.dispose(); panel.outlineGeometry.dispose(); panel.outlineMaterial.dispose(); });
          plateGeometry.dispose(); plateMaterial.dispose(); texture.dispose(); renderer.dispose(); renderer.domElement.remove();
          section.style.removeProperty("--hero-progress");
        };
        resize();
      } catch { initializing = false; }
    };
    const enable = () => { void initialize(); };
    motion.addEventListener("change",enable); compact.addEventListener("change",enable);
    void initialize();
    return () => { cancelled = true; cleanup(); motion.removeEventListener("change",enable); compact.removeEventListener("change",enable); };
  },[]);
  return <div ref={ref} className="cinema-scene" data-paused={String(paused)} data-project={activeProject ?? ""} aria-hidden="true" />;
}
