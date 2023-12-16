import React from "react";
import { styled } from "@mui/material/styles";
import { PATH } from "constants/path";
import CurrencyBitcoinIcon from "@mui/icons-material/CurrencyBitcoin";
import IconButton from "@mui/material/IconButton";
import logo from "assets/logo.png";
import "App.css";

export const HomePage = () => {
  return (
    <div className="App">
      <header className="App-header">
        <a href="/">
          <img src={logo} className="App-logo" alt="logo" />
        </a>
        <IconButton
          aria-label="blockchain"
          color="primary"
          size="large"
          onClick={() => {
            window.location.href = PATH.MINT;
          }}
        >
          <StyledCurrencyBitcoinIcon />
        </IconButton>
      </header>
    </div>
  );
};

const StyledCurrencyBitcoinIcon = styled(CurrencyBitcoinIcon)`
  font-size: 100px;
`;
