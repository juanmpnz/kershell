import type * as Three from "three";

type Engine=typeof import("three");

/** A swept, bevelled open ribbon, with a varying cross-section and deliberate twist. */
export function buildSpatial(T:Engine,compact:boolean) {
  const group=new T.Group();
  const sculpture=new T.Group(); group.add(sculpture);
  const curve=new T.CatmullRomCurve3([
    new T.Vector3(-2.8,-2.1,.1),new T.Vector3(-3,-.6,.7),
    new T.Vector3(-1.6,.15,1.2),new T.Vector3(.6,.1,.9),
    new T.Vector3(2.1,1.2,-.4),new T.Vector3(1.2,2.7,-.6),
    new T.Vector3(-.8,2.3,.3),new T.Vector3(-1.3,1.1,-.5),
    new T.Vector3(.6,-1.2,-1.1),new T.Vector3(2.5,-2.2,.3),
  ],false,"centripetal");
  const segments=compact?100:180;
  const frames=curve.computeFrenetFrames(segments,false);
  const vertices:number[]=[]; const indices:number[]=[];
  const edge:Three.Vector3[]=[];
  const normal=new T.Vector3();const binormal=new T.Vector3();
  for(let step=0;step<=segments;step++) {
    const u=step/segments;const point=curve.getPointAt(u);
    const twist=u*Math.PI*.8-.35;
    normal.copy(frames.normals[step]).multiplyScalar(Math.cos(twist)).addScaledVector(frames.binormals[step],Math.sin(twist));
    binormal.copy(frames.binormals[step]).multiplyScalar(Math.cos(twist)).addScaledVector(frames.normals[step],-Math.sin(twist));
    const width=.78+Math.sin(u*Math.PI)*.55;const half=width/2;
    const profile=[[half-.025,.07],[half,.04],[half,-.04],[half-.025,-.07],[-half+.025,-.07],[-half,-.04],[-half,.04],[-half+.025,.07]];
    for(const [x,y] of profile) {
      const vertex=point.clone().addScaledVector(normal,x).addScaledVector(binormal,y);
      vertices.push(vertex.x,vertex.y,vertex.z);
    }
    if(u>.16&&u<.78) edge.push(point.clone().addScaledVector(normal,half+.006).addScaledVector(binormal,.03));
    if(step<segments) for(let side=0;side<8;side++) {
      const a=step*8+side;const b=step*8+(side+1)%8;const c=a+8;const d=b+8;
      indices.push(a,c,b,b,c,d);
    }
  }
  // End caps are closed, so the strip has physical thickness from every angle.
  for(let side=1;side<7;side++) {
    indices.push(0,side,side+1);
    const end=segments*8;indices.push(end,end+side+1,end+side);
  }
  const geometry=new T.BufferGeometry();geometry.setAttribute("position",new T.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  const metal=new T.MeshPhysicalMaterial({color:0x66736b,metalness:1,roughness:.23,clearcoat:1,clearcoatRoughness:.18,envMapIntensity:1.6});
  const shell=new T.Mesh(geometry,metal);shell.castShadow=!compact;sculpture.add(shell);
  const inner=new T.Mesh(geometry,new T.MeshPhysicalMaterial({color:0x111a15,metalness:.85,roughness:.32,clearcoat:.8,envMapIntensity:1.8}));
  inner.scale.set(.88,.88,.88);inner.rotation.z=.22;inner.rotation.y=.45;inner.position.set(.18,-.1,-.65);inner.castShadow=!compact;sculpture.add(inner);
  const seam=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(edge),compact?80:140,.018,6,false),new T.MeshStandardMaterial({color:0xb4f23f,emissive:0xb4f23f,emissiveIntensity:2.1,roughness:.4}));sculpture.add(seam);
  const ribMaterial=new T.MeshStandardMaterial({color:0x26352c,metalness:.9,roughness:.35});
  for(let i=0;i<12;i++) {
    const u=.035+i*.015;const step=Math.round(u*segments);const point=curve.getPointAt(u);
    const twist=u*Math.PI*.8-.35;
    const across=frames.normals[step].clone().multiplyScalar(Math.cos(twist)).addScaledVector(frames.binormals[step],Math.sin(twist));
    const top=frames.binormals[step].clone().multiplyScalar(Math.cos(twist)).addScaledVector(frames.normals[step],-Math.sin(twist));
    const rib=new T.Mesh(new T.BoxGeometry(.7,.008,.012),ribMaterial);
    const basis=new T.Matrix4().makeBasis(across,top,frames.tangents[step]);rib.quaternion.setFromRotationMatrix(basis);
    rib.position.copy(point).addScaledVector(top,.075);sculpture.add(rib);
  }
  sculpture.position.set(4.4,3.5,-3);sculpture.rotation.set(-.12,-.3,-.12);
  const floor=new T.Mesh(new T.PlaneGeometry(160,160),new T.MeshStandardMaterial({color:0x080e0a,metalness:.7,roughness:.3}));
  floor.rotation.x=-Math.PI/2;floor.position.y=-1.8;floor.receiveShadow=true;group.add(floor);
  const key=new T.SpotLight(0xeaf0e7,180,45,.55,.85,1);key.position.set(1,13,8);key.target.position.set(4,3,-3);group.add(key,key.target);
  const rim=new T.SpotLight(0xd7e6df,130,35,.65,.9,1);rim.position.set(11,7,-8);rim.target.position.set(4,3,-3);group.add(rim,rim.target);
  const light=new T.PointLight(0xb4f23f,8,12,2);light.position.set(3,4,-1);group.add(light);
  let compactView=compact;
  return {
    group,
    resize(isCompact:boolean) {compactView=isCompact;key.target.position.x=rim.target.position.x=isCompact?0:4;light.position.x=isCompact?-1:3;},
    update(time:number) {
      sculpture.position.x=compactView?0:4.4;
      sculpture.position.y=(compactView?3.9:3.5)+Math.sin(time*.27)*.11;
      sculpture.rotation.y=-.3+Math.sin(time*.12)*.18;
      sculpture.rotation.z=-.12+Math.sin(time*.15)*.035;
    },
  };
}
