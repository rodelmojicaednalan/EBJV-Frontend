import { useState, useRef, useEffect } from "react";
// other previous imports
import * as htmlToImage from "html-to-image";
import QRCode from 'react-qr-code'
import './QRCodeStyle.css'
function QrCodeGenerator({fileName, projectId }) {
  const [url, setUrl] = useState("");
  const [qrIsVisible, setQrIsVisible] = useState(false);
  const qrCodeRef = useRef(null);

  useEffect(() => {
    if (fileName && projectId) {
      setUrl(`https://evjbportal.olongapobataanzambalesads.com/ifc-viewer/${projectId}/${fileName}`);
    }
  }, [fileName, projectId]);

  const handleQrCodeGenerator = () => {
    if (!url) {
      return;
    }
    setQrIsVisible(true);
  };

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

        <button className="btn btn-primary addbtn" onClick={handleQrCodeGenerator}>Generate QR Code</button>
      </div>
     
    </div>
  </div>
  );
}
export default QrCodeGenerator;