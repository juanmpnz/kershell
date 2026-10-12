"use client";

import { useEffect, useRef } from "react";

/** Small enhancement: content and the cinematic poster never depend on WebGL. */
export default function CinematicScene({ paused }: { paused: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = ref.current;
    const section = host?.closest<HTMLElement>(".cinema-hero");
    if (!host || !section) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    // Reduced motion and narrow screens retain the art direction with the poster.
    const compact = matchMedia("(max-width: 767px)");
    let cancelled = false;
    let cleanup = () => {};
    let initializing = false;
    let running = false;

    const initialize = async () => {
      if (cancelled || initializing || running || motion.matches || compact.matches) return;
      initializing = true;
      try {
        const [THREE, { RoomEnvironment }] = await Promise.all([
          import("three"), import("three/addons/environments/RoomEnvironment.js"),
        ]);
        if (cancelled || motion.matches || compact.matches) { initializing = false; return; }
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.3;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 40);
        camera.position.set(0, 0, 12);
        const pmrem = new THREE.PMREMGenerator(renderer);
        const room = new RoomEnvironment();
        const environment = pmrem.fromScene(room, 0.04);
        scene.environment = environment.texture;
        room.dispose();
        pmrem.dispose();
        const group = new THREE.Group();
        group.position.set(2.7, -0.8, 0);
        scene.add(group);
        const styles = getComputedStyle(host);
        const accent = new THREE.Color(styles.getPropertyValue("--accent").trim());
        const metal = new THREE.MeshStandardMaterial({ color: 0x25282b, metalness: 0.95, roughness: 0.3 });
        const highlight = new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: 0.12, metalness: 0.75, roughness: 0.28 });
        const geometries: InstanceType<typeof THREE.ExtrudeGeometry>[] = [];
        const ribbons: InstanceType<typeof THREE.Mesh>[] = [];
        for (let i = 0; i < 16; i++) {
          const offset = (i - 7.5) * 0.17;
          const path = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-4.5, -2.9 + offset, -0.3),
            new THREE.Vector3(-2.6, -1 + offset, Math.sin(i * 0.2) * 0.6),
            new THREE.Vector3(-0.2, -0.2 + offset, 0.5),
            new THREE.Vector3(1.8, 0.8 + offset, -0.1),
            new THREE.Vector3(2.8, 3.3 + offset, -1),
          ]);
          const shape = new THREE.Shape();
          shape.moveTo(-0.25, -0.018); shape.lineTo(0.25, -0.018);
          shape.lineTo(0.25, 0.018); shape.lineTo(-0.25, 0.018); shape.closePath();
          const geometry = new THREE.ExtrudeGeometry(shape, { steps: 64, bevelEnabled: false, extrudePath: path });
          geometries.push(geometry);
          const ribbon = new THREE.Mesh(geometry, i === 4 || i === 11 ? highlight : metal);
          ribbon.position.z = offset * 0.4;
          ribbons.push(ribbon); group.add(ribbon);
        }
        const key = new THREE.DirectionalLight(0xffffff, 3);
        key.position.set(-3, 5, 6); scene.add(key);
        const rim = new THREE.PointLight(accent, 12, 18);
        rim.position.set(4, -1, 3); scene.add(rim);
        host.appendChild(renderer.domElement);
        running = true; initializing = false;
        let frame = 0;
        let last = 0;
        let time = 0;
        let progress = 0;
        let desiredProgress = 0;
        let visible = true;
        let contextLost = false;
        const pointer = { x: 0, y: 0 };
        const onScroll = () => {
          const rect = section!.getBoundingClientRect();
          desiredProgress = THREE.MathUtils.clamp(-rect.top / Math.max(rect.height - innerHeight, 1), 0, 1);
        };
        const draw = (now: number) => {
          frame = requestAnimationFrame(draw);
          if (now - last < 1000 / 30) return;
          time += Math.min((now - last) / 1000, 0.1); last = now;
          progress += (desiredProgress - progress) * 0.045;
          group.rotation.y = Math.sin(time * 0.12) * 0.09 + pointer.x * 0.04 + progress * 0.55;
          group.rotation.z = -0.1 + progress * 0.24;
          group.rotation.x += (pointer.y * 0.025 - group.rotation.x) * 0.03;
          group.position.y = -0.8 + progress * 0.65;
          ribbons.forEach((ribbon, i) => {
            ribbon.position.z = (i - 7.5) * (0.068 + progress * 0.045);
          });
          section!.style.setProperty("--hero-progress", String(progress));
          renderer.render(scene, camera);
          host.dataset.ready = "true";
        };
        const synchronize = () => {
          cancelAnimationFrame(frame);
          if (motion.matches || compact.matches) {
            host.dataset.ready = "false";
            section!.style.removeProperty("--hero-progress");
            return;
          }
          if (document.hidden || !visible || contextLost || host.dataset.paused === "true") return;
          last = performance.now(); frame = requestAnimationFrame(draw);
        };
        const resize = () => {
          const { width, height } = host.getBoundingClientRect();
          if (!width || !height) return;
          renderer.setSize(width, height, false); camera.aspect = width / height;
          camera.updateProjectionMatrix(); onScroll(); synchronize();
        };
        const onPointer = (event: PointerEvent) => {
          if (event.pointerType !== "mouse") return;
          pointer.x = event.clientX / innerWidth * 2 - 1;
          pointer.y = event.clientY / innerHeight * 2 - 1;
        };
        const loseContext = (event: Event) => { event.preventDefault(); contextLost = true; host.dataset.ready = "false"; synchronize(); };
        const restoreContext = () => { contextLost = false; resize(); };
        const observer = new IntersectionObserver(([entry]) => { visible = entry?.isIntersecting ?? false; synchronize(); });
        observer.observe(section!);
        const controls = new MutationObserver(synchronize);
        controls.observe(host, { attributes: true, attributeFilter: ["data-paused"] });
        const sizes = new ResizeObserver(resize); sizes.observe(host);
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("pointermove", onPointer, { passive: true });
        document.addEventListener("visibilitychange", synchronize);
        motion.addEventListener("change", synchronize); compact.addEventListener("change", synchronize);
        renderer.domElement.addEventListener("webglcontextlost", loseContext);
        renderer.domElement.addEventListener("webglcontextrestored", restoreContext);
        cleanup = () => {
          cancelAnimationFrame(frame); observer.disconnect(); sizes.disconnect(); controls.disconnect();
          window.removeEventListener("scroll", onScroll); window.removeEventListener("pointermove", onPointer);
          document.removeEventListener("visibilitychange", synchronize);
          motion.removeEventListener("change", synchronize); compact.removeEventListener("change", synchronize);
          renderer.domElement.removeEventListener("webglcontextlost", loseContext);
          renderer.domElement.removeEventListener("webglcontextrestored", restoreContext);
          geometries.forEach((geometry) => geometry.dispose()); metal.dispose(); highlight.dispose();
          environment.dispose(); renderer.dispose(); renderer.domElement.remove();
          section!.style.removeProperty("--hero-progress");
        };
        resize();
      } catch {
        initializing = false;
        // The optimized poster remains visible when the enhancement is unavailable.
      }
    };
    const enable = () => { void initialize(); };
    motion.addEventListener("change", enable); compact.addEventListener("change", enable);
    void initialize();
    return () => {
      cancelled = true; cleanup(); motion.removeEventListener("change", enable); compact.removeEventListener("change", enable);
    };
  }, []);
  return <div ref={ref} className="cinema-scene" data-paused={String(paused)} aria-hidden="true" />;
}
