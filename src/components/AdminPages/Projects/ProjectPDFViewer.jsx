import React, { useState, useEffect, useRef, useContext} from "react";
import axiosInstance from "../../../../axiosInstance.js";
import { useNavigate, useParams } from "react-router-dom";
import { PDFDocument, StandardFonts, PDFName, PDFAnnotation } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.entry";
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

// Set the PDF worker script
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js`;
import './ProjectStyles.css';

import useWindowWidth from '../Projects/ProjectFolderPages/windowWidthHook.jsx'
import ProjectSidebar from './ProjectFolderSidebar.jsx';
import SidebarOffcanvas from "./MobileSidebar.jsx";
import { FaChevronLeft } from "react-icons/fa6";
import { AuthContext } from '../../Authentication/authContext';
function ProjectFolder() {
    const { user } = useContext(AuthContext);
    const userRoles = user?.roles?.map((role) => role.role_name) || [];
    const isAdmin = userRoles.includes('Admin');
    console.log(isAdmin)
    const [isUserLoaded, setIsUserLoaded] = useState(false); 
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const windowWidthHook = useWindowWidth();
  const isMobile = windowWidthHook <= 425;
  const isTablet = windowWidthHook <= 768;
  const { projectId, fileName } = useParams();
  const [projectName, setProjectName] = useState("");
  const [projectStatus, setProjectStatus] = useState("Active");
  const [projectOwner, setProjectOwner] = useState("");
  const [ownerName, setOwnerName] = useState("")
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0); 
  const [pdfBlob, setPdfBlob] = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const canvasRef = useRef(null);
  const [viewerKey, setViewerKey] = useState(0);
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    if (user !== undefined) {
      setIsUserLoaded(true);
    }
  }, [user]);

useEffect(() => {
  setViewerKey(prev => prev + 1); // Change key to force refresh
}, [fileName]);

   // Fetch project details and populate fields
//    const fetchProjectDetails = async () => {
//     try {
//       const response = await axiosInstance.get(
//         `/project/${projectId}`
//       );
//       const {
//         project_name,
//         owner,
//       } = response.data;

//       setProjectName(project_name);
//       setOwnerName(`${owner.first_name} ${owner.last_name}`);

//     } catch (error) {
//       console.error('Error fetching project details:', error);
//     }
//   };


//   useEffect(() => {
//   fetchProjectDetails();
// }, [projectId, refreshKey]);
  

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target.result); // Store image as base64 Data URL
    };
    reader.readAsDataURL(file); // ✅ Use readAsDataURL instead of readAsArrayBuffer
  }
};


const modifyPDF = async () => {
  if (!uploadedImage || !fileName || !qrUrl) {
    alert("Please upload an image and provide a URL.");
    return;
  }

  try {
    console.log("📌 Starting modifyPDF function");

    // ✅ Generate a shortened link or use "Click Here!"

    // Fetch the existing PDF file
    const fileUrl = await axiosInstance.get(`/uploads/${fileName}`, { responseType: "arraybuffer" });
    const arrayBuffer = fileUrl.data;

    // Load the PDF into pdf-lib
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    console.log("✅ PDF loaded successfully");

    // ✅ Convert base64 to byte array
    const base64Data = uploadedImage.split(',')[1];
    const binaryString = atob(base64Data);
    const imageBytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      imageBytes[i] = binaryString.charCodeAt(i);
    }

    // Embed the image
    const image = await pdfDoc.embedPng(imageBytes);
    console.log("✅ Image embedded successfully");

    // Get page dimensions
    const { width, height } = firstPage.getSize();

    // Define margins and position for the QR code
    const margin = 30;
    const imageWidth = 180;
    const imageHeight = 260;
    const qrX = width - imageWidth - margin;
    const qrY = margin + 255;

    // Draw the image
    firstPage.drawImage(image, {
      x: qrX,
      y: qrY,
      width: imageWidth,
      height: imageHeight,
      opacity: 1,
    });

    console.log("✅ Image drawn on PDF");

    // Embed a font for the text
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    console.log("✅ Font embedded: Helvetica");

    // ✅ Draw the "Click Here!" text
    const fontSize = 14;
    const textY = qrY - 30;

    firstPage.drawText(qrUrl, {
      x: qrX,
      y: textY,
      size: fontSize,
      font, 
      wordBreaks: [' ', '-', '/', '.'],
      maxWidth: imageWidth,
    });

    // Save modified PDF
    const pdfBytes = await pdfDoc.save();
    const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
    setPdfBlob(pdfBlob);
    setPdfPreviewUrl(URL.createObjectURL(pdfBlob));

    console.log("✅ PDF modification complete");

    // Render PDF preview
    setViewerKey(prev => prev + 1); // Change key to force refresh
    renderPDFPreview(pdfBlob);
  } catch (error) {
    console.error("❌ Error modifying PDF:", error);
  }
};


const renderPDFPreview = async (pdfBlob) => {
  if (!canvasRef.current) return;

  const pdfUrl = URL.createObjectURL(pdfBlob);
  const loadingTask = pdfjsLib.getDocument(pdfUrl);
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1); // Render first page

  const canvas = canvasRef.current;
  const context = canvas.getContext("2d");

  const viewport = page.getViewport({ scale: .45 });
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  };

  await page.render(renderContext).promise;
};


const downloadPDF = () => {
  if (!pdfBlob) return;
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Modified_${fileName}.pdf`;
  link.click();
};

