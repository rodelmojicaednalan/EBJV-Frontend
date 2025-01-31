/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/prop-types */
import React, { useEffect, useRef, useState } from 'react';
import {
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

import { useDoubleTap } from 'use-double-tap';

// import Stats from 'stats.js';
import * as OBC from '@thatopen/components';
import * as BUI from '@thatopen/ui';
import * as CUIT from '../../tables';
import * as CUIB from '../../buttons';
import * as OBF from '@thatopen/components-front';
import * as OBCF from '@thatopen/components-front';
import * as THREE from 'three';

import axiosInstance from '../../../../axiosInstance';
import StickyHeader from '../../SideBar/StickyHeader';
import Loader from '../../Loaders/Loader';
import Switch from './Switch';
import './IfcViewer.css';

import {
  FiUpload,
  FiMessageCircle,
  FiMaximize,
  FiFolder,
  FiZoomIn,
  FiZoomOut,
  FiArrowLeft,
  FiRotateCw,
  FiMousePointer,
  FiSquare,
  FiCrop,
  FiScissors,
  FiCamera,
  FiCheckSquare,
  // FiCube,
  FiEye,
  FiHelpCircle,
  FiSettings,
  FiColumns,
  FiChevronDown,
} from 'react-icons/fi';

BUI.Manager.init();

function IfcViewer() {
  const { fileName } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const measurementContainerRef = useRef(null);
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [cameraControls, setCameraControls] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [dimensions, setDimensions] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    };

    // Initial check
    checkIsMobile();

    // Add event listener to track window resizing
    window.addEventListener('resize', checkIsMobile);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  // const fileUrl = location.state?.fileUrl;
  const fileUrl = fileName;

  const togglePanel = () => {
    const panelDiv = document.querySelector('.asd');
    const app = document.querySelector('bim-grid');

    if (panelDiv.classList.contains('hidden')) {
      panelDiv.classList.remove('hidden');
      app.style.gridTemplate = `"panel viewport" /368px 1fr`;
    } else {
      panelDiv.classList.add('hidden');
      app.style.gridTemplate = `"viewport"`;
    }

    setIsPanelOpen((prevState) => !prevState);
  };

  const hanldeCameraControls = () => {
    setCameraControls(!cameraControls);
  };

  const handleBack = () => {
    navigate(`/projects`);
  };

  const bind = useDoubleTap(() => {
    if (isMobile && dimensions) {
      console.log('from the bind');
      dimensions.create();
    }
  });

  useEffect(() => {
    if (fileUrl) {
      const initializeIfcViewer = async () => {
        if (!containerRef.current) return;

        const components = new OBC.Components();

        const viewport = document.createElement('bim-viewport');
        viewport.name = 'viewer';

        const worlds = components.get(OBC.Worlds);
        const world = worlds.create();

        world.scene = new OBC.SimpleScene(components);
        world.renderer = new OBCF.PostproductionRenderer(
          components,
          viewport
        );
        world.camera = new OBC.SimpleCamera(components);

        components.init();

        world.camera.controls.setLookAt(5, 5, 5, 0, 0, 0);

        world.scene.setup();

        const grids = components.get(OBC.Grids);
        grids.create(world);

        const fragmentIfcLoader = components.get(OBC.IfcLoader);
        // components.init();

        const dimensionsInstance = components.get(
          OBCF.LengthMeasurement
        );
        dimensionsInstance.world = world;
        dimensionsInstance.enabled = true;
        dimensionsInstance.snapDistance = 1;
        setDimensions(dimensionsInstance);

        if (window.matchMedia('(min-width: 768px)').matches) {
          containerRef.current.ondblclick = () => {
            console.log('from the container');
            dimensionsInstance.create();
          };
        }

        window.onkeydown = (event) => {
          if (event.code === 'Delete' || event.code === 'Backspace') {
            dimensions.delete();
          }
        };

        const ifcLoader = components.get(OBC.IfcLoader);
        await ifcLoader.setup();

        const fragmentsManager = components.get(OBC.FragmentsManager);
        fragmentsManager.onFragmentsLoaded.add((model) => {
          if (world.scene) world.scene.three.add(model);
        });

        const [classificationsTree, updateClassificationsTree] =
          CUIT.tables.classificationTree({
            components,
            classifications: [],
          });

        const classifier = components.get(OBC.Classifier);

        fragmentsManager.onFragmentsLoaded.add(async (model) => {
          classifier.byEntity(model);
          await classifier.byPredefinedType(model);

          const classifications = [
            { system: 'entities', label: 'Entities' },
            { system: 'predefinedTypes', label: 'Predefined Types' },
          ];

          updateClassificationsTree({ classifications });
        });

        const [propertiesTable, updatePropertiesTable] =
          CUIT.tables.elementProperties({
            components,
            fragmentIdMap: {},
          });

        propertiesTable.preserveStructureOnFilter = true;
        propertiesTable.indentationInText = false;

        const highlighter = components.get(OBF.Highlighter);
        highlighter.setup({ world });

        highlighter.events.select.onHighlight.add((fragmentIdMap) => {
          updatePropertiesTable({ fragmentIdMap });
        });

        highlighter.events.select.onClear.add(() =>
          updatePropertiesTable({ fragmentIdMap: {} })
        );

        const loadIfc = async () => {
          try {
            setIsLoading(true);
            const response = await axiosInstance.get(
              `/uploads/${fileUrl}`,
              { responseType: 'arraybuffer' }
            );
            const arrayBuffer = response.data;

            const worker = new Worker(
              new URL('./encoderWorker.js', import.meta.url)
            );

            worker.postMessage(arrayBuffer);

            worker.onmessage = async (e) => {
              const processedBuffer = e.data;

              if (processedBuffer.error) {
                console.error(
                  'Error in worker:',
                  processedBuffer.error
                );
                setIsLoading(false);
                return;
              }

              const model = await fragmentIfcLoader.load(
                processedBuffer
              );
              model.name = 'example';
              world.scene.three.add(model);
              world.meshes.add(model);

              const indexer = components.get(OBC.IfcRelationsIndexer);
              await indexer.process(model);
              setIsLoading(false);

              worker.terminate();
            };

            worker.onerror = (err) => {
              console.error('Worker error:', err);
              setIsLoading(false);
              worker.terminate();
            };
          } catch (error) {
            console.error('Error loading IFC:', error);
            setIsLoading(false);
          }
        };

        loadIfc();
        const panel = BUI.Component.create(() => {
          const [loadIfcBtn] = CUIB.buttons.loadIfc({ components });

          const onTextInput = (e) => {
            const input = e.target;
            propertiesTable.queryString =
              input.value !== '' ? input.value : null;
          };

          const expandTable = (e) => {
            const button = e.target;
            propertiesTable.expanded = !propertiesTable.expanded;
            button.label = propertiesTable.expanded
              ? 'Collapse'
              : 'Expand';
          };

          return BUI.html`
          <bim-panel class="asd" label="Classifications Tree" class="options-menu">
          <bim-panel-section label="Classifications">
          ${classificationsTree}
          </bim-panel-section>
          <bim-panel-section label="Element Data">
          <div style="display: flex; gap: 8px;">
          <bim-button @click=${expandTable} label=${
            propertiesTable.expanded ? 'Collapse' : 'Expand'
          }></bim-button> 
          </div> 
          <bim-text-input @input=${onTextInput} placeholder="Search Property" debounce="250"></bim-text-input>
          ${propertiesTable}
          </bim-panel-section>
          </bim-panel> 
          `;
        });

        const measurementPanel = BUI.Component.create(() => {
          return BUI.html`
          <bim-panel active label="Length Measurement" class="options-menu">
              <bim-panel-section collapsed label="Controls">
                  <bim-label>Create dimension: Double click</bim-label>  
                  <bim-label>Delete dimension: Delete</bim-label>  
              </bim-panel-section>
              
              <bim-panel-section collapsed label="Others">
                <bim-checkbox 
                  checked 
                  label="Dimensions enabled"
                  @change="${(event) => {
                    dimensionsInstance.enabled = event.target.value;
                  }}}">  
                </bim-checkbox>        
                <bim-checkbox checked label="Dimensions visible" 
                   @change="${(event) => {
                     dimensionsInstance.visible = event.target.value;
                   }}">  
                </bim-checkbox>  
                
                <bim-color-input 
                  label="Dimensions Color" color="#202932" 
                   @input="${(event) => {
                     dimensionsInstance.color.set(event.target.color);
                   }}">
                </bim-color-input>
                
                <bim-button label="Delete all"
                  @click="${() => {
                    dimensionsInstance.deleteAll();
                  }}">
                </bim-button>
        
              </bim-panel-section>
            </bim-panel>
            `;
        });

        const app = document.createElement('bim-grid');
        app.layouts = {
          main: {
            template: `
              "panel viewport"
              /368px 1fr  
            `,
            elements: { panel, viewport },
          },
        };

        app.layout = 'main';

        // Append the generated viewer and panel to the container
        // document.body.append(measurementPanel);
        containerRef.current.appendChild(app);
        measurementContainerRef.current.appendChild(measurementPanel);

        const button = BUI.Component.create(() => {
          return BUI.html`
              <bim-button class="phone-menu-toggler" icon="solar:settings-bold"
                @click="${() => {
                  if (
                    measurementPanel.classList.contains(
                      'options-menu-visible'
                    )
                  ) {
                    measurementPanel.classList.remove(
                      'options-menu-visible'
                    );
                  } else {
                    measurementPanel.classList.add(
                      'options-menu-visible'
                    );
                  }
                }}">
              </bim-button>
            `;
        });

        measurementContainerRef.current.appendChild(button);
      };

      initializeIfcViewer();
    }
  }, []);

  return (
    <div className={`w-100`} ref={measurementContainerRef}>
      <TopBar
        hanldeCameraControls={hanldeCameraControls}
        cameraControls={cameraControls}
        handleBack={handleBack}
        handleTogglePanel={togglePanel}
        isPanelOpen={isPanelOpen}
      />
      <div className="container" {...bind} ref={containerRef}>
        {/* <StickyHeader /> */}
        {isLoading && <Loader />}
      </div>
    </div>
  );
}

