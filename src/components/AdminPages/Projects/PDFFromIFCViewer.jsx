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
    // console.log(isAdmin)
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const windowWidthHook = useWindowWidth();
  const isMobile = windowWidthHook <= 425;
  const isTablet = windowWidthHook <= 768;
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState("");
  const navigate = useNavigate();
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [viewerKey, setViewerKey] = useState(0);
  const [progress, setProgress] = useState(0);


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

const matchingPDF  = pdfPreviewUrl || 'https://www.api-cadstream.ebjv.e-fab.com.au/uploads/blank.pdf';

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
                          <Viewer key={viewerKey} fileUrl={matchingPDF} plugins={[defaultLayoutPluginInstance]} />
                      </div>
                </div>
          </div>
    </div>
  );
}

export default PDFFromIFCViewer;
