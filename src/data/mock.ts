import type { Resident, Patient, Task, CalEvent, Reading, Licencia } from '../types'

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
  ]},
  {id:'PAC-002',age:45,sex:'F',sector:'Consultorios — Ambulatorio',status:'ambulatorio',diagnosis:'Esclerosis Múltiple RR — brote motor activo',assignedTo:[2],evolutions:[
    {date:'2026-03-15',author:2,text:'Debilidad progresiva en MMII desde hace 10 días. EDSS basal 2.0. Se indica pulsos de metilprednisolona x3 días.'},
    {date:'2026-03-18',author:2,text:'Post-pulsos: leve mejoría subjetiva. Fuerza 4/5 distal. RMN: nueva lesión T2 cordón lateral. Control en 1 mes.'},
  ]},
  {id:'PAC-003',age:72,sex:'M',sector:'Sala 5 — Cama 3',status:'internado',diagnosis:'Epilepsia de difícil control — estado postcrítico',assignedTo:[4,5],evolutions:[
    {date:'2026-03-20',author:4,text:'Ingresa por crisis tónico-clónica generalizada de 3 minutos. Sin recuperación completa. EEG: actividad epileptiforme bilateral.'},
    {date:'2026-03-21',author:5,text:'Mayor lucidez. Responde órdenes simples. Se optimiza dosis de ácido valproico. Aguarda nivel sérico.'},
  ]},
  {id:'PAC-004',age:58,sex:'F',sector:'Guardia — UC',status:'guardia',diagnosis:'Cefalea en trueno — a descartar HSA',assignedTo:[3],evolutions:[
    {date:'2026-03-21',author:3,text:'Ingresa por cefalea de inicio explosivo. TC sin hemorragia subaracnoidea. PL: xantocromía positiva. Interna para estudio.'},
  ]},
  {id:'PAC-005',age:34,sex:'M',sector:'Alta domiciliaria',status:'alta',diagnosis:'Síndrome de Guillain-Barré en resolución',assignedTo:[1],evolutions:[
    {date:'2026-03-10',author:1,text:'Alta hospitalaria luego de 18 días. IVIG completo. Fuerza 4/5 en MMII. Continúa kinesiología domiciliaria.'},
    {date:'2026-03-17',author:1,text:'Control ambulatorio: mejoría sostenida. Fuerza 4+/5. Deambula con apoyo. Sin disfagia. Control en 2 semanas.'},
  ]},
  {id:'PAC-006',age:81,sex:'F',sector:'Sala 2 — Cama 7',status:'internado',diagnosis:'Enfermedad de Alzheimer — síntomas conductuales',assignedTo:[2,4],evolutions:[
    {date:'2026-03-18',author:2,text:'Agitación nocturna severa. Ajuste quetiapina 25mg noche. Familiar informado.'},
    {date:'2026-03-21',author:4,text:'Mejoría patrón de sueño. Menor agitación. MMSE: 14/30.'},
  ]},
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

export const LICENCIAS: Licencia[] = [
  {id:1,residentId:2,from:'2026-03-30',to:'2026-04-04',type:'vacaciones'},
  {id:2,residentId:4,from:'2026-03-26',to:'2026-03-27',type:'congreso'},
  {id:3,residentId:5,from:'2026-03-24',to:'2026-03-24',type:'medica'},
]

export const READINGS: Reading[] = [
  {id:1,title:'Stroke Guidelines 2025 — AHA/ASA',journal:'Stroke, 2025',type:'guia',assignedTo:[1,2,3,4,5],mandatory:true},
  {id:2,title:'McDonald Criteria 2024 Update for MS Diagnosis',journal:'Annals of Neurology, 2024',type:'articulo',assignedTo:[1,3,5],mandatory:true},
  {id:3,title:'IVIG vs Plasmapheresis in GBS: Meta-analysis',journal:'NEJM, 2024',type:'articulo',assignedTo:[1,4],mandatory:false},
  {id:4,title:'Guía de Epilepsia Refractaria ILAE 2024',journal:'Epilepsia, 2024',type:'guia',assignedTo:[4,5],mandatory:true},
  {id:5,title:'Biomarkers in Alzheimer Disease: Current Evidence',journal:'Lancet Neurology, 2025',type:'revision',assignedTo:[2,3],mandatory:false},
]
