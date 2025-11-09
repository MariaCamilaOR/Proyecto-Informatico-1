import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./components/Layout/ProtectedRoute";
import RoleGuard from "./components/Layout/RoleGuard";
import RoleRedirect from "./components/Layout/RoleRedirect";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";

import PhotosList from "./pages/Photos/List";
import PhotosUpload from "./pages/Photos/Upload";
import PhotosTagger from "./pages/Photos/Tagger";
import DescribeText from "./pages/Describe/Text";
import DescribeVoice from "./pages/Describe/Voice";
import DescribeWizard from "./pages/Describe/Wizard";
import PatientGallery from "./pages/Photos/PatientGallery";
import PatientCaretaker from "./pages/Patient/Caretaker";

import ReportsTrends from "./pages/Reports/Trends";
import ReportsDetail from "./pages/Reports/Detail";

import AlertsSettings from "./pages/Alerts/Settings";
import RemindersSettings from "./pages/Reminders/Settings";

import CaregiversManage from "./pages/Caregivers/Manage";
import CaregiversPatients from "./pages/Caregivers/Patients";
import CaregiverDescribe from "./pages/Caregivers/Describe";

import DoctorsPatients from "./pages/Doctors/Patients";
import MyPatients from "./pages/Doctors/MyPatients";
import PatientDetail from "./pages/Doctors/PatientDetail";

/** ====== QUIZZES ====== */
import QuizManage from "./pages/Doctors/QuizManage";
import QuizTake from "./pages/Quiz/Take";
// ✅ ruta correcta (carpeta Patient)
import PatientQuizResults from "./pages/Patient/QuizResults";

