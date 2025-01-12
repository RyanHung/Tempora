import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import {ToDoListPage} from "./ToDoListPage"
import {RecommendationPage} from "./RecommendationPage"
import {CreateUserPage} from "./CreateUserPage"
import {LoginPage} from "./LoginPage"
import {FrontPage} from "./FrontPage"
import {AvailabilityPage} from "./AvailabilityPage"

export const Home = () => {
    return (
    <Router>
        <Routes>
          <Route path="/" element={<FrontPage />} />
          <Route path="/recommendation" element={<RecommendationPage />} />
          <Route path="/availability" element={<AvailabilityPage />} />
          <Route path="/todo" element={<ToDoListPage />} />
          <Route path="/create-user" element={<CreateUserPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
    </Router>);
  };
