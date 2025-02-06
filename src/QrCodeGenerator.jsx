import React, { useState, useRef, useEffect } from "react";
// other previous imports
import * as htmlToImage from "html-to-image";
import QRCode from 'react-qr-code'
import './QRCodeStyle.css'
import {Toast, ToastContainer} from 'react-bootstrap'
import insideQRImage from './assets/images/ebjv-logo-fab.png'
import view_model from './assets/images/view-model.png';

function QrCodeGenerator({ fileName, projectId }) {
  const [url, setUrl] = useState("");
  const [qrIsVisible, setQrIsVisible] = useState(true);
  const qrCodeRef = useRef(null);
  const [position, setPosition] = useState('bottom-end');
  const [showCopy, setShowCopy] = useState(false);

  const toggleShowCopy = () => setShowCopy(!showCopy);
  
  useEffect(() => {
    if (fileName && projectId) {
      let baseUrl = "https://cadstream.ebjv.e-fab.com.au";
      if (fileName.endsWith(".ifc")) {
        setUrl(`${baseUrl}/ifc-viewer/${projectId}/${fileName}`);
      } else if (fileName.endsWith(".pdf")) {
        setUrl(`${baseUrl}/project-folder/pdf-viewer/${projectId}/${fileName}`);
      }
    }
  }, [fileName, projectId]);

  const downloadQRCode = () => {
    const scale = 3; // Increase scale for higher resolution (e.g., 2x, 3x, 4x)
  
    htmlToImage
      .toCanvas(qrCodeRef.current, { pixelRatio: scale })
      .then((canvas) => {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png"); // Convert canvas to high-quality PNG
        link.download = `${Date.now()}_EBJV-QRCode.png`;
        link.click();
      })
      .catch((error) => {
        console.error("Error generating high-resolution QR code:", error);
      });
  };
  
  
  const copyToClipboard = () => {
    if (!url) {
      return;
    }
    navigator.clipboard.writeText(url)
      .then(() => {
        toggleShowCopy();
      })
      .catch((error) => {
        console.error("Error copying URL to clipboard:", error);
      });
  };

  return (
    <div className="qrcode__container">
      <div className="qrcode__container--parent" >
        {qrIsVisible && (
          <div className="qrcode__download">
            <div className="qrcode__image" ref={qrCodeRef}>
              <QRCode value={url} className="qr-tile-image"/> 
              <div className="qr-tile-bot-grp mt-3">
                <div>
                 <img src={insideQRImage} className="qr-tile-logo"/> 
                </div>
                <div className="d-flex flex-column align-items-center ml-4">
                  <img src={view_model} className="qr-tile-icon"/>
                 <span className="qr-tile-link"> Digital Model <br/> Scan or Click</span>
                </div>
              </div>
              {/* <div className="qr-tile-url">{url}</div> */}
            </div>
            <button className="btn btn-primary addbtn" onClick={downloadQRCode}>Download QR Code</button>
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
            <button className="btn btn-secondary addbtn ml-2" onClick={copyToClipboard}> Copy Link</button>
          </div>
        </div>
      </div>

      <ToastContainer className="p-3" position={position} style={{ zIndex: 99999999 }}>
        <Toast onClose={toggleShowCopy} show={showCopy} delay={1500} autohide>
          <Toast.Header closeButton={false}>
            <strong className="me-auto">Link copied to clipboard</strong>
          </Toast.Header>
        </Toast>
      </ToastContainer>
    </div>
  );
}

export default QrCodeGenerator;
