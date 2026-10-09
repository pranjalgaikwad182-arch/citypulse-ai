import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Place, CitizenReport, WeatherData, TrafficIncident, User } from './types';
import { api } from './services/api';

// Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastContainer, ToastMessage } from './components/Toast';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { ExplorePage } from './pages/ExplorePage';
import { HeritagePage } from './pages/HeritagePage';
import { SafetyPage } from './pages/SafetyPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { ReportsPage } from './pages/ReportsPage';
import { ItineraryPage } from './pages/ItineraryPage';
import { CommunityPage } from './pages/CommunityPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AdminPage } from './pages/AdminPage';

export function App() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [traffic, setTraffic] = useState<TrafficIncident[]>([]);
  const [itineraryStops, setItineraryStops] = useState<Place[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('Pune');

  // Auth State
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('citypulse_token'));
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('citypulse_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (
    title: string,
    message: string,
    type: 'success' | 'warning' | 'error' | 'info' = 'info'
  ) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial Data Fetch
  useEffect(() => {
    api.getPlaces()
      .then((data) => setPlaces(data))
      .catch((err) => console.error('Failed to load places:', err));

    api.getReports()
      .then((data) => setReports(data))
      .catch((err) => console.error('Failed to load reports:', err));

    api.getWeather()
      .then((data) => setWeather(data))
      .catch((err) => console.error('Failed to load weather:', err));

    api.getTraffic()
      .then((data) => setTraffic(data))
      .catch((err) => console.error('Failed to load traffic:', err));
  }, []);

  const handleAddToItinerary = (place: Place) => {
    if (itineraryStops.some((p) => p.id === place.id)) {
      setItineraryStops(itineraryStops.filter((p) => p.id !== place.id));
      showToast('Removed from Itinerary', `${place.name} removed.`, 'info');
    } else {
      setItineraryStops([...itineraryStops, place]);
      showToast('Added to Itinerary', `${place.name} added to your plan.`, 'success');
    }
  };

  const handleLogin = (token: string, user: User) => {
    setAuthToken(token);
    setCurrentUser(user);
    localStorage.setItem('citypulse_token', token);
    localStorage.setItem('citypulse_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    localStorage.removeItem('citypulse_token');
    localStorage.removeItem('citypulse_user');
    showToast('Logged Out', 'You have been signed out.', 'info');
  };

  const handleReportCreated = (newReport: CitizenReport) => {
    setReports((prev) => [newReport, ...prev]);
  };

  const handleReportUpdated = (updated: CitizenReport) => {
    setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
        <Navbar
          weather={weather}
          selectedCity={selectedCity}
          onSelectCity={setSelectedCity}
          isAdminLoggedIn={currentUser?.role === 'admin'}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Routes>
            <Route
              path="/"
              element={
                <DashboardPage
                  places={places}
                  reports={reports}
                  weather={weather}
                  traffic={traffic}
                  onAddToItinerary={handleAddToItinerary}
                  itineraryPlaceIds={itineraryStops.map((p) => p.id)}
                />
              }
            />
            <Route
              path="/explore"
              element={
                <ExplorePage
                  places={places}
                  onAddToItinerary={handleAddToItinerary}
                  itineraryPlaceIds={itineraryStops.map((p) => p.id)}
                />
              }
            />
            <Route path="/heritage" element={<HeritagePage />} />
            <Route path="/safety" element={<SafetyPage reports={reports} />} />
            <Route path="/compare" element={<ComparisonPage places={places} />} />
            <Route
              path="/ai"
              element={
                <AIAssistantPage
                  onAddToItinerary={handleAddToItinerary}
                  itineraryPlaceIds={itineraryStops.map((p) => p.id)}
                  allPlaces={places}
                />
              }
            />
            <Route
              path="/reports"
              element={
                <ReportsPage
                  reports={reports}
                  onReportCreated={handleReportCreated}
                  showToast={showToast}
                />
              }
            />
            <Route
              path="/itinerary"
              element={
                <ItineraryPage
                  customStops={itineraryStops}
                  onRemoveCustomStop={(id) => setItineraryStops(itineraryStops.filter((p) => p.id !== id))}
                  showToast={showToast}
                />
              }
            />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route
              path="/admin"
              element={
                <AdminPage
                  reports={reports}
                  onReportUpdated={handleReportUpdated}
                  currentUser={currentUser}
                  authToken={authToken}
                  onLogin={handleLogin}
                  onLogout={handleLogout}
                  showToast={showToast}
                />
              }
            />
          </Routes>
        </main>

        <Footer />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    </BrowserRouter>
  );
}

export default App;
