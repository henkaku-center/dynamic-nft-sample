import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import React, { useEffect, useState } from "react"
import { Divider, Grid, Button, Header, Container, Input } from 'semantic-ui-react'
const {Row, Column } = Grid

import { ethers } from "ethers"
import DynamicNFT from "../artifacts/contracts/DynamicNFT.sol/DynamicNFT.json"

const CONTRACT_ADDRESS = "0x691A42DAD672C90Ba435eA01D2c5cB0f6943c46D"

const ConnectWallet = ({setAcount}) => {
  return (
      <Button onClick={() => connectWallet(setAcount)}>
      connect wallet
      </Button>
  )
}

const setWalletAccountIfConnected = async (setAccount) => {
  const { ethereum } = window;

  if (!ethereum) {
    console.log("Install metamask")
  }

  const accounts = await ethereum.request({method: "eth_accounts"})
  setAccount(accounts[0])
}

const getDataURI = async (tokenId) => {
  try {
    const { ethereum } = window
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, DynamicNFT.abi, signer)
      const dataURI = await contract.tokenURI(tokenId)
      return dataURI
    }
  } catch (e) {
    console.log(e)
    return;
  }
}

const ShowSVGImage = ({dataURI}) => {
  const json = atob(dataURI.substring(29));
  const { image } = JSON.parse(json);
  console.log(image)
  return (
    <img src={image} />
  )
}

const connectWallet = async (setAccount) => {
    try {
      const { ethereum } = window
      if (!ethereum) {
        alert("Install metamask")
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts"})
      setAccount(accounts[0])
    } catch (e) {
      console.error(e)
    }
}

const mintNft = async (ownersMsg, viewableMsg, setLoading, setTokenId) => {
  if (!viewableMsg || !ownersMsg) {
    alert('enter messages')
    return
  }
  setLoading(true)
  console.log(viewableMsg, ownersMsg)
  try {
    const { ethereum } = window
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, DynamicNFT.abi, signer)

      let tx = await contract.makeDyamicNFT(ownersMsg, viewableMsg)
      const logs = await tx.wait()
      setTokenId(logs.events[0].args.tokenId.toNumber())
      alert("Tada! 🎉 check your account in testnet opensea! https://testnets.opensea.io/ , it takes 5, 10min to dipct")
    }
  } catch (e) {
    console.log(e)
  }
  setLoading(false)
}

const Home = () => {
  const [account, setAcount] = useState()
  const [viewableMsg, setViewableMsg] = useState("")
  const [ownersMsg, setOwnersMsg] = useState("")
  const [loading, setLoading] = useState(false)
  const [tokenId, setTokenId] = useState()
  const [dataURI, setDataURI] = useState()

  useEffect(() => {
    setWalletAccountIfConnected(setAcount)
  }, [])


  useEffect(async() => {
    setDataURI(await getDataURI(tokenId))
  }, [tokenId])
  return (
    <Grid>
      <Row/>
      <Row/>
      <Row>
        <Column>
          <Container centered="true" text>
            <Header as='h1' icon='plug' content='Make and Mint your Original Dynamic NFT 🦄' />
            {account && <p>your wallet address: {account}</p>}
            { account == null ? (
              <ConnectWallet setAcount={setAcount}/>
            ) : (
              <>
              <div>
                <p>A message only owner of the NFT can see: </p>
                <Input placeholder='' row={100} onChange={({target}) => setOwnersMsg(target.value)} value={ownersMsg}/>
              </div>
              <div>
                <p>A message others can see: </p>
                <Input placeholder='' row={100} onChange={({target}) => setViewableMsg(target.value)} value={viewableMsg}/>
              </div>
              <div style={{marginTop: 15}} />
              <Button onClick={() => mintNft(ownersMsg, viewableMsg, setLoading, setTokenId)} color='teal' size="large" loading={loading}>
               mint it
              </Button>
              </>
            ) }

            <Divider horizontal>
              <Header as='h4'>
                Show Image of TokenId
              </Header>
            </Divider>
            <p>Enter Token ID (must be a number)</p>
            <input value={tokenId} onChange={({target}) => setTokenId(target.value)} />
            { tokenId && <p><a href={`https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId}`} target="_blank">> Check NFT in Opeansea</a></p> }
            { tokenId && <p><a href={`https://rinkeby.rarible.com/search/collections/${CONTRACT_ADDRESS}:${tokenId}`} target="_blank">> Check NFT in rarible</a></p> }
            { dataURI && <ShowSVGImage dataURI={dataURI} /> }
          </Container>
        </Column>
      </Row>
    </Grid>
  )
}

export default Home;
