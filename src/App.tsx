import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ConfigProvider } from "antd";
import "./App.css";
import AppContent from "./app/AppContent";
import { antdTheme } from "./theme";

const App: React.FC = () => {
  return (
    <ConfigProvider theme={antdTheme}>
      <Router>
        <AppContent />
      </Router>
    </ConfigProvider>
  );
};

export default App;


