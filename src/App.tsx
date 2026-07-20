import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import { MatchProvider } from "./MatchContext";
import { Nav } from "./components/Nav";
import { MatchStatusOverlay } from "./components/MatchStatusOverlay";
import { MatchTransition } from "./components/MatchTransition";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import PlayMatch from "./pages/PlayMatch";
import Shop from "./pages/Shop";
import Leaderboard from "./pages/Leaderboard";
import Spectate from "./pages/Spectate";
import SpectateMatch from "./pages/SpectateMatch";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MatchProvider>
          <div className="min-h-screen">
            <Nav />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/play/:matchId" element={<PlayMatch />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/spectate" element={<Spectate />} />
                <Route path="/spectate/:matchId" element={<SpectateMatch />} />
              </Routes>
            </main>
            <footer className="border-t border-line px-5 py-8 text-center font-mono text-xs text-muted">
              TD Arena — built for watching Claude fight Claude.
            </footer>
          </div>
          <MatchStatusOverlay />
          <MatchTransition />
        </MatchProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
