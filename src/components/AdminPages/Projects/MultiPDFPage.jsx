import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
import axiosInstance from "../../../../axiosInstance.js";
import { useNavigate, useParams } from "react-router-dom";
import { PDFDocument, StandardFonts } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.entry";
import { Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { FaCircleArrowLeft, FaArrowLeft, FaArrowRight  } from "react-icons/fa6";
import { AuthContext } from "../../Authentication/authContext.jsx";
import { useLoader } from '../../Loaders/LoaderContext';
import './ProjectStyles.css';
import JSZip from "jszip";
import FileSaver from "file-saver";
import { GiDivergence } from "react-icons/gi";
import { RiFileZipFill } from "react-icons/ri";
import { BsQrCode } from "react-icons/bs";
import { FaRegFilePdf } from "react-icons/fa";
import { MdSelectAll, MdDeselect  } from "react-icons/md";
import useWindowWidth from './ProjectFolderPages/windowWidthHook.jsx';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js`;

function MultiPDFEditor() {
  const { setLoading } = useLoader();
    const windowWidthHook = useWindowWidth();
    const isMobile = windowWidthHook <= 425;
    const isTablet = windowWidthHook <= 768;
    const { user } = useContext(AuthContext);
    const userRoles = user?.roles?.map(role => role.role_name) || [];
    const isAdmin = userRoles.includes('Admin') || userRoles.includes('Superadmin');
    const { projectId, folderName } = useParams();
    const decodedFolderName = folderName ? decodeURIComponent(folderName): "";
    // console.log(folderName)
    const navigate = useNavigate();
    const [pdfFiles, setPdfFiles] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = isMobile ? 50 : 100;
    const [modifiedPdfs, setModifiedPdfs] = useState({});
    const [uploadedImage, setUploadedImage] = useState(null);
    const [qrUrl, setQrUrl] = useState("");
    // const [activeFile, setActiveFile] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const defaultLayoutPluginInstance = defaultLayoutPlugin();
    const [projectName, setProjectName] = useState('');

    useEffect(() => {
      const fetchPdfFiles = async () => {
        setLoading(true);
        try {
            let endpoint = folderName
                ? `/project/${projectId}/files?folder=${encodeURIComponent(decodedFolderName)}`
                : `/project/${projectId}/files`;
    
            const response = await axiosInstance.get(endpoint);
            let pdfs = [];
    
          
                pdfs = response.data.files.currentLevelFiles.map(file => {
                    let decodedFile = decodeURIComponent(file);
                    return decodedFile.split('/').pop(); // ✅ Correct usage of `.pop()`
                });
            
    
            setPdfFiles(pdfs);
            setSelectedFiles(pdfs); // ✅ Update with the correct list
            // console.log("Fetched PDFs:", pdfs);
        } catch (error) {
            console.error("Error fetching PDF files:", error);
        } finally {
          setLoading(false);
        }
    };
    

        const fetchProjectDetails = async () => {
          try {
            const response = await axiosInstance.get(
              `/project/${projectId}`
            );
            const { project_name } = response.data;
            setProjectName(project_name);
          } catch (error) {
            console.error('Error fetching project name:', error);
          }
        }

        fetchProjectDetails();
        fetchPdfFiles();
    }, [projectId, folderName]);

    // const handleSelectionChange = (file) => {
    //     setSelectedFiles(prev => prev.includes(file) ? prev.filter(f => f !== file) : [...prev, file]);
    // };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setUploadedImage(e.target.result);
                const extractedFileName = file.name.split("EBJV-QR_")[1]?.replace(".png", "");
                let baseUrl = "https://cadstream.ebjv.e-fab.com.au";
                // let baseUrl = "http://localhost:5173";
                // let baseUrl = "https://app.ebjv.com.au.e-fab.com.au";
                let autoGeneratedUrl = extractedFileName.endsWith(".frag") 
                    ? `${baseUrl}/ifc-viewer/${projectId}/${extractedFileName}` 
                    : `${baseUrl}/project-folder/pdf-viewer/${projectId}/${extractedFileName}`;
                setQrUrl(autoGeneratedUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const modifyPDFs = async () => {
        if (!uploadedImage || !qrUrl || selectedFiles.length === 0) {
            alert("Please upload an image, provide a URL, and select at least one PDF.");
            return;
        }

        const updatedPdfs = {};
        for (const fileName of selectedFiles) {
            try {
                const fileUrl = await axiosInstance.get(`/uploads/${fileName}`, { responseType: "arraybuffer" });
                const arrayBuffer = fileUrl.data;
                const pdfDoc = await PDFDocument.load(arrayBuffer);
                const firstPage = pdfDoc.getPages()[0];
                const base64Data = uploadedImage.split(',')[1];
                const binaryString = atob(base64Data);
                const imageBytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    imageBytes[i] = binaryString.charCodeAt(i);
                }
                const image = await pdfDoc.embedPng(imageBytes);
                const { width, height } = firstPage.getSize();
                const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
                const fontSize = 196;

                 let imageWidth = 180;
                 let imageHeight = 260;
                 let margin = 30;
                 let qrX = width - imageWidth - margin;
                 let qrY = margin + 155;
                 let textY = qrY - 30;
             
                 // Adjust for A0 or B1
                 if (width === 3370.394 && height === 2383.937) {
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
                updatedPdfs[fileName] = URL.createObjectURL(new Blob([pdfBytes], { type: "application/pdf" }));
                // updatedPdfs[fileName] = new Blob([pdfBytes], { type: "application/pdf" });
            } catch (error) {
                console.error(`Error modifying ${fileName}:`, error);
            }
        }
        setModifiedPdfs(updatedPdfs);
    };

    const downloadPDFs = () => {
      if (Object.keys(modifiedPdfs).length === 0) return;
    
      const zip = new JSZip();
      const pdfPromises = Object.entries(modifiedPdfs).map(async ([fileName, blobUrl]) => {
        const response = await fetch(blobUrl);
        const pdfBlob = await response.blob();
        zip.file(`Modified_${fileName}`, pdfBlob);
      });
    
      Promise.all(pdfPromises).then(() => {
        zip.generateAsync({ type: "blob" }).then((content) => {
          FileSaver.saveAs(content, "Modified_PDFs.zip");
        });
      });
    };
    
    // Paginate files
  const totalPages = Math.ceil(pdfFiles.length / itemsPerPage);
  const paginatedFiles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return pdfFiles.slice(start, start + itemsPerPage);
  }, [currentPage, pdfFiles]);

  // Handle selection
  const handleSelectionChange = (file) => {
    setSelectedFiles((prev) =>
      prev.includes(file) ? prev.filter((f) => f !== file) : [...prev, file]
    );
  };

  // Select all files on the current page
  const handleSelectAll = () => {
    const allOnPage = paginatedFiles.filter((file) => !selectedFiles.includes(file));
    setSelectedFiles([...selectedFiles, ...allOnPage]);
  };

  // Deselect all files on the current page
  const handleDeselectAll = () => {
    setSelectedFiles((prev) => prev.filter((file) => !paginatedFiles.includes(file)));
  };

  const navigateBack = () => {
    if (folderName){
      navigate(`/project-folder/${projectId}/data/project-explorer/subfolder/${encodeURIComponent(decodedFolderName)}`);
    } else {
      // Otherwise, go to the project explorer
      navigate(`/project-folder/${projectId}/data/project-explorer`);
    }
  };

    return (
        <div className="multipdf-container d-flex flex-column pb-2">
             <div className="pdf-preview-header d-flex flex-row ml-2 ">
                <span className="back-btn ml-3" onClick={navigateBack}>
                  <FaCircleArrowLeft size={28} className="icon-left mr-2 align-items-center"/> Go Back
                </span>
              </div>  
          <div className="multipdf-wrapper mt-2 ">
            { pdfFiles.length === 0 ? (  
              <div className="no-pdf-message">
               <h2>  No PDF files available in this folder. </h2>
              </div>
            ) : (
          <>
          <div className="multipdf-sidebar">
            <h5>{folderName ? decodedFolderName : projectName} - PDF Files</h5>

            {/* Select All / Deselect All */}
            <div className="select-controls">
              <button  className="d-flex align-items-center" onClick={handleSelectAll}> 
               Select All
              </button>
              <span className="items-info">
                {`${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, pdfFiles.length)} of ${pdfFiles.length}`}
              </span>
              <button className="d-flex align-items-center" onClick={handleDeselectAll}> 
              Deselect All
              </button>
            </div>

            <div className="pdf-item-wrapper">
              {paginatedFiles.map((file, index) => (
                <div key={file} className="pdf-item">
                  <input
                    type="checkbox"
                    id="selectedPDF"
                    checked={selectedFiles.includes(file)}
                    onChange={() => handleSelectionChange(file)}
                  />
                  <span className="selectedPDF-label">{file}</span>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="pagination">
              <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
              <FaArrowLeft />
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
              <FaArrowRight />
              </button>
            </div>
          </div>

            <div className="multipdf-main-content d-flex">
                <div className="multipdf-viewer mb-3">
                  <div className="d-flex justify-content-around mb-2">
                  <button className="pdfControl-btn" onClick={() => setActiveIndex((prev) => Math.max(prev - 1, 0))}><FaArrowLeft /></button>
                  <span> {selectedFiles[activeIndex]} </span>
                  <button className="pdfControl-btn" onClick={() => setActiveIndex((prev) => Math.min(prev + 1, selectedFiles.length - 1))}><FaArrowRight /></button>
                  </div>
                {selectedFiles.length > 0 && (
                  // <Viewer key={selectedFiles[activeIndex]} fileUrl={modifiedPdfs[selectedFiles[activeIndex]] || `http://localhost:3000/api/uploads/ifc-files/${selectedFiles[activeIndex]}`} plugins={[defaultLayoutPluginInstance]} />
                  <Viewer key={selectedFiles[activeIndex]} fileUrl={modifiedPdfs[selectedFiles[activeIndex]] || `https://www.api-cadstream.ebjv.e-fab.com.au/api/uploads/${selectedFiles[activeIndex]}`} plugins={[defaultLayoutPluginInstance]} />
                  // <Viewer key={selectedFiles[activeIndex]} fileUrl={modifiedPdfs[selectedFiles[activeIndex]] || `https://www.ebjv.api.e-fab.com.au/api/uploads/${selectedFiles[activeIndex]}`} plugins={[defaultLayoutPluginInstance]} />
                )}
                </div>
                {isAdmin && (
              <div className="d-flex flex-column mt-4 pdfAction-btnGroup">
                <div className="multipdf-controls mt-2">
                  <input type="file" accept="image/png, image/jpeg" onChange={handleImageUpload} />
                  <input className="extractedUrl" type="text"  value={qrUrl} onChange={(e) => setQrUrl(e.target.value)} />
                  <button className="addqr-btn" onClick={modifyPDFs}>{isMobile ? <span className="d-flex align-items-center"> <BsQrCode className="mr-1"/>Add to PDF</span> : "Add QR to Selected PDFs"}</button>
                </div>
                
                <div className="d-flex justify-content-end mt-3">
                 <button className="btn btn-primary" onClick={downloadPDFs}>{isMobile ? <span className="d-flex align-items-center"> <RiFileZipFill className="mr-1"/> Download </span> : "Download Modified PDFs"}</button>
                </div>
  
              </div>
                )}
            </div>
            </>
            )}
            </div>
        </div>
    );
}

export default MultiPDFEditor;
