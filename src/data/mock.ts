import type { Resident, Patient, Task, CalEvent, Reading } from '../types'

export const RESIDENTS: Resident[] = [
  {id:1,name:'García',full:'Dr. García',initial:'G',color:'#05D9A4',bg:'rgba(5,217,164,.12)',email:'garcia@residencia.com'},
  {id:2,name:'López',full:'Dr. López',initial:'L',color:'#F0A500',bg:'rgba(240,165,0,.12)',email:'lopez@residencia.com'},
  {id:3,name:'Martínez',full:'Dra. Martínez',initial:'M',color:'#8B5CF6',bg:'rgba(139,92,246,.12)',email:'martinez@residencia.com'},
  {id:4,name:'Rodríguez',full:'Dr. Rodríguez',initial:'R',color:'#E84C4C',bg:'rgba(232,76,76,.12)',email:'rodriguez@residencia.com'},
  {id:5,name:'Sánchez',full:'Dra. Sánchez',initial:'S',color:'#6B7FD7',bg:'rgba(107,127,215,.12)',email:'sanchez@residencia.com'},
]

export const PATIENTS: Patient[] = [
  {id:'PAC-001',age:67,sex:'M',sector:'Sala 3 — Cama 12',status:'internado',diagnosis:'ACV isquémico territorio ACM derecha',assignedTo:[1,3],evolutions:[
    {date:'2026-03-19',author:1,text:'Paciente hemodinámicamente estable. Sin nuevos déficits. TC control sin cambios. Plan: RMN con DWI.'},
    {date:'2026-03-20',author:3,text:'RMN informa infarto agudo fronto-parietal derecho sin transformación hemorrágica. Se inicia antiagregación AAS 100mg.'},
    {date:'2026-03-21',author:1,text:'Mejoría clínica leve. Hemiparesia izquierda 3/5 proximal. Lenguaje conservado. Interconsulta kinesiología solicitada.'},
  ],chart:{patientId:'PAC-001',antecedentes:'HTA, dislipemia. Fumador 20 pack-years. Fibrilación auricular paroxística no anticoagulada.',motivoConsulta:'Pérdida brusca de fuerza en hemicuerpo izquierdo y desviación de comisura labial de 4 horas de evolución.',examenFisico:'TA 158/92 mmHg. FC 88 irr. Hemiparesia izquierda 3/5 proximal, 2/5 distal. Paresia facial central izquierda. Lenguaje conservado. NIHSS 9.',estudiosComplementarios:'TC s/c: sin hemorragia. RMN DWI 20/03: infarto agudo fronto-parietal derecho ~45cc sin transformación hemorrágica. Eco Doppler carotídeo: sin estenosis. Holter: FA paroxística.',diagnostico:'ACV isquémico territorio ACM derecha por cardioembolia (FA paroxística).',plan:'Anticoagulación: HBPM puente → apixabán 5mg c/12h. Estatina alta intensidad: atorvastatina 80mg. Kinesioterapia motora y fonoaudiología. RMN control a los 7 días.',pendientes:'Ecocardiograma transtorácico. Holter 24h de control. Interconsulta cardiología para inicio NACO.',updatedAt:'2026-03-21',updatedBy:1},images:[]},
  {id:'PAC-002',age:45,sex:'F',sector:'Consultorios — Ambulatorio',status:'ambulatorio',diagnosis:'Esclerosis Múltiple RR — brote motor activo',assignedTo:[2],evolutions:[
    {date:'2026-03-15',author:2,text:'Debilidad progresiva en MMII desde hace 10 días. EDSS basal 2.0. Se indica pulsos de metilprednisolona x3 días.'},
    {date:'2026-03-18',author:2,text:'Post-pulsos: leve mejoría subjetiva. Fuerza 4/5 distal. RMN: nueva lesión T2 cordón lateral. Control en 1 mes.'},
  ],images:[]},
  {id:'PAC-003',age:72,sex:'M',sector:'Sala 5 — Cama 3',status:'internado',diagnosis:'Epilepsia de difícil control — estado postcrítico',assignedTo:[4,5],evolutions:[
    {date:'2026-03-20',author:4,text:'Ingresa por crisis tónico-clónica generalizada de 3 minutos. Sin recuperación completa. EEG: actividad epileptiforme bilateral.'},
    {date:'2026-03-21',author:5,text:'Mayor lucidez. Responde órdenes simples. Se optimiza dosis de ácido valproico. Aguarda nivel sérico.'},
  ],chart:{patientId:'PAC-003',antecedentes:'Epilepsia focal con generalización secundaria diagnosticada hace 12 años. En tratamiento con ácido valproico 1000mg/día y levetiracetam 1500mg/día.',motivoConsulta:'Crisis tónico-clónica generalizada de 3 minutos sin recuperación completa. Traído por familiar.',examenFisico:'Somnoliento, responde órdenes simples. Sin focalidad neurológica postcrítica evidente. Mordedura lateral de lengua.',estudiosComplementarios:'EEG 20/03: actividad epileptiforme bilateral, puntas-onda en región fronto-central. Nivel sérico VPA: 42 mcg/mL (sub-terapéutico). TC cráneo: sin lesiones agudas.',diagnostico:'Crisis epiléptica tónico-clónica generalizada en contexto de niveles subterapéuticos de ácido valproico.',plan:'Optimizar dosis VPA: incremento a 1500mg/día. Mantener levetiracetam. Monitoreo de niveles séricos. Restricción de actividades de riesgo.',pendientes:'Nivel sérico VPA de control en 48h. EEG sueño. Evaluación neuropsicológica. Educación familiar sobre primeros auxilios en crisis.',updatedAt:'2026-03-21',updatedBy:4},images:[]},
  {id:'PAC-004',age:58,sex:'F',sector:'Guardia — UC',status:'guardia',diagnosis:'Cefalea en trueno — a descartar HSA',assignedTo:[3],evolutions:[
    {date:'2026-03-21',author:3,text:'Ingresa por cefalea de inicio explosivo. TC sin hemorragia subaracnoidea. PL: xantocromía positiva. Interna para estudio.'},
  ],images:[]},
  {id:'PAC-005',age:34,sex:'M',sector:'Alta domiciliaria',status:'alta',diagnosis:'Síndrome de Guillain-Barré en resolución',assignedTo:[1],evolutions:[
    {date:'2026-03-10',author:1,text:'Alta hospitalaria luego de 18 días. IVIG completo. Fuerza 4/5 en MMII. Continúa kinesiología domiciliaria.'},
    {date:'2026-03-17',author:1,text:'Control ambulatorio: mejoría sostenida. Fuerza 4+/5. Deambula con apoyo. Sin disfagia. Control en 2 semanas.'},
  ],images:[]},
  {id:'PAC-006',age:81,sex:'F',sector:'Sala 2 — Cama 7',status:'internado',diagnosis:'Enfermedad de Alzheimer — síntomas conductuales',assignedTo:[2,4],evolutions:[
    {date:'2026-03-18',author:2,text:'Agitación nocturna severa. Ajuste quetiapina 25mg noche. Familiar informado.'},
    {date:'2026-03-21',author:4,text:'Mejoría patrón de sueño. Menor agitación. MMSE: 14/30.'},
  ],chart:{patientId:'PAC-006',antecedentes:'EA estadio moderado (GDS 5). HTA. Hipotiroidismo en tratamiento. Institucionalizada hace 2 años.',motivoConsulta:'Agitación nocturna severa con conductas disruptivas en los últimos 5 días. Familiar refiere empeoramiento del sueño.',examenFisico:'Desorientada en tiempo y espacio. MMSE 14/30. Sin signos de foco neurológico agudo. Sin signos de infección activa.',estudiosComplementarios:'Laboratorio: sin alteraciones metabólicas ni infecciosas. TSH normal. Orina normal.',diagnostico:'Síntomas conductuales y psicológicos de la demencia (SCPD) en el contexto de EA estadio moderado.',plan:'Quetiapina 25mg/noche con escalada gradual según respuesta. Higiene del sueño. Estimulación cognitiva diurna.',pendientes:'Control MMSE en 30 días. Evaluación de carga del cuidador. Reunión familiar para ajuste de plan terapéutico.',updatedAt:'2026-03-21',updatedBy:2},images:[]},
]

