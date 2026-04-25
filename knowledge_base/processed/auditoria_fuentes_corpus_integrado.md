# Corpus curado integrado — Latinoamérica / Colombia Comparte

Generado: 2026-04-24

## Resumen

- Registros curados: 22
- Fuentes integradas: HTTrack limpio, DOCX entregado por el equipo, sitio oficial, aula pública EDIFICA, PDF público de lineamientos, LinkedIn público, Portafolio y Fondos en Acción.
- Formato principal: JSONL, un registro por tema/sección, listo para chunking o para usar directamente como corpus maestro.

## Criterio de curación

1. Prioridad alta a fuentes oficiales: sitio oficial, aula pública y PDF oficial.
2. El DOCX se usó como fuente editorial principal para la nueva página Colombia Comparte.
3. Fuentes externas como Portafolio y Fondos en Acción se usaron para corroboración, no para reemplazar el contenido editorial más reciente.
4. Se excluyeron registros 404, índices locales, duplicados, login/aula privada y temas que el DOCX pidió eliminar, especialmente deportados.

## Fuentes usadas

### httrack_lac_home
- Título: Latinoamérica Comparte — Inspirando Propósito (mirror HTTrack)
- Tipo: httrack_mirror
- Fiabilidad: alta
- URL: https://latinoamericacomparte.com/
- Uso: Se usó como confirmación de la portada pública y se eliminaron duplicados/404.

### httrack_edifica_public_courses
- Título: EDIFICA aula virtual pública (mirror HTTrack)
- Tipo: httrack_mirror
- Fiabilidad: media-alta
- URL: https://www.latinoamericacomparte.com/aulavirtual/
- Uso: Se usó solo para cursos/listado público visible sin login; se excluyeron textos de sesión/login.

### docx_colombia_comparte
- Título: Pagina Colombia Comparte..docx
- Tipo: documento_entregado_por_equipo
- Fiabilidad: alta_para_contenido_editorial
- URL: N/A
- Uso: Base editorial principal para la nueva página de Colombia Comparte: EDIFICA, Top Speakers, NODUS, historia, impacto y acciones.

### official_lac_home
- Título: Latinoamérica Comparte — Inspirando Propósito
- Tipo: sitio_oficial
- Fiabilidad: alta
- URL: https://www.latinoamericacomparte.com/
- Uso: Fuente oficial para propósito regional, quiénes somos, equipo, aliados, noticias, apoyo y contacto.

### official_edifica_lineamientos_pdf
- Título: Políticas y lineamientos EDIFICA Colombia Comparte 2025
- Tipo: pdf_oficial_publico
- Fiabilidad: alta
- URL: https://aula.colombiacomparte.com/wp-content/uploads/2025/02/POLITICAS-Y-LINEAMIENTOS-EDIFICA-COLOMBIA-COMPARTE-2025.pdf
- Uso: Fuente oficial para propósito de EDIFICA, admisión, certificación, convivencia y reglas generales del programa.

### official_aula_mentores
- Título: Mentores – Aula Fundación Colombia Comparte
- Tipo: sitio_oficial_publico
- Fiabilidad: alta
- URL: https://aula.colombiacomparte.com/mentores/
- Uso: Fuente oficial para nombres, roles y orientación pública de mentores/coaches.

### linkedin_colombia_comparte
- Título: Colombia Comparte | LinkedIn
- Tipo: red_social_oficial
- Fiabilidad: media-alta
- URL: https://co.linkedin.com/company/fundaci%C3%B3n-colombia-comparte
- Uso: Fuente pública para actividad reciente, equipo, contacto, NODUS y proyectos educativos; se usó con cautela por ser red social.

### portafolio_2023
- Título: Familias vergonzantes: el emprendimiento es la salida
- Tipo: medio_periodistico
- Fiabilidad: media-alta
- URL: https://www.portafolio.co/emprendimiento/fundacion-colombia-comparte-orienta-a-las-personas-para-emprender-y-salir-de-crisis-589442
- Uso: Fuente externa para corroborar historia de fundadores, nacimiento en 2015, enfoque ocupacional y estructura de EDIFICA.

### fondos_en_accion
- Título: Fundación Colombia Comparte | Fondos en Acción
- Tipo: directorio_donacion_tercero
- Fiabilidad: media
- URL: https://fondosenaccion.com/fundacion-colombia-comparte/
- Uso: Fuente externa para corroborar misión, objetivos, programa EDIFICA y públicos beneficiarios.

### youtube_colombia_comparte
- Título: Canal YouTube @colombiacomparte
- Tipo: canal_video_publico
- Fiabilidad: media
- URL: https://www.youtube.com/@colombiacomparte
- Uso: Solo como enlace de casos reales/acciones; no se extrajeron afirmaciones concretas porque el contenido debe revisarse video por video.

## Fuentes excluidas o limitadas

