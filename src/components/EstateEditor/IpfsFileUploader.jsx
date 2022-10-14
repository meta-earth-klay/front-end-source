import { Button, useToast } from '@chakra-ui/react';
import { create } from 'ipfs-http-client';
import { useRef } from 'react';
import { NFTStorage, File, Blob } from 'nft.storage'

const all = require('it-all')


const auth = 'Bearer ';

const ipfs = create({
    host: 'api.nft.storage',
    port: 80,
    protocol: 'https',
    headers: {
        authorization: auth,
    },
});


const NFT_STORAGE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDAyNEYxOGNlOTUwMDMzNzExODU0QWIwNzcwMjE4ODlmODNFYjZCRTciLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2NTY4MDY3NDkzMSwibmFtZSI6Im1ldGFlYXJ0aC5zYnMifQ.zkDhumdznSyLoExf0Py-lNTdJ6GxLY8NoDZGfQNhQL4'
const client = new NFTStorage({ token: NFT_STORAGE_TOKEN })


window.ipfs = ipfs;
function IpfsFileUploader({ children, onClick, onCancel, result, accept, ...rest }) {
  const inputEl = useRef(null);
  const toast = useToast();
  function charge() {
    document.body.onfocus = () => {
      setTimeout(() => {
        if (inputEl.current.value.length === 0) {
          document.body.onfocus = null
          onCancel();
        }
      }, 1000);
    }
  }
  async function onChange(e) {
    try {
      
      const FilesHash =  await client.storeDirectory([e.target.files[0]])

      const FilesUrl = 'https://nftstorage.link/ipfs/' + FilesHash
      console.log(FilesUrl)
      result(FilesUrl + "/" + e.target.files[0].name);
    } catch (error) {
      toast({
        title: 'Error Upload File',
        description: error,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
    finally {
      inputEl.current.value = "";
    }
  }
  return (
    <>
      <Button {...rest} onClick={() => {
        inputEl.current.click()
        onClick();
        charge();
      }} >{children}</Button>
      <input ref={inputEl} style={{ display: "none" }} accept={accept}
        type="file"
        onChange={onChange}
      />
    </>
  );
}

export default IpfsFileUploader