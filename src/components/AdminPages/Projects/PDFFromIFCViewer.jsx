import React, { useState, useEffect, useRef, useContext} from "react";
import axiosInstance from "../../../../axiosInstance.js";
import { useNavigate, useParams } from "react-router-dom";
import { PDFDocument, StandardFonts, } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.entry";
import { Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import Swal from "sweetalert2";

// Set the PDF worker script
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js`;
import './ProjectStyles.css';

import useWindowWidth from '../Projects/ProjectFolderPages/windowWidthHook.jsx'
import { useLoader } from '../../Loaders/LoaderContext';
import { FaChevronLeft } from "react-icons/fa6";
import { AuthContext } from '../../Authentication/authContext';
function PDFFromIFCViewer() {
    const { setLoading } = useLoader();
    const { user } = useContext(AuthContext);
    const userRoles = user?.roles?.map((role) => role.role_name) || [];
    const isAdmin = userRoles.includes('Admin') || userRoles.includes('Superadmin');
    // console.log(isAdmin)
    const [isUserLoaded, setIsUserLoaded] = useState(false); 
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const windowWidthHook = useWindowWidth();
  const isMobile = windowWidthHook <= 425;
  const isTablet = windowWidthHook <= 768;
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState("");
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0); 
  const [pdfBlob, setPdfBlob] = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const canvasRef = useRef(null);
  const [viewerKey, setViewerKey] = useState(0);
  const [qrUrl, setQrUrl] = useState("");
  const [extractedPDFText, setExtractedPDFText] = useState([]);
  const [progress, setProgress] = useState(0);
  const [pdfurl, setpdfurl] = useState(null);


  useEffect(() => {
    // Fetch project details and populate fields
    const fetchProjectName = async () => {
      // setLoading(true);
      try {
        const response = await axiosInstance.get(`/project/${projectId}`);
        const { project_name } = response.data;
        setProjectName(project_name);
        viewAssemblyPDF(project_name);
      } catch (error) {
        console.error("Error fetching project details:", error);
      } finally {
        // setLoading(false);
      }
    };
      fetchProjectName();
    }, [projectId]);

  const extractTextFromPDF = async (pdfBlob) => {
    if (!pdfBlob) return [];

    const pdfUrl = URL.createObjectURL(pdfBlob);
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    
    try {
        const pdf = await loadingTask.promise;
        let extractedText = [];

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item) => item.str).join(" ");
            extractedText.push(pageText);
        }

        return extractedText;
    } catch (error) {
        console.error("Error extracting text from PDF:", error);
        return [];
    }
};


const viewAssemblyPDF = async (projectName) => {
  if (!projectName) return; // Ensure projectName is available
  const selectedAttributes = JSON.parse(localStorage.getItem('SELECTED_ELEMENT_ATTR'));
  
  if (!selectedAttributes || selectedAttributes.length === 0) {
    console.warn("No attributes selected.");
    return;
  }

  // Show SweetAlert2 loader
  Swal.fire({
    title: "Searching for Assembly File...",
    text: "Please wait while we locate the correct document.",
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  // setLoading(true);
  setProgress(0);

  try {
    // Fetch all PDFs in the {Parent}/(Assemblies) folder
    const response = await axiosInstance.get(`/project/${projectId}/files?folder=${projectName}/Assemblies`);
    const pdfFiles = response.data.files.currentLevelFiles.map(file => decodeURIComponent(file).split('/').pop());

    // Process PDFs in batches of 10
    const batchSize = 10;
    const maxThreads = 4;
    let foundPdfUrl = null;

    for (let i = 0; i < pdfFiles.length; i += batchSize * maxThreads) {
      // Process up to maxThreads concurrently
      const batchPromises = [];

      for (let j = 0; j < maxThreads; j++) {
        const start = i + j * batchSize;
        const batch = pdfFiles.slice(start, start + batchSize);

        if (batch.length === 0) break;

        batchPromises.push(
          (async () => {
            for (const pdf of batch) {
              if (foundPdfUrl) return; // Stop processing if a match is found

              const pdfUrl = `https://www.api-cadstream.ebjv.e-fab.com.au/api/uploads/${pdf}`;
              const pdfBlob = await (await fetch(pdfUrl)).blob();
              const extractedText = await extractTextFromPDF(pdfBlob);

              const attributeValues = selectedAttributes.map(attr => attr.data.Value.toLowerCase());

              if (extractedText.some(page => attributeValues.some(attr => page.toLowerCase().includes(attr)))) {
                console.log(`Match found in ${pdf}`);
                foundPdfUrl = pdfUrl;
                return;
              }
            }
          })()
        );
      }

      await Promise.all(batchPromises); // Wait for batch processing to complete

      if (foundPdfUrl) break; // Exit if a match was found
    }

    if (foundPdfUrl) {
      setPdfPreviewUrl(foundPdfUrl);
      Swal.fire({
        icon: "success",
        title: "Assembly File Found!",
        text: "Displaying the matching document.",
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        icon: "warning",
        title: "No Matching PDF Found",
        text: "Try selecting a different element.",
        timer: 2500,
        showConfirmButton: false,
      });
    }

    // setLoading(false);
  } catch (error) {
    console.error("Error fetching PDFs:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to fetch PDFs. Please try again.",
    });
    // setLoading(false);
  }
};



