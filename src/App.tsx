import AnalyzeJobCard from "./components/JobAnalysis/AnalyzeJobCard";
import RecentJobs from "./components/RecentJobs";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PagePlaceholder from "./components/PagePlaceholder";
import JobAnalysis from "./pages/JobAnalysis";
import SavedResumes from "./pages/SavedResumes";
import AuthPage from "./pages/AuthPage";
import "./App.css";
import { Route, Routes } from "react-router-dom";

function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <div className="dashboard-content">
                <Header />
                <AnalyzeJobCard />
                <RecentJobs />
                <Footer />
              </div>
            }
          />
          <Route
            path="/analyze"
            element={<JobAnalysis />}
          />
          <Route
            path="/applications"
            element={<SavedResumes />}
          />
          <Route
            path="/settings"
            element={
              <PagePlaceholder
                title="Settings"
                description="Manage your RoleReady workspace and preferences here. Settings will be available soon."
              />
            }
          />
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="*"
            element={
              <PagePlaceholder
                title="Page not found"
                description="That page doesn’t exist. Head back to your dashboard to continue."
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
