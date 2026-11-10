/* te-scene-en.js — ภาษาอังกฤษของชั้น UI กลาง (TE_HELP ⓘ 60 คีย์ + ปุ่ม first-run/ทัวร์) · r1 (5 พ.ย. 2569)
   ข้อความ EN แปลจากฉบับที่ผ่านการทวน Drive+Internet แล้ว (ผลตรวจ Rev01 + 5 ข้อชี้ขาดของ อ.หนึ่ง)
   โหลดอัตโนมัติจาก te-scene.js เมื่อภาษาเป็น en · ไม่มีสูตรคำนวณ */
(function(){
if(typeof window==='undefined')return;
window.TE_HELP_EN={
 o2:{t:'Flue-gas O₂ (%)',w:'At the flue outlet before the economizer, with a flue-gas analyzer',n:'Solid fuel 4–8 % · oil 3–5 % · gas 2–4 %',f:'Use 6 % (solid fuel) and flag it as an assumption'},
 co:{t:'Flue-gas CO (ppm)',w:'Same point as O₂, measured together',n:'Gas/oil < 200 ppm · biomass practical target ≤ 400–500 ppm (field data)',f:'Gas/oil use 0–50 · biomass use 200–400'},
 tg:{t:'Flue-gas temperature Tg (°C)',w:'At the stack, after the last heat-recovery device',n:'150–250 °C · above 250 → consider an economizer',f:'Read the stack gauge or DCS'},
 ta:{t:'Combustion air temperature Ta (°C)',w:'At the combustion-air fan inlet',n:'30–35 °C in Thailand',f:'Use 32 °C'},
 tamb:{t:'Ambient temperature (°C)',w:'Near the equipment, in shade',n:'30–35 °C',f:'Use 32 °C'},
 steamP:{t:'Steam pressure (bar g)',w:'Gauge at the header or boiler front',n:'Per rating, e.g. 8–10 bar g',f:'Read the boiler front gauge'},
 steamT:{t:'Steam temperature (°C)',w:'Probe on the steam outlet (superheated steam only)',n:'Saturated steam: leave blank, computed from pressure',f:'Leave blank for saturated steam'},
 ws:{t:'Steam output (t/h)',w:'Steam meter, or estimate from feedwater',n:'40–90 % of rating',f:'Production hours × average load from the boiler log'},
 fw:{t:'Feedwater temperature (°C)',w:'Probe at the feed tank or economizer inlet',n:'With condensate return 60–90 °C (feed tank ≥ 85 °C) · without 30–35 °C',f:'Pressurised deaerator 105 °C · open tank 85 °C'},
 fuelF:{t:'Fuel firing rate (kg/h)',w:'Feeder scale, loader trips, or monthly purchases ÷ running hours',n:'—',f:'Monthly purchases ÷ running hours'},
 moist:{t:'Fuel moisture M (%)',w:'Oven-dry a sample or use supplier data',n:'Wood chips 35–50 · palm shell 15–25 · rice husk 8–12',f:'Use the typical value for the fuel type from the library'},
 hrs:{t:'Operating hours (h/yr)',w:'Run log or shift pattern',n:'1 shift ≈ 2,000 · 2 shifts ≈ 4,000 · 24 h ≈ 8,000',f:'Use 8,000 for a 24-hour plant'},
 priceE:{t:'Electricity price (THB/kWh)',w:'Utility bill: average = amount paid ÷ kWh',n:'3.5–4.5 THB/kWh',f:'Use 4.0 THB/kWh'},
 priceF:{t:'Fuel price (THB/kg)',w:'Delivery note or purchase contract',n:'Estimate Nov 2026: tree roots 1.0–1.3 · wood chips 1.5–2.0 · palm shell 2.5–4 · wood pellet 3.5–4.0 · coal 6.0–6.5 THB/kg',f:'Use actual delivery notes — prices vary by season/region'},
 kw:{t:'Electric power (kW)',w:'Power meter at the MCC, or the energy meter',n:'—',f:'√3 × V(line-line) × A × PF ÷ 1000 if only an ammeter is available'},
 pf:{t:'Power factor',w:'Utility bill or power meter',n:'> 0.85 avoids penalty (PEA charges 56.07 THB/kvar on peak kvar above 61.97 % of peak kW)',f:'Check the kvar line on the bill'},
 thd:{t:'THD (%)',w:'Power-quality analyzer at the main bus',n:'PCC 1–69 kV: THDv < 5 % (LV ≤ 1 kV: 8 %) · current as TDD by Isc/IL, typically 5–15 %',f:'Must be measured — do not assume'},
 flow:{t:'Flow rate (m³/h)',w:'Flow meter or ultrasonic clamp-on',n:'—',f:'Pump rating × valve opening % (rough)'},
 head:{t:'Pump head (m)',w:'Discharge–suction gauges: ΔP(bar) × 10.2',n:'—',f:'Nameplate design-point head'},
 dt:{t:'Chilled-water ΔT (°C)',w:'Return − supply temperature at the chiller',n:'Design 5–7 °C · below 3 = low-ΔT syndrome',f:'Strap-on probes (insulate over them)'},
 kwrt:{t:'kW/RT',w:'Chiller power ÷ actual refrigeration tons',n:'New water-cooled centrifugal 0.50–0.60 · above 0.8 investigate · air-cooled uses its own criterion ≈ 1.0–1.2',f:'Compute from measured kW and Q'},
 appr:{t:'Cooling-tower approach (°C)',w:'Cold-water outlet − ambient wet-bulb',n:'3–5 °C · above 7 = degraded tower',f:'Measure wet-bulb with a sling psychrometer'},
 range:{t:'Cooling-tower range (°C)',w:'Water in − water out',n:'4–6 °C depending on load',f:'—'},
 pdisc:{t:'Discharge pressure (bar g)',w:'Header gauge after the receiver',n:'6–7 bar g · every 1 bar reduced ≈ 7 % saving',f:'Read the compressor gauge'},
 pdp:{t:'Pressure dew point (°C)',w:'Dew-point meter after the dryer',n:'Refrigerated 3–10 °C · desiccant −20 to −40',f:'Use the dryer spec'},
 leak:{t:'Compressed-air leakage (%)',w:'Load/unload test during shutdown: % leak = T_load ÷ (T_load + T_unload)',n:'Well maintained < 10 % · unmanaged 20–30 % (US DOE)',f:'Run a 30-minute test on a non-production day'},
 effm:{t:'Motor efficiency (%)',w:'Nameplate or IE class table',n:'IEC 60034-30-1 (4-pole): 22 kW IE1 ≈ 90 · IE3 ≈ 93 % · 55 kW IE1 ≈ 92.1 · IE3 ≈ 94.6 %',f:'Use the IE table by size and vintage'},
 load:{t:'Load factor (%)',w:'Measured kW ÷ rated kW',n:'Motors should run 60–90 %',f:'Measured amps vs rated (rough)'},
 condRet:{t:'Condensate return (%)',w:'Hot water returned to the feed tank ÷ total feedwater',n:'Should exceed 60 % where not contaminated',f:'Estimate from points piped back'},
 blow:{t:'Blowdown (%)',w:'From boiler/feed TDS or valve-open time',n:'3–8 %',f:'From TDS: %BD = TDSfw ÷ (TDSb − TDSfw) × 100'},
 orif:{t:'Steam-trap orifice (mm)',w:'Trap spec or manufacturer table',n:'Typical plant traps 3–6 mm',f:'Use 3 mm if unknown (conservative)'},
 u:{t:'U-value (W/m²K)',w:'Back-calculated from measured Q, area and LMTD',n:'More than 20 % below clean → clean it',f:'Use the commissioning value as baseline'},
 copN:{t:'Refrigeration system COP',w:'Cooling delivered (kW) ÷ electric input (kW)',n:'Industrial NH₃ 2.5–4.5 depending on temperatures',f:'Measure kW and estimate Q from the load'},
 wob:{t:'Wobbe Index',w:'From the gas composition (CoA)',n:'±5 % of the burner design value',f:'Ask the gas supplier for the CoA'},
 lrad:{t:'Shell loss Lrad (%)',w:'Size-based reference (ABMA) or measured surface temperature',n:'~10 t/h boiler ≈ 0.8–2 % (higher at low load · BS 845 ≤ 1 % at full load)',f:'Use 1–1.5 % and mark as "reference value"'},
 cref:{t:'Carbon in ash (%)',w:'Ash sample to lab (LOI)',n:'Unburnt fuel in ash should not exceed 5 % (Triple E criterion) · FB typically 1–5 % · grates up to 15 % = tuning opportunity',f:'Use 5 % and note it'},
 cap:{t:'Investment (THB)',w:'Quotation or estimate',n:'—',f:'Enter a rough estimate and add a note'},
 life:{t:'Measure life (years)',w:'Life of the main equipment in the measure',n:'Insulation 5–10 · VSD 10 · burner 10–15',f:'Use 10 years'},
 accCap:{t:'Continuous boiler output (kg/h)',w:'The rate the boiler can actually sustain, from the run log',n:'Often 5–15 % below nameplate MCR',f:'Use 85–90 % of MCR'},
 accDt:{t:'Data interval (min/point)',w:'Time between rows in the pasted log',n:'1 min is good · no coarser than 5 min',f:'Check the first two timestamps'},
 accFill:{t:'Water fill fraction (%)',w:'Accumulator design value at full charge',n:'Full charge 75–90 % (cycle starts ~50 %) — the rest is steam space',f:'Use 80 % (full charge)'},
 cod:{t:'Wastewater COD (mg/L)',w:'Lab results of influent/effluent',n:'Starch plants 10,000–25,000 · pig farms (flush) 5,000–20,000 (dry scraping is higher)',f:'Use the latest monthly lab result'},
 pipe:{t:'Main pipe (length/size)',w:'Measured along the real route from compressor room to the far end',n:'Pipe only ≤ 0.1 bar drop (incl. dryer/filter: ≤ 10 % of discharge pressure)',f:'Estimate from the plant layout'},
 pneed:{t:'Minimum pressure at point of use (bar g)',w:'Gauge at the farthest/most critical user at full load',n:'Mostly 5.5–6.5 bar g — header set above this is "artificial demand"',f:'Ask which machine needs the highest pressure'},
 recv:{t:'Total receiver volume (litres)',w:'Sum of all receivers (vessel nameplates)',n:'Rule of thumb 10–15 L per FAD 1 l/s (≈ 170–250 L per m³/min) — load/unload needs more than VSD',f:'Add up all vessel nameplates'},
 hr:{t:'Heat rate (kJ/kWh)',w:'Fuel energy in ÷ electricity out (state HHV/LHV basis consistently)',n:'Simple-cycle GT 8,500–11,500 · CCGT 6,000–7,500 kJ/kWh (LHV)',f:'Gas meter × HHV ÷ MWh'},
 alife:{t:'Analysis period (years)',w:'Horizon used for NPV of every measure',n:'10 years is the reporting standard',f:'Use 10 years'},
 rate:{t:'Discount rate (%)',w:'Company financial policy (WACC) or DEDE criterion',n:'Typically 6–10 % — Thai major-bank MLR Nov 2026 ≈ 6.2–6.5 %',f:'Use 8 % = MLR + project risk premium ~1.5–2 %'},
 iecls:{t:'Efficiency class (IE)',w:'Motor nameplate, or infer from purchase year',n:'Thailand has no mandatory minimum (TIS IE labelling is voluntary) · EU mandated IE3 from 2015 → older imports often IE1–IE2',f:'Unlabelled old motor: use IE1'},
 meth:{t:'Load estimation method',w:'Pick by instrument: kW meter best > amps > speed (slip)',n:'—',f:'Clamp ammeter only → current method'},
 nh3evap:{t:'Evaporating temperature (°C)',w:'Suction pressure gauge → NH₃ saturation table, or DCS',n:'Cold rooms −10 to −35 °C by product',f:'Convert suction pressure via the saturation table'},
 nh3cond:{t:'Condensing temperature (°C)',w:'Discharge pressure gauge → saturation table',n:'≈ cooling-water outlet +3–5 °C · each 1 °C lower ≈ −2 to −3 % power',f:'Convert discharge pressure'},
 demand:{t:'Demand charge (THB/kW)',w:'Utility bill, demand charge line (TOU: on-peak)',n:'PEA TOU: ≥ 69 kV = 74.14 · 22–33 kV = 132.93 · < 22 kV = 210.00 THB/kW',f:'Most plants at 22–33 kV use 132.93 — large plants at ≥ 69 kV use 74.14'},
 efco2:{t:'Fuel emission factor (kgCO₂/GJ)',w:'TGO EF table by fuel type',n:'NG 56.1 · fuel oil 77.4 · bituminous coal 94.6 · sub-bituminous 96.1 · lignite 101 · biomass reported separately as biogenic',f:'Blank = CO₂ not computed'},
 fgj:{t:'Fuel price (THB/GJ)',w:'THB/kg ÷ HHV (MJ/kg) × 1000',n:'Estimate Nov 2026: tree roots ~105–135 · wood chips ~150–200 · pellet ~200–230 · coal ~230–270 · NG 300–450 THB/GJ',f:'THB/ton ÷ actual HHV of that lot'},
 tdh:{t:'TDH (m)',w:'Discharge gauge × 10.2 + gauge elevation − suction head',n:'—',f:'Read both pump gauges during normal operation'},
 etaB:{t:'Boiler efficiency (HHV basis)',w:'From card TH-BLR-01/02 or a BS 845 test (convert LHV → HHV first)',n:'Biomass 70–82 % · gas 80–86 % on HHV (88–93 % on LHV)',f:'Use 80 % and note it'},
 fcost:{t:'Fuel price (THB/GJ, HHV)',w:'THB/kg ÷ HHV (MJ/kg) × 1000',n:'Nov 2026: palm mix ~55 · tree roots ~105–135 · wood chips ~150–200 · pellet ~200–230 · coal ~230–270 · NG 300–450 THB/GJ',f:'Use the latest delivery note'},
 scost:{t:'Steam cost (THB/ton)',w:'Fuel cost ÷ boiler efficiency, or the energy accountant\'s figure',n:'Biomass 400–700 · gas 900–1,400 THB/ton',f:'Fuel THB/GJ × (2.3–2.7 GJ per ton steam, by feedwater temperature) ÷ η'},
 tcond:{t:'Condensate temperature (°C)',w:'IR or contact thermometer on the pipe before the trap',n:'Near saturation of upstream pressure · much cooler = sub-cooled',f:'Enter 0 to assume saturation'},
 eabs:{t:'Absorption input (kW thermal)',w:'Steam: ṁ × h_fg ÷ 3600 · hot water: ṁ × cp × ΔT ÷ 3600',n:'Thermal COP single-effect 0.6–0.75 · double-effect 1.0–1.3',f:'From the steam rate supplied to the machine'}
};
window.TE_SCENE_EN={
 where:'Where to measure:',typical:'Typical:',nodata:'If no data:',helpTitle:'Explanation',
 frTitle:'First time here?',frSub:'Run the sample to see the full flow first, then replace it with your plant data',
 demo:'▶ See a sample result',tour:'✍ Step-by-step tour',open:'📂 Open job file',hide:'Hide',
 chip:'Guide',skip:'Skip',next:'Next ›',done:'Done ✓'
};
})();
/* ═════ [EN r2 · 7 พ.ย. 2569] ⓘ ชุดใหม่ที่ อ.หนึ่ง ยืนยันตารางทวน 132 รายการแล้ว + คีย์ stm_* + ตัวอย่างการกรอก ═════ */
(function(){
if(typeof window==='undefined'||!window.TE_HELP_EN)return;
var H=window.TE_HELP_EN;
function put(o){for(var k in o)H[k]=o[k];}
/* ── TH-CAS: แท็บ 1 / ทะเบียน / โปรไฟล์ ── */
put({
 tAmb:{t:'Compressor inlet air temperature (°C)',w:'At the compressor air intake — not outdoors; closed compressor rooms run much hotter',n:'Thai compressor rooms 35–42 °C · inlet 3 °C hotter ≈ FAD down ~1 %',f:'Outdoor temperature + 5 °C, flagged as an estimate'},
 rhAmb:{t:'Inlet air relative humidity (%)',w:'Hygrometer at the air intake, or the nearest weather station on the measurement day',n:'Thailand 65–80 % · drives condensate and dryer load',f:'70 %'},
 pAtm:{t:'Atmospheric pressure (bar a)',w:'Barometer, or from site altitude (≈ −0.012 bar per 100 m)',n:'Sea level 1.013 · Chiang Mai (310 m) ≈ 0.977',f:'1.013 — used for FAD ↔ Nm³; a wrong value skews every standard-basis figure'},
 efKey:{t:'Grid emission factor (TGO)',w:'Latest TGO emission-factor table',n:'Current grid mix ≈ 0.4750 kgCO₂e/kWh',f:'Use the tool default and state the table year in the report'},
 dataStat:{t:'Data status',w:'State what this report stands on — measured / representative period / design values',n:'An audit should be "measured", at least for kW and pressure',f:'Choose "design" and record the limitation in tab 8'},
 cKwRated:{t:'Motor kW (nameplate)',w:'Motor nameplate — shaft output, not electrical input',n:'Measured full-load input is usually 5–12 % above nameplate (motor + fan losses)',f:'Use the nameplate and leave "measured kW" blank'},
 cFad:{t:'Nameplate FAD (m³/min)',w:'Catalogue/ISO 1217 test sheet at rated pressure — state the reference basis',n:'Oil-flooded screw at 7.5 bar ≈ 0.14–0.17 m³/min per kW',f:'Run a pump-up test in tab 2A and send the result back'},
 cPRated:{t:'Rated pressure (bar g)',w:'Pressure at which the FAD above is guaranteed',n:'Standard models 7.5 or 8.5 bar g',f:'Use the system set pressure'},
 cKwFull:{t:'Measured full-load kW',w:'3-phase power meter on the compressor supply while loaded at working pressure — never V×I×√3 without PF',n:'5–12 % above nameplate kW',f:'Leave blank; nameplate kW is used and tagged [design]'},
 cUnload:{t:'Unload kW (% of full)',w:'kW while running unloaded (inlet closed) ÷ full-load kW',n:'Load/unload screw 25–35 % · the higher it is, the more is wasted at low load',f:'30 % for oil-flooded screw'},
 cLoadFrac:{t:'Load-time fraction (0–1)',w:'Loaded hours ÷ running hours from the two hour meters, or time load/unload for 10–15 min',n:'Base machine 0.8–1.0 · trim 0.2–0.5 · if every machine is ~0.5, too many machines are running',f:'Count load/unload cycles and the time in one cycle'},
 cRunHrs:{t:'Running hours per year',w:'Difference of two hour-meter readings ÷ days × 365',n:'Base machine ≈ system hours · standby 0–500',f:'Use the system operating hours in tab 1'},
 cSeq:{t:'Sequencing order',w:'Order in which the controller starts machines — 1 is the base machine, first on and longest running',n:'The last in sequence should be the smallest or a VSD to take the trim load',f:'Order by size, largest first'},
 cCtrl:{t:'Capacity control method',w:'Check the controller, or watch how kW responds when air demand drops',n:'Load/Unload: unload 25–35 % · Modulation: ~70 % at zero flow (worst) · VSD: near-linear +10–15 % at low speed · Centrifugal IGV: 75–100 % then blow-off',f:'If kW barely falls as demand falls = modulation'},
 prof24:{t:'24-hour air demand profile',w:'Flow meter or data logger ≥ 24 h (ISO 11011) · without a meter convert hourly kW: LF = (kW − kW_unload)/(kW_full − kW_unload)',n:'Full production 90–100 · lunch break 50–65 · non-production 25–40 — the non-production figure is leakage + unclosed air users',f:'Estimate from the production schedule, then check the 24-cell average against the registry load fractions'},
 profMode:{t:'Load calculation method',w:'Choose per-machine load fractions or distribution along the 24-h profile',n:'Profile mode is needed to assess sequencer/VSD measures — their savings come from low-load hours',f:'Start with load fractions; switch when hourly data is available'},
 dsPick:{t:'Pick a model from data sheets',w:'Manufacturer CAGI/PNEUROP data sheets (public)',n:'Sheet values are inlet acfm per ISO 1217 — convert the basis before comparing with a flow meter',f:'Enter fields manually from the catalogue'},
 spBasis:{t:'Basis of the measured flow',w:'Read the unit on the meter or report and match it',n:'FAD = actual inlet · Nm³ 0 °C · Sm³ 15 °C · ANR 20 °C/65 % · SCFM has several definitions — specify',f:'Ask whoever measured — a wrong basis can be off by up to 8 %'},
 lgFile:{t:'Logger data file',w:'CSV from a power/flow logger recording continuously ≥ 24 h per ISO 11011',n:'1–5 min interval, at least one working day and one non-working day',f:'Paste data from Excel in the box below instead'},
 lgLeak:{t:'Leak-test window (no air use)',w:'A period with all machines off but air still supplied, e.g. a break or after hours',n:'30–60 min is enough · all air produced in this window is leakage',f:'Leave blank and use a leak method in tab 3'}
});
})();
(function(){
if(typeof window==='undefined'||!window.TE_HELP_EN)return;
var H=window.TE_HELP_EN;function put(o){for(var k in o)H[k]=o[k];}
/* ── TH-CAS: 2A ISO 1217 / 2B field measurement ── */
put({
 aKind:{t:'Test type',w:'Fixed speed → Annex C (pump-up) · VSD → Annex E (weighted multi-point load)',n:'A VSD machine tested at a single point does not meet the standard',f:'Fixed speed'},
 aGFad:{t:'Guaranteed FAD (m³/min)',w:'Quotation / contract / manufacturer test certificate at the agreed pressure',n:'Used as the pass/fail benchmark together with the acceptance tolerance',f:'Use the catalogue value and state its source in the report'},
 aGSec:{t:'Guaranteed SEC (kW per m³/min)',w:'Data sheet of that model, corrected to reference conditions 20 °C, 1 bar',n:'Oil-flooded screw ≈ 6.0–6.6 at 7 bar g · ≈ 6.8–7.4 at 8.5 bar g',f:'Nameplate kW ÷ nameplate FAD, tagged as a catalogue value'},
 aV:{t:'System volume V (m³)',w:'Receiver volume from the vessel certificate (not outside dimensions) + pipe volume between compressor and receiver',n:'An error in V goes one-to-one into FAD — the largest single source of error',f:'Cylinder + heads volume, with a higher uncertainty'},
 aPs:{t:'Start pressure for timing (bar g)',w:'Start the stopwatch at this gauge reading, after venting the receiver low and closing every air user',n:'Keep ≥ 1 bar below the end pressure so the timing is long enough to be accurate',f:'0.5 bar g'},
 aPe:{t:'End pressure (bar g)',w:'Stop timing at this value — slightly below the machine unload point',n:'Usually the normal working pressure',f:'System set pressure − 0.3 bar'},
 aU:{t:'Instrument uncertainty (%)',w:'Calibration certificate of each instrument (power meter, gauge, stopwatch, thermometer, receiver volume)',n:'Good power meter 0.5–1 % · industrial gauge 1–2.5 % · receiver volume 1–3 %',f:'Keep the default and state in the report that typical class values were used'},
 aTolV:{t:'Acceptance tolerance (%)',w:'ISO 1217 Annex C tolerance table by machine FAD size',n:'Smaller machines are allowed a wider tolerance than large ones',f:'The value written in the purchase contract takes precedence'},
 bKwL:{t:'Loaded power (kW)',w:'3-phase power meter while compressing at working pressure, averaged over ≥ 5 load cycles',n:'Should be close to the measured full-load kW in the tab 2 registry',f:'Nameplate kW × 1.08 as a temporary value'},
 bKwU:{t:'Unloaded power (kW)',w:'Power meter while running without compressing — wait until blow-down has finished before reading',n:'25–35 % of loaded kW for screw machines',f:'0.30 × loaded kW'},
 bLF:{t:'Load factor (0–1)',w:'Fraction of the measured period the machine is loaded',n:'Below 0.5 on a load/unload machine = large unload losses — consider VSD or re-sequencing',f:'Count load/unload cycles over one hour and average'},
 bFu:{t:'fu for SECexp',w:'Standard multiplier on unload power used to make SEC comparable between machines',n:'Load/unload 0.25–0.35 per EIT-CA-001',f:'0.30'},
 bSecSrc:{t:'Source of SECfull',w:'Choose full-load SEC from the measurement in this tab, or enter it from the 2A test result',n:'If an ISO 1217 test exists, use the 2A value — conditions are better controlled',f:'Use the value calculated from this tab'},
 bLeakM:{t:'Leak method',w:'L/U: load fraction during no-production time · pressure decay: stop the compressor and time the pressure drop · manual: from the leak register in tab 3',n:'Pressure decay is more accurate but needs a system stop · L/U can be done during the lunch break',f:'L/U method during the lunch break'},
 bLFnl:{t:'LF during no-demand period (0–1)',w:'Machine load fraction while every production machine is off',n:'This is leakage directly — a well-kept system should be below 0.10',f:'Must be measured — cannot be estimated'},
 bDecay:{t:'Pressure-decay test',w:'Pump up to Pa, stop the compressor, time the drop to Pb with no air use',n:'Drop at least 1 bar so the timing is long enough · result × 1.25 compensates for the falling pressure during the test',f:'Use the L/U method instead'},
 bKwDry:{t:'Dryer and auxiliaries power (kW)',w:'Power meter on the dryer, cooling fans, cooling-water pump and condensate drains',n:'Refrigerated dryer 2–3 % of compressor kW · heatless desiccant loses 10–20 % purge air instead',f:'Dryer nameplate kW'},
 bNcyc:{t:'Load/unload cycles (per hour)',w:'Count load→unload switches in one hour',n:'Should not exceed 6–10 per hour for large motors · more = receiver too small or pressure band too narrow',f:'Calculate from receiver volume and pressure band'},
 bVsdSec:{t:'SECfull of the new VSD',w:'Data sheet of the replacement model at the actual working pressure',n:'≈ 4–8 % better than the old machine at full load, but the real gain is at low load',f:'Old SEC × 0.95 as a conservative estimate'},
 cDp:{t:'Mean pressure reduction from a narrower band (bar)',w:'Compare mean pressure before and after a sequencer — the combined band of several staggered machines is very wide',n:'e.g. 6.8–8.3 down to 6.8–7.2 ≈ 0.9 bar lower mean · each 1 bar ≈ 7 % less power',f:'Read max–min pressure from one day of logger data'},
 cIdle:{t:'Machines not used by the sequencer',w:'Machines that will be stopped completely (not unloaded) after the sequencer is installed',n:'The main gain of a sequencer is cutting the unload power of idling machines',f:'Pick the machine with the lowest load fraction in the registry'},
 cSens:{t:'Energy sensitivity per bar',w:'Polytropic, from pressure ratio and number of stages',n:'≈ 6–8 % per bar for single-stage machines at 7 bar g',f:'7 %/bar, the commonly used value'}
});
/* ── TH-CAS: leaks / demand / receiver / piping / treatment / network ── */
put({
 leakMode:{t:'Leak assessment method',w:'% of demand (rough) · count leaks by size (ultrasonic detector) · load/unload test with no air use (most accurate)',n:'Well-kept system < 10 % · never surveyed often 20–35 %',f:'Load/unload test during the lunch break — takes under half an hour'},
 leakCd:{t:'Leak discharge coefficient C_d',w:'Flow coefficient through the orifice — sharper edges give lower values',n:'0.65 for typical cracks / loose fittings · 0.97 for round, rounded-edge holes',f:'0.65 (conservative)'},
 unregPct:{t:'Share of unregulated use (%)',w:'Survey how many air users have a regulator — unregulated users consume more as supply pressure rises (artificial demand)',n:'Typical plants 40–70 % · each 1 bar of excess pressure ≈ +13 % air at these users',f:'60 %'},
 pDropHdr:{t:'Pressure drop to the farthest user (bar)',w:'Read two gauges at the same time at peak load: compressor room and end of line',n:'Whole system incl. filters and dryer ≤ 10 % of supply pressure · piping alone ≤ 0.1 bar',f:'Calculate from tab 4 or the 4B piping network'},
 pBandH:{t:'Load–unload control band (bar)',w:'Difference between unload and reload pressure — read from the machine settings',n:'0.5–1.0 bar · too narrow = frequent cycling, too wide = high mean pressure and wasted power',f:'1.0 bar'},
 recvEvent:{t:'Large demand event',w:'Machines that draw large bursts of air, e.g. bottle blowing, moulds or large valves — give rate and duration',n:'Used to size the receiver so pressure does not fall far enough to stop the line',f:'Leave blank if the load is steady'},
 recvDelay:{t:'Standby machine response time (s)',w:'Time from start signal until the machine delivers full air',n:'Screw 10–30 s (incl. star-delta and pressure build-up)',f:'20 s'},
 pipeQ:{t:'Peak flow in the main header (m³/min FAD)',w:'Total air through that line in the busiest hour',n:'Main-header velocity ≤ 6–8 m/s (short branches up to 15 m/s)',f:'Sum of FAD of machines running together'},
 pipeLoop:{t:'Piping layout',w:'From drawings or a walk-down — dead end or ring main around the plant',n:'A ring main roughly halves pressure drop at the same pipe size and handles large loads better',f:'Choose dead end (conservative)'},
 dryerPdp:{t:'Target pressure dew point (°C)',w:'Set by the end use and the lowest temperature the piping will see',n:'Indoors +3 °C is enough · outdoor piping or painting/pharma needs −20 to −40 °C',f:'+3 °C for general plants — setting it lower than needed wastes power or purge air'},
 dryerPurge:{t:'Desiccant purge (% of FAD)',w:'From the dryer spec, or measure the air vented during regeneration',n:'Heatless 10–20 % · heated purge 5–8 % · blower purge 2–3 %',f:'15 % for heatless'},
 filtDp:{t:'Total filter + dryer pressure drop (bar)',w:'Gauges before and after the filter/dryer set, read at peak load (not at zero flow)',n:'New elements 0.1–0.2 bar · 0.5–0.7 bar = time to replace · each 0.1 bar compensated ≈ +0.7 % power',f:'0.35 bar for filters at half life'},
 tAfter:{t:'Aftercooler outlet air temperature (°C)',w:'On the pipe leaving the aftercooler, before the receiver',n:'Should be ≤ 10–15 °C above the cooling-air temperature · higher = fouled cooler, water condenses in the piping instead',f:'Compressor-room temperature + 12 °C'},
 drainType:{t:'Condensate drain type',w:'Check the drain under the receiver and traps along the line',n:'Timer drains waste air on every opening · zero-loss (float/electronic) waste none',f:'A regular rhythmic air blast = timer'},
 drainN:{t:'Number of drains × open time / cycle',w:'Count all drains, then read open time (s) and interval (s) from the controller',n:'5 s every 180 s at 10 drains can waste hundreds of thousands of baht a year in a mid-size plant',f:'Time one open–close cycle with a stopwatch'},
 nEps:{t:'Pipe roughness ε (mm)',w:'Choose by pipe material and age seen on site',n:'New steel 0.05 · galvanised steel 0.15 · old rusty steel 0.5 · aluminium/PE 0.0015',f:'Galvanised 0.15 for typical plant piping'},
 nCritDp:{t:'Max allowable ΔP (bar per 100 m)',w:'Design criterion used to flag undersized lines',n:'Main header 0.02–0.03 bar per 100 m · whole system ≤ 0.1 bar',f:'0.03'},
 nCritV:{t:'Max velocity (m/s)',w:'Used with ΔP to limit noise and water carry-over',n:'Main header 6–8 m/s · short branches ≤ 15 m/s',f:'8'}
});
/* ── common keys (te-scene r2b) ── */
put({
 rh:{t:'Relative humidity (%)',w:'Hygrometer at the point of interest, or the nearest weather station on the measurement day',n:'Thailand average 65–80 %',f:'70 %'},
 patm:{t:'Atmospheric pressure (bar a)',w:'Barometer, or from site altitude (≈ −0.012 bar per 100 m)',n:'Sea level 1.013 · Chiang Mai (310 m) ≈ 0.977',f:'1.013'},
 efgrid:{t:'Grid emission factor (kgCO₂e/kWh)',w:'Latest TGO greenhouse-gas emission-factor table',n:'Current Grid Mix ≈ 0.4750 kgCO₂e/kWh',f:'Use the tool default and state the table year in the report'},
 dstat:{t:'Data status',w:'State what this report stands on — measured / representative period / design values',n:'An audit should be "measured", at least for kW and pressure',f:'Choose "design" and write the limitation at the end of the report'},
 fbasis:{t:'Flow reference basis',w:'Check the unit on the meter or report and match it',n:'FAD = actual inlet · Nm³ 0 °C · Sm³ 15 °C · ANR 20 °C/65 % · SCFM has several definitions — specify',f:'Ask whoever measured — a wrong basis can be off by up to 8 %'}
});
})();
(function(){
if(typeof window==='undefined'||!window.TE_HELP_EN)return;
var H=window.TE_HELP_EN;function put(o){for(var k in o)H[k]=o[k];}
/* ── NH3 Refrigeration ── */
put({
 nh3_tevap:{t:'Evaporating temperature T_evap (°C)',w:'Convert suction pressure P₁ (abs) to NH₃ saturation temperature, or read the R-717 scale on the gauge',n:'Cold room −5 to −15 · freezer −30 to −40 · each 1 °C raised ≈ 3–4 % less power'},
 nh3_tcond:{t:'Condensing temperature T_cond (°C)',w:'Convert discharge pressure P₂ (abs) to saturation temperature',n:'Evaporative condenser ≈ wet bulb + 8–12 K (Thailand usually 33–38) · above 40 suggests a fouled condenser, too little air or non-condensables'},
 nh3_sh:{t:'Suction superheat (K)',w:'Suction-line temperature before the compressor − saturation temperature at P₁ (strap-on probe + insulation)',n:'5–10 K · below 3 risks liquid carry-over · too high = expansion valve under-feeding or overload'},
 nh3_sc:{t:'Subcooling after the condenser (K)',w:'Saturation temperature at P₂ − liquid-line temperature after the condenser',n:'2–5 K · near 0 = refrigerant shortage or flash gas in the liquid line'},
 nh3_eta:{t:'Compressor η_isen',w:'Manufacturer spec sheet at the operating pressure ratio, or back-calculated from measured kW',n:'Screw 0.65–0.80 · reciprocating 0.70–0.82 · falls as pressure ratio rises'},
 nh3_p:{t:'Suction / discharge pressure (bar abs)',w:'Gauges on the machine — gauges read bar g, add atmospheric ~1.013 before entering',n:'NH₃: −10 °C ≈ 2.9 bar a · +35 °C ≈ 13.5 bar a'},
 nh3_t2:{t:'Discharge temperature T₂ (°C)',w:'Strap-on probe on the discharge pipe ~15 cm from the machine flange',n:'Single-stage NH₃ usually 90–140 · above 150 endangers the oil — the reason two-stage is needed at low suction'},
 nh3_wcomp:{t:'Electrical input power (kW)',w:'3-phase power meter at the machine MCC panel — not current × voltage × √3 without PF',n:'Compare with nameplate: full load usually 90–105 % of nameplate'},
 nh3_tcw:{t:'Condenser cooling-water in/out temperature (°C)',w:'Thermowell thermometers/gauges on inlet and outlet pipes, read together at steady load',n:'Inlet 28–32 · ΔT 4–6 K · a narrower ΔT = too much water, wasted pumping'},
 nh3_qcw:{t:'Cooling-water flow (kg/s)',w:'Ultrasonic flow meter on a straight run ≥ 10D, or back-calculated from a heat balance',n:'≈ 0.05–0.07 kg/s per kW of refrigeration at ΔT 5 K'},
 nh3_fc:{t:'Target Carnot fraction f_C',w:'Target COP relative to COP_Carnot at the same conditions — used to set an improvement target',n:'Good industrial NH₃ systems 0.45–0.60'},
 nh3_poil:{t:'Oil pressure (bar differential)',w:'Dual gauge on the machine: oil-pump pressure − suction pressure',n:'Per manufacturer spec, usually 2–5 bar · below the limit the machine trips'},
 nh3_vib:{t:'Vibration (mm/s RMS)',w:'Vibration meter on the motor/compressor bearing housings, radial and axial',n:'ISO 10816 large machine, rigid base: good < 2.8 · acceptable < 7.1'},
 nh3_tint:{t:'Two-stage intermediate temperature T_int (°C)',w:'From the intercooler vessel pressure converted to saturation temperature',n:'Optimum when P_int ≈ √(P₁×P₂) — T_int usually −5 to −12 for freezers'},
 nh3_wstage:{t:'Power per stage LP/HP (kW)',w:'Power meter on each machine separately (at least 15 min each at steady load)',n:'LP:HP split usually about 40:60 to 50:50 depending on T_int'}
});
/* ── Chiller Multi ── */
put({
 ch_tchw:{t:'Chilled-water supply/return temperature (°C)',w:'Thermowell thermometers on the machine supply and return pipes, read together at steady load',n:'Supply 6–8 · return 11–13 · design ΔT 5 K — below 3 K is Low ΔT syndrome; continue in the Low ΔT Diagnostic card'},
 ch_tcw:{t:'Condenser-water in/out temperature (°C)',w:'Gauges/probes on condenser inlet and outlet',n:'Inlet 28–32 · ΔT 4–6 K · each 1 °C cooler inlet ≈ 2–3 % less power'},
 ch_power:{t:'Electrical / heat input (kW)',w:'Electric: 3-phase power meter at the machine panel · absorption: steam flow × enthalpy, or hot-water flow × ΔT × 4.186',n:'Versus rating: actual load is usually 40–80 % of rated'},
 ch_flow:{t:'Chilled-water flow (m³/h)',w:'BTU meter / ultrasonic on a straight run ≥ 10D, or read from the balancing valve',n:'Design ≈ 0.62 m³/h per TR at ΔT 5 K (= 2.4 USgpm/TR)'},
 ch_cap:{t:'Rated cooling capacity',w:'Nameplate/catalogue — match the unit to the field (TR or kW; 1 TR = 3.517 kW)',n:'Used for % load and for sequencing'},
 ch_type:{t:'Chiller type',w:'Nameplate — electric (screw/centrifugal/scroll) or absorption (steam/hot water/exhaust gas)',n:'Water-cooled kW/TR: centrifugal 0.55–0.65 · screw 0.60–0.75 · air-cooled 1.0–1.3 · absorption uses thermal COP 0.7 (single) / 1.1–1.3 (double effect)'},
 ch_seqload:{t:'Target total cooling load',w:'Actual building/process load for the period being sequenced — from a main BTU meter or Σ(flow × ΔT × 1.163) of running machines',n:'Running several machines pays off because water-cooled chillers usually have the lowest kW/TR at 50–75 % load'},
 ch_current:{t:'Motor current (A)',w:'Clamp meter, or read from the machine display — used for % load (%RLA)',n:'%RLA 40–90 in normal operation'},
 ch_vib:{t:'Vibration (mm/s RMS)',w:'At the motor/compressor bearings',n:'ISO 10816: good < 2.8 · watch 2.8–7.1'}
});
/* ── Low ΔT / CW Loop / HX ── */
put({
 ldt_pn:{t:'Pump exponent n (P ∝ Qⁿ)',w:'Depends on the pump control — check the panel for a VFD or a throttling valve',n:'VFD on DP ≈ 2.0–2.5 · VFD on speed ≈ 2.5–3.0 · throttling ≈ 1.0–1.5 (small saving)'},
 ldt_bypass:{t:'ΔT at the chiller vs ΔT at the header',w:'Measure two pairs together: chiller in/out and header supply/return',n:'If chiller ΔT is clearly narrower than header ΔT = water short-circuits through the bypass/decoupler without picking up heat'},
 ldt_crw:{t:'Water-side resistance fraction (0–1)',w:'Share of the coil’s total heat-transfer resistance on the water side — used in the ε-NTU model',n:'Typical cooling coils 0.2–0.35'},
 ldt_dp:{t:'DP setpoint and minimum DP (kPa)',w:'Setpoint at the pump controller · minimum DP = value at which the farthest coil valve still gets enough water fully open (step down and watch the valves)',n:'Over-set systems can usually drop 20–40 % · target: the most-open valve sits at about 85–95 %'},
 ldt_dpstat:{t:'Static share of DP (0–1)',w:'Part of DP that does not fall with flow (fixed drop across end valves/coils that must be held)',n:'Systems controlled on remote DP 0.2–0.5'},
 ldt_stage:{t:'Extra chiller started for flow or for load',w:'Compare: current flow ÷ design flow per machine vs actual load ÷ capacity per machine',n:'If % flow hits its ceiling before % load = machines are added for water, not cooling — Low ΔT directly'},
 cwl_lg:{t:'Design L/G (kg water / kg air)',w:'Cooling-tower spec sheet, or design water flow ÷ design fan air flow',n:'Typical towers 0.8–1.5 · too high L/G = too much water, approach widens'},
 cwl_expn:{t:'Tower exponent n (KaV/L ∝ (L/G)⁻ⁿ)',w:'From the tower performance curve (spec sheet), or fitted from measurements at two conditions',n:'0.5–0.7 for typical counterflow towers'},
 cwl_ad:{t:'Evaporative pad / spray effectiveness (%)',w:'Fraction of inlet-air cooling toward wet bulb: (DBT in − DBT after pad)/(DBT in − WBT)',n:'Cellulose pad 70–90 · mist spray 50–70'},
 hx_uclean:{t:'Clean/design U (W/m²·K)',w:'Equipment data sheet, or back-calculated from a measurement right after cleaning (more accurate)',n:'PHE water-water 3,000–5,000 · shell & tube water-water 800–1,500 · with oil/vapour 300–800'},
 hx_rf:{t:'Fouling rate Rf (m²·K/W per 1,000 h)',w:'From history: (1/U_t2 − 1/U_t1) ÷ hours between the two × 1000',n:'Well-treated tower water 0.00002–0.00006 · raw water / lapsed treatment much higher'},
 hx_pen:{t:'Energy penalty (THB/yr per 10 % U drop)',w:'Assess from the system this HX serves, e.g. the chiller must raise T_cond, or extra pumps/machines must run',n:'Example: 500 TR chiller condenser — U down 10 % ≈ T_cond up ~1 °C ≈ 2–3 % more power'},
 hx_cp:{t:'Specific heat capacity (kJ/kg·K)',w:'By fluid — water 4.186 · brine/glycol lower, see tables by concentration',n:'Water 4.186 · EG 30 % ≈ 3.6 · hot oil ≈ 2.0–2.5'}
});
})();
(function(){
if(typeof window==='undefined'||!window.TE_HELP_EN)return;
var H=window.TE_HELP_EN;
var F={nh3_tevap:'Room temperature − 7 K',nh3_tcond:'Wet bulb on the measurement day + 10 K',nh3_sh:'Must be measured — it is a machine-safety indicator and cannot be guessed',nh3_sc:'3 K',nh3_eta:'0.70',nh3_p:'Read the machine gauges and note in the remarks that they are not calibrated',nh3_t2:'Must be measured — valve/oil condition cannot be diagnosed without it',nh3_wcomp:'Measured current ÷ rated current × nameplate kW (rough, tag as estimate)',nh3_tcw:'Read the permanent gauges and note the uncertainty',nh3_qcw:'Back-calculate: Q_cond ÷ (4.186 × water ΔT)',nh3_fc:'0.50',nh3_poil:'Read the gauge on the machine',nh3_vib:'May be left blank — used for trend monitoring, does not affect the energy calculation',nh3_tint:'Use √(P₁×P₂) and convert to temperature',nh3_wstage:'Measure the total and split by each machine’s current (rough)',
ch_tchw:'Read from the machine display and note that it is the machine’s own sensor',ch_tcw:'Use the tower value (tower outlet = chiller inlet)',ch_power:'Electric: measured current ÷ rated current × rated kW (rough)',ch_flow:'Back-calculate from load: Q(kW) ÷ (1.163 × ΔT)',ch_cap:'Look up the model in the manufacturer catalogue',ch_seqload:'Use the average of the working-day peak period',ch_current:'Read from the machine display',ch_vib:'May be left blank — does not affect the calculation',
ldt_pn:'2.4',ldt_bypass:'Must be measured at both points at the same time — two people or loggers',ldt_crw:'0.25',ldt_dp:'Minimum DP ≈ design pressure drop of the farthest coil + valve',ldt_dpstat:'0.3',ldt_stage:'Check % load on the machine display as well',cwl_lg:'1.2',cwl_expn:'0.6',cwl_ad:'70',hx_uclean:'Back-calculate from the first measurement after cleaning and keep it as the permanent baseline',hx_rf:'0.00004, then adjust once two measurements in time are available',hx_pen:'Enter 0 until assessed — the result then covers cleaning cost only',hx_cp:'Water 4.186'};
for(var k in F)if(H[k])H[k].f=F[k];
})();
(function(){
if(typeof window==='undefined'||!window.TE_HELP_EN)return;
var H=window.TE_HELP_EN;function put(o){for(var k in o)H[k]=o[k];}
/* ── MG-PLT / ECM / BLR-02 ── */
put({
 mg_demand:{t:'Demand charge (THB/kW/month)',w:'Electricity bill, demand-charge line under the PEA/MEA TOU/TOD tariff',n:'TOU ≥ 69 kV roughly 74–133 THB/kW depending on class — the actual bill governs',f:'Take it from the latest bill'},
 mg_fuelef:{t:'Fuel emission factor (kgCO₂e/GJ or per unit)',w:'TGO emission-factor table by fuel type',n:'Natural gas ~56 kgCO₂e/GJ · fuel oil ~77 · bituminous coal ~95 · biomass counted separately as biogenic',f:'Pick from the list in the tool and state the table year'},
 mg_rate:{t:'Discount rate (% per year)',w:'Company finance policy (WACC) or the project loan rate',n:'Thai industry usually 7–10 % · cite the source of whatever value is used',f:'8 % = major-bank MLR + project risk premium ~1.5–2 % (default on every card)'},
 mg_life:{t:'Measure life (years)',w:'Technical service life of the equipment invested in',n:'VSD/controls 10 · insulation 5–10 · major machinery 15–20',f:'10'},
 mg_grant:{t:'Grant (% of investment)',w:'That year’s DEDE support-programme announcement (e.g. revolving fund / savings subsidy)',n:'Historically 20–30 % depending on programme terms — check the current year before using',f:'0 until eligibility is confirmed'},
 mg_tax:{t:'Tax incentive (%)',w:'BOI / Revenue Department measures for energy-saving equipment in force in the investment year',n:'Past schemes included an extra 50 % deduction of the investment — terms change with each announcement',f:'0 until eligibility is confirmed'},
 mg_carbon:{t:'Carbon revenue (THB/tCO₂e)',w:'Actual traded price of energy-type T-VER credits from the latest TGO market data',n:'Varies by project type and year — use the latest traded price and state the reference date',f:'0 (not counted) — count it only when registration is actually planned'},
 mg_year:{t:'Plant total annual energy / cost',w:'Sum of 12 monthly electricity bills + 12 months of fuel purchases (same year as the data period)',n:'Used as the base for whole-plant % savings',f:'Use the latest complete 12 months'}
});
/* ── Split AC + VRV/VRF ── */
put({
 ac_plate:{t:'Nameplate ratings',w:'Plate on the condensing unit, or the model catalogue — cooling capacity, power input, EER/SEER/IPLV',n:'Nameplate is at standard test conditions (35 °C); aged or dirty units perform lower',f:'Look up the catalogue from the model on the plate'},
 ac_age:{t:'Unit age (years)',w:'Purchase/installation year from the asset register or the service sticker',n:'Efficiency falls about 1–2 %/yr with regular cleaning · replacement usually pays at 10–15 years',f:'Estimate from refrigerant (R-22 = before ~2012)'},
 ac_vi:{t:'Voltage / current / PF',w:'Clamp meter on the supply cable while the compressor runs (not fan-only)',n:'Inverter units PF 0.9–0.98 · fixed speed 0.8–0.9 — without a PF meter use a wattmeter directly',f:'PF 0.9 with a note'},
 ac_watt:{t:'Directly measured power (W)',w:'Wattmeter/power meter on the supply, averaged over ≥ 10 min of continuous compressor running',n:'More accurate than V×I×PF — use it when available',f:'Use V×I×PF from the three fields above'},
 ac_dbwb:{t:'Return/supply air DB-WB temperature (°C)',w:'Dry/wet-bulb thermometer (or hygrometer reading WB) at the return grille and ~10 cm from the supply outlet',n:'Return ~25–27 DB · supply 8–12 K below return when healthy — narrow ΔT = low charge / blocked coil / too much air',f:'Must be measured — it is the core of the real air-side cooling calculation'},
 ac_cfm:{t:'Air flow (CFM or CMH)',w:'Vane anemometer traversed across the supply grille × grille area (m²) — CMH = m/s × m² × 3600',n:'12,000 BTU unit ≈ 400–450 CFM · far below spec = blocked filter/coil',f:'Model spec air flow × 0.9'},
 ac_sh:{t:'Superheat (K)',w:'Suction-line temperature (strap-on probe + insulation) − saturation temperature from the suction gauge',n:'Fixed orifice 8–12 · TXV/EEV 4–8 · abnormally high = low charge · very low = liquid floodback risk',f:'If it cannot be measured skip the refrigerant-circuit section — do not guess'},
 ac_sc:{t:'Subcooling (K)',w:'Saturation temperature from the discharge gauge − liquid-line temperature',n:'Normal 3–8 · low = low charge · high = overcharge / restriction',f:'If it cannot be measured skip the refrigerant-circuit section'},
 ac_tdis:{t:'T_discharge (°C)',w:'Strap-on probe on the compressor discharge pipe ~10 cm out',n:'Normal 60–90 · above 100 indicates a fault (low charge / dirty condenser)',f:'May be left blank — used for diagnosis, not the energy calculation'},
 ac_pgauge:{t:'Gauge pressure Low/High (bar g)',w:'Manifold gauge on the service valves — connection should be done by an AC technician',n:'R-32 at 35 °C outdoor: Low ~0.9–1.2 MPa · High ~2.4–3.0 MPa (see that refrigerant’s table)',f:'Use pipe temperatures instead (measured outside, no gauges needed)'},
 ac_pipe:{t:'Pipe length / height difference ODU–IDU',w:'Measure along the actual pipe route + height difference between outdoor and indoor units',n:'Long runs / large height differences reduce VRF capacity — beyond 90 m equivalent check the manufacturer derating table',f:'Estimate from drawings + 0.5 m per elbow'},
 ac_load:{t:'Room data for load estimate',w:'Measure the room: W×L×H, glazing area and orientation, occupants, lights/equipment (check watt labels), fresh air',n:'Typical Thai office 600–900 BTU/m² · west-facing glazed rooms can be much higher',f:'Area × 750 BTU/m² as a starting point, then adjust'},
 ac_iplv:{t:'EER by load point (IPLV)',w:'Engineering catalogue of the model (part-load table) — the nameplate usually shows full load only',n:'Inverter units are often more efficient at 50 % than at 100 % — so IPLV exceeds EER',f:'Enter only the points with data; the tool weights them'}
});
/* ── Pump/Fan Curve ── */
put({
 pf_rpm:{t:'Speed (RPM)',w:'Laser tachometer on reflective tape on the shaft, or a stroboscope — do not use motor nameplate speed directly if belt-driven',n:'4-pole ~1,450–1,480 · 2-pole ~2,900–2,960 (slip below synchronous)',f:'Synchronous speed × 0.97 (direct drive) · with belts multiply by the pulley ratio'},
 pf_meff:{t:'Motor efficiency η_motor',w:'Motor nameplate (IE class + %) or IEC 60034-30-1 table by size and poles',n:'IE3 15–90 kW about 92–95 % · drops slightly below 50 % load',f:'0.92 for general industrial motors'},
 pf_ceff:{t:'Transmission efficiency (coupling/belt)',w:'Check the drive type on site',n:'Direct coupling 1.00 · V-belt 0.93–0.96 (lower if old/slack) · timing belt 0.97–0.98',f:'Direct = 1.00 · belt = 0.95'},
 pf_z:{t:'ΔZ static (m)',w:'Height difference between suction and discharge gauge tappings — water-level hose or laser level',n:'Forgetting this correction is the number-one error in pump-head measurement',f:'Tape-measure from gauge centre to gauge centre'},
 pf_rho:{t:'Fluid density ρ (kg/m³)',w:'Water by temperature · air from measured T, P, RH (the card calculates it)',n:'Water 30 °C ≈ 996 · air 35 °C at sea level ≈ 1.146',f:'Water 997 · air: use the weather-based calculation field'},
 pf_static:{t:'ΔP_static at Q = 0',w:'Close the discharge valve briefly (no more than 1–2 min for pumps) and read the pressure — the shutoff head at the top of the curve',n:'Usually 1.15–1.3 × BEP head for typical centrifugal pumps',f:'Use the manufacturer curve at the same speed'},
 pf_ref:{t:'Check point Q_ref / ΔP_ref',w:'Run at actual operating conditions; measure flow (ultrasonic/pitot) and pressure together at 1–2 points',n:'Checks how well the curve built from the catalogue picture (pixel mapping) matches the real machine — should be within ±5 %',f:'At least 1 point is needed to claim the result with confidence'},
 pf_aff:{t:'Affinity laws (speed change / impeller trim)',w:'Enter the BEP at the original speed, then the new speed to be reduced by VFD',n:'Q ∝ N · H ∝ N² · P ∝ N³ — 20 % lower speed ≈ 49 % less power if the system is pure friction · less with a large static head'}
});
})();
(function(){
if(typeof window==='undefined'||!window.TE_HELP_EN)return;
var H=window.TE_HELP_EN;function put(o){for(var k in o)H[k]=o[k];}
/* ── TH-STM-02 (R6) ── */
put({
 stm_etab:{t:'Boiler efficiency % (HHV basis)',w:'This card follows MEASUR, which uses an HHV basis — the familiar Thai values (BS 845 / DEDE) are LHV-based and must be converted first',n:'η(HHV) ≈ η(LHV) × LHV/HHV — natural gas ×0.90 · fuel oil ×0.94 · coal ×0.96 · wet biomass lower',f:'Take the TH-BLR-01 result (LHV basis) and multiply by the factor above',e:'Measured 84 % (LHV, gas) → enter 84 × 0.90 ≈ 76'},
 stm_cfuel:{t:'Fuel price (THB/GJ, HHV basis)',w:'Actual purchase price ÷ higher heating value (HHV) of that fuel',n:'Wood chips 1,700 THB/t ÷ ~10.5 GJ/t ≈ 160 THB/GJ · gas etc. the same way',f:'Use the company’s central price estimate and state the source',e:'Coal 6,200 THB/t, HHV 25 GJ/t → enter 248'},
 stm_cwater:{t:'Make-up water cost (THB/m³)',w:'Raw water + treatment (softener/RO + chemicals) per cubic metre',n:'Mains + softener ~25–45 · with RO ~45–80',f:'35'},
 stm_bd:{t:'Blowdown rate (%)',w:'From TDS ratio: feedwater ÷ (blowdown − feedwater) × 100, or from a blowdown water meter',n:'Good water control 2–5 % · above 8 % check the water-treatment system',f:'4 %'},
 stm_tmu:{t:'Make-up water temperature (°C)',w:'Thermometer at the make-up tank or the pipe into the feed tank',n:'Thai well/mains water 27–32',f:'30'},
 stm_tcr:{t:'Condensate return temperature (°C)',w:'Measure at the condensate receiver (not at the steam trap)',n:'Open systems 70–90 · below 60 = long return route / large open-tank losses',f:'80'},
 stm_pdea:{t:'Deaerator pressure (bar a)',w:'Gauge on the deaerator vessel (+1.013 if the gauge reads bar g)',n:'1.1–1.5 bar a (102–111 °C)',f:'1.15'},
 stm_vent:{t:'Deaerator vent rate (%)',w:'Share of steam vented through the deaerator vent — judge from the plume at the vent',n:'0.05–0.2 % of steam entering the deaerator · a strong plume all the time = over-set',f:'0.1'},
 stm_ei:{t:'Turbine isentropic η (%)',w:'Manufacturer test/guarantee, or back-calculated from measured kW and inlet/outlet steam conditions',n:'Small back-pressure 50–70 · large condensing 75–85',f:'65 for back-pressure · 80 for condensing, with a note'},
 stm_effuel:{t:'Fuel EF (kgCO₂/GJ, HHV basis)',w:'Pick the fuel from the list beside the field — the tool enters IPCC 2006 values (same basis as the TGO EF table) converted to HHV, because this card counts fuel in GJ HHV',n:'Natural gas 50.5 · LPG 58.1 · diesel 70.4 · fuel oil 73.5 · bituminous coal 89.9 · sub-bituminous 91.3 · lignite 96.0 · biomass 0 (biogenic CO₂ reported separately) — CO₂ only',f:'Choose "custom" and enter the TGO NCV value × (NCV/GCV) for that fuel',e:'Fuel oil: 77.4 (NCV) × 0.95 → 73.5'},
 stm_efgrid:{t:'Grid EF (kgCO₂/MWh)',w:'TGO electricity EF table — use the latest Grid Mix value',n:'0.4750 kgCO₂e/kWh = 475 kgCO₂/MWh (Grid Mix 2022–2024) · the old 499 (0.4999, 2016–2018) was valid until 31 Jan 2026',f:'475',e:'Enter 475'}
});
/* ── "Example entry" for the shared keys (approved 7 Nov 2026) ── */
var E={tamb:'Measured on site at 14:00 = 34.5 → enter 34.5',steamT:'Saturated 10 bar g: leave blank · superheated: enter e.g. 220',fuelF:'Wood-chip boiler, 10 t/h steam ≈ 2,300–2,600 kg/h',hrs:'2 shifts, 6 days/week → enter 5,000',priceE:'PEA TOU bill: (energy + demand + Ft) ÷ kWh → e.g. 4.2',flow:'Cooling-tower pump for a 500 TR chiller ≈ 300–380 m³/h',head:'Single-storey plant cooling-water system ≈ 20–30 m',pdisc:'Header gauge reads 7.0 at full load → enter 7.0',cap:'75 kW VSD installed ≈ 150,000–250,000 THB'};
for(var k in E)if(H[k])H[k].e=E[k];
if(window.TE_SCENE_EN)window.TE_SCENE_EN.example='Example entry:';
})();
