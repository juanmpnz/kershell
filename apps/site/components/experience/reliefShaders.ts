export const noiseShader=/* glsl */`
float hash31(vec3 p) {
  p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);
}
float valueNoise(vec3 p) {
  vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
  return mix(mix(mix(hash31(i),hash31(i+vec3(1,0,0)),f.x),mix(hash31(i+vec3(0,1,0)),hash31(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash31(i+vec3(0,0,1)),hash31(i+vec3(1,0,1)),f.x),mix(hash31(i+vec3(0,1,1)),hash31(i+vec3(1,1,1)),f.x),f.y),f.z);
}
float cloudNoise(vec3 p) {return valueNoise(p)*.62+valueNoise(p*2.07+7.3)*.28+valueNoise(p*4.13+13.1)*.1;}
`;

export const skyVertex=/* glsl */`
varying vec3 vWorld;
void main(){vWorld=(modelMatrix*vec4(position,1.0)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}
`;
export const skyFragment=/* glsl */`
uniform vec3 uSunDirection;uniform float uTime;varying vec3 vWorld;
${noiseShader}
void main(){
  vec3 ray=normalize(vWorld-cameraPosition);
  float elevation=smoothstep(-.08,.65,ray.y);
  vec3 color=mix(vec3(.42,.36,.28),vec3(.065,.085,.105),elevation);
  float sunAlignment=max(dot(ray,uSunDirection),0.0);
  color+=vec3(.62,.36,.14)*pow(sunAlignment,24.0)*.7;
  vec3 cloudPoint=ray*10.0+vec3(uTime*.0015,0.0,0.0);
  float cloud=smoothstep(.39,.68,cloudNoise(cloudPoint));
  color=mix(color,color*.55+vec3(.045),cloud*.68*smoothstep(.02,.3,ray.y));
  float disc=smoothstep(cos(.010),cos(.008),sunAlignment);
  color+=vec3(5.0,3.8,2.0)*disc;
  gl_FragColor=vec4(color,1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
export const screenVertex=/* glsl */`
varying vec2 vUv;
void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}
`;
export const fogFragment=/* glsl */`
uniform sampler2D uDepth;uniform mat4 uInvProjection;uniform mat4 uCameraWorld;
uniform vec3 uCameraPosition;uniform vec3 uSunDirection;uniform float uTime;
varying vec2 vUv;
${noiseShader}
void main(){
  float depth=texture2D(uDepth,vUv).x;
  vec4 viewPoint=uInvProjection*vec4(vUv*2.0-1.0,depth*2.0-1.0,1.0);
  vec3 worldPoint=(uCameraWorld*vec4(viewPoint.xyz/viewPoint.w,1.0)).xyz;
  vec3 ray=normalize(worldPoint-uCameraPosition);
  // The ray stops at opaque scene depth: mist never draws through the stone.
  float distanceToSurface=min(length(worldPoint-uCameraPosition),140.0);
  float stride=distanceToSurface/float(FOG_STEPS);
  float jitter=hash31(vec3(floor(gl_FragCoord.xy),0.0))*.6;
  vec3 light=mix(vec3(.54,.55,.53),vec3(.85,.68,.46),pow(max(dot(ray,uSunDirection),0.0),8.0)*.45);
  vec3 scatter=vec3(0.0);float transmission=1.0;
  for(int i=0;i<FOG_STEPS;i++){
    vec3 p=uCameraPosition+ray*(float(i)+.5+jitter)*stride;
    float altitude=exp(-max(p.y-.05,0.0)*.5);
    if(altitude<.001)continue;
    vec3 wind=p*vec3(.17,.28,.16)-vec3(uTime*.012,0.0,uTime*.004);
    float bank=smoothstep(.32,.72,cloudNoise(wind));
    float density=(.003+.03*bank)*altitude;
    float absorption=1.0-exp(-density*stride);
    float limeFalloff=exp(-length(p-vec3(3.0,2.8,-10.0))*.23)*.2;
    vec3 localLight=light+vec3(.3,.45,.06)*limeFalloff;
    scatter+=transmission*absorption*localLight;transmission*=1.0-absorption;
    if(transmission<.02)break;
  }
  gl_FragColor=vec4(scatter,transmission);
}
`;
export const compositeFragment=/* glsl */`
uniform sampler2D uScene;uniform sampler2D uFog;uniform sampler2D uDepth;
uniform vec2 uFogTexel;uniform vec2 uNearFar;varying vec2 vUv;
float linearDepth(float depth){return (uNearFar.x*uNearFar.y)/((uNearFar.x-uNearFar.y)*depth+uNearFar.y);}
void main(){
  vec3 sceneColor=texture2D(uScene,vUv).rgb;
  float centerDepth=linearDepth(texture2D(uDepth,vUv).x);
  vec4 fog=vec4(0.0);float weightSum=0.0;
  // Depth-aware upsampling prevents pale halos around the foreground ledges.
  for(int x=0;x<2;x++)for(int y=0;y<2;y++){
    vec2 sampleUv=clamp(vUv+(vec2(float(x),float(y))-.5)*uFogTexel,vec2(0.0),vec2(1.0));
    float neighborDepth=linearDepth(texture2D(uDepth,sampleUv).x);
    float weight=exp(-abs(centerDepth-neighborDepth)*.55)+.001;
    fog+=texture2D(uFog,sampleUv)*weight;weightSum+=weight;
  }
  fog/=weightSum;gl_FragColor=vec4(sceneColor*fog.a+fog.rgb,1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export const waterVertex=/* glsl */`uniform mat4 textureMatrix;varying vec4 vUv;varying vec3 vWorld;
      void main(){vUv=textureMatrix*vec4(position,1.0);vWorld=(modelMatrix*vec4(position,1.0)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
export const waterFragment=/* glsl */`uniform sampler2D tDiffuse;uniform float uTime;uniform vec3 uSunDirection;uniform float uUseReflection;varying vec4 vUv;varying vec3 vWorld;
      void main(){
        float rippleA=sin(vWorld.x*.8+vWorld.z*.35+uTime*.15);float rippleB=cos(vWorld.z*1.7-vWorld.x*.28+uTime*.11);
        vec4 projected=vUv;projected.xy+=vec2(rippleA,rippleB)*.0018*projected.w;
        vec3 toEye=normalize(cameraPosition-vWorld);float fresnel=.18+.35*pow(1.0-max(toEye.y,0.0),4.0);
        vec3 reflection=vec3(.04,.048,.05);
        if(uUseReflection>.5)reflection=(texture2DProj(tDiffuse,projected).rgb+texture2DProj(tDiffuse,projected+vec4(.001*projected.w,0,0,0)).rgb)*.5;
        vec3 normal=normalize(vec3(rippleA*.02,1.0,rippleB*.014));
        float glint=pow(max(dot(toEye,reflect(-uSunDirection,normal)),0.0),210.0);
        vec3 color=mix(vec3(.009,.015,.017),reflection,fresnel)+vec3(1.5,1.05,.5)*glint;
        gl_FragColor=vec4(color,1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`;
