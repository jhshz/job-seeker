import { createBrowserRouter, Navigate, Outlet } from "react-router";
import { AppShell } from "@/components/layouts/app-shell";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { ProtectedRoute } from "@/components/layouts/protected-route";
import { RoleRoute } from "@/components/layouts/role-route";
import { RecruiterLayout } from "@/components/layouts/recruiter-layout";
import {
  Home,
  Jobs,
  JobDetails,
  RecruiterPublic,
  Login,
  Register,
  OtpVerify,
  SeekerDashboard,
  SeekerProfile,
  SeekerApplications,
  SeekerResumes,
  ResumeWizard,
  RecruiterDashboard,
  RecruiterProfile,
  RecruiterJobs,
  CreateJob,
  EditJob,
  JobApplications,
} from "@/pages";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Home /> },
      { path: "jobs", element: <Jobs /> },
      { path: "jobs/:jobId", element: <JobDetails /> },
      { path: "recruiters/:recruiterId", element: <RecruiterPublic /> },
      {
        path: "auth",
        element: <AuthLayout />,
        children: [
          {
            path: "login",
            element: <Login />,
            handle: {
              title: "ورود",
            },
          },
          {
            path: "register",
            element: <Register />,
            handle: {
              title: "ثبت‌نام",
            },
          },
          {
            path: "otp-verify",
            element: <OtpVerify />,
            handle: {
              title: "تایید کد",
              description: "کد ارسال شده را وارد کنید",
            },
          },
        ],
      },
      {
        path: "seeker",
        element: (
          <ProtectedRoute>
            <RoleRoute role="seeker">
              <Outlet />
            </RoleRoute>
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Navigate to="/seeker/dashboard" replace /> },
          { path: "dashboard", element: <SeekerDashboard /> },
          { path: "profile", element: <SeekerProfile /> },
          { path: "applications", element: <SeekerApplications /> },
          { path: "resumes", element: <SeekerResumes /> },
          { path: "resume-wizard", element: <ResumeWizard /> },
        ],
      },
      {
        path: "recruiter",
        element: (
          <ProtectedRoute>
            <RoleRoute role="recruiter">
              <RecruiterLayout />
            </RoleRoute>
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="/recruiter/dashboard" replace />,
          },
          { path: "dashboard", element: <RecruiterDashboard /> },
          { path: "profile", element: <RecruiterProfile /> },
          { path: "jobs", element: <RecruiterJobs /> },
          { path: "jobs/create", element: <CreateJob /> },
          { path: "jobs/:jobId/edit", element: <EditJob /> },
          { path: "jobs/:jobId/applications", element: <JobApplications /> },
        ],
      },
    ],
  },
]);
