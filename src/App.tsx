import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import AppContent from "./app/AppContent";

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;


