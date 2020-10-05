import React from 'react';
import { HashRouter, Switch, Route } from "react-router-dom";
import './App.css';
import { Home } from './Pages/Home';

function App() {
  return (
    <div className="App">
      <HashRouter>
        <Switch>
          <Route path="/" exact component={ Home } />
        </Switch>
      </HashRouter>
    </div>
  );
}

export default App;
