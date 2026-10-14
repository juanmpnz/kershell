import type * as Three from "three";
import { stoneGeometry, RELIEF_SUN_DIRECTION } from "@/lib/experience/reliefGeometry";
import { skyFragment, skyVertex, waterVertex, waterFragment } from "./reliefShaders";

type Engine=typeof import("three");

export async function buildRelief(T:Engine,renderer:Three.WebGLRenderer,compact:boolean) {
  const { Reflector }=await import("three/addons/objects/Reflector.js");
  const albedo=await new T.TextureLoader().loadAsync("/art/basalt.webp");
  albedo.wrapS=albedo.wrapT=T.RepeatWrapping;albedo.colorSpace=T.SRGBColorSpace;
  albedo.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),compact?2:4);
  const heightMap=albedo.clone();heightMap.colorSpace=T.NoColorSpace;heightMap.needsUpdate=true;
  const group=new T.Group();group.name="Relieve: basalt, low sun and mist";
  const stone=new T.MeshStandardMaterial({color:0x737679,map:albedo,bumpMap:heightMap,bumpScale:.19,roughness:.94,metalness:0});
  const sunDirection=new T.Vector3(...RELIEF_SUN_DIRECTION).normalize();
  function slab(size:[number,number,number],position:[number,number,number],seed:number) {
    const mesh=new T.Mesh(stoneGeometry(...size,seed),stone);mesh.position.set(...position);mesh.castShadow=!compact;mesh.receiveShadow=true;group.add(mesh);return mesh;
  }
  const mainWall=slab([8,15,78],[-4,6.9,-35],1);mainWall.rotation.y=-.22;
  slab([26,1.8,16],[-10,-.25,12],2);
  slab([14,1.5,12],[-8,1,2],3);
  slab([9,.55,10],[-7,2.1,-5],4);
  slab([5,3.1,8],[-10,1.45,-14],5);
  slab([27,.65,8],[.5,3.3,-14],6);
  for(let i=0;i<7;i++) {
    const z=-26-i*17;
    slab([9,Math.max(2,7-i*.6),15],[1+i*.8,2-i*.22,z],8+i);
    slab([8,Math.max(1.5,5-i*.38),14],[17+i*.7,1-i*.15,z+3],18+i);
  }
  slab([14,1.4,14],[16,-.05,12],29);
  const limeMaterial=new T.MeshStandardMaterial({color:0xb4f23f,emissive:0xb4f23f,emissiveIntensity:1.3,roughness:.6});
  const edge=new T.Mesh(new T.BoxGeometry(26.6,.035,.08),limeMaterial);edge.position.set(.5,2.96,-9.98);group.add(edge);
  const underlight=new T.PointLight(0xb4f23f,18,15,1.8);underlight.position.set(3,2.6,-10);group.add(underlight);

  const ridgePositions:number[]=[];const ridgeIndices:number[]=[];
  for(let i=0;i<=40;i++){
    const x=-160+i*8;const height=6+Math.sin(i*.56)*3+Math.cos(i*.17)*4;
    ridgePositions.push(x,-5,-165,x,height,-165);
    if(i<40){const a=i*2;ridgeIndices.push(a,a+2,a+1,a+1,a+2,a+3);}
  }
  const ridgeGeometry=new T.BufferGeometry();ridgeGeometry.setAttribute("position",new T.Float32BufferAttribute(ridgePositions,3));ridgeGeometry.setIndex(ridgeIndices);ridgeGeometry.computeVertexNormals();
  group.add(new T.Mesh(ridgeGeometry,new T.MeshStandardMaterial({color:0x535b60,roughness:1,side:T.DoubleSide})));
  const skyUniforms={uSunDirection:{value:sunDirection},uTime:{value:0}};
  const sky=new T.Mesh(new T.SphereGeometry(180,32,16),new T.ShaderMaterial({uniforms:skyUniforms,vertexShader:skyVertex,fragmentShader:skyFragment,side:T.BackSide,depthWrite:false}));
  sky.renderOrder=-10;group.add(sky);
  const sunlight=new T.DirectionalLight(0xffe0b1,3.3);sunlight.position.set(65,32,-100);sunlight.target.position.set(0,0,-20);sunlight.castShadow=!compact;
  sunlight.shadow.mapSize.set(1024,1024);sunlight.shadow.camera.left=-35;sunlight.shadow.camera.right=35;sunlight.shadow.camera.top=25;sunlight.shadow.camera.bottom=-25;sunlight.shadow.camera.far=220;sunlight.shadow.normalBias=.08;
  group.add(sunlight,sunlight.target,new T.HemisphereLight(0xc2c8d0,0x151a19,.5));

  const waterUniforms={uTime:{value:0},uSunDirection:{value:sunDirection},uUseReflection:{value:compact?0:1}};
  const waterShader={
    uniforms:{tDiffuse:new T.Uniform<Three.Texture|null>(null),color:{value:new T.Color(0x444c48)},textureMatrix:{value:new T.Matrix4()},...waterUniforms},
    vertexShader:waterVertex,fragmentShader:waterFragment,
  };
  let reflection:InstanceType<typeof Reflector>|null=null;
  if(!compact){
    reflection=new Reflector(new T.PlaneGeometry(130,230),{textureWidth:512,textureHeight:512,multisample:0,clipBias:.003,shader:waterShader});
    reflection.rotation.x=-Math.PI/2;reflection.position.set(0,-.15,-60);group.add(reflection);
  }else{
    const water=new T.Mesh(new T.PlaneGeometry(130,230),new T.ShaderMaterial(waterShader));water.rotation.x=-Math.PI/2;water.position.set(0,-.15,-60);group.add(water);
  }
  return {
    group,
    resize(isCompact:boolean){sunDirection.set(isCompact?18:90,16,-180).normalize();},
    update(time:number){skyUniforms.uTime.value=time;waterUniforms.uTime.value=time;
      // Reflector clones its shader uniforms, so update the live material as well.
      if(reflection?.material instanceof T.ShaderMaterial){reflection.material.uniforms.uTime.value=time;reflection.material.uniforms.uSunDirection.value.copy(sunDirection);}
    },
    dispose(){albedo.dispose();heightMap.dispose();reflection?.getRenderTarget().dispose();sunlight.shadow.map?.dispose();},
  };
}
