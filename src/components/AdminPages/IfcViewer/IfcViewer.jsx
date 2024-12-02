import React, { useEffect, useRef, useState } from "react";
import { useLocation } from 'react-router-dom';
import "./IfcViewer.css";
import { IfcViewerAPI } from "web-ifc-viewer";
import Swal from "sweetalert2";
import StickyHeader from "../../SideBar/StickyHeader";
import {
  FiUpload,
  FiMaximize,
  FiFolder,
  FiZoomIn,
  FiZoomOut,
} from "react-icons/fi";
import check from "../../../assets/images/check.png";

function IfcViewer() {
  const viewerContainerRef = useRef(null); // Reference for the viewer container
  const viewerRef = useRef(null); // Reference for the IFC viewer
  const [loadingIfc, setLoadingIfc] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "designer1",
      name: "Alice",
      text: "I was thinking about incorporating an open-plan living area for this project.",
    },
    {
      sender: "designer2",
      name: "Bob",
      text: "That’s a great idea! It would make the space feel larger and more connected.",
    },
    {
      sender: "designer1",
      name: "Alice",
      text: "Exactly. We could also use floor-to-ceiling windows to bring in more natural light.",
    },
    {
      sender: "designer3",
      name: "Charlie",
      text: "For the exterior, I suggest a mix of concrete and wood for a modern yet warm aesthetic.",
    },
  ]);
  const [newMessage, setNewMessage] = useState(""); 
  const location = useLocation(); 

  const fileUrl = location.state?.fileUrl; // File URL passed via state

  useEffect(() => {
    if (fileUrl && fileUrl.endsWith('.ifc')) {
      // Initialize the IFC Viewer
      const viewerContainer = viewerContainerRef.current;
      const viewer = new IfcViewerAPI({ container: viewerContainer });
      viewer.addAxes();
      viewer.addGrid();
      viewer.IFC.setWasmPath("/"); // Ensure the WASM path is correct
      viewerRef.current = viewer;

      // Load the IFC file once the viewer is initialized
      const loadIfc = async () => {
        try {
          setLoadingIfc(true);
          await viewer.IFC.loadIfcUrl(fileUrl, true); // Load the IFC file
        } catch (error) {
          Swal.fire("Error", "Failed to load IFC file", "error");
        } finally {
          setLoadingIfc(false);
        }
      };

      loadIfc();

      // Cleanup on component unmount
      return () => {
        viewer.dispose();
        viewerRef.current = null;
      };
    } else {
      Swal.fire("Invalid File", "Please upload a valid IFC file.", "error");
    }
  }, [fileUrl]);
  

  const handleViewFullIfc = () => {
    // Open the IFC viewer in full screen
    const viewerContainer = viewerContainerRef.current;
    if (viewerContainer) {
      viewerContainer.requestFullscreen();
    }
  };



  const handleZoomIn = () => {
    const viewer = viewerRef.current;
    if (viewer) viewer.context.ifcCamera.cameraControls.dolly(-0.5); // Zoom in
  };
  
  const handleZoomOut = () => {
    const viewer = viewerRef.current;
    if (viewer) viewer.context.ifcCamera.cameraControls.dolly(0.5); // Zoom out
  };
  

  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "user", name: "You", text: newMessage },
      ]);
      setNewMessage(""); // Clear the input field
    }
  };

  return (
    <div className="container">
      <StickyHeader />
      <div className="col-lg-12 col-md-6 custom-content-container margin-top">
      <h3 className="title-page">{fileUrl ? fileUrl.split('/').pop() : "No File Selected"}</h3>
        <div className="ifc-container">
          <div className="viewer-container" ref={viewerContainerRef}></div>

          <div className="chat-box">
            <div className="chat-box-header">
              <h4>Chat</h4>
            </div>
            <div className="chat-messages">
              {messages.map((message, index) => (
                <div key={index} className={`chat-message ${message.sender}`}>
                  <strong>{message.name}</strong>
                  <div>{message.text}</div>
                </div>
              ))}
            </div>
            <div className="chat-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </div>

          <div className="zoom-controls">
            <button onClick={handleZoomIn} className="zoom-button">
              <FiZoomIn size={24} color="#000" />
            </button>
            <button onClick={handleZoomOut} className="zoom-button">
              <FiZoomOut size={24} color="#000" />
            </button>
          </div>
        </div>
        <div className="upload-ifc-content">
         
          <label onClick={handleViewFullIfc} className="upload-icon mr-2">
            <FiMaximize size={24} color="#000" />
          </label>
         
        </div>
        {!fileUrl && <div className="no-file"><p>No IFC file selected. Please upload a file to view.</p></div>}
        {loadingIfc && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            Loading IFC File...
          </div>
        )}
      </div>
    </div>
  );
}

export default IfcViewer;
