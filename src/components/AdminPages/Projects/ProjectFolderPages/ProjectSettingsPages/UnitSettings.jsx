import React, { useState, useEffect } from "react";
import axiosInstance from "../../../../../../axiosInstance.js";
import Swal from "sweetalert2";
import { useNavigate, useParams, Link } from "react-router-dom";
import check from "../../../../../assets/images/check.png";
import StickyHeader from "../../../../SideBar/StickyHeader";
import { AuthContext } from "../../../../Authentication/authContext";
import upload_icon from "../../../../../assets/images/uploading.png";
import DataTable from "react-data-table-component";

import '../../ProjectStyles.css'
import { FiChevronLeft } from 'react-icons/fi';

import ProjectSidebar from '../../ProjectFolderSidebar';

function UnitSettings() {
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState("");
  const [ownerName, setOwnerName] = useState("")
  const [existingFiles, setExistingFiles] = useState([]); // Existing files
  const [error, setError] = useState("");
  const navigate = useNavigate();


  useEffect(() => {
    // Fetch project details and populate fields
    const fetchProjectDetails = async () => {
      try {
        const response = await axiosInstance.get(`/project/${projectId}`);
        const { project_name, user } = response.data;
        const parsedFiles = JSON.parse(response.data.project_file)

        setProjectName(project_name);
        setOwnerName(`${user.first_name} ${user.last_name}`)
        setExistingFiles(parsedFiles); 
        // Assuming `project_files` is an array of file objects
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

    return (
      <div className="container">
      <StickyHeader />
      <h3 className="title-page" id="projectFolder-title">
        {ownerName}'s {projectName} 
      </h3>
      <div className="container-content" id="project-folder-container">
      <div className="projectFolder-sidebar-container">
      <ProjectSidebar projectId={projectId}/>
      </div>


      <div className="projectFolder-display">
                <div className="main"> 
                    <div className="container-fluid moduleFluid">
                      <div className="project-content p-2">
                    
                      <div className="table-header d-flex justify-content-between align-items-center mb-3">
                        <div className="page-title">
                          <h2>Units</h2>
                        </div>
                        <div className="button-group d-flex">
                          <button id="addbtn"className="btn btn-primary add-btn" title="Save Changes">
                            Save Changes
                          </button>
                        </div>
                      </div>

                      <div className="module mb-2 py-2">
                        <header className="row-distributez mb-0">
                          <h3 className="mt-3"> Preferences </h3>
                        </header>

                        <div className="row mt-2 accordionContent">
                          <div className="col-md-12 col-lg-4 mb-2">
                            <p className="text-meta">
                            Choose how units should be displayed in the 2D & 3D viewer
                            </p>

                          </div>
                          <div className="col-md-12 col-lg-8">
                            <div className="row">
                              <div className="col-12">
                                <div className="row mb-4">
                                  <div className="col-12" id="unitSystem">
                                    <div className="input-group">
                                    <label for="unitSystem"><span>Unit system</span></label>
                                    <div className="input-focus-group">
                                      <select id="unitSystem" data-cy="unitSystem" defaultValue="Metric">
                                        <option value="Imperial">Imperial</option>
                                        <option value="Metric">Metric</option>
                                        <option value="USSurveyFeet">U.S. Survey Feet</option>
                                        <option value="Custom">Custom</option>
                                      </select>
                                    </div>
                                    </div>
                                  </div>
                                  <div className="col-6 col-sm-6 col-md-8 col-lg-8 mt-3 mb-2">
                                    <div className="section-header no-border">
                                      <h6>Units</h6>
                                    </div>
                                  </div>
                                  <div className="col-6 col-sm-6 col-md-4 col-lg-4 mt-3 mb-2">
                                    <div className="section-header no-border">
                                      <h6>Display Precision</h6>
                                    </div>
                                  </div>
                                  <div className="col-6 col-sm-6 col-md-8 col-lg-8 test4">
                                    <div className="input-group">
                                    <label for="unitLength"><span>Length</span></label>
                                      <div className="input-focus-group">
                                        <select id="unitLength" data-cy="unitLength">
                                          <option value="mm">mm</option>
                                          <option value="cm">cm</option>
                                          <option value="m">m</option>
                                          <option value="km">km</option>
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-6 col-sm-6 col-md-4 col-lg-4 test5">
                                    <div className="input-group">
                                      <label for="unitLengthValue"><span> </span></label>
                                      <div className="input-focus-group">
                                        <select id="unitLengthValue" data-cy="unitLengthValue">
                                          <option value="0">0</option>
                                          <option value="0.1">0.1</option>
                                          <option value="0.01">0.01</option>
                                          <option value="0.001">0.001</option>
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-12 px-0">
                                    <div className="input-group checkradio mb-0">
                                      <div className="group-items ml-1">
                                        <div className="icon checkbox">
                                        <input className="custom-input" name="shouldApplyLengthForMeasurements" id="shouldApplyLengthForMeasurements" type="checkbox" defaultChecked/>
                                        </div>
                                        <label>Use same setting for measurements</label>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-6 col-sm-6 col-md-8 col-lg-8 test4">
                                    <div className="input-group">
                                      <label for="unitArea"><span>Area</span></label>
                                      <div className="input-focus-group">
                                        <select id="unitArea" data-cy="unitArea" defaultValue="m²">
                                          <option value="mm²">mm²</option>
                                          <option value="cm²">cm²</option>
                                          <option value="m²">m²</option>
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-6 col-sm-6 col-md-4 col-lg-4 test5">
                                    <div className="input-group">
                                      <label for="unitAreaValue"><span> </span></label>
                                      <div className="input-focus-group">
                                        <select id="unitAreaValue" data-cy="unitAreaValue" defaultValue="0.01">
                                          <option value="0">0</option>
                                          <option value="0.1">0.1</option>
                                          <option value="0.01">0.01</option>
                                          <option value="0.001">0.001</option>
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-6 col-sm-6 col-md-8 col-lg-8 test4">
                                    <div className="input-group">
                                      <label for="unitVolume"><span>Volume</span></label>
                                      <div className="input-focus-group">
                                        <select id="unitVolume" data-cy="unitVolume" defaultValue="m²">
                                          <option value="mm²">mm²</option>
                                          <option value="cm²">cm²</option>
                                          <option value="m²">m²</option>
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-6 col-sm-6 col-md-4 col-lg-4 test5">
                                    <div className="input-group">
                                      <label for="unitVolumeValue"><span> </span></label>
                                      <div className="input-focus-group">
                                        <select id="unitVolumeValue" data-cy="unitVolumeValue" defaultValue="0.01">
                                          <option value="0">0</option>
                                          <option value="0.1">0.1</option>
                                          <option value="0.01">0.01</option>
                                          <option value="0.001">0.001</option>
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-6 col-sm-6 col-md-8 col-lg-8 test4">
                                    <div className="input-group">
                                      <label for="unitWeight"><span>Weight</span></label>
                                      <div className="input-focus-group">
                                        <select id="unitWeight" data-cy="unitWeight" defaultValue="t">
                                          <option value="mg">mg</option>
                                          <option value="g">g</option>
                                          <option value="kg">kg</option>
                                          <option value="t">t</option>
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-6 col-sm-6 col-md-4 col-lg-4 test5">
                                    <div className="input-group">
                                      <label for="unitWeightValue"><span> </span></label>
                                      <div className="input-focus-group">
                                        <select id="unitWeightValue" data-cy="unitWeightValue" defaultValue="0.001">
                                          <option value="0">0</option>
                                          <option value="0.1">0.1</option>
                                          <option value="0.01">0.01</option>
                                          <option value="0.001">0.001</option>
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-6 col-sm-6 col-md-8 col-lg-8 test4">
                                    <div className="input-group">
                                      <label for="unitAngle"><span>Angle</span></label>
                                      <div className="input-focus-group">
                                        <select id="unitAngle" data-cy="unitAngle" defaultValue="deg">
                                          <option value="deg">deg</option>
                                          <option value="rad">rad</option>
                                          <option value="deg-min-sec">deg-min-sec</option>
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-6 col-sm-6 col-md-4 col-lg-4 test5">
                                    <div className="input-group">
                                      <label for="unitAngleValue"><span> </span></label>
                                      <div className="input-focus-group">
                                        <select id="unitAngleValue" data-cy="unitAngleValue" defaultValue="0.001">
                                          <option value="0">0</option>
                                          <option value="0.1">0.1</option>
                                          <option value="0.01">0.01</option>
                                          <option value="0.001">0.001</option>
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

              
                      </div>
                    </div>
                </div>
          </div>

      </div>
      </div>
      );
    }

export default UnitSettings;
