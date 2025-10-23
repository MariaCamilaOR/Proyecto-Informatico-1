import React from "react";
import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/Layout/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PhotosList from "./pages/Photos/List";
import PhotosUpload from "./pages/Photos/Upload";
import PhotosTagger from "./pages/Photos/Tagger";
import DescribeText from "./pages/Describe/Text";
import DescribeVoice from "./pages/Describe/Voice";
import DescribeWizard from "./pages/Describe/Wizard";
import ReportsTrends from "./pages/Reports/Trends";
import ReportsDetail from "./pages/Reports/Detail";
import AlertsSettings from "./pages/Alerts/Settings";
import RemindersSettings from "./pages/Reminders/Settings";
import CaregiversManage from "./pages/Caregivers/Manage";
import CaregiversPatients from "./pages/Caregivers/Patients";

export const appRoutes = (
  <>
    <Route path="/login" element={<Login />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/" element={<Dashboard />} />
      <Route path="/photos" element={<PhotosList />} />
      <Route path="/photos/upload" element={<PhotosUpload />} />
      <Route path="/photos/tagger" element={<PhotosTagger />} />
      <Route path="/describe/text" element={<DescribeText />} />
      <Route path="/describe/voice" element={<DescribeVoice />} />
      <Route path="/describe/wizard" element={<DescribeWizard />} />
      <Route path="/reports" element={<ReportsTrends />} />
      <Route path="/reports/:id" element={<ReportsDetail />} />
      <Route path="/alerts" element={<AlertsSettings />} />
      <Route path="/reminders" element={<RemindersSettings />} />
      <Route path="/caregivers/manage" element={<CaregiversManage />} />
      <Route path="/caregivers/patients" element={<CaregiversPatients />} />
    </Route>
    <Route path="*" element={<Navigate to="/" />} />
  </>
);