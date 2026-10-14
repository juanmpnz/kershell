import * as T from "three";

/** World-scale UVs and shared-vertex displacement keep the stone surfaces closed. */
export function stoneGeometry(width:number,height:number,depth:number,seed=0) {
  const geometry=new T.BoxGeometry(width,height,depth,Math.min(12,Math.ceil(width)),Math.min(10,Math.ceil(height)),Math.min(18,Math.ceil(depth/2)));
  const positions=geometry.getAttribute("position");
  const normals=geometry.getAttribute("normal");
  const uv=geometry.getAttribute("uv");
  for(let i=0;i<positions.count;i++) {
    const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i);
    const nx=Math.abs(normals.getX(i)),ny=Math.abs(normals.getY(i));
    if(ny>.5) uv.setXY(i,x*.18,z*.18);
    else if(nx>.5) uv.setXY(i,z*.18,y*.18);
    else uv.setXY(i,x*.18,y*.18);
    // Same original coordinates always yield the same displacement on adjacent faces.
    positions.setXYZ(i,x+Math.sin(y*2.2+z*.7+seed)*.035,y+(Math.sin(x*1.9+seed)+Math.cos(z*1.4))*Math.min(.07,height*.045),z+Math.sin(x*2.1+y*.8+seed)*.035);
  }
  geometry.computeVertexNormals();geometry.computeBoundingBox();
  return geometry;
}

export const RELIEF_HOME_CAMERA=[10,5,22] as const;
export const RELIEF_HOME_TARGET=[4.5,3,-25] as const;
export const RELIEF_SUN_DIRECTION=[90,16,-180] as const;
