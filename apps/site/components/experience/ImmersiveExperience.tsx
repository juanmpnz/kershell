"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Menu, Pause, Play, X } from "lucide-react";
import { Logo } from "@kershell/ui/logo";
import { adjacentProject, locationHash, parseLocation, type ProjectId, type View } from "@/lib/experience/navigation";
import "./experience.css";
import ContactWizard from "./ContactWizard";
import VideoBackdrop from "./VideoBackdrop";

type Project = { id:ProjectId; title:string; category:string; description:string; tags:string[]; url:string|null; cta:string };
type Service = { title:string; description:string; tag:string };
type Step = { number:string; title:string; description:string };
type Answer = { question:string; answer:string };
function subscribeHash(onChange:()=>void) {
  window.addEventListener("hashchange",onChange); window.addEventListener("popstate",onChange);
  return ()=>{ window.removeEventListener("hashchange",onChange); window.removeEventListener("popstate",onChange); };
}
const browserHash=()=>window.location.hash;
const serverHash=()=>"";
const VIEWS:View[]=["home","services","studio","project","approach","faq","contact"];

export default function ImmersiveExperience() {
  const hash=useSyncExternalStore(subscribeHash,browserHash,serverHash);
  const location=parseLocation(hash);
  const locale=useLocale(); const router=useRouter();
  const e=useTranslations("experience"); const hero=useTranslations("hero"); const portfolio=useTranslations("portfolio");
  const services=useTranslations("services"); const studio=useTranslations("studio"); const approach=useTranslations("process");
  const faq=useTranslations("aeo"); const contact=useTranslations("contact");
  const projects=portfolio.raw("items") as Project[];
  const capabilities=services.raw("items") as Service[];
  const steps=approach.raw("steps") as Step[];
  const answers=faq.raw("answers") as Answer[];
  const [paused,setPaused]=useState(false); const [menuOpen,setMenuOpen]=useState(false);
  const [serviceIndex,setServiceIndex]=useState(0); const [stepIndex,setStepIndex]=useState(0); const [faqIndex,setFaqIndex]=useState(0);
  const reduced=useReducedMotion();
  const contentRef=useRef<HTMLElement>(null); const menuRef=useRef<HTMLButtonElement>(null);
  const previousLocation=useRef(hash);
  const project=projects.find(item=>item.id===location.project)??projects[0];

  useEffect(()=>{
    const previousHtml=document.documentElement.style.overflow;
    const previousBody=document.body.style.overflow;
    document.documentElement.style.overflow="hidden"; document.body.style.overflow="hidden";
    return ()=>{ document.documentElement.style.overflow=previousHtml; document.body.style.overflow=previousBody; };
  },[]);
  useEffect(()=>{
    if(previousLocation.current===hash) return;
    previousLocation.current=hash;
    contentRef.current?.focus({preventScroll:true});
  },[hash]);
  useEffect(()=>{
    if(!menuOpen) return;
    const escape=(event:KeyboardEvent)=>{ if(event.key==="Escape") { setMenuOpen(false); menuRef.current?.focus(); } };
    window.addEventListener("keydown",escape); return ()=>window.removeEventListener("keydown",escape);
  },[menuOpen]);

  const navigate=(view:View,id:ProjectId=location.project)=>{
    setMenuOpen(false);
    const destination=locationHash(view,id);
    if(window.location.hash===destination) return;
    window.history.pushState(null,"",destination);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  };
  const navClick=(event:React.MouseEvent<HTMLAnchorElement>,view:View,id?:ProjectId)=>{
    if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey) return;
    event.preventDefault(); navigate(view,id);
  };
  const switchLanguage=()=>{
    const next=locale==="es"?"en":"es";
    document.cookie=`NEXT_LOCALE=${next}; path=/; max-age=31536000; samesite=lax`;
    router.push(`/${next}${window.location.hash}`);
  };

  return <div className={`experience-root experience-view-${location.view}`} data-paused={String(paused)}>
    <VideoBackdrop paused={paused} onPlaybackChange={setPaused}/>
    <div className="experience-vignette" aria-hidden="true"/>
    <header className="experience-header">
      <a href="#home" onClick={event=>navClick(event,"home")} aria-label={e("home")}><Logo size={25}/></a>
      <nav aria-label={e("navigation")} className="experience-main-nav">
        <a href="#services" onClick={event=>navClick(event,"services")} aria-current={location.view==="services"?"page":undefined}>{e("services")}</a>
        <a href="#studio" onClick={event=>navClick(event,"studio")} aria-current={location.view==="studio"?"page":undefined}>{e("studio")}</a>
        <a className="experience-work-nav" href={locationHash("project",location.project)} onClick={event=>navClick(event,"project")} aria-current={location.view==="project"?"page":undefined}>{e("project")}</a>
        <a href="#contact" onClick={event=>navClick(event,"contact")} className="experience-talk" aria-current={location.view==="contact"?"page":undefined}>{e("contact")}<ArrowUpRight size={14}/></a>
        <button onClick={switchLanguage} aria-label={locale==="es"?"Switch to English":"Cambiar a español"} className="experience-language">{locale.toUpperCase()}</button>
        <button ref={menuRef} onClick={()=>setMenuOpen(value=>!value)} aria-label={e(menuOpen?"close_menu":"menu")} aria-expanded={menuOpen} aria-controls="experience-menu">{menuOpen?<X size={20}/>:<Menu size={20}/>}</button>
      </nav>
      {menuOpen&&<nav id="experience-menu" className="experience-menu" aria-label={e("more")}>
        {VIEWS.map(view=><a key={view} href={locationHash(view,location.project)} onClick={event=>navClick(event,view)}>{e(view)}<ArrowUpRight size={14}/></a>)}
      </nav>}
    </header>
    <main ref={contentRef} tabIndex={-1} className="experience-content" aria-label={e(location.view)}>
      {VIEWS.map(view=><motion.section key={view} id={`experience-${view}`} aria-hidden={location.view!==view} inert={location.view!==view} className={`experience-panel panel-${view}`} initial={false} animate={{opacity:location.view===view?1:0,y:location.view===view?0:18,filter:location.view===view?"blur(0px)":"blur(8px)"}} transition={{duration:reduced?0:.65,ease:[.16,1,.3,1],delay:(location.view===view && !reduced) ? .12 : 0}} style={{visibility:location.view===view?"visible":"hidden"}}>
        {view==="home"&&<div className="experience-home-copy">
          <p className="experience-eyebrow">{hero("badge")}</p>
          <h1><span>{hero("title1")}</span><span>{hero("title2")} {hero("title3")}</span></h1>
          <p className="experience-home-intro">{e("intro")}</p>
          <div className="experience-home-actions"><a href="#services" className="experience-link" onClick={event=>navClick(event,"services")}>{e("explore_services")}<ArrowUpRight size={18}/></a><a href="#studio" className="experience-studio-link" onClick={event=>navClick(event,"studio")}>{e("meet_studio")}<ArrowUpRight size={16}/></a></div>
        </div>}
        {view==="project"&&projects.map(item=><article key={item.id} hidden={item.id!==location.project} className="experience-project-copy">
          <p className="experience-eyebrow">{item.category}</p><h2>{item.title}</h2><p className="experience-description">{item.description}</p>
          <ul className="experience-tags">{item.tags.map(tag=><li key={tag}>{tag}</li>)}</ul>
          {item.url?<a href={item.url} target="_blank" rel="noopener noreferrer" className="experience-link">{item.cta}<ArrowUpRight size={18}/></a>:<span className="experience-project-status">{portfolio("in_development")}</span>}
        </article>)}
        {view==="services"&&<div className="experience-info-layout"><div><p className="experience-eyebrow">{services("badge")}</p><h2>{services("title")}</h2><div className="experience-selector">{capabilities.map((item,index)=><button key={item.title} aria-pressed={serviceIndex===index} onClick={()=>setServiceIndex(index)}><small>{String(index+1).padStart(2,"0")}</small><span>{item.title}</span><ArrowUpRight size={18}/></button>)}</div></div>
          <div className="experience-detail">{capabilities.map((item,index)=><article key={item.title} hidden={index!==serviceIndex}><p className="experience-eyebrow">{item.tag}</p><h3>{item.title}</h3><p>{item.description}</p></article>)}<a href="#contact" className="experience-link" onClick={event=>navClick(event,"contact")}>{e("discuss_project")}<ArrowUpRight size={18}/></a></div></div>}
        {view==="studio"&&<div className="experience-studio-copy"><p className="experience-eyebrow">{studio("badge")}</p><h2>{studio("title1")}<span>{studio("title2")}</span></h2><p className="experience-description">{studio("description")}</p><a href="#contact" className="experience-link" onClick={event=>navClick(event,"contact")}>{studio("cta")}<ArrowUpRight size={18}/></a></div>}
        {view==="approach"&&<div className="experience-info-layout"><div><p className="experience-eyebrow">{approach("badge")}</p><h2>{approach("title")}</h2><div className="experience-step-controls">{steps.map((step,index)=><button key={step.number} aria-pressed={stepIndex===index} onClick={()=>setStepIndex(index)}>{step.number}</button>)}</div></div><div className="experience-detail">{steps.map((step,index)=><article hidden={index!==stepIndex} key={step.number}><h3>{step.title}</h3><p>{step.description}</p></article>)}</div></div>}
        {view==="faq"&&<div className="experience-faq-copy"><p className="experience-eyebrow">{faq("badge")}</p><h2>{faq("title")}</h2>{answers.map((answer,index)=><article key={answer.question} hidden={index!==faqIndex}><h3>{answer.question}</h3><p>{answer.answer}</p></article>)}<div className="experience-pagination"><button aria-label={e("previous")} onClick={()=>setFaqIndex(value=>(value-1+answers.length)%answers.length)}><ArrowLeft size={18}/></button><span>{faqIndex+1} / {answers.length}</span><button aria-label={e("next")} onClick={()=>setFaqIndex(value=>(value+1)%answers.length)}><ArrowRight size={18}/></button></div></div>}
        {view==="contact"&&<div className="experience-contact-copy"><div><p className="experience-eyebrow">{contact("badge")}</p><h2>{contact("title")}</h2><p className="experience-description">{contact("subtitle")}</p></div><ContactWizard/></div>}
      </motion.section>)}
    </main>
    <div className="experience-bottom">
      {location.view==="home"&&<nav className="experience-capability-dock" aria-label={services("badge")}>{capabilities.slice(0,3).map((item,index)=><a key={item.title} href="#services" onClick={event=>{setServiceIndex(index);navClick(event,"services");}}><small>{String(index+1).padStart(2,"0")}</small><span>{item.title}</span><ArrowUpRight size={22}/></a>)}</nav>}
      {location.view==="project"&&<div className="experience-project-controls"><a href={locationHash("project",adjacentProject(location.project,-1))} onClick={event=>navClick(event,"project",adjacentProject(location.project,-1))} aria-label={e("previous")}><ArrowLeft size={20}/></a><span>{String(projects.indexOf(project)+1).padStart(2,"0")} / 04</span><a href={locationHash("project",adjacentProject(location.project,1))} onClick={event=>navClick(event,"project",adjacentProject(location.project,1))} aria-label={e("next")}><ArrowRight size={20}/></a></div>}
      {location.view==="project"&&<nav className="experience-project-dock" aria-label={hero("project_navigation")}>{projects.map((item,index)=><a key={item.id} href={locationHash("project",item.id)} aria-current={location.project===item.id?"page":undefined} onClick={event=>navClick(event,"project",item.id)}><span>{item.title}</span><small>{String(index+1).padStart(2,"0")}</small></a>)}</nav>}
      <footer className="experience-footer"><div><a href="#services" onClick={event=>navClick(event,"services")}>{e("services")}</a><a href="#approach" onClick={event=>navClick(event,"approach")}>{e("approach")}</a><a href="#faq" onClick={event=>navClick(event,"faq")}>{e("faq")}</a><a href={`/${locale}/privacy`}>{e("privacy")}</a><a href={`/${locale}/terms`}>{e("terms")}</a></div><button aria-label={hero(paused?"play":"pause")} aria-pressed={paused} onClick={()=>setPaused(value=>!value)}>{paused?<Play size={12}/>:<Pause size={12}/>}<span>{hero(paused?"play":"pause")}</span></button></footer>
    </div>
    <p className="sr-only" role="status">{e(location.view)}{location.view==="project"?`: ${project.title}`:""}</p>
  </div>;
}
