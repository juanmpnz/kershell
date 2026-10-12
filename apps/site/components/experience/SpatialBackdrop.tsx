"use client";

import { useId } from "react";

/** Vector compatibility composition. The GPU scene uses independent 3D geometry. */
export default function SpatialBackdrop() {
  const id=useId();
  return <div className="experience-fallback" aria-hidden="true">
    <div className="experience-spatial-atmosphere"/>
    <svg className="experience-spatial-art" viewBox="0 0 800 800" fill="none">
      <defs>
        <linearGradient id={`${id}-metal`} x1="170" y1="150" x2="570" y2="670" gradientUnits="userSpaceOnUse"><stop stopColor="#89938e"/><stop offset=".2" stopColor="#303935"/><stop offset=".44" stopColor="#131a17"/><stop offset=".62" stopColor="#59645e"/><stop offset=".76" stopColor="#bac3b9"/><stop offset=".81" stopColor="#454f49"/><stop offset="1" stopColor="#111813"/></linearGradient>
        <linearGradient id={`${id}-edge`} x1="300" y1="130" x2="450" y2="660" gradientUnits="userSpaceOnUse"><stop stopColor="#e1e6de"/><stop offset=".4" stopColor="#4c5950"/><stop offset="1" stopColor="#101713"/></linearGradient>
        <linearGradient id={`${id}-dark`} x1="220" y1="230" x2="650" y2="580" gradientUnits="userSpaceOnUse"><stop stopColor="#141c17"/><stop offset=".4" stopColor="#4d5a51"/><stop offset=".55" stopColor="#bac6b8"/><stop offset=".64" stopColor="#303c33"/><stop offset="1" stopColor="#0c130e"/></linearGradient>
        <radialGradient id={`${id}-glow`}><stop stopColor="#b4f23f" stopOpacity=".13"/><stop offset="1" stopColor="#b4f23f" stopOpacity="0"/></radialGradient>
      </defs>
      <ellipse cx="453" cy="440" rx="290" ry="265" fill={`url(#${id}-glow)`}/>
      <g className="experience-fold">
        <path d="M180 641C93 528 146 377 296 349L481 309C582 288 573 209 501 178L362 118L385 93L530 147C669 198 661 353 515 390L308 442C213 466 239 540 285 604L180 641Z" fill={`url(#${id}-metal)`}/>
        <path d="M362 118L385 93L530 147C669 198 661 353 515 390L308 442C213 466 239 540 285 604L270 628C189 527 186 455 297 425L504 370C633 335 641 216 521 165L362 118Z" fill={`url(#${id}-edge)`}/>
        <path d="M192 606C288 678 449 643 505 531L591 359C646 252 535 198 462 242L264 367C199 408 132 372 169 301L207 228L174 213L126 292C70 386 158 484 280 421L485 311C521 292 553 306 531 349L440 521C392 611 294 638 225 584L192 606Z" fill={`url(#${id}-dark)`}/>
        <path d="M207 228L169 301C132 372 199 408 264 367L462 242C535 198 646 252 591 359L505 531" stroke="#b4f23f" strokeWidth="2.5"/>
        <path d="M385 93L530 147C669 198 661 353 515 390L308 442" stroke="#a2aea5" strokeOpacity=".46" strokeWidth="1"/>
        <path d="M194 634L267 607M187 615L250 584M184 595L236 562M184 575L226 540M186 555L218 521" stroke="#080d0a" strokeWidth="2" strokeOpacity=".45"/>
      </g>
    </svg>
    <div className="experience-spatial-horizon"/>
  </div>;
}