useEffect(() => {
  viewAssemblyPDF();
}, [projectId]);

  useEffect(() => {
    if (user !== undefined) {
      setIsUserLoaded(true);
    }
  }, [user]);


// const formattedPDFname = fileName.replace(".pdf", "")
// console.log(formattedPDFname)  
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target.result); // Store image as base64 Data URL

      // Extract filename from uploaded QR tile
      const uploadedFileName = file.name; // Example: "1739164821281_EBJV-QRCode_1738646441860-Ifc4_CubeAdvancedBrep.ifc.png"

      // Split at "EBJV-QRCode_" and take the second part
      const splitParts = uploadedFileName.split("EBJV-QR_");
      if (splitParts.length < 2) {
        console.error("Invalid QR filename format");
        return;
      }

      // Extract actual filename before ".png"
      const extractedFileName = splitParts[1].replace(".png", ""); 
      console.log("Extracted Filename:", extractedFileName); // Debugging

      let baseUrl = "https://cadstream.ebjv.e-fab.com.au";
      // let baseUrl = "http://localhost:5173";
      // let baseUrl = "https://app.ebjv.com.au.e-fab.com.au";
      let autoGeneratedUrl = "";

      if (extractedFileName.endsWith(".frag")) {
        autoGeneratedUrl = `${baseUrl}/ifc-viewer/${projectId}/${extractedFileName}`;
      } else if (extractedFileName.endsWith(".pdf")) {
        autoGeneratedUrl = `${baseUrl}/project-folder/pdf-viewer/${projectId}/${extractedFileName}`;
      }

      setQrUrl(autoGeneratedUrl); // Auto-populate URL field
    };
    reader.readAsDataURL(file);
  }
};



const modifyPDF = async () => {
  if (!uploadedImage || !qrUrl) {
    alert("Please upload an image and provide a URL.");
    return;
  }

  try {
    console.log("📌 Starting modifyPDF function");

    // ✅ Generate a shortened link or use "Click Here!"

    // Fetch the existing PDF file
    // const fileUrl = await axiosInstance.get(`/uploads/${fileName}`, { responseType: "arraybuffer" });
    const arrayBuffer = pdfPreviewUrl.data;

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
    console.log(`PDF Dimensions: Width=${width}, Height=${height}`);

    // Define margins and position for the QR code     // Default position values for A1
     let imageWidth = 180;
     let imageHeight = 260;
     let margin = 30;
     let qrX = width - imageWidth - margin;
     let qrY = margin + 155;
     let textY = qrY - 30;
 
     // Adjust for A0 or B1
     if (width === 3370.394 && height === 2383.937) {
       console.log("📌 Detected A0 or B1 paper size");
       qrY += 50; // Shift upwards for larger pages
       textY = qrY - 40; // Adjust text position accordingly
     }

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
    const fontSize = 196;

    firstPage.drawText(qrUrl, {
      x: qrX ,
      y: qrY + 80,
      size: fontSize,
      font, 
      wordBreaks: [' ', '-', '/', '.'],
      opacity: 0,
    });

    
    firstPage.drawText(qrUrl, {
      x: qrX ,
      y: textY + 40,
      size: 14,
      font, 
      wordBreaks: [' ', '-', '/', '.'],
      opacity: 0,
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
  link.download = `Modified.pdf`;
  link.click();
};

const activeFileUrl = pdfPreviewUrl || `https://www.api-cadstream.ebjv.e-fab.com.au/api/uploads/`;

// Call this function when needed


// const activeFileUrl = pdfPreviewUrl || `http://localhost:3000/api/uploads/${fileName}`;

  return (
    <div className="container">
          <div className="PDFFromIFCViewer-display">
                <div className="pdfFromModel-wrapper"> 
                      <div className="pdf-preview-header pt-0 pb-0">
                        <span className="d-flex flex-row align-items-center pdf-name"
                              onClick={() => navigate(-1)}>    
                          <FaChevronLeft className="mr-2"/> Go Back 
                        </span>
                      </div>
                      <div className="PDFFromModel-container">
                          <Viewer key={viewerKey} fileUrl={activeFileUrl} plugins={[defaultLayoutPluginInstance]} />
                      </div>
                </div>
          </div>
    </div>
  );
}

export default PDFFromIFCViewer;