export default IfcViewer;

function TopBar({
  hanldeCameraControls,
  cameraControls,
  handleBack,
  handleTogglePanel,
  isPanelOpen,
}) {
  const [isModalOpen, setModalOpen] = useState(false);

  const toggleModal = () => {
    setModalOpen((prev) => !prev);
  };

  return (
    <div className="top-bar">
      <div className="top-bar-content">
        <button className="top-bar-button" onClick={handleBack}>
          <FiArrowLeft /> Back
        </button>

        <div className="top-bar-right">
          <p style={{ marginBottom: '0rem', fontWeight: 'bold' }}>
            Classification Tree
          </p>
          <Switch handleTogglePanel={handleTogglePanel} />
          {/* <Tools
            hanldeCameraControls={hanldeCameraControls}
            toggleModal={toggleModal}
            isModalOpen={isModalOpen}
          /> */}
        </div>
      </div>
    </div>
  );
}

function Tools({ hanldeCameraControls, toggleModal, isModalOpen }) {
  return (
    <>
      {/* Hamburger Menu for Mobile */}
      <div className="hamburger-menu" onClick={toggleModal}>
        ☰
      </div>

      {/* Modal for Icons */}
      <div
        className={`icon-group-modal ${isModalOpen ? 'active' : ''}`}
      >
        <div onClick={hanldeCameraControls}>
          <FiRotateCw />
          {/* <FiChevronDown size={15} /> */}
        </div>
        {/* <FiMousePointer className="active-icon" /> */}
        <FiMousePointer />
        <FiSquare />
        <FiMaximize />
        <FiCrop />
        <FiScissors />
        <FiCamera />
        <FiCheckSquare />
        <FiEye />
        {/* <span className="reset-model">Reset model</span> */}
        <FiHelpCircle />
        <FiSettings />
        <FiColumns />
      </div>

      {/* Icon Group for Larger Screens */}
      <div className="icon-group">
        <div
          onClick={hanldeCameraControls}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FiRotateCw />
          {/* <FiChevronDown size={15} /> */}
        </div>
        <FiMousePointer />
        <FiSquare />
        <FiMaximize />
        <FiCrop />
        <FiScissors />
        <FiCamera />
        <FiCheckSquare />
        <FiEye />
        {/* <span className="reset-model">Reset model</span> */}
        <FiHelpCircle />
        <FiSettings />
        <FiColumns />
      </div>
    </>
  );
}
