import { describe, expect, it } from "vitest";
import { stoneGeometry } from "@/lib/experience/reliefGeometry";

describe("relief stone geometry",()=>{
  it("keeps all faces closed after displacement, including thin ledges",()=>{
    for(const dimensions of [[8,15,78],[27,.65,8],[14,1.5,12]] as const){
      const geometry=stoneGeometry(dimensions[0],dimensions[1],dimensions[2]);
      const positions=geometry.getAttribute("position");const index=geometry.getIndex()!;
      const edges=new Map<string,number>();
      const point=(i:number)=>[positions.getX(i),positions.getY(i),positions.getZ(i)].map(x=>x.toFixed(5)).join(",");
      for(let i=0;i<index.count;i+=3)for(let side=0;side<3;side++){
        const a=point(index.getX(i+side)),b=point(index.getX(i+(side+1)%3));const key=[a,b].sort().join("|");edges.set(key,(edges.get(key)??0)+1);
      }
      expect([...edges.values()].every(count=>count===2)).toBe(true);geometry.dispose();
    }
  });
  it("produces finite positions, normals and world-scale UVs",()=>{
    const geometry=stoneGeometry(8,15,78);
    for(const name of ["position","normal","uv"])expect(Array.from(geometry.getAttribute(name).array).every(Number.isFinite)).toBe(true);
    expect(geometry.boundingBox!.min.y).toBeLessThan(0);expect(geometry.boundingBox!.max.y).toBeGreaterThan(0);
    geometry.dispose();
  });
});
