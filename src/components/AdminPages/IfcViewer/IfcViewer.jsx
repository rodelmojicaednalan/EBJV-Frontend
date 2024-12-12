/* eslint-disable react/prop-types */
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as OBC from '@thatopen/components';
import * as BUI from '@thatopen/ui';
import * as CUIT from '../../tables';
import * as CUIB from '../../buttons';
import * as OBF from '@thatopen/components-front';
import axiosInstance from '../../../../axiosInstance';
import StickyHeader from '../../SideBar/StickyHeader';
import Loader from '../../Loaders/Loader';
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
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [cameraControls, setCameraControls] = useState(false);

  const fileUrl = location.state?.fileUrl;
  // const []+

  // const handleFileSelect = (event) => {
  //   const file = event.target.files[0];
  //   handleIfcUpload(file);
  // };

  const hanldeCameraControls = () => {
    setCameraControls(!cameraControls);
  };

  const handleBack = () => {
    navigate(`/projects`);
  };

  useEffect(() => {
    if (fileUrl) {
      const initializeIfcViewer = async () => {
        if (!containerRef.current) return;

        const components = new OBC.Components();

        const viewport = document.createElement('bim-viewport');
        viewport.name = 'viewer';

        const worlds = components.get(OBC.Worlds);
        const world = worlds.create();

        const sceneComponent = new OBC.SimpleScene(components);
        sceneComponent.setup();
        world.scene = sceneComponent;

        const rendererComponent = new OBC.SimpleRenderer(
          components,
          viewport
        );
        world.renderer = rendererComponent;

        const cameraComponent = new OBC.SimpleCamera(components);
        world.camera = cameraComponent;

        viewport.addEventListener('resize', () => {
          rendererComponent.resize();
          cameraComponent.updateAspect();
        });

        const fragmentIfcLoader = components.get(OBC.IfcLoader);

        const viewerGrids = components.get(OBC.Grids);
        viewerGrids.create(world);

        components.init();

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
              `/uploads/${fileUrl}`
            );
            const fileContent = response.data;

            const encoder = new TextEncoder();
            const buffer = encoder.encode(fileContent);

            const model = await fragmentIfcLoader.load(buffer);
            model.name = 'example';
            world.scene.three.add(model);
            const indexer = components.get(OBC.IfcRelationsIndexer);
            await indexer.process(model);
            setIsLoading(false);
          } catch (error) {
            console.error('Error loading IFC:', error);
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
           <bim-panel label="Classifications Tree">
            <bim-panel-section label="Classifications">
              ${classificationsTree}
            </bim-panel-section>
            <bim-panel-section label="Element Data">
              <div style="display: flex; gap: 0.5rem;">
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

        const app = document.createElement('bim-grid');
        app.layouts = {
          main: {
            template: `
              "panel viewport"
              / 23rem 1fr
            `,
            elements: { panel, viewport },
          },
        };

        app.layout = 'main';

        // Append the generated viewer and panel to the container
        containerRef.current.appendChild(app);
      };

      initializeIfcViewer();
    }
  }, []);

  return (
    <div className="container" ref={containerRef}>
      <StickyHeader />

      <div className="col-lg-12 col-md-6 custom-content-container margin-top">
        <TopBar
          hanldeCameraControls={hanldeCameraControls}
          cameraControls={cameraControls}
          handleBack={handleBack}
        />
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
}) {
  return (
    <div className="top-bar">
      <div className="top-bar-content">
        <button className="top-bar-button" onClick={handleBack}>
          <FiArrowLeft /> Back
        </button>
        <div className="icon-group">
          <div onClick={hanldeCameraControls}>
            <FiRotateCw /> <FiChevronDown size={15} />
          </div>
          {cameraControls && (
            <div style={{ position: 'absolute', top: '50px' }}>
              sample dropdwon
            </div>
          )}
          <FiMousePointer className="active-icon" />
          <FiSquare />
          <FiMaximize />
          <FiCrop />
          <FiScissors />
          <FiCamera />
          <FiCheckSquare />
          <FiEye className="active-icon" />
          <span className="reset-model">Reset model</span>
          <FiHelpCircle />
          <FiSettings />
          <FiColumns />
        </div>
      </div>
    </div>
  );
}
