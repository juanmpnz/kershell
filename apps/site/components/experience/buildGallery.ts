import type * as Three from "three";
import type { ProjectId } from "@/lib/experience/navigation";
import { buildRelief } from "./buildRelief";
import { createReliefAtmosphere } from "./ReliefAtmosphere";

type Engine = typeof import("three");
export type Exhibit = { group: Three.Group; position: Three.Vector3 };

/** Geometry, not an image plate: room, reflective floor and four working exhibits. */
export async function buildGallery(T: Engine, renderer: Three.WebGLRenderer, compact: boolean) {
  const [{ RoomEnvironment }, { Reflector }] = await Promise.all([
    import("three/addons/environments/RoomEnvironment.js"),
    import("three/addons/objects/Reflector.js"),
  ]);
  const scene = new T.Scene();
  const room = new T.Group(); scene.add(room);
  const spatial = await buildRelief(T,renderer,compact); scene.add(spatial.group);
  const spatialFog = new T.FogExp2(0x919a9e,.004);
  const atmosphere = createReliefAtmosphere(T,renderer,compact);
  const roomFog = new T.FogExp2(0x090c0b,.018);
  scene.background = new T.Color(0x090c0b);
  scene.fog = spatialFog;
  const environmentGenerator = new T.PMREMGenerator(renderer);
  const roomEnvironment = new RoomEnvironment();
  const environment = environmentGenerator.fromScene(roomEnvironment, .04);
  scene.environment = environment.texture;
  roomEnvironment.dispose(); environmentGenerator.dispose();

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const context = canvas.getContext("2d");
  if (!context) { environment.dispose(); throw new Error("Texture canvas unavailable"); }
  const pixels = context.createImageData(256,256);
  let seed = 731;
  for (let i=0; i<pixels.data.length; i+=4) {
    seed = (Math.imul(seed,1664525)+1013904223) >>> 0;
    const value = 105 + (seed % 35);
    pixels.data[i] = pixels.data[i+1] = pixels.data[i+2] = value;
    pixels.data[i+3] = 255;
  }
  context.putImageData(pixels,0,0);
  const stoneTexture = new T.CanvasTexture(canvas);
  stoneTexture.wrapS = stoneTexture.wrapT = T.RepeatWrapping;
  stoneTexture.repeat.set(4,4);
  const concrete = new T.MeshStandardMaterial({ color:0x565d57, map:stoneTexture, bumpMap:stoneTexture, bumpScale:.045, roughness:.82, metalness:.1 });
  const graphite = new T.MeshStandardMaterial({ color:0x252c29, roughness:.4, metalness:.75 });
  const silver = new T.MeshStandardMaterial({ color:0xa2aca4, roughness:.25, metalness:.85 });
  const white = new T.MeshStandardMaterial({ color:0xadb3a7, roughness:.65, metalness:.15 });
  const glass = new T.MeshStandardMaterial({ color:0x6b8274, transparent:true, opacity:.3, roughness:.14, metalness:.8, depthWrite:false });
  const lime = new T.MeshStandardMaterial({ color:0xb4f23f, emissive:0xb4f23f, emissiveIntensity:1.05, roughness:.35, metalness:.25 });
  const mutedLime = new T.MeshStandardMaterial({ color:0x526e26, emissive:0x536e26, emissiveIntensity:.16, roughness:.65 });
  const unitBox = new T.BoxGeometry(1,1,1);
  const cylinder = new T.CylinderGeometry(1,1,1,12);
  const cone = new T.ConeGeometry(1,1,8);

  function box(parent: Three.Object3D, dimensions: [number,number,number], position: [number,number,number], material: Three.Material = graphite) {
    const mesh = new T.Mesh(unitBox,material);
    mesh.scale.set(...dimensions); mesh.position.set(...position);
    mesh.castShadow = !compact; mesh.receiveShadow = true;
    parent.add(mesh); return mesh;
  }
  function beam(parent: Three.Object3D, from: [number,number,number], to: [number,number,number], width: number, material: Three.Material) {
    const a = new T.Vector3(...from); const b = new T.Vector3(...to);
    const mesh = new T.Mesh(cylinder,material);
    mesh.position.copy(a).add(b).multiplyScalar(.5);
    mesh.scale.set(width,a.distanceTo(b),width);
    mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.sub(a).normalize());
    parent.add(mesh); return mesh;
  }
  // Architecture: actual columns, ceiling, slabs and an open rear doorway.
  box(room,[26,.25,43],[0,-.2,-7],concrete);
  box(room,[26,.6,38],[0,10.5,-7],concrete);
  for (const x of [-12,12]) {
    for (const z of [-21,-11,0,10]) box(room,[1.4,10.2,1.6],[x,5,z],concrete);
    box(room,[.45,6,10],[x,3,-13],concrete);
  }
  for (const x of [-5.8,5.8]) box(room,[8.8,10.4,1],[x,5,-24],concrete);
  box(room,[4.5,3.8,1],[0,8.3,-24],concrete);
  for (const x of [-2.25,2.25]) box(room,[.05,6.3,.09],[x,3.1,-23.45],lime);
  box(room,[1.2,.015,34],[0,.005,-7],lime);
  for (const x of [-9,9]) box(room,[.035,.02,30],[x,.01,-7],mutedLime);

  let mirror: InstanceType<typeof Reflector> | null = null;
  if (!compact) {
    mirror = new Reflector(new T.PlaneGeometry(25,39),{ color:0x474e48, textureWidth:512, textureHeight:512, clipBias:.004 });
    mirror.rotation.x = -Math.PI/2; mirror.position.set(0,-.055,-7); room.add(mirror);
    // Concrete islands leave a reflective centre path and reflective exhibition floor.
  }
  const daylight = new T.DirectionalLight(0xf1f1df,3.5);
  daylight.position.set(-9,15,-16); daylight.castShadow = !compact;
  daylight.shadow.mapSize.set(1024,1024);
  daylight.shadow.camera.left = -18; daylight.shadow.camera.right = 18;
  daylight.shadow.camera.top = 18; daylight.shadow.camera.bottom = -18;
  daylight.shadow.normalBias = .035; room.add(daylight);
  room.add(new T.HemisphereLight(0xdde3dd,0x141a17,1.1));
  for (const [x,z] of [[-6,-7],[6,-8],[-6,1],[6,1]]) {
    const light = new T.SpotLight(0xe2e8db,compact?26:42,18,.65,.6,1.5);
    light.position.set(x,8,z+1); light.target.position.set(x,1,z);
    room.add(light,light.target);
  }
  const entranceLight = new T.PointLight(0xb4f23f,28,22,2);
  entranceLight.position.set(0,2,-18); room.add(entranceLight);
  // Distant, faceted landscape seen through the open rear doorway.
  const landscapeMaterial = new T.MeshStandardMaterial({ color:0x69746e, flatShading:true, roughness:1 });
  for (let i=0;i<10;i++) {
    const mountain = new T.Mesh(cone,landscapeMaterial);
    mountain.scale.set(5+(i%3),9+(i%4)*2,5);
    mountain.position.set(-25+i*6,2,-36-(i%3)*4);
    room.add(mountain);
  }
  const backdrop = new T.Mesh(new T.PlaneGeometry(85,35),new T.MeshBasicMaterial({ color:0x77877d }));
  backdrop.position.set(0,10,-55); room.add(backdrop);

  const positions: Record<ProjectId,[number,number,number]> = {
    ediflow:[-5.7,1.25,-8], operational:[5.7,1.25,-9], futscan:[-5.7,1.25,1], campos:[5.7,1.25,1],
  };
  const exhibits = {} as Record<ProjectId,Exhibit>;
  const animations: Array<(time: number) => void> = [];
  for (const id of Object.keys(positions) as ProjectId[]) {
    const group = new T.Group(); group.position.set(...positions[id]); room.add(group);
    box(room,[5.8,1,4.7],[group.position.x,.5,group.position.z],concrete);
    box(room,[5.65,.035,4.55],[group.position.x,1.025,group.position.z],graphite);
    box(room,[5.6,.025,.028],[group.position.x,1.06,group.position.z+2.25],lime);
    exhibits[id] = { group, position:group.position.clone() };
  }

  // Ediflow: three residential volumes with glass windows and lit shared spaces.
  const residential = exhibits.ediflow.group;
  for (const [index,x] of [-1.5,0,1.5].entries()) {
    const height = [2.7,3.5,2.4][index];
    box(residential,[1.15,height,1.7],[x,height/2,0],concrete);
    box(residential,[1.3,.1,1.9],[x,height+.05,0],graphite);
    for (let floor=0;floor<4;floor++) {
      for (let column=0;column<2;column++) {
        box(residential,[.35,.34,.03],[x-.25+column*.5,.4+floor*.5,.865],(floor+index+column)%4===0?lime:glass);
      }
      box(residential,[1.2,.035,.24],[x,.3+floor*.5,1],silver);
    }
  }
  beam(residential,[-2.2,.06,1.5],[2.2,.06,1.5],.018,lime);

  // Operational 3D: container yard, gantry crane and a moving truck.
  const yard = exhibits.operational.group;
  const containerPositions: Array<[number,number,number]> = [];
  const ribPositions: Array<[number,number,number]> = [];
  for (let row=0;row<3;row++) for (let col=0;col<3;col++) {
    const x=-1.7+col*1.15; const z=-1.15+row*.8;
    containerPositions.push([x,.23,z]);
    if ((row+col)%2===0) containerPositions.push([x,.68,z]);
    for (let rib=0;rib<7;rib++) ribPositions.push([x-.45+rib*.15,.23,z+.32]);
  }
  const containerInstances = new T.InstancedMesh(unitBox,graphite,containerPositions.length);
  const ribInstances = new T.InstancedMesh(unitBox,silver,ribPositions.length);
  const placement = new T.Object3D();
  containerPositions.forEach((position,index) => {
    placement.position.set(...position); placement.scale.set(1.02,.43,.62); placement.updateMatrix();
    containerInstances.setMatrixAt(index,placement.matrix);
  });
  ribPositions.forEach((position,index) => {
    placement.position.set(...position); placement.scale.set(.018,.39,.025); placement.updateMatrix();
    ribInstances.setMatrixAt(index,placement.matrix);
  });
  containerInstances.castShadow = !compact; yard.add(containerInstances,ribInstances);
  for (const x of [-2.1,2.1]) {
    box(yard,[.1,2.55,.12],[x,1.25,-.2],silver);
    box(yard,[.7,.14,.2],[x,.08,-.2],graphite);
  }
  box(yard,[4.3,.22,.18],[0,2.55,-.2],silver);
  const hoist = new T.Group(); yard.add(hoist);
  beam(hoist,[0,2.45,-.2],[0,1.7,-.2],.012,graphite);
  box(hoist,[1.05,.4,.6],[0,1.45,-.2],lime);
  const truck = new T.Group(); truck.position.set(0,0,1.4); yard.add(truck);
  box(truck,[1.35,.35,.48],[0,.32,0],silver);
  box(truck,[.45,.4,.46],[.85,.32,0],graphite);
  box(truck,[.015,.17,.35],[1.08,.4,0],glass);
  for (const x of [-.4,.4,.9]) for (const z of [-.26,.26]) {
    const wheel = new T.Mesh(cylinder,graphite); wheel.scale.set(.1,.07,.1); wheel.rotation.x = Math.PI/2;
    wheel.position.set(x,.12,z); truck.add(wheel);
  }
  animations.push(time => { truck.position.x = Math.sin(time*.25)*.65; hoist.position.x = Math.sin(time*.18)*.8; });

  // Futscan: a true 3D pitch, goals and instanced moving tactical players.
  const football = exhibits.futscan.group;
  box(football,[5.1,.09,3.65],[0,.045,0],graphite);
  const fieldLines: number[] = [];
  const segment = (a:[number,number],b:[number,number]) => fieldLines.push(a[0],.105,a[1],b[0],.105,b[1]);
  segment([-2.4,-1.65],[2.4,-1.65]); segment([2.4,-1.65],[2.4,1.65]);
  segment([2.4,1.65],[-2.4,1.65]); segment([-2.4,1.65],[-2.4,-1.65]); segment([0,-1.65],[0,1.65]);
  for(let i=0;i<40;i++) segment([Math.cos(i/40*Math.PI*2)*.5,Math.sin(i/40*Math.PI*2)*.5],[Math.cos((i+1)/40*Math.PI*2)*.5,Math.sin((i+1)/40*Math.PI*2)*.5]);
  for(const side of [-1,1]) {
    segment([side*2.4,-.85],[side*1.7,-.85]); segment([side*1.7,-.85],[side*1.7,.85]); segment([side*1.7,.85],[side*2.4,.85]);
    beam(football,[side*2.4,.1,-.4],[side*2.4,.4,-.4],.015,silver);
    beam(football,[side*2.4,.1,.4],[side*2.4,.4,.4],.015,silver);
    beam(football,[side*2.4,.4,-.4],[side*2.4,.4,.4],.015,silver);
  }
  const markings = new T.BufferGeometry(); markings.setAttribute("position",new T.Float32BufferAttribute(fieldLines,3));
  football.add(new T.LineSegments(markings,new T.LineBasicMaterial({ color:0xb4f23f })));
  const playerGeometry = new T.CapsuleGeometry(.065,.13,3,8);
  const players = new T.InstancedMesh(playerGeometry,silver,12);
  players.instanceMatrix.setUsage(T.DynamicDrawUsage); football.add(players);
  const playerTransform = new T.Object3D();
  animations.push(time => {
    for(let i=0;i<12;i++) {
      const side=i<6?-1:1; const j=i%6;
      playerTransform.position.set(side*(.55+(j%3)*.65)+Math.sin(time*.3+i)*.11,.26,(Math.floor(j/3)-.5)*1.7+Math.cos(time*.24+i)*.2);
      playerTransform.updateMatrix(); players.setMatrixAt(i,playerTransform.matrix);
    }
    players.instanceMatrix.needsUpdate=true;
  });

  // Campos: cantilevered architecture, glazed facades and terraces.
  const villa = exhibits.campos.group;
  box(villa,[4.7,.16,3.2],[0,.08,0],white);
  box(villa,[2.8,1.15,2.3],[-.7,.7,-.25],concrete);
  box(villa,[4.1,.14,2.7],[0,1.4,-.1],white);
  box(villa,[2.9,.9,2.0],[.5,1.9,-.3],concrete);
  box(villa,[3.7,.16,2.5],[.5,2.43,-.2],white);
  box(villa,[3.1,.8,.025],[.3,1.91,.72],glass);
  box(villa,[2.5,.86,.025],[-.6,.77,.92],glass);
  for(const x of [-1.7,-.8,.1,1,1.9]) box(villa,[.025,.88,.04],[x,.73,.95],silver);
  box(villa,[4.1,.02,.04],[0,1.32,1.22],lime);
  box(villa,[3.1,.02,.04],[.4,2.35,.93],lime);
  box(villa,[2,.035,.55],[1.1,.18,1.1],glass);
  for(const x of [-2,1.7]) {
    const tree = new T.Mesh(cone,mutedLime); tree.scale.set(.27,.85,.27); tree.position.set(x,.6,-1.6); villa.add(tree);
  }
  animations.push(time => { lime.emissiveIntensity = .9 + Math.sin(time*.5)*.12; });

  return {
    scene, exhibits,
    setView(projectView:boolean) { room.visible=projectView; spatial.group.visible=!projectView; scene.fog=projectView?roomFog:spatialFog; },
    resize(width:number,height:number,isCompact:boolean) { spatial.resize(isCompact); atmosphere.resize(width,height,isCompact); },
    render(camera:Three.PerspectiveCamera,time:number) { if(spatial.group.visible) atmosphere.render(scene,camera,time); else renderer.render(scene,camera); },
    update(time:number) { spatial.update(time); if(room.visible) animations.forEach(animate => animate(time)); },
    dispose() {
      const geometries = new Set<Three.BufferGeometry>(); const materials = new Set<Three.Material>();
      scene.traverse(node => { if (node instanceof T.Mesh || node instanceof T.Line) { geometries.add(node.geometry); (Array.isArray(node.material)?node.material:[node.material]).forEach(material=>materials.add(material)); } });
      geometries.forEach(geometry=>geometry.dispose()); materials.forEach(material=>material.dispose());
      spatial.dispose(); atmosphere.dispose(); mirror?.getRenderTarget().dispose(); environment.dispose(); stoneTexture.dispose(); daylight.shadow.map?.dispose();
    },
  };
}