export const TASKS: Task[] = [
  {id:1,title:'Presentar caso ACV en ateneo semanal',assignedTo:2,status:'pendiente',priority:'alta',due:'2026-03-24',type:'presentacion'},
  {id:2,title:'Completar evoluciones PAC-003 pendientes',assignedTo:5,status:'pendiente',priority:'alta',due:'2026-03-21',type:'clinica'},
  {id:3,title:'Revisar protocolo anticoagulación post-ACV',assignedTo:1,status:'en_curso',priority:'media',due:'2026-03-25',type:'academica'},
  {id:4,title:'Preparar clase diagnóstico EM — criterios McDonald',assignedTo:3,status:'en_curso',priority:'media',due:'2026-03-28',type:'clase'},
  {id:5,title:'Interconsulta neuropsicología PAC-006',assignedTo:4,status:'en_curso',priority:'baja',due:'2026-03-22',type:'clinica'},
  {id:6,title:'Leer artículo: NEJM — Stroke 2025 Guidelines',assignedTo:1,status:'completada',priority:'media',due:'2026-03-18',type:'academica'},
  {id:7,title:'Registrar guardias de la semana',assignedTo:2,status:'completada',priority:'baja',due:'2026-03-17',type:'admin'},
  {id:8,title:'Actualizar ficha PAC-002 con nueva RMN',assignedTo:3,status:'pendiente',priority:'alta',due:'2026-03-22',type:'clinica'},
]

