import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreatePoint from './pages/CreatePoint';
import PointList from './pages/PointList';
import PointDetails from './pages/PointDetails';
import MapView from './pages/MapView';
import GlobalMap from './pages/GlobalMap';
import RegionPage from './pages/RegionPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/regions" element={<GlobalMap />} />
          <Route path="/region/:slug" element={<RegionPage />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/points" element={<PointList />} />
          <Route path="/points/:id" element={<PointDetails />} />
          <Route
            path="/create-point"
            element={
              <ProtectedRoute>
                <CreatePoint />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

