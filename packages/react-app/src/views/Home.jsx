import { useState } from 'react' 
import { useContractReader, useContractLoader, useBalance } from "eth-hooks";
import { ethers } from "ethers";
import React from "react";
import { Link } from "react-router-dom";
import {  targetNetwork,
          gasPrice,
          selectedNetwork,
          injectedProvider,
          address,
          userProviderAndSigner,
          localProvider,
          blockExplorer,
} from '../App.jsx';

import {
  Account,
  Address,
  AddressInput,
  Balance,
  Contract,
  Faucet,
  GasGauge,
  Header,
  Ramp,
  ThemeSwitch,
} from "../components";
import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch } from "antd";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
import { Transactor } from '../helpers'
/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
function Home({ account, mainnetProvider, localProvider,writeContracts, readContracts,  yourLocalBalance, tx, price, targetNetwork, }) {
  // you can also use hooks locally in your component of choice
  // in this case, let's keep track of 'purpose' variable from our contract
  const vendorAddress = readContracts && readContracts.YourVyperContract && readContracts.YourVyperContract.address;

  const vendorETHBalance = useBalance(localProvider, vendorAddress);
   console.log("💵 vendorETHBalance", vendorETHBalance ? ethers.utils.formatEther(vendorETHBalance) : "...");


  const vendorTokenBalance = useContractReader(readContracts, "YourVyperContract", "balanceOf", [vendorAddress]); 
    console.log("🏵 vendorTokenBalance:", vendorTokenBalance ? ethers.utils.formatEther(vendorTokenBalance) : "...");


  const tokensPerETH = useContractReader(readContracts, "YourVyperContract", "tokensPerETH");
  console.log("🏦 tokensPerETH:", tokensPerETH ? tokensPerETH.toString() : "...");

  const [tokenSellAmount, setTokenSellAmount] = useState({
  valid: false,
  value:"",

  });

  const [tokenBuyAmount, setTokenBuyAmount] = useState({
    valid: false,
    value: "",

  }); 
 
  const ethCostToPurchaseTokens = tokenBuyAmount.valid &&
    tokensPerETH &&
    ethers.utils.parseEther("" + tokenBuyAmount.value / parseFloat(tokensPerETH));
     console.log("ethCostToPurchaseTokens:", ethCostToPurchaseTokens);

  const ethValueToSellTokens = tokenSellAmount.valid &&
  tokensPerETH &&
  ethers.utils.parseEther("" + tokenSellAmount.value / parseFloat(tokensPerETH));
  console.log("ethValueToSellTokens:", ethValueToSellTokens);

  const [buying, setBuying] = useState();

  return (
     
  <div>
<div style={{ padding: 8, marginTop: 32, width: 300, margin: "auto" }}>
            <div style={{ padding: 8, fontSize: 20 }}>tokens per ETH</div>

     <div style={{ padding: 8 }}>
                  <Input
                    style={{ textAlign: "center" }}
                    placeholder={"amount of tokens to buy"}
                    value={tokenBuyAmount.value}
                    onChange={e => {
                      const newValue = e.target.value.startsWith(".") ? "0." : e.target.value;
                      const buyAmount = {
                        value: newValue,
                        valid: /^\d*\.?\d+$/.test(newValue),
                      };
                      setTokenBuyAmount(buyAmount);
                    }}
                  />
                  <Balance balance={ethCostToPurchaseTokens} dollarMultiplier={price} />
                </div>

                 <div style={{ padding: 8 }}>
                  <Button
                    type={"primary"}
                    loading={buying}
                    onClick={async () => {
                      setBuying(true);
                     await tx(writeContracts.YourVyperContract.buyToken({ value: ethCostToPurchaseTokens }));
                      setBuying(false);
                    }}
                    disabled={!tokenBuyAmount.valid}
                  >
                    Buy Tokens
                  </Button>
                </div> 
</div>
      <Divider />
    <div style={{ padding: 8, marginTop: 32, width: 300, margin: "auto" }}>
      <div style={{ padding: 8, fontSize: 20 }}>sell tokens for ETH</div>
      <div style={{ padding: 8 }}>
        <Input
          style={{ textAlign: "center" }}
          placeholder={"amount of tokens to sell"}
          value={tokenSellAmount.value}
           onChange={e => {
                      const newValue = e.target.value.startsWith(".") ? "0." : e.target.value;
                      const sellAmount = {
                        value: newValue,
                        valid: /^\d*\.?\d+$/.test(newValue)
                      }
                      setTokenSellAmount(sellAmount);
                    }}
      />
        </div>
        </div>
        <div style={{padding: 8 }}>
        <Button
                      type={"primary"}
                      loading={buying}
                      onClick={async () => {
                        setBuying(true);
                        await tx(writeContracts.YourVyperContract.sellTokens(tokenSellAmount.valid && ethers.utils.parseEther(tokenSellAmount.value)));
                        setBuying(false);
                        setTokenSellAmount("");
                      }}
                      disabled={!tokenSellAmount.valid}
                    >
                      Sell Tokens
                    </Button>
                  </div>
        <Divider />
                  <div style={{ padding: 8, marginTop: 32 }}>
              <div>Vendor Token Balance:</div>
              <Balance balance={vendorTokenBalance} fontSize={64} />
            </div>

            <div style={{ padding: 8 }}>
              <div>Vendor ETH Balance:</div>
              <Balance balance={vendorETHBalance} fontSize={64} /> ETH
            </div>

          <Divider />
        TokenVendor in Vyper:
        <Address
          address={readContracts && readContracts.YourVyperContract ? readContracts.YourVyperContract.address : null}
          ensProvider={mainnetProvider}
          fontSize={16}
        />
        <Divider />
         
    </div>


  );
}

export default Home;