// console.log(fileName, pdfBlob)
// console.log(user)
const activeFileUrl = pdfPreviewUrl || `https://www.ebjv.api.e-fab.com.au/uploads/ifc-files/${fileName}`;

  return (
    <div className="container">
      {/* <h3 className="projectFolder-title" id="projectFolder-title" >
       {ownerName}&apos;s {projectName}
      </h3> */}
      <div className="container-content" id="project-folder-container">
      {/* <div className="projectFolder-sidebar-container">
        {isMobile ? (
          <SidebarOffcanvas projectId={projectId} />
        ) : (
          <ProjectSidebar projectId={projectId} />
        )}
        </div> */}

          <div className="projectFolder-display">
                <div className="main"> 
                    <div className="container-fluid moduleFluid">
                      <div className="pdf-preview-header">
                        <span className="d-flex flex-row align-items-center pdf-name"
                              onClick={() => navigate(`/project-folder/${projectId}/data/project-explorer`)}>    
                          <FaChevronLeft className="mr-2"/> Go Back to Project Explorer 
                        </span>
                      </div>

                      <div className="pdf-preview-container">
                          {/* PDF Viewer Component */}
                          {/* <div className="pdf-viewer">
                           <iframe
                            className="pdf-iframe"
                            src={`https://www.ebjv.api.e-fab.com.au/uploads/ifc-files/${fileName}`}
                            title="PDF Document"
                          /> 
                  

                          </div> */}

                        <div className="pdf-container">

                          <Viewer key={viewerKey} fileUrl={activeFileUrl} plugins={[defaultLayoutPluginInstance]} />
    
                        </div>

                         {/* <div className="pdf-preview-container">
                          <h6 className="mt-4 ml-2"> Modified PDF Preview: </h6>
                          <canvas ref={canvasRef} className="pdf-canvas"></canvas>
                        </div> */}
                        {/* Upload Image */}
                        {isUserLoaded && user && isAdmin &&(
                          <div className="pdf-preview-btnGroup d-flex mb-5 mt-2 ml-2">
                                                
                          <div className="d-flex flex-column mr-auto">
                          <input type="file" accept="image/png, image/jpeg" onChange={handleImageUpload} className="mr-auto addQR-to-PDF"/>
                          <input 
                            type="text" 
                            placeholder="Enter URL for QR code" 
                            value={qrUrl} 
                            onChange={(e) => setQrUrl(e.target.value)}
                            className="form-control"
                          />
                          </div>

                          {/* Buttons */}
                          <div className="d-flex add-download-btngroup">
                            <button className="btn btn-primary addQR-btn" onClick={modifyPDF}>
                            {!isTablet ? ("Add Image to PDF") : ("Add Image")}
                            </button>
                            {pdfBlob && (
                              <button className="btn btn-success downloadNewPDF-btn" onClick={downloadPDF}>
                                {!isTablet ? ("Download Modified PDF") : ("Download")}
                              </button>
                            )}
                          </div>
                        
                        </div>
                        ) }
                     


                      </div>

                    </div>
                </div>
          </div>
   
      </div>
    </div>
  );
}

export default ProjectFolder;
