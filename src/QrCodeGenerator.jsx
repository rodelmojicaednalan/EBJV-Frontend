import { useState, useRef, useEffect } from "react";
// other previous imports
import * as htmlToImage from "html-to-image";
import QRCode from 'react-qr-code'
import './QRCodeStyle.css'
import {Toast, ToastContainer} from 'react-bootstrap'
// eslint-disable-next-line react/prop-types
function QrCodeGenerator({fileName, projectId }) {
  const [url, setUrl] = useState("");
  const [qrIsVisible, setQrIsVisible] = useState(true);
  const qrCodeRef = useRef(null);
  const [position, setPosition] = useState('bottom-end');
 const [showCopy, setShowCopy] = useState(false);

 const toggleShowCopy = () => setShowCopy(!showCopy);
  useEffect(() => {
    if (fileName && projectId) {
      setUrl(`https://evjbportal.olongapobataanzambalesads.com/ifc-viewer/${projectId}/${fileName}`);
    }
  }, [fileName, projectId]);

  // const handleQrCodeGenerator = () => {
  //   if (!url) {
  //     return;
  //   }
  //   setQrIsVisible(true);
  // };

  const downloadQRCode = () => {
    htmlToImage
      .toPng(qrCodeRef.current)
      .then(function (dataUrl) {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `${Date.now()}_EVJV-QRCode.png`;
        link.click();
      })
      .catch(function (error) {
        console.error("Error generating QR code:", error);
      });
  };
  
  const copyToClipboard = () => {
    if (!url) {
      return;
    }
    navigator.clipboard.writeText(url)
      .then(() => {
      toggleShowCopy()
      })
      .catch((error) => {
        console.error("Error copying URL to clipboard:", error);
      });
  };

  

  return (
    <div className="qrcode__container">
    {/* <h1>QR Code Generator</h1> */}
    <div className="qrcode__container--parent" >
    {qrIsVisible && (
        <div className="qrcode__download">
          <div className="qrcode__image" ref={qrCodeRef}>
            <QRCode value={url} size={150} />
          </div>
          <button  className="btn btn-primary addbtn" onClick={downloadQRCode}>Download QR Code</button>
        </div>
      )}

      <div className="qrcode__input">
        <input
          type="text"
          placeholder="Enter a URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={true}
        />
        <div className="d-flex">
        {/* <button className="btn btn-primary addbtn mr-2" onClick={handleQrCodeGenerator}>Generate</button> */}
        <button className="btn btn-secondary addbtn ml-2" onClick={copyToClipboard}> Copy Link</button>
        </div>
        
      </div>
     
    </div>

    <ToastContainer
          className="p-3"
          position={position}
          style={{ zIndex: 1 }}
        >
          <Toast
            onClose={toggleShowCopy}
            show={showCopy}
            delay={1500} 
            autohide
          >
            <Toast.Header closeButton={false}>
              <img
                src="holder.js/20x20?text=%20"
                className="rounded me-2"
                alt=""
              />
              <strong className="me-auto">Link copied to clipboard</strong>
            </Toast.Header>
            {/* <Toast.Body>Hello, world! This is a toast message.</Toast.Body> */}
          </Toast>
        </ToastContainer>
  </div>
  );
}
export default QrCodeGenerator;