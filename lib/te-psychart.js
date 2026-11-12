/*! TE_PSYCHART r1 (12 พ.ย. 2569) — แผนภูมิไซโครเมตริกแบบพิมพ์ครบทุกสเกล (รูปแบบแผนภูมิ ASHRAE)
   [แก้ไข 12 พ.ย. 2569] แยกจาก Tool_Psychrometric_Chart v2.1 (แท็บแผนภูมิอ่านค่า) เพื่อใช้ร่วมกับเครื่องมือ Free ทุกตัวที่มีสภาวะอากาศ
   สเกล: DB (แกนล่าง) · W (แกนขวา) · DP และ pw (สเกลข้างแกน W) · อุณหภูมิอิ่มตัว = WB/DP (บนเส้นอิ่มตัว) · RH · WB · h (สเกลเฉียง) · v
         · ไม้โปรแทรกเตอร์ SHF และ Δh/ΔW (มุมคำนวณจากสเกลแกนจริงของแผนภูมิ อ้างอิง 24 °C / 50 % RH)
   ทุกเส้นคำนวณจาก TE_PSY (lib/te-core.js — ASHRAE Fundamentals, Hyland–Wexler) ไม่มีสูตรคุณสมบัติอากาศชุดใหม่
   ใช้งาน: TE_PSYCHART.render(svg,{range:[t0,t1,Wmax],p,fine,rh5,shf,legend,points,lines,guides}) → map
           TE_PSYCHART.bind(svg,tip,{map:()=>map, hover:()=>bool, click:(state)=>{}}) · downloadPNG/downloadSVG(svg,ชื่อไฟล์) */
