import React from 'react';
import { Route, Routes } from "react-router-dom";
import Account from './views/Account';
import BuyLand from './views/BuyLand';
import EstateVREdit from './views/EstateVREdit';
import EstateVRView from './views/EstateVRView';
import EstateView from './views/EstateView';
import Home from './views/Home';
import Overview from './views/Overview';
import ShowAR from './components/ShowAR/ShowAR';


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="buy-land" element={<BuyLand />} />
      <Route path="account" element={<Account />} />
      <Route path="overview" element={<Overview />} />
      <Route path="estate-view" element={<EstateView />} />
      <Route path="estatevr-edit" element={<EstateVREdit />} />
      <Route path="estatevr-view" element={<EstateVRView />} />
      <Route path="vrexperience" element={<ShowAR />} />
    </Routes>
  );
}
