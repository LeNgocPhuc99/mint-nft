import React, { FC, ReactNode, useMemo } from 'react';
import './App.css';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider, useAnchorWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import {
  GlowWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import * as anchor from "@project-serum/anchor";
import {
  Program, Provider, web3, Wallet
} from '@project-serum/anchor';
import {
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createInitializeMintInstruction,
  MINT_SIZE,
} from "@solana/spl-token";

import { clusterApiUrl, Connection } from '@solana/web3.js';

import idl from "./idl.json";

require('@solana/wallet-adapter-react-ui/styles.css');

function App() {
  return (
    <Context>
      <Content />
    </Context>
  );
}

export default App;


const Context: FC<{ children: ReactNode }> = ({ children }) => {

  const network = WalletAdapterNetwork.Devnet;

  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new GlowWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new TorusWalletAdapter(),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

const Content: FC = () => {
  const wallet = useAnchorWallet();
  const baseAccount = web3.Keypair.generate();

  function getProvider() {
    if (!wallet) {
      return null;
    }

    const network = "https://api.devnet.solana.com";
    const connection = new Connection(network, "processed");

    const provider = new Provider(
      connection, wallet, { "preflightCommitment": "processed" },
    );
    return provider;
  }

  async function mintNFT() {
    const provider = getProvider();

    if (!provider) {
      throw ("Provider is null");
    }

    // create a program interface (<=> create contract)
    const a = JSON.stringify(idl);
    const b = JSON.parse(a);
    const program = new Program(b, idl.metadata.address, provider);

    // call instruction
    try {
      await program.rpc.increment({
        accounts: {
          myAccount: baseAccount.publicKey,
        },
      });

      const account = await program.account.myAccount.fetch(baseAccount.publicKey);
      console.log('account: ', account.data.toString());
    } catch (err) {
      console.log(err);
    }
  }



  return (
    <div>
      <div className="App">
        <WalletMultiButton />
      </div>
      <br />
      <div className="App">
        <button>Mint</button>
      </div>

    </div>

  );
};
