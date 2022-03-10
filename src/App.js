import myEpicNft from './utils/MyEpicNFT.json';
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import ReactLoading from 'react-loading';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';


// Constantsを宣言する: constとは値書き換えを禁止した変数を宣言する方法です。
const TWITTER_HANDLE = 'georgesekkie';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;


const CONTRACT_ADDRESS = "0xcC0DB9cfa7AD4e94A377484160e80aD004227602";

const App  = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [count, setCount] = useState(0);
  const [minting, setMinting] = useState(false);
  
  console.log("currentAccount: ", currentAccount);
  
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
    } else {
        let chainId = await ethereum.request({ method: 'eth_chainId' });
        console.log("Connected to chain " + chainId);
        // 0x4 は　Rinkeby の ID です。
        const rinkebyChainId = "0x4";
        if (chainId !== rinkebyChainId) {
          alert("You are not connected to the Rinkeby Test Network!");
        }
        console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account)

      setupEventListener()
    } else {
      console.log("No authorized account found")
    }
  }


  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      setupEventListener()
    } catch (error) {
      console.log(error)
    }
  }

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      // NFT が発行されます。
      const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

      // Event が　emit される際に、コントラクトから送信される情報を受け取っています。
      connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
        console.log(from, tokenId.toNumber())
        alert(`あなたのウォレットに NFT を送信しました。OpenSea に表示されるまで最大で10分かかることがあります。NFT へのリンクはこちらです: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
      });

      console.log("Setup event listener!")

      } else {
      console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const askContractToMintNft = async () => {
    
    try {
      const { ethereum } = window;
      if (ethereum) {
        
       
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
        console.log("Going to pop wallet now to pay gas...")
        setMinting(true)
        let nftTxn = await connectedContract.makeAnEpicNFT();
        console.log("Mining...please wait.")
        await nftTxn.wait();
        setCount(count+1);
  
        console.log(`Minted, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
        setMinting(false)
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  // renderNotConnectedContainer メソッドを定義します。
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  const renderConnectedContainer = () => (
    <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
      Mint NFT
    </button>
  );

  const myCollectionButton = () => (
    <div className="my-button-container">
      <button onClick={myCollectionLink} className="sub-button">
        Own my collection is here！
      </button>
    </div>
  );

  const myCollectionLink = () => (
    window.open("https://testnets.opensea.io/collection/squarenft-yih8jcwi3c", '_blank')
  );

  const Normal = () => (
    <div className="App">
        <div className="container">
          <div className="header-container">
            <p className="header gradient-text">George's lovely words <br/>NFT Collection</p>
            <p className="sub-text">
              Mint your own special words NFT💫
            </p>
            {currentAccount === "" ? (
              renderNotConnectedContainer()
            ) : (
              renderConnectedContainer()
            )}
            <p className="follow-text">
             {`You now minted ${count} / ${TOTAL_MINT_COUNT}`}
            </p>
            {myCollectionButton()}
          </div>
          
          <div className="footer-container">
            <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
            <a
              className="footer-text"
              href={TWITTER_LINK}
              target="_blank"
              rel="noreferrer"
            >{`built on @${TWITTER_HANDLE}`}</a>
          </div>
        </div>
      </div>
  );

  const Loading = () => (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <div className="loading">
            <p className="sub-text">We are minting, give us 15 second....</p>
            <ReactLoading className="loading_content" type="spokes" color={'white'} height={200} width={200} />
          </div>
        </div>  
      </div>
    </div>
  );
  /*
  * ページがロードされたときに useEffect()内の関数が呼び出されます。
  */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])
  

  // loadingName(true);

  if (minting) {
    return (
      <Loading  />
    )
  }

  return (
    <Normal  />
  );
  
  
};

export default App;
