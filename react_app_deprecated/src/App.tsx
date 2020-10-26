import React from 'react';
import { HashRouter, Switch, Route } from "react-router-dom";
import './App.css';
import { Home } from './Pages/Home';
import { RoutManage } from './Pages/RoutManage';

function App() {
  return (
    <div className="App">
      <HashRouter>
        <Switch>
          <Route path="/" exact component={ Home } />
          <Route path="/routemanage" exact component={ RoutManage } />
        </Switch>
      </HashRouter>
    </div>
  );
}

export default App;