export const EVENTS: CalEvent[] = [
  {id:1,title:'Ateneo Semanal',date:'2026-03-24',time:'09:00',type:'ateneo',loc:'Aula Magna',presenter:2,desc:'Dr. López presenta: ACV en paciente joven.'},
  {id:2,title:'Clase: Criterios McDonald 2024',date:'2026-03-26',time:'14:00',type:'clase',loc:'Sala de Docencia',presenter:3,desc:'Diagnóstico actualizado de Esclerosis Múltiple. Dra. Martínez.'},
  {id:3,title:'Guardia — García + Rodríguez',date:'2026-03-22',time:'08:00',type:'guardia',loc:'Guardia Central',presenter:null,desc:'Guardia de 24 horas.'},
  {id:4,title:'Guardia — López + Sánchez',date:'2026-03-25',time:'08:00',type:'guardia',loc:'Guardia Central',presenter:null,desc:'Guardia de 24 horas.'},
  {id:5,title:'Discusión: Biomarcadores en LCR',date:'2026-03-28',time:'11:00',type:'presentacion',loc:'Sala de Reuniones',presenter:5,desc:'Dra. Sánchez presenta avances de trabajo de investigación.'},
  {id:6,title:'Ateneo Semanal',date:'2026-03-31',time:'09:00',type:'ateneo',loc:'Aula Magna',presenter:null,desc:'Caso clínico a definir.'},
  {id:7,title:'Guardia — Martínez + Sánchez',date:'2026-03-29',time:'08:00',type:'guardia',loc:'Guardia Central',presenter:null,desc:'Guardia de 24 horas.'},
]

export const READINGS: Reading[] = [
  {id:1,title:'Stroke Guidelines 2025 — AHA/ASA',journal:'Stroke, 2025',type:'guia',assignedTo:[1,2,3,4,5],mandatory:true},
  {id:2,title:'McDonald Criteria 2024 Update for MS Diagnosis',journal:'Annals of Neurology, 2024',type:'articulo',assignedTo:[1,3,5],mandatory:true},
  {id:3,title:'IVIG vs Plasmapheresis in GBS: Meta-analysis',journal:'NEJM, 2024',type:'articulo',assignedTo:[1,4],mandatory:false},
  {id:4,title:'Guía de Epilepsia Refractaria ILAE 2024',journal:'Epilepsia, 2024',type:'guia',assignedTo:[4,5],mandatory:true},
  {id:5,title:'Biomarkers in Alzheimer Disease: Current Evidence',journal:'Lancet Neurology, 2025',type:'revision',assignedTo:[2,3],mandatory:false},
]
