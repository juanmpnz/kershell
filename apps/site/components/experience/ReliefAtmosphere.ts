import type * as Three from "three";
import { compositeFragment, fogFragment, screenVertex } from "./reliefShaders";

type Engine=typeof import("three");
/** Linear HDR scene, reduced-resolution volume, then one color-managed composite. */
export function createReliefAtmosphere(T:Engine,renderer:Three.WebGLRenderer,compact:boolean) {
  const colorType=renderer.extensions.has("EXT_color_buffer_float")?T.HalfFloatType:T.UnsignedByteType;
  const target=new T.WebGLRenderTarget(1,1,{type:colorType,depthBuffer:true});
  const depth=new T.DepthTexture(1,1,T.UnsignedIntType);target.depthTexture=depth;
  const fogTarget=new T.WebGLRenderTarget(1,1,{type:colorType,depthBuffer:false});
  const uniforms={uDepth:{value:depth},uInvProjection:{value:new T.Matrix4()},uCameraWorld:{value:new T.Matrix4()},uCameraPosition:{value:new T.Vector3()},uSunDirection:{value:new T.Vector3(90,16,-180).normalize()},uTime:{value:0}};
  const fogMaterial=new T.ShaderMaterial({uniforms,defines:{FOG_STEPS:compact?20:40},vertexShader:screenVertex,fragmentShader:fogFragment,depthTest:false,depthWrite:false,toneMapped:false});
  const compositeMaterial=new T.ShaderMaterial({uniforms:{uScene:{value:target.texture},uFog:{value:fogTarget.texture},uDepth:{value:depth},uFogTexel:{value:new T.Vector2()},uNearFar:{value:new T.Vector2(.1,220)}},vertexShader:screenVertex,fragmentShader:compositeFragment,depthTest:false,depthWrite:false});
  const geometry=new T.PlaneGeometry(2,2);const fogScene=new T.Scene(),compositeScene=new T.Scene();
  fogScene.add(new T.Mesh(geometry,fogMaterial));compositeScene.add(new T.Mesh(geometry,compositeMaterial));
  const screenCamera=new T.OrthographicCamera(-1,1,1,-1,0,1);
  return {
    resize(width:number,height:number,isCompact:boolean) {
      target.setSize(width,height);uniforms.uSunDirection.value.set(isCompact?18:90,16,-180).normalize();
      const ratio=isCompact?.4:.55;const fogWidth=Math.max(1,Math.min(960,Math.round(width*ratio)));const fogHeight=Math.max(1,Math.round(height*fogWidth/width));
      fogTarget.setSize(fogWidth,fogHeight);compositeMaterial.uniforms.uFogTexel.value.set(1/fogWidth,1/fogHeight);
      const steps=isCompact?20:40;if(fogMaterial.defines.FOG_STEPS!==steps){fogMaterial.defines.FOG_STEPS=steps;fogMaterial.needsUpdate=true;}
    },
    render(scene:Three.Scene,camera:Three.PerspectiveCamera,time:number) {
      camera.updateMatrixWorld();uniforms.uTime.value=time;
      uniforms.uInvProjection.value.copy(camera.projectionMatrixInverse);uniforms.uCameraWorld.value.copy(camera.matrixWorld);uniforms.uCameraPosition.value.copy(camera.position);
      compositeMaterial.uniforms.uNearFar.value.set(camera.near,camera.far);
      const original=renderer.getRenderTarget();
      try {
        renderer.setRenderTarget(target);renderer.render(scene,camera);
        renderer.setRenderTarget(fogTarget);renderer.render(fogScene,screenCamera);
        renderer.setRenderTarget(original);renderer.render(compositeScene,screenCamera);
      } finally {renderer.setRenderTarget(original);}
    },
    dispose(){target.dispose();depth.dispose();fogTarget.dispose();geometry.dispose();fogMaterial.dispose();compositeMaterial.dispose();},
  };
}
