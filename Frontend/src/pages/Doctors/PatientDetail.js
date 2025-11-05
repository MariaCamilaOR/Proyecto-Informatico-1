import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "../../components/Layout/Navbar";
import { Sidebar } from "../../components/Layout/Sidebar";
import { Box, Heading, Text, VStack, Card, CardBody, HStack, Avatar, Button, Checkbox, Textarea, useToast, Divider } from "@chakra-ui/react";
import { api } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";
import { useQuizzes } from "../../hooks/useQuizzes";

// ------------ Helpers de formateo ------------
const normalizeToList = (val) => {
  if (val == null) return [];
  if (Array.isArray(val)) return val.map(v => String(v).trim()).filter(Boolean);
  if (typeof val === "object") return Object.values(val).flatMap(normalizeToList).filter(Boolean);
  let s = String(val).trim(); if (!s) return [];
  try { return normalizeToList(JSON.parse(s)); } catch {}
  s = s.replace(/[{}\[\]"]/g, "");
  return s.split(/[,;\n]/).map(x => x.trim()).filter(Boolean);
};
const quoteList = (arr) => arr.map(x => `"${x}"`).join(", ");
const formatDescriptionData = (data) => {
  if (!data) return "";
  const people   = normalizeToList(data.people);
  const places   = normalizeToList(data.places);
  const events   = normalizeToList(data.events);
  const emotions = normalizeToList(data.emotions);
  const tags     = normalizeToList(data.tags);
  const details  = (data.details ?? "").toString().trim();
  const parts = [];
  if (people.length)   parts.push(`foto de ${quoteList(people)}`);
  if (places.length)   parts.push(`en ${quoteList(places)}`);
  if (events.length)   parts.push(`durante ${quoteList(events)}`);
  if (emotions.length) parts.push(`emociones ${quoteList(emotions)}`);
  if (details)         parts.push(`detalles: "${details}"`);
  if (tags.length)     parts.push(`tags: ${tags.map(t => `#${t.replace(/\s+/g, "_")}`).join(", ")}`);
  return parts.join(", ");
};
const formatDescription = (d) => d?.type === "text" ? (d.description ?? "").toString().trim() : formatDescriptionData(d?.data);
const fmtDate = (v) => new Date(v?.toDate ? v.toDate() : v).toLocaleString();
const formatReport = (r) => {
  const lines = [];
  if (r?.baseline) lines.push(`Línea base: ${r.baseline}`);
  const list = Array.isArray(r?.data?.descriptions) ? r.data.descriptions : [];
  if (list.length > 0) list.forEach((dd) => lines.push(`• ${formatDescription(dd) || "(sin detalles)"}`));
  else lines.push("(sin descripciones)");
  const q = Array.isArray(r?.quizResults) ? r.quizResults : [];
  if (q.length) {
    const last = q[q.length - 1];
    lines.push(`• Quiz: ${Math.round((last?.score || 0) * 100)}% — ${last?.classification || "-"}`);
  }
  return lines.join("  ");
};
// ------------ /Helpers ------------

export default function PatientDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { generateQuiz } = useQuizzes();

  const [patient, setPatient] = useState(null);
  const [descriptions, setDescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState({});
  const [baseline, setBaseline] = useState("");
  const [message, setMessage] = useState("");
  const toast = useToast();

  const load = async () => {
    if (!id) return;
    try { const p = await api.get(`/patients/${id}`); setPatient(p.data); } catch (e) { console.error("Failed to load patient", e); }
    try { const d = await api.get(`/descriptions/patient/${id}`); setDescriptions(d.data || []); } catch (e) { console.error("Failed to load descriptions", e); }
    try { const r = await api.get(`/reports/patient/${id}`); setReports(r.data || []); } catch (e) { console.error("Failed to load reports", e); }
  };
  useEffect(() => { load(); }, [id]);

  const toggle = (descId) => setSelected((s) => ({ ...s, [descId]: !s[descId] }));

  const handleCreateReport = async () => {
    if (!id) return;
    const selectedList = descriptions.filter((d) => selected[d.id]);
    if (selectedList.length === 0 && !baseline) {
      toast({ title: "Nada seleccionado", description: "Selecciona al menos una descripción o escribe una línea base.", status: "warning" });
      return;
    }
    try {
      const payload = { patientId: id, data: { descriptions: selectedList, createdBy: user?.uid }, baseline };
      await api.post(`/reports`, payload);
      toast({ title: "Reporte creado", status: "success" });
      const r = await api.get(`/reports/patient/${id}`);
      setReports(r.data || []);
    } catch (e) {
      console.error("Failed to create report", e);
      toast({ title: "Error", description: "No se pudo crear el reporte.", status: "error" });
    }
  };

  const handleGenerateQuiz = async () => {
    try {
      const selIds = descriptions.filter(d => selected[d.id]).map(d => d.id);
      const quiz = await generateQuiz({ patientId: id, descriptionIds: selIds, limitPerDesc: 3 });
      navigate(`/quiz/${quiz.id}`);
    } catch (e) {
      toast({ title: "No se pudo generar el cuestionario", status: "error" });
    }
  };

  const handleRequestBaseline = async () => {
    if (!id) return;
    try {
      await api.post(`/notifications`, { patientId: id, type: "baseline_request", message });
      toast({ title: "Solicitud enviada", description: "Se solicitó al paciente que establezca una línea base.", status: "success" });
      setMessage("");
    } catch (e) {
      console.error("Failed to send notification", e);
      toast({ title: "Error", description: "No se pudo enviar la solicitud.", status: "error" });
    }
  };

  return (_jsxs(Box, { children: [
    _jsx(Navbar, {}),
    _jsxs(HStack, { spacing: 0, align: "stretch", children: [
      _jsx(Sidebar, {}),
      _jsx(Box, { flex: "1", p: { base: 4, md: 6 }, children:
        _jsxs(VStack, { align: "stretch", spacing: 6, children: [
          _jsxs(Heading, { children: ["Paciente: ", patient?.displayName || patient?.email || id] }),

          _jsx(Card, { children: _jsxs(CardBody, { children: [
            _jsx(Heading, { size: "sm", children: "Descripciones del paciente" }),
            _jsx(Text, { fontSize: "sm", color: "gray.600", children: "Selecciona las descripciones que quieras incluir en un reporte." }),
            _jsx(VStack, { align: "stretch", mt: 3, children:
              descriptions.length === 0 ? _jsx(Text, { children: "No hay descripciones." }) :
              descriptions.map((d) => (_jsx(Card, { children:
                _jsx(CardBody, { children:
                  _jsxs(HStack, { align: "start", justify: "space-between", children: [
                    _jsxs(HStack, { children: [
                      _jsx(Avatar, { name: d.authorUid || 'Paciente', size: "sm" }),
                      _jsxs(Box, { children: [
                        _jsx(Text, { fontWeight: "bold", children: d.type || 'descripcion' }),
                        _jsx(Text, { fontSize: "sm", children: formatDescription(d) || "(sin detalles)" })
                      ]})
                    ]}),
                    _jsx(Checkbox, { isChecked: !!selected[d.id], onChange: () => toggle(d.id), children: "Incluir" })
                  ]})
                })
              }, d.id)))
            }),
            _jsx(Divider, { my: 4 }),
            _jsx(Heading, { size: "sm", children: "Crear Reporte" }),
            _jsx(Text, { fontSize: "sm", color: "gray.600", children: "Puedes incluir las descripciones seleccionadas y/o una línea base." }),
            _jsx(Textarea, { mt: 2, placeholder: "Línea base (opcional)", value: baseline, onChange: (e) => setBaseline(e.target.value) }),
            _jsx(HStack, { justify: "flex-end", mt: 3, children:
              _jsxs(HStack, { spacing: 3, children: [
                _jsx(Button, { variant: "outline", onClick: handleGenerateQuiz, children: "Generar cuestionario" }),
                _jsx(Button, { colorScheme: "green", onClick: handleCreateReport, children: "Crear Reporte" })
              ]})
            })
          ]})}),

          _jsx(Card, { children: _jsxs(CardBody, { children: [
            _jsx(Heading, { size: "sm", children: "Solicitar Línea Base" }),
            _jsx(Text, { fontSize: "sm", color: "gray.600", children: "Envía una solicitud al paciente para que complete una línea base que puedas usar en futuros reportes." }),
            _jsx(Textarea, { mt: 2, placeholder: "Mensaje al paciente (opcional)", value: message, onChange: (e) => setMessage(e.target.value) }),
            _jsx(HStack, { justify: "flex-end", mt: 3, children:
              _jsx(Button, { colorScheme: "blue", onClick: handleRequestBaseline, children: "Solicitar Línea Base" })
            })
          ]})}),

          _jsx(Card, { children: _jsxs(CardBody, { children: [
            _jsx(Heading, { size: "sm", children: "Reportes previos" }),
            reports.length === 0 ? _jsx(Text, { children: "No hay reportes." }) : (
              _jsx(VStack, { align: "stretch", children:
                reports.map((r) => (_jsx(Card, { children:
                  _jsxs(CardBody, { children: [
                    _jsx(Text, { fontWeight: "bold", children: fmtDate(r.createdAt) }),
                    _jsx(Text, { fontSize: "sm", children: formatReport(r) })
                  ]})
                }, r.id)))
              })
            )
          ]})})
        ]})
      })
    ]})
  ]}));
}
