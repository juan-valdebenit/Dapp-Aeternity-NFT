import { Routes, Route } from "react-router-dom";
import { createGlobalStyle } from "styled-components";

import { HomePage } from "pages/HomePage";
import { MintPage } from "pages/MintPage";

import { PATH } from "constants/path";

import "./App.css";

const GlobalStyles = createGlobalStyle`
  background: linear-gradient(90deg, #000000 0%, rgb(58, 56, 49) 100%);
`;

function App() {
  return (
    <>
      <GlobalStyles />
      <Routes>
        <Route path={PATH.INDEX} element={<HomePage />} />
        <Route path={PATH.MINT} element={<MintPage />} />
      </Routes>
    </>
  );
}

export default App;
