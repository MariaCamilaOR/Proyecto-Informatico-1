// src/routes.tsx
import React from "react";
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

export const appRoutes = (
  <>
    {/* públicas */}
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    {/* landing autenticada: decide portal por rol */}
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <RoleRedirect />
        </ProtectedRoute>
      }
    />

    {/* portales por rol (placeholder: Dashboard en los 3) */}
    <Route
      path="/paciente"
      element={
        <ProtectedRoute>
          <RoleGuard allowed={["PATIENT"]}>
            <Dashboard />
          </RoleGuard>
        </ProtectedRoute>
      }
    />
    <Route
      path="/patient/gallery"
      element={
        <ProtectedRoute>
          <RoleGuard allowed={["PATIENT"]}>
            <PatientGallery />
          </RoleGuard>
        </ProtectedRoute>
      }
    />
    <Route
      path="/patient/caretaker"
      element={
        <ProtectedRoute>
          <RoleGuard allowed={["PATIENT"]}>
            <PatientCaretaker />
          </RoleGuard>
        </ProtectedRoute>
      }
    />
    <Route
      path="/cuidador"
      element={
        <ProtectedRoute>
          <RoleGuard allowed={["CAREGIVER"]}>
            <Dashboard />
          </RoleGuard>
        </ProtectedRoute>
      }
    />
    <Route
      path="/cuidador/photos/upload"
      element={
        <ProtectedRoute>
          <RoleGuard allowed={["CAREGIVER"]}>
            <PhotosUpload />
          </RoleGuard>
        </ProtectedRoute>
      }
    />
    <Route
      path="/medico"
      element={
        <ProtectedRoute>
          <RoleGuard allowed={["DOCTOR"]}>
            <Dashboard />
          </RoleGuard>
        </ProtectedRoute>
      }
    />

    {/* Módulos funcionales */}
    <Route
      path="/photos"
      element={
        <ProtectedRoute>
          <RoleGuard allowed={["PATIENT", "CAREGIVER"]}>
            <PhotosList />
          </RoleGuard>
        </ProtectedRoute>
      }
    />
    {/* upload is caregiver-only and lives under the caregiver portal path to avoid patient discovery */}
    <Route
      path="/photos/tagger"
      element={
        <ProtectedRoute>
          <RoleGuard allowed={["PATIENT", "CAREGIVER"]}>
            <PhotosTagger />
          </RoleGuard>
        </ProtectedRoute>
      }
    />

    {/* Describe: agrega índice para la base /describe */}
    <Route
      path="/describe"
      element={
        <ProtectedRoute>
          <RoleGuard allowed={["PATIENT"]}>
            <Navigate to="/describe/wizard" replace />
          </RoleGuard>
        </ProtectedRoute>
      }
    />
    <Route
      path="/describe/text"
      element={
        <ProtectedRoute>
          <RoleGuard allowed={["PATIENT"]}>
            <DescribeText />
          </RoleGuard>
        </ProtectedRoute>
      }
    />
    <Route
      path="/describe/voice"
      element={
        <ProtectedRoute>
          <RoleGuard allowed={["PATIENT"]}>
            <DescribeVoice />
          </RoleGuard>
        </ProtectedRoute>
      }
    />
    <Route
      path="/describe/wizard"
      element={
        <ProtectedRoute>
          <RoleGuard allowed={["PATIENT"]}>
            <DescribeWizard />
          </RoleGuard>
        </ProtectedRoute>
      }
    />

    <Route
      path="/reports"
      element={
        <ProtectedRoute>
          <RoleGuard allowed={["DOCTOR", "CAREGIVER"]}>
            <ReportsTrends />
          </RoleGuard>
        </ProtectedRoute>
      }
    />
    <Route
      path="/reports/:id"
      element={
        <ProtectedRoute>
          <RoleGuard allowed={["DOCTOR", "CAREGIVER"]}>
            <ReportsDetail />
          </RoleGuard>
        </ProtectedRoute>
      }
    />

    <Route
      path="/alerts"
      element={
        <ProtectedRoute>
          <RoleGuard allowed={["PATIENT", "CAREGIVER", "DOCTOR"]}>
            <AlertsSettings />
          </RoleGuard>
        </ProtectedRoute>
      }
    />
    <Route
      path="/reminders"
      element={
        <ProtectedRoute>
          <RoleGuard allowed={["PATIENT", "CAREGIVER"]}>
            <RemindersSettings />
          </RoleGuard>
        </ProtectedRoute>
      }
    />

    <Route
      path="/caregivers/manage"
      element={
        <ProtectedRoute>
          <RoleGuard allowed={["CAREGIVER"]}>
            <CaregiversManage />
          </RoleGuard>
        </ProtectedRoute>
      }
    />
    <Route
      path="/caregivers/patients"
      element={
        <ProtectedRoute>
          <RoleGuard allowed={["CAREGIVER"]}>
            <CaregiversPatients />
          </RoleGuard>
        </ProtectedRoute>
      }
    />

    {/* catch-all */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </>
);
