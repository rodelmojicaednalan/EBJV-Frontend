/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useDoubleTap } from 'use-double-tap';

// import Stats from 'stats.js';
import * as OBC from '@thatopen/components';
import * as BUI from '@thatopen/ui';
import * as CUIT from '../../tables';
import * as THREE from 'three';
import * as CUIB from '../../buttons';
import * as OBF from '@thatopen/components-front';
import * as OBCF from '@thatopen/components-front';

import axiosInstance from '../../../../axiosInstance';
import Loader from '../../Loaders/Loader';
import Switch from './Switch';
import './IfcViewer.css';

import { FiArrowLeft, FiEyeOff, FiRotateCcw } from 'react-icons/fi';

BUI.Manager.init();

function IfcViewer() {
  const { fileName, projectId } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const measurementContainerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dimensions, setDimensions] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isHideContainerOpen, setIsHideContainerOpen] =
    useState(false);
  const [selectedFragmentIdMap, setSelectedFragmentIdMap] =
    useState(null);
  const [hiderInstance, setHiderInstance] = useState(null);
  const [hiddenFragmentIds, setHiddenFragmentIds] = useState([]);
  const [selectedPartMark, setSelectedPartMark] = useState(null);

  const addHiddenFragmentId = (fragmentId) => {
    setHiddenFragmentIds((hiddenFragmentIds) => [
      ...hiddenFragmentIds,
      fragmentId,
    ]);
  };

  const restoreHiddenFragments = () => {
    hiddenFragmentIds.forEach((id) => hiderInstance.set(true, id));

    setHiddenFragmentIds([]);
  };

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    };

    checkIsMobile();

    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  const fileUrl = fileName;

  const togglePanel = () => {
    const panelDiv = document.querySelector('.asd');
    const app = document.querySelector('bim-grid');
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    if (panelDiv.classList.contains('hidden')) {
      panelDiv.classList.remove('hidden');

      if (!isMobile) {
        app.style.gridTemplate = `"panel viewport" /400px 1fr`;
      } else {
        panelDiv.style.position = 'absolute';
        panelDiv.style.top = '50px';
        panelDiv.style.left = '0';
        panelDiv.style.width = '85%';
        panelDiv.style.height = '100%';
        panelDiv.style.zIndex = '1000';
      }
    } else {
      panelDiv.classList.add('hidden');

      if (!isMobile) {
        app.style.gridTemplate = `"viewport"`;
      } else {
        panelDiv.style.position = '';
        panelDiv.style.width = '';
        panelDiv.style.height = '';
        panelDiv.style.zIndex = '';
      }
    }
  };

  const handleBack = () => {
    navigate(`/project-folder/${projectId}/data/project-explorer`);
  };

  const bind = useDoubleTap(() => {
    if (isMobile && dimensions) {
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
        world.scene.three.background = new THREE.Color(0xe4e4e4);

        const grids = components.get(OBC.Grids);
        grids.create(world);

        // CULLER
        const cullers = components.get(OBC.Cullers);
        const culler = cullers.create(world);

        const indexer = components.get(OBC.IfcRelationsIndexer);

        culler.config.threshold = 10;

        // LENGTH MEASUREMENTS
        const dimensionsInstance = components.get(
          OBCF.LengthMeasurement
        );
        dimensionsInstance.world = world;
        dimensionsInstance.enabled = true;
        dimensionsInstance.snapDistance = 1;
        setDimensions(dimensionsInstance);

        if (window.matchMedia('(min-width: 768px)').matches) {
          containerRef.current.ondblclick = () => {
            dimensionsInstance.create();
          };
        }

        window.onkeydown = (event) => {
          if (event.code === 'Delete') {
            dimensions.delete();
          }
        };

        const fragmentsManager = components.get(OBC.FragmentsManager);
        let uuid = '';

        const [classificationsTree, updateClassificationsTree] =
          CUIT.tables.classificationTree({
            components,
            classifications: [],
          });

        //HIDER
        const hider = components.get(OBC.Hider);
        setHiderInstance(hider);

        const classifier = components.get(OBC.Classifier);

        fragmentsManager.onFragmentsLoaded.add(async (model) => {
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

        const [relationsTree] = CUIT.tables.relationsTree({
          components,
          models: [],
        });

        relationsTree.preserveStructureOnFilter = true;

        propertiesTable.preserveStructureOnFilter = true;
        propertiesTable.indentationInText = false;

        const highlighter = components.get(OBF.Highlighter);
        highlighter.setup({ world });
        highlighter.zoomToSelection = true;

        highlighter.events.select.onHighlight.add((fragmentIdMap) => {
          setSelectedFragmentIdMap(fragmentIdMap);
          setIsHideContainerOpen(() => true);
          updatePropertiesTable({ fragmentIdMap });

          setTimeout(() => {
            const selected = localStorage.getItem(
              'SELECTED_PART_MARK'
            );
            setSelectedPartMark(selected);
          }, '1000');
        });

        highlighter.events.select.onClear.add(() => {
          // localStorage.removeItem('SELECTED_PART_MARK');
          // setSelectedPartMark(null);
          setIsHideContainerOpen(() => false);
          updatePropertiesTable({ fragmentIdMap: {} });
        });

        const loadIfc = async () => {
          if (fragmentsManager.groups.size) {
            return;
          }
          try {
            setIsLoading(true);
            const response = await axiosInstance.get(
              `/uploads/${fileUrl}`,
              { responseType: 'arraybuffer' }
            );
            const jsonPath = await axiosInstance.get(
              `/uploads/${fileUrl.split('.')[0]}.json`,
              { responseType: 'arraybuffer' }
            );

            const data = await response.data;
            const buffer = new Uint8Array(data);

            const json_data = await jsonPath.data;
            const json_text = new TextDecoder().decode(json_data);
            const json_object = JSON.parse(json_text);

            const model = await fragmentsManager.load(buffer);
            model._properties = await json_object;

            model.name = `${fileUrl}`;
            world.scene.three.add(model);
            world.meshes.add(model);
            uuid = model.uuid;

            await indexer.process(model);

            // CULLERS
            for (const fragment of model.items) {
              culler.add(fragment.mesh);
            }

            culler.needsUpdate = true;
            world.camera.controls.addEventListener(
              'controlend',
              () => {
                culler.needsUpdate = true;
              }
            );
            world.camera.controls.addEventListener('update', () => {
              culler.needsUpdate = true;
            });

            setIsLoading(false);
          } catch (error) {
            console.error('Error loading IFC:', error);
            setIsLoading(false);
          }
        };

        loadIfc();
        const panel = BUI.Component.create(() => {
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

          const onSearch = (e) => {
            const input = e.target;
            relationsTree.queryString = input.value;
          };

          return BUI.html`
          <bim-panel class="asd hidden" label="Classifications Tree" class="options-menu">
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

        //     <bim-panel-section label="Assembly">
        //   <bim-text-input @input=${onSearch} placeholder="Search..." debounce="200"></bim-text-input>
        //   ${relationsTree}
        // </bim-panel-section>

        const measurementPanel = BUI.Component.create(() => {
          const viewAssemblyPDF = () => {
            setTimeout(() => {
              const selected = localStorage.getItem(
                'SELECTED_PART_MARK'
              );
              console.log('selected', selected);
              navigate(`/project-folder/pdf-from-model/${projectId}`)
            }, '1000');
          };

          return BUI.html`
          <bim-panel active label="Tools" class="options-menu">
              <bim-panel-section collapsed label="Controls">
                  <bim-label>Create dimension: Double click</bim-label>  
                  <bim-label>Delete dimension: Delete</bim-label>  
              </bim-panel-section>
              
              <bim-panel-section collapsed label="Length Measurement">
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

              <bim-panel-section collapsed label="Culler">
               
              </bim-panel-section>
              <bim-panel-section collapsed label="View Assembly PDF">
                <bim-button label="View"
                  @click="${() => {
                    viewAssemblyPDF();
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
              "panel viewport
              /0px 1fr"
            `,
            elements: { panel, viewport },
          },
        };

        app.layout = 'main';

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
        handleBack={handleBack}
        handleTogglePanel={togglePanel}
      />
      <div className="container" {...bind} ref={containerRef}>
        {/* <StickyHeader /> */}
        {isLoading && <Loader />}
      </div>
      {isHideContainerOpen && (
        <div className="tools-container">
          <div className="hide-container">
            <button
              className="hide-button"
              onClick={() => {
                hiderInstance.set(false, selectedFragmentIdMap);
                addHiddenFragmentId(selectedFragmentIdMap);
              }}
            >
              <FiEyeOff />
            </button>
            <button
              className="reset-button"
              onClick={restoreHiddenFragments}
            >
              <FiRotateCcw />
            </button>
          </div>
          {/* <button className="opacity-button">opacity</button> */}
        </div>
      )}
    </div>
  );
}

export default IfcViewer;

function TopBar({ handleBack, handleTogglePanel }) {
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
        </div>
      </div>
    </div>
  );
}
