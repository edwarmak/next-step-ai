import AnalyzeJobCard from "./components/AnalyzeJobCard";
import RecentJobs from "./components/RecentJobs";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PagePlaceholder from "./components/PagePlaceholder";
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
            element={
              <PagePlaceholder
                title="Analyze a job"
                description="Your job analysis workspace is coming soon. You’ll be able to bring a job description and resume together to see what to highlight in your application."
              />
            }
          />
          <Route
            path="/applications"
            element={
              <PagePlaceholder
                title="My Applications"
                description="Keep your job search organized in one place. Applications you save and analyze will be collected here."
              />
            }
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