- **HTTrack corpus_from_httrack.jsonl:** Se descartaron 9 registros 404 Not Found, un índice local de HTTrack y duplicados exactos de la portada.
- **Notas públicas sobre EDIFICA Regresa y Brilla / deportados:** No se incorporaron al corpus principal porque el DOCX editorial solicita explícitamente eliminar el tema de deportados. Se consideran contenido conflictivo o no alineado con la versión actual de la página.
- **Formularios de donación externos:** No se extrajeron campos de formularios ni datos de usuarios. Solo se conservaron descripciones generales y enlaces de apoyo.
- **Rutas de aula con login, cursos internos, usuarios o contenido restringido:** Se excluyeron por seguridad y por alcance público del chatbot. Solo se usó información visible sin iniciar sesión.
- **Fundación Comparte / CPUV Colombia:** Se excluyó porque corresponde a otra organización con nombre similar y misión distinta.

## Registros incluidos

- lac_001_proposito_regional: Latinoamérica Comparte: propósito regional [Quiénes somos] — fuentes: httrack_lac_home, official_lac_home
- lac_002_paises_portales: Países vinculados a Latinoamérica Comparte [Portales por país] — fuentes: httrack_lac_home, official_lac_home
- lac_003_equipo_principal: Equipo principal visible de Latinoamérica Comparte [Equipo] — fuentes: httrack_lac_home, official_lac_home
- lac_004_aliados_apoyo_contacto: Empresas aliadas, apoyo y contacto regional [Cómo apoyar / Contacto] — fuentes: official_lac_home, httrack_lac_home
- co_001_banner_home: Mensajes principales para la portada de Colombia Comparte [Banners / Home] — fuentes: docx_colombia_comparte
- co_002_a_quienes_acompanamos: A quiénes acompaña Colombia Comparte [A quién acompañamos] — fuentes: docx_colombia_comparte, fondos_en_accion
- co_003_edifica_descripcion: EDIFICA: programa de emprendimiento [EDIFICA] — fuentes: docx_colombia_comparte, official_edifica_lineamientos_pdf, fondos_en_accion, portafolio_2023
- co_004_edifica_publicos: Públicos a los que puede dirigirse EDIFICA [EDIFICA / Públicos] — fuentes: docx_colombia_comparte, fondos_en_accion
- co_005_edifica_lineamientos: Lineamientos públicos del programa EDIFICA [EDIFICA / Lineamientos] — fuentes: official_edifica_lineamientos_pdf
- co_006_edifica_no_prestamos: Aclaraciones públicas sobre recursos y apoyos de EDIFICA [EDIFICA / Aclaraciones] — fuentes: official_edifica_lineamientos_pdf
- co_007_aula_publica_cursos: Aula pública EDIFICA: cursos y áreas visibles [Aula / Cursos públicos] — fuentes: httrack_edifica_public_courses
- co_008_mentores_coaches: Comunidad de mentores y coaches [Mentores y coaches] — fuentes: official_aula_mentores, docx_colombia_comparte, linkedin_colombia_comparte
- co_009_empresas_tres_frentes: Empresas comprometidas con su gente: NODUS, EDIFICA y TOP SPEAKERS [Empresas] — fuentes: docx_colombia_comparte, linkedin_colombia_comparte
- co_010_top_speakers: TOP SPEAKERS: cultura, liderazgo y bienestar empresarial [TOP SPEAKERS] — fuentes: docx_colombia_comparte, official_lac_home
- co_011_nodus: NODUS: liderazgo con mentalidad emprendedora [NODUS] — fuentes: docx_colombia_comparte, linkedin_colombia_comparte
- co_012_historia: Historia de Colombia Comparte [Nuestra historia] — fuentes: docx_colombia_comparte, portafolio_2023, official_lac_home
- co_013_impacto_actual: Impacto reportado por Colombia Comparte [Impacto] — fuentes: docx_colombia_comparte, official_lac_home, portafolio_2023
- co_014_acciones_recientes: Acciones y proyectos recientes [Noticias / acciones] — fuentes: docx_colombia_comparte, linkedin_colombia_comparte
- co_015_quienes_somos_colombia: Quiénes somos: comunidad de propósito, empatía y servicio [Sobre nosotros] — fuentes: docx_colombia_comparte, linkedin_colombia_comparte
- co_016_donaciones_y_apoyo: Cómo apoyar a Colombia Comparte [Donaciones / apoyo] — fuentes: official_lac_home, fondos_en_accion
- co_017_contacto: Contacto público para Colombia Comparte [Contacto] — fuentes: docx_colombia_comparte, linkedin_colombia_comparte, official_lac_home
- guard_001_alcance_seguro: Alcance seguro para respuestas del chatbot [Guardrails de contenido] — fuentes: docx_colombia_comparte, official_lac_home, official_edifica_lineamientos_pdf
