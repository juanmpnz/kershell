"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Check, Send } from "lucide-react";

export default function ContactWizard() {
  const t=useTranslations("contact"); const e=useTranslations("experience");
  const types=t.raw("types") as string[];
  const [step,setStep]=useState(0);
  const [values,setValues]=useState({name:"",email:"",company:"",project_type:"",message:"",website:""});
  const [pending,setPending]=useState(false); const [error,setError]=useState(""); const [success,setSuccess]=useState(false);
  const formRef=useRef<HTMLFormElement>(null);
  const change=(event:React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>)=>setValues(current=>({...current,[event.target.name]:event.target.value}));
  const next=()=>{
    if (!formRef.current?.reportValidity()) return;
    setStep(current=>Math.min(2,current+1));
    requestAnimationFrame(()=>formRef.current?.querySelector<HTMLElement>("input:not([type=hidden]),select,textarea")?.focus());
  };
  const submit=async(event:React.FormEvent)=>{
    event.preventDefault(); if (step<2) { next(); return; }
    setPending(true); setError("");
    try {
      const response=await fetch("/api/contact",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(values)});
      if(!response.ok) throw new Error(t("error"));
      setSuccess(true);
    } catch { setError(t("error")); } finally { setPending(false); }
  };
  if(success) return <div className="experience-success" role="status"><Check size={36}/><p>{t("success")}</p></div>;
  return <form ref={formRef} onSubmit={submit} className="experience-contact-form">
    <p className="experience-step-label">{e("step")} {step+1} / 3</p>
    <input type="text" name="website" value={values.website} onChange={change} autoComplete="off" tabIndex={-1} aria-hidden="true" style={{display:"none"}} />
    {step===0&&<div className="experience-fields">
      <label>{t("name")}<input name="name" value={values.name} onChange={change} autoComplete="name" required minLength={2}/></label>
      <label>{t("email")}<input name="email" type="email" value={values.email} onChange={change} autoComplete="email" required/></label>
    </div>}
    {step===1&&<div className="experience-fields">
      <label>{t("company")}<input name="company" value={values.company} onChange={change} autoComplete="organization"/></label>
      <label>{t("project_type")}<select name="project_type" value={values.project_type} onChange={change}><option value="">{e("choose_type")}</option>{types.map(type=><option key={type} value={type}>{type}</option>)}</select></label>
    </div>}
    {step===2&&<label className="experience-message">{t("message")}<textarea name="message" value={values.message} onChange={change} rows={4} required minLength={10}/></label>}
    {error&&<p role="alert" className="experience-form-error">{error}</p>}
    <div className="experience-form-actions">
      {step>0?<button type="button" onClick={()=>setStep(current=>current-1)}><ArrowLeft size={16}/>{e("back")}</button>:<span/>}
      <button type="submit" disabled={pending}>{step<2?<>{e("continue")}<ArrowRight size={16}/></>:<>{pending?t("submitting"):t("submit")}<Send size={16}/></>}</button>
    </div>
  </form>;
}
