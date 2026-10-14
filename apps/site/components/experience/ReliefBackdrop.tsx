import Image from "next/image";

export default function ReliefBackdrop(){
  return <div className="experience-fallback experience-relief-backdrop" aria-hidden="true">
    <Image src="/art/relieve-sun.webp" alt="" fill preload unoptimized sizes="100vw"/>
    <div className="experience-mist experience-mist-far"/>
    <div className="experience-mist experience-mist-near"/>
  </div>;
}