export const appRoutes = (
  _jsxs(_Fragment, {
    children: [
      /* Auth */
      _jsx(Route, { path: "/login", element: _jsx(Login, {}) }),
      _jsx(Route, { path: "/register", element: _jsx(Register, {}) }),

      /* Home según rol */
      _jsx(Route, {
        path: "/",
        element: _jsx(ProtectedRoute, { children: _jsx(RoleRedirect, {}) })
      }),

      /* Panel Paciente */
      _jsx(Route, {
        path: "/paciente",
        element: _jsx(ProtectedRoute, {
          children: _jsx(RoleGuard, { allowed: ["PATIENT"], children: _jsx(Dashboard, {}) })
        })
      }),
      _jsx(Route, {
        path: "/patient/gallery",
        element: _jsx(ProtectedRoute, {
          children: _jsx(RoleGuard, { allowed: ["PATIENT"], children: _jsx(PatientGallery, {}) })
        })
      }),
      _jsx(Route, {
        path: "/patient/caretaker",
        element: _jsx(ProtectedRoute, {
          children: _jsx(RoleGuard, { allowed: ["PATIENT"], children: _jsx(PatientCaretaker, {}) })
        })
      }),

      /* Panel Cuidador */
      _jsx(Route, {
        path: "/cuidador",
        element: _jsx(ProtectedRoute, {
          children: _jsx(RoleGuard, { allowed: ["CAREGIVER"], children: _jsx(Dashboard, {}) })
        })
      }),
      _jsx(Route, {
        path: "/cuidador/photos/upload",
        element: _jsx(ProtectedRoute, {
          children: _jsx(RoleGuard, { allowed: ["CAREGIVER"], children: _jsx(PhotosUpload, {}) })
        })
      }),
      _jsx(Route, {
        path: "/cuidador/describir",
        element: _jsx(ProtectedRoute, {
          children: _jsx(RoleGuard, { allowed: ["CAREGIVER"], children: _jsx(CaregiverDescribe, {}) })
        })
      }),

      /* Panel Médico */
      _jsx(Route, {
        path: "/medico",
        element: _jsx(ProtectedRoute, {
          children: _jsx(RoleGuard, { allowed: ["DOCTOR"], children: _jsx(Dashboard, {}) })
        })
      }),

      /* Fotos */
      _jsx(Route, {
        path: "/photos",
        element: _jsx(ProtectedRoute, {
          children: _jsx(RoleGuard, { allowed: ["PATIENT", "CAREGIVER"], children: _jsx(PhotosList, {}) })
        })
      }),
      _jsx(Route, {
        path: "/photos/tagger",
        element: _jsx(ProtectedRoute, {
          children: _jsx(RoleGuard, { allowed: ["PATIENT", "CAREGIVER"], children: _jsx(PhotosTagger, {}) })
        })
      }),

      /* Describir (paciente) */
      _jsx(Route, {
        path: "/describe",
        element: _jsx(ProtectedRoute, {
          children: _jsx(RoleGuard, { allowed: ["PATIENT"], children: _jsx(Navigate, { to: "/describe/wizard", replace: true }) })
        })
      }),
      _jsx(Route, {
        path: "/describe/text",
        element: _jsx(ProtectedRoute, {
          children: _jsx(RoleGuard, { allowed: ["PATIENT"], children: _jsx(DescribeText, {}) })
        })
      }),
      _jsx(Route, {
        path: "/describe/voice",
        element: _jsx(ProtectedRoute, {
          children: _jsx(RoleGuard, { allowed: ["PATIENT"], children: _jsx(DescribeVoice, {}) })
        })
      }),
      _jsx(Route, {
        path: "/describe/wizard",
        element: _jsx(ProtectedRoute, {
          children: _jsx(RoleGuard, { allowed: ["PATIENT"], children: _jsx(DescribeWizard, {}) })
        })
      }),

      /* Reportes (incluye paciente) */
      _jsx(Route, {
        path: "/reports",
        element: _jsx(ProtectedRoute, {
          children: _jsx(RoleGuard, { allowed: ["DOCTOR", "CAREGIVER", "PATIENT"], children: _jsx(ReportsTrends, {}) })
        })
      }),
      _jsx(Route, {
        path: "/reports/:id",
        element: _jsx(ProtectedRoute, {
          children: _jsx(RoleGuard, { allowed: ["DOCTOR", "CAREGIVER", "PATIENT"], children: _jsx(ReportsDetail, {}) })
        })
      }),

      /* ===== QUIZZES ===== */
      // 🔁 /quiz redirige al listado de resultados del paciente
      _jsx(Route, {
        path: "/quiz",
        element: _jsx(ProtectedRoute, {
          children: _jsx(RoleGuard, { allowed: ["PATIENT"], children: _jsx(Navigate, { to: "/quiz/results", replace: true }) })
        })
      }),
      _jsx(Route, {
        path: "/quiz/results",
        element: _jsx(ProtectedRoute, {
          children: _jsx(RoleGuard, { allowed: ["PATIENT"], children: _jsx(PatientQuizResults, {}) })
        })
      }),
      _jsx(Route, {
        path: "/quiz/take/:id",
        element: _jsx(ProtectedRoute, {
          children: _jsx(RoleGuard, { allowed: ["PATIENT"], children: _jsx(QuizTake, {}) })
        })
      }),
      _jsx(Route, {
        // ✅ unificado con el resto
        path: "/quiz/manage/:patientId",
        element: _jsx(ProtectedRoute, {
          children: _jsx(RoleGuard, { allowed: ["DOCTOR", "CAREGIVER"], children: _jsx(QuizManage, {}) })
        })
      }),

      /* Caregivers */
      _jsx(Route, {
        path: "/caregivers/manage",
        element: _jsx(ProtectedRoute, {
          children: _jsx(RoleGuard, { allowed: ["CAREGIVER"], children: _jsx(CaregiversManage, {}) })
        })
      }),
      _jsx(Route, {
        path: "/caregivers/patients",
        element: _jsx(ProtectedRoute, {
          children: _jsx(RoleGuard, { allowed: ["CAREGIVER"], children: _jsx(CaregiversPatients, {}) })
        })
      }),

      /* Doctors */
      _jsx(Route, {
        path: "/doctors/patients",
        element: _jsx(ProtectedRoute, {
          children: _jsx(RoleGuard, { allowed: ["DOCTOR"], children: _jsx(DoctorsPatients, {}) })
        })
      }),
      _jsx(Route, {
        path: "/doctors/mis-pacientes",
        element: _jsx(ProtectedRoute, {
          children: _jsx(RoleGuard, { allowed: ["DOCTOR"], children: _jsx(MyPatients, {}) })
        })
      }),
      _jsx(Route, {
        path: "/doctors/patient/:id",
        element: _jsx(ProtectedRoute, {
          children: _jsx(RoleGuard, { allowed: ["DOCTOR"], children: _jsx(PatientDetail, {}) })
        })
      }),

      /* Alerts / Reminders */
      _jsx(Route, {
        path: "/alerts",
        element: _jsx(ProtectedRoute, {
          children: _jsx(RoleGuard, { allowed: ["PATIENT", "CAREGIVER", "DOCTOR"], children: _jsx(AlertsSettings, {}) })
        })
      }),
      _jsx(Route, {
        path: "/reminders",
        element: _jsx(ProtectedRoute, {
          children: _jsx(RoleGuard, { allowed: ["PATIENT", "CAREGIVER"], children: _jsx(RemindersSettings, {}) })
        })
      }),

      /* Fallback */
      _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })
    ]
  })
);
