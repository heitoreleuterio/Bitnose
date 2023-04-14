import React from "react";
import Main from "./pages/main";
import Search from "./pages/search";
import { Provider } from "react-redux";
import searchReducer from "./redux/reducers/searchReducer";
import { configureStore } from "@reduxjs/toolkit"


import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {

  const store = configureStore({
    reducer: searchReducer
  });

  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<Main />}>
          </Route>
          <Route exact path="/search" element={<Search />}></Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
