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
        const { project_name, folderTree } = response.data;
        setProjectName(project_name);
        const allSubfolders = folderTree.subfolders.map(folder => folder.folderName);
    
        // Exclude "Marking Plans"
        const searchableFolders = allSubfolders.filter(folder => folder !== "Marking Plans");
    
        // Call the PDF search function with the filtered folders
        viewAssemblyPDF(project_name, searchableFolders);
      } catch (error) {
        console.error("Error fetching project details:", error);
      } finally {
        // setLoading(false);
      }
    };
      fetchProjectName();
    }, [projectId]);

    const viewAssemblyPDF = async (projectName, searchableFolders) => {
      if (!projectName || !searchableFolders.length) return;
    
      const selectedAttributes = JSON.parse(localStorage.getItem('SELECTED_ELEMENT_ATTR'));
      const assemblyMarkAttr = selectedAttributes?.find(attr => attr.data.Name === "Assembly Mark");
    
      if (!assemblyMarkAttr) {
        console.warn("No Assembly Mark found in selected attributes.");
        Swal.fire({
          icon: "warning",
          title: "No Assembly Mark Found",
          text: "Please select a different element.",
          timer: 2500,
          showConfirmButton: false,
        });
        return;
      }
    
      const assemblyMark = assemblyMarkAttr.data.Value.toLowerCase();
    
      Swal.fire({
        title: "Searching for Assembly File...",
        text: "Please wait while we locate the correct document.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
    
      setProgress(0);
    
      const searchForPdf = async (folderName) => {
        try {
          const response = await axiosInstance.get(`/project/${projectId}/files?folder=${projectName}/${folderName}`);
          const pdfFiles = response.data.files.currentLevelFiles.map(file => decodeURIComponent(file).split('/').pop());
    
          return pdfFiles.find(file => file.toLowerCase().includes(assemblyMark));
        } catch (error) {
          console.error(`Error fetching PDFs from ${folderName}:`, error);
          return null;
        }
      };
    
      try {
        let matchingPdf = null;
    
        for (const folder of searchableFolders) {
          matchingPdf = await searchForPdf(folder);
          if (matchingPdf) {
            console.log(`Found match in ${folder}`);
            break;
          }
        }
    
        if (matchingPdf) {
          const pdfUrl = `https://www.api-cadstream.ebjv.e-fab.com.au/api/uploads/${matchingPdf}`;
          setPdfPreviewUrl(pdfUrl);
          Swal.fire({
            icon: "success",
            title: "Assembly File Found!",
            text: "Displaying the matching document.",
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          setPdfPreviewUrl(null);
          Swal.fire({
            icon: "warning",
            title: "No Matching PDF Found",
            text: "Try selecting a different element.",
            timer: 2500,
            showConfirmButton: false,
          });
        }
      } catch (error) {
        console.error("Error fetching PDFs:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch PDFs. Please try again.",
        });
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
