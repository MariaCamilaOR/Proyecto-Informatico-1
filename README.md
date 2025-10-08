# DoYouRemember — CAFESAJU (UAO)
App para **detección temprana y monitoreo del Alzheimer** a partir del análisis de descripciones de fotografías familiares.

**Arquitectura propuesta:** microservicios (con capas internas por servicio).  
**Curso:** Proyecto Informático (2025-3) — **Profesor:** Iván Mauricio Cabezas Troyano

---

## 👥 Equipo
Grupo **CAFESAJU**  
- Daniel Ojeda Vega  
- Juan Pablo Franco Herrera  
- Santiago Collantes Nieto  
- Maria Camila Orozco Romero  
- Luis Felipe Murillo Matallana  

---

## 🎯 Propósito
Establecer una **línea base cognitiva** y monitorear **cambios sutiles** en:
- **Memory Recall** (recuerdo de hechos/entidades)  
- **Narrative Coherence** (consistencia temática, secuencia lógica, complejidad lingüística)

---

## 🧱 Arquitectura (resumen)
- **Front-end:** app web/móvil (UI)  
- **API Gateway:** enrutamiento, rate limit, auth  
- **Servicios** (ejemplos):  
  - `auth` (usuarios/roles)  
  - `media` (fotos y metadatos)  
  - `nlp` (análisis de narrativa y recall)  
  - `reports` (tendencias y alertas)  
- **Datos:** almacenes por servicio (principio *database-per-service*)  
- **Observabilidad:** logs centralizados y métricas por servicio

> Diagrama C4 (Contexto/Contenedores) → `docs/arquitectura/` (añade aquí tus imágenes)

---

## 📑 Documentación
- **Diagramas C4** → https://www.rapidcharts.ai/editor/74d1cae3-1738-43c3-8134-046daa184d47/View
- **Diagramas UML** →  
- **Informe en Word** → https://uao-my.sharepoint.com/:w:/g/personal/maria_cam_orozco_uao_edu_co/ESOyNBjM1AtBvD_HAi7yajkB9N5RzVdCMINbTpjee2A2Og?e=gUAHyH 

---

## ✅ Atributos de calidad (objetivos iniciales)
| Atributo         | Objetivo inicial                                      | Métrica de aceptación                            |
|------------------|--------------------------------------------------------|--------------------------------------------------|
| Disponibilidad   | Evitar caída total ante fallo de un servicio           | Degradación parcial con *circuit breaker*        |
| Rendimiento      | Respuesta media UI < 2s (p95 < 3s)                     | APM, p95 por endpoint                            |
| Seguridad (CIA)  | Datos en tránsito y reposo cifrados                    | TLS 1.2+, KMS/secretos gestionados               |
| Modificabilidad  | Cambios locales por servicio sin afectar al resto      | Despliegues independientes (CI/CD por servicio)  |
| Testabilidad     | Cobertura crítica y pruebas de contrato entre servicios| >80% módulos core, Pact/Contract Tests           |

---

## 🧪 Pruebas
- **Unitarias** por servicio  
- **Contratos** (API)  
- **Integración** (docker-compose)  
- **End-to-End** (flujo completo usuario → reporte)

---

## 🚀 Cómo ejecutar (modo dev)
Requisitos: Docker + docker-compose

```bash
# 1) Clonar
git clone https://github.com/MariaCamilaOR/Proyecto-Informatico-1.git
cd COLOCAR CUANDO CREEMOS LA CARPETA

# 2) Variables de entorno
cp .env.example .env    # Completa secretos mínimos

# 3) Levantar servicios
docker compose up -d --build

# 4) Ver logs (opcional)
docker compose logs -f