var TE_PSYCHART=(function(){
  'use strict';
  var C={W:1120,H:790,L:44,R:196,T:34,B:60}; C.pw=C.W-C.L-C.R; C.ph=C.H-C.T-C.B;
  var CPM=1.006+1.86*0.0093, HG=2501+1.86*24;                     // ไม้โปรแทรกเตอร์ SHF: cp อากาศชื้นและ hg ที่ 24 °C / 50 % RH
  var RANGES=[['0,50,0.030','มาตรฐาน 0–50 °C (W ≤ 30 g/kg)','Standard 0–50 °C (W ≤ 30 g/kg)'],['10,45,0.030','งานปรับอากาศ 10–45 °C','Air conditioning 10–45 °C'],
    ['-10,40,0.025','อากาศเย็น −10–40 °C','Cold air −10–40 °C'],['0,90,0.120','อุณหภูมิสูง / เครื่องอบแห้ง 0–90 °C','High temperature / dryers 0–90 °C']];
  function P_(){ return TE_PSY; }
  function L_(th,en){ return (typeof window!=='undefined'&&window.TE_I18N&&TE_I18N.lang==='en')?en:th; }
  function bis(f,lo,hi,n){ var flo=f(lo); for(var i=0;i<(n||70);i++){ var m=(lo+hi)/2, fm=f(m); if((fm<0)===(flo<0)){lo=m;flo=fm;} else hi=m; } return (lo+hi)/2; }
  function tSatW(W,p){ return bis(function(t){return P_().Ws(t,p)-W;},-80,150); }       // อุณหภูมิอิ่มตัวที่ W (= จุดน้ำค้าง)
  function wH(h,t){ return (h-1.006*t)/(2501+1.86*t); }                                   // W บนเส้น h คงที่
  function wV(v,t,p){ return (v*p/(0.287042*(t+273.15))-1)/1.607858; }                   // W บนเส้น v คงที่
  function nice(raw,c){ for(var i=0;i<c.length;i++) if(c[i]>=raw-1e-12) return c[i]; return c[c.length-1]; }
  function F(v,d){ return isFinite(v)?(+v).toFixed(d):'–'; }
  function mul(v,s){ var r=v/s; return Math.abs(r-Math.round(r))<1e-6; }
  function place(items,minD){ items.sort(function(a,b){return b.pri-a.pri;}); var ok=[];
    items.forEach(function(it){ for(var i=0;i<ok.length;i++){ if(Math.hypot(ok[i].x-it.x,ok[i].y-it.y)<minD) return; } ok.push(it); }); return ok; }
  /* ทิศเส้นกระบวนการตาม SHF (ใช้ค่าคงที่เดียวกับไม้โปรแทรกเตอร์): ΔW ต่อ Δt = cp(1 − SHF)/(SHF·hg) */
  function shfSlope(s){ return CPM*(1-s)/(s*HG); }

  function render(svg,o){
    if(!svg) return null; o=o||{};
    var PS=P_(), Ws=PS.Ws, W_rh=PS.W_rh, W_wb=PS.W_wb, Hda=PS.Hda, Vda=PS.Vda, Pw_W=PS.Pw_W;
    var rg=o.range||[0,50,0.030], t0=+rg[0], t1=+rg[1], Wmax=+rg[2], W0=0, p=o.p>50&&o.p<120?o.p:101.325, fine=o.fine!==false;
    var uid=(svg.id||'pc')+'_', L=C.L, T=C.T, PW=C.pw, PH=C.ph, R=L+PW, B=T+PH, kx=PW/(t1-t0), ky=PH/(Wmax-W0);
    var X=function(t){return L+(t-t0)*kx;}, Y=function(w){return B-(w-W0)*ky;};
    var Tx=function(x){return t0+(x-L)/kx;}, Wy=function(y){return W0+(B-y)/ky;};
    var HALO='paint-order="stroke" stroke="#fff" stroke-width="2.6" stroke-linejoin="round"';
    var out=[], f1=function(v){return v.toFixed(1);}, i, k, t, w, mj;
    function ln(x1,y1,x2,y2,st){ out.push('<line x1="'+f1(x1)+'" y1="'+f1(y1)+'" x2="'+f1(x2)+'" y2="'+f1(y2)+'" '+st+'/>'); }
    function tx(x,y,s,st){ out.push('<text x="'+f1(x)+'" y="'+f1(y)+'" '+(st||'')+'>'+s+'</text>'); }
    function pd(pts){ var d=''; pts.forEach(function(q,j){ d+=(j?'L':'M')+f1(q[0])+' '+f1(q[1])+' '; }); return d; }
    function path(pts,st){ if(pts.length>1) out.push('<path d="'+pd(pts)+'" fill="none" '+st+'/>'); }
    function ang(a,b){ return Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI; }
    svg.setAttribute('viewBox','0 0 '+C.W+' '+C.H);

    /* ── เส้นอิ่มตัวในกรอบ + พื้นที่ใต้เส้นอิ่มตัว (ใช้ตัดเส้นตาราง) ── */
    var tE=Ws(t1,p)>Wmax?tSatW(Wmax,p):t1;
    var sat=[]; for(i=0;i<=320;i++){ var ts=t0+(tE-t0)*i/320; sat.push([X(ts),Y(Math.min(Ws(ts,p),Wmax))]); }
    var satPoly='M'+L+' '+B+' L'+sat.map(function(q){return f1(q[0])+' '+f1(q[1]);}).join(' L')+(tE<t1?' L'+R+' '+T:'')+' L'+R+' '+B+' Z';
    out.push('<defs><clipPath id="'+uid+'box"><rect x="'+L+'" y="'+T+'" width="'+PW+'" height="'+PH+'"/></clipPath><clipPath id="'+uid+'sat"><path d="'+satPoly+'"/></clipPath></defs>');
    out.push('<rect x="0" y="0" width="'+C.W+'" height="'+C.H+'" fill="#ffffff"/>');

    /* ── 1) เส้นตาราง DB (ตั้ง) และ W (นอน) — สิ้นสุดที่เส้นอิ่มตัว ── */
    var dtMin=nice(7/kx,[1,2,5,10,20]), dtMaj=nice(Math.max(5,40/kx),[5,10,20,50]);
    var dwMin=nice(14/ky,[0.0005,0.001,0.002,0.005,0.01,0.02]), dwMaj=nice(Math.max(0.005,40/ky),[0.005,0.01,0.02,0.05,0.1]);
    var G=[];
    for(k=Math.ceil(t0/dtMin-1e-9); k*dtMin<=t1+1e-9; k++){ t=k*dtMin; mj=mul(t,dtMaj); if(!fine&&!mj) continue;
      G.push('<line x1="'+f1(X(t))+'" y1="'+T+'" x2="'+f1(X(t))+'" y2="'+B+'" stroke="'+(mj?'#93a3b8':'#c9d2de')+'" stroke-width="'+(mj?0.9:0.5)+'"/>'); }
    for(k=Math.ceil(W0/dwMin-1e-9); k*dwMin<=Wmax+1e-12; k++){ w=k*dwMin; mj=mul(w,dwMaj); if(!fine&&!mj) continue;
      G.push('<line x1="'+L+'" y1="'+f1(Y(w))+'" x2="'+R+'" y2="'+f1(Y(w))+'" stroke="'+(mj?'#93a3b8':'#c9d2de')+'" stroke-width="'+(mj?0.9:0.5)+'"/>'); }
    out.push('<g clip-path="url(#'+uid+'sat)">'+G.join('')+'</g>');

    /* ── 2) ปริมาตรจำเพาะ v (เส้นประเขียว) ── */
    var vLo=Vda(t0,0,p), vHi=Vda(t1,Math.min(Wmax,Ws(t1,p)),p), vStep=nice((vHi-vLo)/22,[0.005,0.01,0.02,0.05,0.1]), vd=vStep<0.01?3:2, V=[], VL=[];
    for(k=Math.ceil(vLo/vStep-1e-9); k*vStep<=vHi+1e-12; k++){ var vv=k*vStep, pts=[];
      for(i=0;i<=80;i++){ t=t0+(t1-t0)*i/80; w=wV(vv,t,p); if(w>=W0-1e-9&&w<=Wmax+1e-9) pts.push([X(t),Y(w)]); }
      if(pts.length<2) continue;
      V.push('<path d="'+pd(pts)+'" fill="none" stroke="#1e9e5a" stroke-width="'+(mul(vv,vStep*5)?0.95:0.65)+'" stroke-dasharray="6 3" opacity="0.85"/>');
      var wt=W0+0.04*(Wmax-W0), tl=vv*p/(0.287042*(1+1.607858*wt))-273.15;
      if(!(tl>t0+0.6&&tl<t1-0.6)){ tl=t1-0.03*(t1-t0); wt=wV(vv,tl,p); }
      if(wt>W0&&wt<Math.min(Wmax,Ws(tl,p))*0.97){ var a1=[X(tl),Y(wt)], a2=[X(tl+0.3),Y(wV(vv,tl+0.3,p))];
        VL.push('<text x="'+f1(a1[0]-3)+'" y="'+f1(a1[1])+'" font-size="8.6" font-weight="600" fill="#157a45" '+HALO+' text-anchor="middle" transform="rotate('+ang(a1,a2).toFixed(1)+' '+f1(a1[0]-3)+' '+f1(a1[1])+')">'+vv.toFixed(vd)+'</text>'); } }
    out.push('<g clip-path="url(#'+uid+'sat)">'+V.join('')+'</g>');

    /* ── 3) กระเปาะเปียก WB (เส้นประน้ำตาล) — เริ่มที่เส้นอิ่มตัว ── */
    var wbStep=fine?dtMin:5, WB=[], WBL=[];
    for(k=Math.ceil(t0/wbStep-1e-9); k*wbStep<=t1-0.5; k++){ var tw=k*wbStep, pts2=[]; mj=mul(tw,5);
      for(i=0;i<=60;i++){ t=tw+(t1-tw)*i/60; w=W_wb(t,tw,p); if(w<W0) break; if(w<=Wmax+1e-9) pts2.push([X(t),Y(w)]); }
      if(pts2.length<2) continue;
      WB.push('<path d="'+pd(pts2)+'" fill="none" stroke="#8a5a2b" stroke-width="'+(mj?0.85:0.55)+'" stroke-dasharray="'+(mj?'5 3':'3 3')+'" opacity="'+(mj?0.85:0.7)+'"/>');
      if(Ws(tw,p)>Wmax){ var tt=bis(function(x){return W_wb(x,tw,p)-Wmax;},tw,t1); if(tt<t1-0.3) WBL.push({x:X(tt)+2,y:T+11,s:String(tw),pri:mj?2:1}); } }
    out.push('<g clip-path="url(#'+uid+'box)">'+WB.join('')+'</g>');

    /* ── 4) ความชื้นสัมพัทธ์ RH ── */
    var RHs=[10,20,30,40,50,60,70,80,90]; if(o.rh5) RHs=RHs.concat([5,15,25,35,45,55,65,75,85,95]);
    RHs.forEach(function(r){ var pts3=[], m10=r%10===0, j;
      for(j=0;j<=240;j++){ var tq=t0+(t1-t0)*j/240, wq=W_rh(tq,r/100,p); if(wq>Wmax){ var tc=bis(function(x){return W_rh(x,r/100,p)-Wmax;},tq-(t1-t0)/240,tq); pts3.push([X(tc),T]); break; } pts3.push([X(tq),Y(wq)]); }
      path(pts3,'stroke="'+(m10?'#2f75bb':'#7fb0e0')+'" stroke-width="'+(m10?0.95:0.6)+'"'+(m10?'':' stroke-dasharray="2 2"'));
      var tgt=Wmax*(0.20+0.62*r/100), best=-1; for(j=2;j<pts3.length-2;j++){ if(pts3[j][0]<L+20||pts3[j][0]>R-30||pts3[j][1]<T+14) continue; if(best<0||Math.abs(Wy(pts3[j][1])-tgt)<Math.abs(Wy(pts3[best][1])-tgt)) best=j; } if(best<0) return;
      var qa=pts3[Math.max(0,best-2)], qb=pts3[Math.min(pts3.length-1,best+2)], q=pts3[best];
      if(q&&(m10||fine)) out.push('<text x="'+f1(q[0])+'" y="'+f1(q[1]-3)+'" font-size="'+(m10?9.5:8)+'" font-weight="700" fill="#1f5fa0" '+HALO+' text-anchor="middle" transform="rotate('+ang(qa,qb).toFixed(1)+' '+f1(q[0])+' '+f1(q[1]-3)+')">'+r+'%</text>'); });
    out.push(VL.join(''));

    /* ── 5) สเกลเอนทัลปีเฉียง + เส้น h คงที่ ── */
    var d=30, C1=[X(t0),Y(Ws(t0,p))], C2=[X(tE),Y(Math.min(Ws(tE,p),Wmax))];
    var P1=[L,C1[1]-d], P2=tE<t1?[C2[0]-d,T]:[C2[0]-d*0.7,C2[1]-d*0.7];
    var hAt=function(x,y){return Hda(Tx(x),Wy(y));}, h1=hAt(P1[0],P1[1]), h2=hAt(P2[0],P2[1]);
    var ux=P2[0]-P1[0], uy=P2[1]-P1[1], Ls=Math.hypot(ux,uy); ux/=Ls; uy/=Ls; var nx=uy, ny=-ux;   // n ชี้ออกซ้ายบน
    var hPt=function(h){ var s=bis(function(s){return hAt(P1[0]+ux*s,P1[1]+uy*s)-h;},0,Ls,50); return [P1[0]+ux*s,P1[1]+uy*s]; };
    var pxPerH=Ls/Math.max(1e-6,h2-h1), hTick=nice(3.2/pxPerH,[1,2,5,10,20]), hLab=nice(26/pxPerH,[5,10,20,50,100]);
    var hLo=Hda(t0,W0), hHi=Hda(t1,Math.min(Wmax,Ws(t1,p))), hStep=nice((h2-h1)/22,[2,5,10,20,50]), H=[], HL=[];
    for(k=Math.ceil(hLo/hStep-1e-9); k*hStep<=hHi+1e-9; k++){ var hh=k*hStep, S=null, side='';
      if(hh>=h1&&hh<=h2){ S=hPt(hh); side='s'; }
      else if(hh<h1){ w=wH(hh,t0); if(w<W0) continue; S=[L,Y(w)]; side='l'; }
      else { t=(hh-2501*Wmax)/(1.006+1.86*Wmax); if(t>t1-0.2) continue; S=[X(t),T]; side='t'; }
      var tS=Tx(S[0]), tEnd=Math.min(t1,(hh-2501*W0)/(1.006+1.86*W0)); if(tEnd<=tS) continue;
      var pts4=[S]; for(i=1;i<=30;i++){ t=tS+(tEnd-tS)*i/30; pts4.push([X(t),Y(wH(hh,t))]); }
      mj=mul(hh,hLab*2)||mul(hh,10);
      H.push('<path d="'+pd(pts4)+'" fill="none" stroke="#d9822b" stroke-width="'+(mj?0.95:0.6)+'" opacity="0.85"/>');
      if(side==='l') HL.push('<text x="'+f1(L-4)+'" y="'+f1(S[1]+3)+'" font-size="9" font-weight="600" fill="#b45309" text-anchor="end">'+hh+'</text>');
      if(side==='t'&&S[0]>P2[0]+14) HL.push('<text x="'+f1(S[0])+'" y="'+f1(T-5)+'" font-size="9" font-weight="600" fill="#b45309" text-anchor="middle">'+hh+'</text>'); }
    out.push('<g clip-path="url(#'+uid+'box)">'+H.join('')+'</g>'+HL.join(''));
    ln(P1[0],P1[1],P2[0],P2[1],'stroke="#b45309" stroke-width="1.3"');
    var HT=[];
    for(k=Math.ceil(h1/hTick-1e-9); k*hTick<=h2+1e-9; k++){ var hv=k*hTick, q2=hPt(hv), lab=mul(hv,hLab), l2=lab?9:(mul(hv,5)?6:3.5);
      ln(q2[0],q2[1],q2[0]+nx*l2,q2[1]+ny*l2,'stroke="#b45309" stroke-width="'+(lab?1.1:0.7)+'"');
      if(lab) HT.push('<text x="'+f1(q2[0]+nx*18)+'" y="'+f1(q2[1]+ny*18+3.5)+'" font-size="10" font-weight="700" fill="#b45309" '+HALO+' text-anchor="middle">'+hv+'</text>'); }
    out.push(HT.join(''));
    var hm=[P1[0]+(P2[0]-P1[0])*0.78+nx*44,P1[1]+(P2[1]-P1[1])*0.78+ny*44];
    out.push('<text x="'+f1(hm[0])+'" y="'+f1(hm[1])+'" font-size="11.5" font-weight="700" fill="#b45309" '+HALO+' text-anchor="middle" transform="rotate('+(Math.atan2(uy,ux)*180/Math.PI).toFixed(1)+' '+f1(hm[0])+' '+f1(hm[1])+')">'+L_('เอนทัลปี h (kJ/kg อากาศแห้ง)','Enthalpy h (kJ/kg dry air)')+'</text>');

    /* ── 6) เส้นอิ่มตัว + สเกลอุณหภูมิอิ่มตัว (อ่าน WB และ DP) ── */
    path(sat,'stroke="#0b3d91" stroke-width="2.4"');
    var SL=[], stStep=fine?0.5:1;
    for(k=Math.ceil(t0/stStep-1e-9); k*stStep<=tE+1e-9; k++){ var tsv=k*stStep, wa=Ws(tsv,p); if(wa>Wmax) break;
      var sa=[X(tsv),Y(wa)], sb=[X(tsv+0.05),Y(Ws(tsv+0.05,p))], tlen=Math.hypot(sb[0]-sa[0],sb[1]-sa[1]), ex=(sb[1]-sa[1])/tlen, ey=-(sb[0]-sa[0])/tlen;
      var isI=mul(tsv,1), is5=mul(tsv,5), l3=is5?9:(isI?6:3.5);
      ln(sa[0],sa[1],sa[0]+ex*l3,sa[1]+ey*l3,'stroke="#0b3d91" stroke-width="'+(is5?1.2:0.8)+'"');
      if(isI) SL.push({x:sa[0]+ex*16,y:sa[1]+ey*16,s:String(Math.round(tsv)),pri:is5?3:1,b:is5}); }
    place(SL,13).forEach(function(it){ tx(it.x,it.y+3.5,it.s,'font-size="'+(it.b?10.5:9)+'" font-weight="'+(it.b?800:600)+'" fill="#0b3d91" '+HALO+' text-anchor="middle"'); });
    place(WBL,14).forEach(function(it){ tx(it.x,it.y,it.s,'font-size="8.5" font-weight="600" fill="#8a5a2b" '+HALO+' text-anchor="start"'); });

    /* ── 7) กรอบแผนภูมิ + แกน DB ล่าง ── */
    out.push('<rect x="'+L+'" y="'+T+'" width="'+PW+'" height="'+PH+'" fill="none" stroke="#334155" stroke-width="1.1"/>');
    var dtTick=fine?nice(4/kx,[0.5,1,2,5]):dtMin, dtLab=nice(15/kx,[1,2,5,10,20]);
    for(k=Math.ceil(t0/dtTick-1e-9); k*dtTick<=t1+1e-9; k++){ t=k*dtTick; var a5=mul(t,dtMaj), aL=mul(t,dtLab), aI=mul(t,dtMin);
      ln(X(t),B,X(t),B+(a5?8:aI?5:3),'stroke="#334155" stroke-width="'+(a5?1:0.7)+'"');
      if(aL) tx(X(t),B+(a5?20:18),String(Math.round(t*10)/10),'font-size="'+(a5?11:9)+'" font-weight="'+(a5?700:500)+'" fill="#1e293b" text-anchor="middle"'); }
    tx(L+PW/2,B+40,L_('อุณหภูมิกระเปาะแห้ง DB (°C) — Dry-Bulb Temperature','Dry-Bulb Temperature DB (°C)'),'font-size="12.5" font-weight="700" fill="#0f2a4a" text-anchor="middle"');

    /* ── 8) แกนขวา: W · DP · pw ── */
    var dwTick=nice(5/ky,[0.0002,0.0005,0.001,0.002,0.005,0.01]), dwLab=nice(13/ky,[0.0005,0.001,0.002,0.005,0.01,0.02,0.05]), wd=dwLab<0.001?1:0;
    for(k=Math.ceil(W0/dwTick-1e-9); k*dwTick<=Wmax+1e-12; k++){ w=k*dwTick; var b5=mul(w,dwMaj), bL=mul(w,dwLab);
      ln(R,Y(w),R+(b5?8:bL?5:3),Y(w),'stroke="#334155" stroke-width="'+(b5?1:0.7)+'"');
      if(bL) tx(R+(b5?11:8),Y(w)+3.5,(w*1000).toFixed(wd),'font-size="'+(b5?10.5:9)+'" font-weight="'+(b5?700:500)+'" fill="#1e293b"'); }
    var xD=R+52, xPc=R+118, dpTop=tSatW(Wmax,p), dpBot=tSatW(Math.max(W0,0.0004*(Wmax/0.03)),p);
    ln(xD,Y(Ws(Math.ceil(dpBot),p)),xD,T,'stroke="#0b3d91" stroke-width="1"');
    var DPI=[], dpS=(Y(Ws(Math.ceil(dpBot),p))-T)/Math.max(1,dpTop-Math.ceil(dpBot))>40?0.5:1, yPrev=1e9;
    for(k=Math.ceil(dpBot/dpS); k*dpS<=dpTop+1e-9; k++){ var dpv=k*dpS, yd=Y(Ws(dpv,p)), c5=mul(dpv,5), cI=mul(dpv,1);
      if(!c5&&yPrev-yd<2.6) continue; yPrev=yd;
      ln(xD,yd,xD+(c5?8:cI?5:3),yd,'stroke="#0b3d91" stroke-width="'+(c5?1:0.7)+'"');
      if(cI) DPI.push({x:xD+11,y:yd,s:String(Math.round(dpv)),pri:c5?3:1,b:c5}); }
    place(DPI,11).forEach(function(it){ tx(it.x,it.y+3.5,it.s,'font-size="'+(it.b?10.5:9)+'" font-weight="'+(it.b?700:500)+'" fill="#0b3d91"'); });
    var pwMax=Pw_W(Wmax,p), pxPkPa=PH/pwMax, pTick=nice(4.5/pxPkPa,[0.05,0.1,0.2,0.5,1,2]), pLab=nice(45/pxPkPa,[0.2,0.5,1,2,5,10]);
    ln(xPc,B,xPc,T,'stroke="#6b21a8" stroke-width="1"');
    for(k=1; k*pTick<=pwMax+1e-9; k++){ var pv=k*pTick, yp=Y(0.621945*pv/(p-pv)), cL=mul(pv,pLab);
      ln(xPc,yp,xPc+(cL?8:4),yp,'stroke="#6b21a8" stroke-width="'+(cL?1:0.7)+'"');
      if(cL) tx(xPc+11,yp+3.5,pv.toFixed(pLab<1?1:0),'font-size="9.5" font-weight="600" fill="#6b21a8"'); }
    tx(R+10,B+18,'W','font-size="10.5" font-weight="800" fill="#1e293b"'); tx(R+10,B+30,'g/kg','font-size="8.5" fill="#1e293b"');
    tx(xD-2,B+18,'DP','font-size="10.5" font-weight="800" fill="#0b3d91"'); tx(xD-2,B+30,'°C','font-size="8.5" fill="#0b3d91"');
    tx(xPc-2,B+18,'pw','font-size="10.5" font-weight="800" fill="#6b21a8"'); tx(xPc-2,B+30,'kPa','font-size="8.5" fill="#6b21a8"');
    out.push('<text transform="translate('+(C.W-10)+','+(T+PH/2)+') rotate(90)" font-size="11.5" font-weight="700" fill="#0f2a4a" text-anchor="middle">'+L_('อัตราส่วนความชื้น W (g/kg อากาศแห้ง) · จุดน้ำค้าง DP (°C) · ความดันไอน้ำ pw (kPa)','Humidity ratio W (g/kg dry air) · Dew point DP (°C) · Vapour pressure pw (kPa)')+'</text>');

    /* ── 9) ไม้โปรแทรกเตอร์ SHF / Δh/ΔW ── */
    var shfOn=o.shf!==false&&Wmax<=0.05;
    if(shfOn){
      var cx=L+112, cy=T+106, RR=80;
      var dirA=function(vt,vw){ if(vw<0||(vw===0&&vt<0)){vt=-vt;vw=-vw;} return Math.atan2(vw*ky,vt*kx); };
      var Pp=function(a,r){ return [cx+r*Math.cos(a),cy-r*Math.sin(a)]; };
      out.push('<path d="M'+f1(cx+RR)+' '+f1(cy)+' A'+RR+' '+RR+' 0 0 0 '+f1(cx-RR)+' '+f1(cy)+'" fill="#fffdf7" stroke="#475569" stroke-width="1"/>');
      ln(cx-RR,cy,cx+RR,cy,'stroke="#475569" stroke-width="0.8"');
      out.push('<circle cx="'+cx+'" cy="'+cy+'" r="2.2" fill="#475569"/>');
      var SI=[];
      [1,0.9,0.8,0.7,0.6,0.5,0.4,0.3,0.2,0.1,0,-0.1,-0.2,-0.3,-0.5,-1,-2,-4,4,2,1.5,1.2].forEach(function(s){ var a=dirA(s/CPM,(1-s)/HG), m=Pp(a,RR), n2=Pp(a,RR-7); ln(m[0],m[1],n2[0],n2[1],'stroke="#475569" stroke-width="0.9"');
        var c=Pp(Math.min(Math.max(a,0.14),Math.PI-0.14),RR-16); SI.push({x:c[0],y:c[1],s:(s===1?'1.0':String(s).replace('-','−')),pri:(s===1||s===0||s===0.5)?3:(s>0&&s<1?2:1)}); });
      place(SI,12).forEach(function(it){ tx(it.x,it.y+3,it.s,'font-size="8" font-weight="600" fill="#334155" text-anchor="middle"'); });
      var DI=[];
      [10000,5000,4000,3000,2500,2000,1000,0,-1000,-2000,-5000].forEach(function(r){ var a=dirA((r-HG)/CPM,1), m=Pp(a,RR), n3=Pp(a,RR+5); ln(m[0],m[1],n3[0],n3[1],'stroke="#475569" stroke-width="0.8"');
        var c=Pp(a,RR+14); DI.push({x:c[0],y:c[1],s:String(r).replace('-','−'),pri:r===0||r===2500?2:1}); });
      DI.push({x:cx+RR+8,y:cy-2,s:'±∞',pri:3}); DI.push({x:cx-RR-8,y:cy-2,s:'±∞',pri:3});
      place(DI,16).forEach(function(it){ tx(it.x,it.y+3,it.s,'font-size="8" fill="#475569" text-anchor="middle"'); });
      tx(cx,cy-RR*0.42,'SHF','font-size="9" font-weight="800" fill="#334155" text-anchor="middle"');
      tx(cx,cy+13,L_('SHF (ใน) · Δh/ΔW kJ/kg (นอก)','SHF (inner) · Δh/ΔW kJ/kg (outer)'),'font-size="8" fill="#334155" text-anchor="middle"');
    }

    /* ── 10) กรอบคำอธิบาย ── */
    if(o.legend!==false){
      var lx=L+8, ly=T+(shfOn?138:12), rows=[
        ['#93a3b8','',L_('DB (°C) แกนล่าง · W (g/kg) แกนขวา','DB (°C) bottom axis · W (g/kg) right axis')],
        ['#2f75bb','',L_('RH (%) — เส้นโค้งสีฟ้า','RH (%) — blue curves')],
        ['#8a5a2b','5 3',L_('WB (°C) — ตามเส้นประถึงเส้นอิ่มตัว','WB (°C) — follow to saturation curve')],
        ['#d9822b','',L_('h (kJ/kg) — ตามเส้นถึงสเกลเฉียง','h (kJ/kg) — follow to oblique scale')],
        ['#1e9e5a','6 3',L_('v (m³/kg) — เส้นประเขียว','v (m³/kg) — green dashed')],
        ['#0b3d91','',L_('RH 100 % — ตัวเลขบนเส้น = WB/DP (°C)','RH 100 % — numbers = WB/DP (°C)')],
        ['#6b21a8','',L_('DP (°C) · pw (kPa) — สเกลขวา','DP (°C) · pw (kPa) — right scales')]];
      out.push('<rect x="'+lx+'" y="'+ly+'" width="204" height="'+(rows.length*13+9)+'" rx="5" fill="#ffffff" fill-opacity="0.92" stroke="#cbd5e1"/>');
      rows.forEach(function(r,j){ var yy=ly+12+j*13; ln(lx+8,yy-3,lx+28,yy-3,'stroke="'+r[0]+'" stroke-width="1.6"'+(r[1]?' stroke-dasharray="'+r[1]+'"':'')); tx(lx+34,yy,r[2],'font-size="8.6" fill="#1e293b"'); });
    }
    tx(L,T-12,(o.title?o.title+' · ':'')+L_('แผนภูมิไซโครเมตริก · ความดันบรรยากาศ ','Psychrometric chart · Barometric pressure ')+F(p,3)+' kPa'+(Math.abs(p-101.325)<0.0005?L_(' (ระดับน้ำทะเล)',' (sea level)'):'')+' · ASHRAE (Hyland–Wexler)','font-size="12" font-weight="700" fill="#0f2a4a"');
    tx(R,B+56,'Triple E Energy Tools · tripleeenergytools.com','font-size="8.5" fill="#64748b" text-anchor="end"');

    var map={X:X,Y:Y,Tx:Tx,Wy:Wy,t0:t0,t1:t1,Wmax:Wmax,W0:W0,p:p,L:L,T:T,R:R,B:B,P1:P1,P2:P2,hPt:hPt,h1:h1,h2:h2,nx:nx,ny:ny,kx:kx,ky:ky};

    /* ── 11) เส้นกระบวนการ · เส้นนำสายตา · จุด ── */
    (o.lines||[]).forEach(function(l){ if(!l||!l.a||!l.b) return; var col=l.color||'#d1495b', a=[X(l.a.t),Y(l.a.W)], b=[X(l.b.t),Y(l.b.W)];
      out.push('<line x1="'+f1(a[0])+'" y1="'+f1(a[1])+'" x2="'+f1(b[0])+'" y2="'+f1(b[1])+'" stroke="'+col+'" stroke-width="'+(l.width||2.4)+'"'+(l.dash?' stroke-dasharray="'+l.dash+'"':'')+' stroke-linecap="round" opacity="0.92"/>');
      if(l.arrow){ var an=Math.atan2(b[1]-a[1],b[0]-a[0]), m=[(a[0]+b[0])/2,(a[1]+b[1])/2], s=7;
        out.push('<path d="M'+f1(m[0]+s*Math.cos(an))+' '+f1(m[1]+s*Math.sin(an))+' L'+f1(m[0]+s*Math.cos(an+2.5))+' '+f1(m[1]+s*Math.sin(an+2.5))+' L'+f1(m[0]+s*Math.cos(an-2.5))+' '+f1(m[1]+s*Math.sin(an-2.5))+' Z" fill="'+col+'"/>'); }
      if(l.label){ var mm=[(a[0]+b[0])/2,(a[1]+b[1])/2]; tx(mm[0]+6,mm[1]-6,l.label,'font-size="10" font-weight="700" fill="'+col+'" '+HALO); } });
    (o.guides||[]).forEach(function(g){ if(g&&g.s) guide(out,g.s,map,g.color); });
    (o.points||[]).forEach(function(q){ if(!q||!isFinite(q.t)||!isFinite(q.W)) return; mark(out,q,map); });

    svg.innerHTML=out.join('');
    return map;
  }

  function mark(out,q,M){ var x=M.X(q.t), y=M.Y(q.W), col=q.color||'#d1495b';
    out.push('<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+(q.r||5)+'" fill="'+col+'" stroke="#fff" stroke-width="1.8"/>');
    if(q.label) out.push('<text x="'+(x+7+(q.dx||0)).toFixed(1)+'" y="'+(y-6+(q.dy||0)).toFixed(1)+'" font-size="12" font-weight="800" fill="'+col+'" paint-order="stroke" stroke="#fff" stroke-width="3" stroke-linejoin="round">'+q.label+'</text>');
  }
  function guide(out,s,M,col){                                       // เส้นนำสายตาไปทุกแกน + ค่า
    var PS=P_(), X=M.X, Y=M.Y, p=M.p, x=X(s.t), y=Y(s.W), Cc=col||'#7b3fa0', DS='stroke="'+Cc+'" stroke-width="1.3" stroke-dasharray="5 3"';
    var HALO='paint-order="stroke" stroke="#fff" stroke-width="3" stroke-linejoin="round"', i;
    function lab(xx,yy,txt,anc){ out.push('<text x="'+xx.toFixed(1)+'" y="'+yy.toFixed(1)+'" font-size="10" font-weight="800" fill="'+Cc+'" '+HALO+' text-anchor="'+(anc||'start')+'">'+txt+'</text>'); }
    function dot(xx,yy){ out.push('<circle cx="'+xx.toFixed(1)+'" cy="'+yy.toFixed(1)+'" r="3.2" fill="'+Cc+'"/>'); }
    function pl(pts){ var d=''; pts.forEach(function(q,j){ d+=(j?'L':'M')+q[0].toFixed(1)+' '+q[1].toFixed(1)+' '; }); out.push('<path d="'+d+'" fill="none" '+DS+'/>'); }
    pl([[x,y],[x,M.B]]); lab(x+3,M.B-5,'DB '+F(s.t,1));
    var xd=Math.max(M.L,X(s.tdp)); pl([[xd,y],[M.R+150,y]]); if(s.tdp>=M.t0) dot(xd,y);
    lab(M.R-4,y-5,'W '+F(s.W*1000,1)+' g/kg · DP '+F(s.tdp,1)+' °C · pw '+F(s.pw,2)+' kPa','end');
    var twe=Math.max(s.twb,M.t0), wb=[]; for(i=0;i<=24;i++){ var t=s.t+(twe-s.t)*i/24; wb.push([X(t),Y(Math.min(PS.W_wb(t,s.twb,p),M.Wmax))]); } pl(wb);
    if(s.twb>=M.t0) dot(X(s.twb),Y(PS.Ws(s.twb,p))); lab(X(twe)+7,Y(Math.min(PS.W_wb(twe,s.twb,p),M.Wmax))+15,'WB '+F(s.twb,1),'start');
    var S; if(s.h>=M.h1&&s.h<=M.h2) S=M.hPt(s.h); else if(s.h>M.h2){ var tt=(s.h-2501*M.Wmax)/(1.006+1.86*M.Wmax); S=[X(tt),M.T]; } else { S=[M.L,Y(Math.min(wH(s.h,M.t0),M.Wmax))]; }
    var hp=[], tS=M.Tx(S[0]); for(i=0;i<=24;i++){ var t2=s.t+(tS-s.t)*i/24; hp.push([X(t2),Y(wH(s.h,t2))]); } pl(hp); dot(S[0],S[1]);
    if(s.h>=M.h1&&s.h<=M.h2) lab(S[0]-M.nx*18,S[1]-M.ny*18+4,'h '+F(s.h,1),'middle'); else lab(S[0]+4,S[1]+14,'h '+F(s.h,1),'start');
    var vp=[]; for(i=0;i<=40;i++){ var t3=M.t0+(M.t1-M.t0)*i/40, w3=wV(s.v,t3,p); if(w3>=M.W0&&w3<=Math.min(M.Wmax,PS.Ws(t3,p))) vp.push([X(t3),Y(w3)]); }
    if(vp.length>1) out.push('<path d="'+vp.map(function(q,j){return (j?'L':'M')+q[0].toFixed(1)+' '+q[1].toFixed(1);}).join(' ')+'" fill="none" stroke="#1e9e5a" stroke-width="1.4" stroke-dasharray="2 2"/>');
    lab(x+8,y+16,'RH '+F(s.rh,1)+' % · v '+F(s.v,3)+' m³/kg');
  }

  /* ชี้เมาส์อ่านค่า / คลิกเลือกจุด — opt: {map:()=>map, hover:()=>bool, click:(state,ev)=>{}} */
  function bind(svg,tip,opt){
    if(!svg) return; opt=opt||{};
    function at(ev){ var r=svg.getBoundingClientRect(), M=opt.map&&opt.map(); var sx=(ev.clientX-r.left)/r.width*C.W, sy=(ev.clientY-r.top)/r.height*C.H;
      if(!M||sx<M.L||sx>M.R||sy<M.T||sy>M.B) return null; var t=M.Tx(sx), w=Math.min(Math.max(M.Wy(sy),0),P_().Ws(t,M.p)); return {t:t,w:w,p:M.p,cx:ev.clientX-r.left,cy:ev.clientY-r.top}; }
    svg.onmousemove=function(ev){ if(!tip) return; if(opt.hover&&!opt.hover()){ tip.style.display='none'; return; } var a=at(ev); if(!a){ tip.style.display='none'; return; }
      var s=P_().state(a.t,a.w,a.p); tip.style.display='block'; tip.style.left=(a.cx+14)+'px'; tip.style.top=(a.cy+10)+'px';
      tip.textContent='DB '+F(s.t,1)+' °C   WB '+F(s.twb,1)+' °C\nRH '+F(s.rh,1)+' %   DP '+F(s.tdp,1)+' °C\nW  '+F(s.W*1000,2)+' g/kg   pw '+F(s.pw,3)+' kPa\nh  '+F(s.h,2)+' kJ/kg   v '+F(s.v,4)+' m³/kg'; };
    svg.onmouseleave=function(){ if(tip) tip.style.display='none'; };
    svg.onclick=function(ev){ if(!opt.click) return; var a=at(ev); if(!a) return; opt.click(P_().state(a.t,a.w,a.p),ev,a); };
  }

  /* ส่งออก */
  function svgString(svg){ var cl=svg.cloneNode(true); cl.setAttribute('xmlns','http://www.w3.org/2000/svg'); cl.setAttribute('width',C.W); cl.setAttribute('height',C.H);
    cl.setAttribute('font-family','"IBM Plex Sans Thai", Sarabun, Tahoma, sans-serif'); return new XMLSerializer().serializeToString(cl); }
  function dl(b,name){ var a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=name; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },1500); }
  function downloadSVG(svg,name){ dl(new Blob([svgString(svg)],{type:'image/svg+xml'}),name); }
  function downloadPNG(svg,name,k){ k=k||3; var img=new Image(); img.onload=function(){ var c=document.createElement('canvas'); c.width=C.W*k; c.height=C.H*k; var g=c.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0,0,c.width,c.height); g.drawImage(img,0,0,c.width,c.height); c.toBlob(function(b){ dl(b,name); }); };
    img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svgString(svg)); }
  function rangeFor(pts){                                             // เลือกช่วงมาตรฐานที่ครอบทุกจุด
    var tmin=1e9,tmax=-1e9,wmax=0; (pts||[]).forEach(function(q){ if(!q||!isFinite(q.t)) return; tmin=Math.min(tmin,q.t); tmax=Math.max(tmax,q.t); wmax=Math.max(wmax,q.W||0); });
    for(var i=0;i<RANGES.length;i++){ var r=RANGES[i][0].split(',').map(Number); if(i===2) continue; if(tmin>=r[0]+0.5&&tmax<=r[1]-0.5&&wmax<=r[2]*0.97) return RANGES[i][0]; }
    if(tmin>=-9.5&&tmax<=39.5&&wmax<=0.024) return RANGES[2][0];
    return RANGES[3][0];
  }
  /* แผงสำเร็จรูปสำหรับเครื่องมืออื่น: แถบเครื่องมือ (เส้นนำสายตา · เส้นละเอียด · PNG · SVG) + แผนภูมิ + กล่องค่าตามเมาส์
     var P=TE_PSYCHART.panel(divElement,{id:'psyX',file:'ชื่อไฟล์',note:['ไทย','English']}); P.update({p,points,lines,guides,range?}) */
  var NPANEL=0;
  function panel(el,cfg){
    if(!el) return null; cfg=cfg||{}; var id=cfg.id||('tepsy'+(++NPANEL)), last=null, map=null;
    var BTN='border:1px solid #cbd5e1;background:#fff;border-radius:8px;padding:6px 12px;cursor:pointer;font:inherit;font-size:.84rem';
    el.innerHTML='<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:0 0 8px">'+
      '<label style="display:inline-flex;gap:5px;align-items:center;font-size:.85rem;cursor:pointer"><input type="checkbox" id="'+id+'_g" checked style="width:auto"><span id="'+id+'_lg"></span></label>'+
      '<label style="display:inline-flex;gap:5px;align-items:center;font-size:.85rem;cursor:pointer"><input type="checkbox" id="'+id+'_f" checked style="width:auto"><span id="'+id+'_lf"></span></label>'+
      '<button type="button" id="'+id+'_png" style="'+BTN+'"></button><button type="button" id="'+id+'_svg" style="'+BTN+'"></button></div>'+
      '<div style="position:relative;overflow-x:auto;background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:4px">'+
      '<svg id="'+id+'" viewBox="0 0 1120 790" preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;min-width:760px;height:auto;font-family:\'IBM Plex Sans Thai\',Sarabun,sans-serif"></svg>'+
      '<div id="'+id+'_tip" style="position:absolute;pointer-events:none;background:rgba(15,42,74,.94);color:#fff;font-size:.74rem;padding:6px 9px;border-radius:7px;display:none;white-space:pre;line-height:1.45;z-index:5"></div></div>'+
      '<div id="'+id+'_n" style="font-size:.8rem;color:#64748b;margin-top:6px;line-height:1.5"></div>';
    var $i=function(s){ return document.getElementById(id+s); }, svg=document.getElementById(id);
    function labels(){ $i('_lg').textContent=L_('เส้นนำสายตาไปทุกแกน','Guide lines to every scale'); $i('_lf').textContent=L_('เส้นละเอียด','Fine grid');
      $i('_png').textContent=L_('🖼 บันทึก PNG','🖼 Save PNG'); $i('_svg').textContent=L_('📐 บันทึก SVG','📐 Save SVG');
      var nt=cfg.note||['ชี้เมาส์บนแผนภูมิเพื่ออ่านค่า · แผนภูมิครบทุกสเกลแบบเดียวกับเครื่องมือ Psychrometric Chart (ASHRAE, Hyland–Wexler) · บันทึก PNG/SVG ไปใช้ในรายงานหรือการสอน','Hover over the chart to read values · same full-scale chart as the Psychrometric Chart tool (ASHRAE, Hyland–Wexler) · save PNG/SVG for reports or teaching'];
      $i('_n').textContent=L_(nt[0],nt[1]); }
    function draw(){ if(!last) return; var o={}; for(var k in last) o[k]=last[k];
      if(!$i('_g').checked) o.guides=[]; o.fine=$i('_f').checked;
      if(!o.range){ var all=(o.points||[]).slice(); (o.lines||[]).forEach(function(l){ if(l&&l.a) all.push(l.a); if(l&&l.b) all.push(l.b); }); o.range=rangeFor(all).split(',').map(Number); }
      map=render(svg,o); bind(svg,$i('_tip'),{map:function(){return map;}}); }
    labels();
    $i('_g').onchange=draw; $i('_f').onchange=draw;
    $i('_png').onclick=function(){ downloadPNG(svg,(cfg.file||'Psychrometric_Chart')+'_'+new Date().toISOString().slice(0,10)+'.png',3); };
    $i('_svg').onclick=function(){ downloadSVG(svg,(cfg.file||'Psychrometric_Chart')+'_'+new Date().toISOString().slice(0,10)+'.svg'); };
    document.addEventListener('te-lang',function(){ labels(); draw(); });
    return {update:function(o){ last=o; draw(); },svg:svg,redraw:draw};
  }
  return {_ver:'TE_PSYCHART r1-2569',panel:panel,C:C,CPM:CPM,HG:HG,RANGES:RANGES,render:render,bind:bind,shfSlope:shfSlope,svgString:svgString,downloadSVG:downloadSVG,downloadPNG:downloadPNG,rangeFor:rangeFor,tSatW:tSatW,wH:wH,wV:wV};
})();
if(typeof window!=='undefined') window.TE_PSYCHART=TE_PSYCHART;
