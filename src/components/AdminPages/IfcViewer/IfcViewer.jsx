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

import {
  FiArrowLeft,
  FiEyeOff,
  FiRotateCcw,
  FiBox,
  FiGrid,
} from 'react-icons/fi';
import { RiArrowDropRightFill } from 'react-icons/ri';

BUI.Manager.init();

function IfcViewer() {
  const { fileName, projectId } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const measurementContainerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dimensions, setDimensions] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isHideContainerOpen, setIsHideContainerOpen] = useState(false);
  const [selectedFragmentIdMap, setSelectedFragmentIdMap] = useState([null]);
  const [hiderInstance, setHiderInstance] = useState(null);
  const [hiddenFragmentIds, setHiddenFragmentIds] = useState([]);
  const [selectedPartMark, setSelectedPartMark] = useState(null);
  const [alwaysOpen, setAlwaysOpen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentWorld, setCurrentWorld] = useState(null);
  const [centerW, setCenterW] = useState(null);
  const [ifcGrids, setIfcGrids] = useState([]);
  const [showIfcGrid, setShowIfcGrid] = useState(false);
  const [modelProperties, setModelProperties] = useState([]);
  const modelPropertiesRef = useRef(null);

  // Persistent panel state
  const [isPanelOpen, setIsPanelOpen] = useState(() => {
    const saved = localStorage.getItem('ifcPanelOpen');
    return saved === null ? true : saved === 'true';
  });

  const [lastOpacity, setLastOpacity] = useState(1);
  const [originalMaterials, setOriginalMaterials] = useState(
    new Map()
  );
  const [isTransparent, setIsTransparent] = useState(false);

  const fragmentsManagerRef = useRef(null);
  const worldRef = useRef(null);
  const hiderRef = useRef(null);
  const ifcGridRef = useRef(null);
  const indexerRef = useRef(null);
  const componentsRef = useRef(null);

  const createIfcGrid = async (model) => {
    if (!worldRef.current || !model || !componentsRef.current) return;

    if (ifcGridRef.current) {
      worldRef.current.scene.three.remove(ifcGridRef.current);
      ifcGridRef.current = null;
    }

    const gridGroup = new THREE.Group();
    gridGroup.name = 'IFC_GRID';

    let ifcGridEntities = [];
    if (modelProperties) {
      ifcGridEntities = modelProperties.filter(
        (item) => item.type === 3009204131
      );
    }
    if (ifcGridEntities.length > 0) {
      for (const grid of ifcGridEntities) {
        if (grid.UAxes && grid.VAxes) {
          for (let i = 0; i < grid.UAxes.length; i++) {
            const axisRef = grid.UAxes[i];
            const axis = modelProperties.find(
              (item) => item.expressID === axisRef.value
            );

            if (axis && axis.AxisCurve) {
              const curveId = axis.AxisCurve.value;
              const polyline = modelProperties.find(
                (item) => item.expressID === curveId
              );
              if (polyline && polyline.Points) {
                const points = [];
                for (const pointRef of polyline.Points) {
                  const point = modelProperties.find(
                    (item) => item.expressID === pointRef.value
                  );

                  if (point && point.Coordinates) {
                    points.push(
                      new THREE.Vector3(
                        point.Coordinates[0] / 1000,
                        0,
                        point.Coordinates[1] / 1000
                      )
                    );
                  }
                }

                if (points.length >= 2) {
                  const line = createGridLine(
                    points[0],
                    points[points.length - 1],
                    0xff0000
                  );
                  gridGroup.add(line);

                  const label = createTextLabel(
                    axis.AxisTag?.value ||
                      String.fromCharCode(90 - i),
                    new THREE.Vector3(points[0].x, 0, points[0].z - 1)
                  );
                  gridGroup.add(label);
                }
              } else {
                const box = new THREE.Box3().setFromObject(model);
                const size = box.getSize(new THREE.Vector3());
                const center = box.getCenter(new THREE.Vector3());

                const totalUAxes = grid.UAxes.length;
                const offset =
                  size.x * (i / (totalUAxes - 1 || 1) - 0.5);

                const start = new THREE.Vector3(
                  center.x + offset,
                  0,
                  center.z - size.z / 2
                );

                const end = new THREE.Vector3(
                  center.x + offset,
                  0,
                  center.z + size.z / 2
                );

                const line = createGridLine(start, end, 0xff0000);
                gridGroup.add(line);

                const label = createTextLabel(
                  axis.AxisTag?.value || String.fromCharCode(90 - i),
                  new THREE.Vector3(start.x, 0, start.z - 1)
                );
                gridGroup.add(label);
              }
            }
          }

          for (let i = 0; i < grid.VAxes.length; i++) {
            const axisRef = grid.VAxes[i];
            const axis = modelProperties.find(
              (item) => item.expressID === axisRef.value
            );

            if (axis && axis.AxisCurve) {
              const curveId = axis.AxisCurve.value;

              const polyline = modelProperties.find(
                (item) => item.expressID === curveId
              );
              if (polyline && polyline.Points) {
                const points = [];
                for (const pointRef of polyline.Points) {
                  const point = modelProperties.find(
                    (item) => item.expressID === pointRef.value
                  );

                  if (point && point.Coordinates) {
                    points.push(
                      new THREE.Vector3(
                        point.Coordinates[0] / 1000,
                        0,
                        point.Coordinates[1] / 1000
                      )
                    );
                  }
                }

                if (points.length >= 2) {
                  const line = createGridLine(
                    points[0],
                    points[points.length - 1],
                    0x0000ff
                  );
                  gridGroup.add(line);

                  const label = createTextLabel(
                    axis.AxisTag?.value || `V${i + 1}`,
                    new THREE.Vector3(points[0].x - 1, 0, points[0].z)
                  );
                  gridGroup.add(label);
                }
              } else {
                const box = new THREE.Box3().setFromObject(model);
                const size = box.getSize(new THREE.Vector3());
                const center = box.getCenter(new THREE.Vector3());

                const totalVAxes = grid.VAxes.length;
                const offset =
                  size.z * (i / (totalVAxes - 1 || 1) - 0.5);

                const start = new THREE.Vector3(
                  center.x - size.x / 2,
                  0,
                  center.z + offset
                );

                const end = new THREE.Vector3(
                  center.x + size.x / 2,
                  0,
                  center.z + offset
                );

                const line = createGridLine(start, end, 0x0000ff);
                gridGroup.add(line);
                const label = createTextLabel(
                  axis.AxisTag?.value || `V${i + 1}`,
                  new THREE.Vector3(start.x - 1, 0, start.z)
                );
                gridGroup.add(label);
              }
            }
          }
        }
      }
    } else {
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const gridSize = Math.max(size.x, size.z);
      const numLines = 5;

      for (let i = 0; i < numLines; i++) {
        const offset = gridSize * (i / (numLines - 1) - 0.5);

        const uStart = new THREE.Vector3(
          center.x + offset,
          0,
          center.z - gridSize / 2
        );
        const uEnd = new THREE.Vector3(
          center.x + offset,
          0,
          center.z + gridSize / 2
        );
        const uLine = createGridLine(uStart, uEnd, 0xff0000);
        gridGroup.add(uLine);

        const uLabel = createTextLabel(
          String.fromCharCode(90 - i),
          new THREE.Vector3(uStart.x, 0, uStart.z - 1)
        );
        gridGroup.add(uLabel);

        const vStart = new THREE.Vector3(
          center.x - gridSize / 2,
          0,
          center.z + offset
        );
        const vEnd = new THREE.Vector3(
          center.x + gridSize / 2,
          0,
          center.z + offset
        );
        const vLine = createGridLine(vStart, vEnd, 0x0000ff);
        gridGroup.add(vLine);

        const vLabel = createTextLabel(
          `V${i + 1}`,
          new THREE.Vector3(vStart.x - 1, 0, vStart.z)
        );
        gridGroup.add(vLabel);
      }
    }

    worldRef.current.scene.three.add(gridGroup);
    ifcGridRef.current = gridGroup;
    setIfcGrids(ifcGridEntities);

    // if (ifcGridRef.current) {
    //   ifcGridRef.current.visible = true;
    //   setShowIfcGrid(true);
    // }

    if (ifcGridRef.current) {
      ifcGridRef.current.visible = false;
      setShowIfcGrid(false);
    }

    return gridGroup;
  };

  const createGridLine = (start, end, color = 0x000000) => {
    const material = new THREE.LineBasicMaterial({
      color: color,
      linewidth: 2,
      opacity: 0.8,
      transparent: true,
    });

    const geometry = new THREE.BufferGeometry().setFromPoints([
      start,
      end,
    ]);
    const line = new THREE.Line(geometry, material);
    line.renderOrder = 999;
    return line;
  };

  const createTextLabel = (text, position) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 128;
    canvas.height = 64;

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = '48px Arial';
    context.fillStyle = '#000000';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.9,
    });

    const sprite = new THREE.Sprite(material);
    sprite.position.copy(position);
    sprite.scale.set(2, 1, 1);

    return sprite;
  };

  useEffect(() => {
    if (modelProperties && fragmentsManagerRef.current) {
      const models = Array.from(
        fragmentsManagerRef.current.groups.values()
      );
      if (models) {
        createIfcGrid(models[0]);
      }
    }
  }, [modelProperties]);

  const setOpacity = (opacityValue) => {
    const opacity = opacityValue / 100;

    if (!worldRef.current || !fragmentsManagerRef.current) {
      console.log('Required references not available yet');
      return;
    }

    const models = Array.from(
      fragmentsManagerRef.current.groups.values()
    );

    models.forEach((model) => {
      model.traverse((object) => {
        if (object.isMesh && object.material) {
          if (opacity < 1 && !isTransparent) {
            const id = object.uuid;
            if (Array.isArray(object.material)) {
              originalMaterials.set(
                id,
                object.material.map((mat) => ({
                  transparent: mat.transparent,
                  opacity: mat.opacity,
                }))
              );
            } else {
              originalMaterials.set(id, {
                transparent: object.material.transparent,
                opacity: object.material.opacity,
              });
            }
          }

          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => {
              mat.transparent = opacity < 1;
              mat.opacity = opacity;
              mat.needsUpdate = true;
            });
          } else {
            object.material.transparent = opacity < 1;
            object.material.opacity = opacity;
            object.material.needsUpdate = true;
          }
        }
      });
    });

    setIsTransparent(opacity < 1);
    setLastOpacity(opacity);
  };

  const [buttonConf, setButtonConf] = useState([
    {
      name: 'Top',
      coords: { x: 0, y: 10, z: 0 },
    },
    {
      name: 'Front',
      coords: { x: 0, y: 0, z: 10 },
    },
    {
      name: 'Left',
      coords: { x: -10, y: 0, z: 0 },
    },
    {
      name: 'Back',
      coords: { x: 0, y: 0, z: -10 },
    },
    {
      name: 'Right',
      coords: { x: 10, y: 0, z: 0 },
    },
    {
      name: 'Bottom',
      coords: { x: 0, y: -10, z: 0 },
    },
  ]);

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

  // Toggle panel and persist state
  const togglePanel = () => {
    const panelDiv = document.querySelector('.asd');
    const app = document.querySelector('bim-grid');
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    let willOpen;
    if (panelDiv.classList.contains('hidden')) {
      panelDiv.classList.remove('hidden');
      willOpen = true;
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
      willOpen = false;
      if (!isMobile) {
        app.style.gridTemplate = `"viewport"`;
      } else {
        panelDiv.style.position = '';
        panelDiv.style.width = '';
        panelDiv.style.height = '';
        panelDiv.style.zIndex = '';
      }
    }
    setIsPanelOpen(willOpen);
    localStorage.setItem('ifcPanelOpen', willOpen);
  };

  const handleBack = () => {
    navigate(`/project-folder/${projectId}/data/project-explorer`);
  };

  const bind = useDoubleTap(() => {
    if (isMobile && dimensions) {
      dimensions.create();
    }
  });

  // On mount and whenever isPanelOpen changes, update panel visibility
  useEffect(() => {
    // Wait for DOM to be ready
    const updatePanelVisibility = () => {
      const panelDiv = document.querySelector('.asd');
      const app = document.querySelector('bim-grid');
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      if (panelDiv && app) {
        if (isPanelOpen) {
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
      }
    };
    // Use a timeout to ensure the panel is in the DOM
    const timeout = setTimeout(updatePanelVisibility, 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPanelOpen]);

  useEffect(() => {
    const hasReloaded = sessionStorage.getItem('hasReloaded');

    if (!hasReloaded) {
      sessionStorage.setItem('hasReloaded', 'true');
      window.location.reload();
    }

    return () => {
      sessionStorage.removeItem('hasReloaded');
    };
  }, []);

  useEffect(() => {}, [hiddenFragmentIds]);

  useEffect(() => {
    if (fileUrl) {
      const initializeIfcViewer = async () => {
        if (!containerRef.current) return;

        const components = new OBC.Components();
        componentsRef.current = components;

        const viewport = document.createElement('bim-viewport');
        viewport.name = 'viewer';

        const worlds = components.get(OBC.Worlds);
        const world = worlds.create();
        setCurrentWorld(world);
        worldRef.current = world;

        world.scene = new OBC.SimpleScene(components);
        world.renderer = new OBCF.PostproductionRenderer(
          components,
          viewport
        );
        world.camera = new OBC.SimpleCamera(components);
        world.renderer.needsUpdate = true;
        components.init();

        world.scene.setup();
        world.scene.three.background = new THREE.Color(0xe4e4e4);

        const grids = components.get(OBC.Grids);
        grids.create(world);

        // CULLER
        const cullers = components.get(OBC.Cullers);
        const culler = cullers.create(world);

        const indexer = components.get(OBC.IfcRelationsIndexer);
        indexerRef.current = indexer;

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
        fragmentsManagerRef.current = fragmentsManager; // Store for opacity function

        const [classificationsTree, updateClassificationsTree] =
          CUIT.tables.classificationTree({
            components,
            classifications: [],
          });

        //HIDER
        const hider = components.get(OBC.Hider);
        hiderRef.current = hider; // Store for opacity function
        setHiderInstance(hider);

        const classifier = components.get(OBC.Classifier);

        fragmentsManager.onFragmentsLoaded.add(async (model) => {
          // Create IFC grid after model is loaded
          // setTimeout(() => {
          //   createIfcGrid(model, modelPropertiesRef.current);
          // }, 1000);

          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());

          const distance = Math.max(size.x, size.y, size.z) * 0.7;
          const cameraPosition = new THREE.Vector3(
            center.x + distance,
            center.y + distance,
            center.z + distance
          );
          setButtonConf([
            {
              name: 'Top',
              coords: {
                x: center.x,
                y: center.y + distance * 1.3,
                z: center.z,
              },
            },
            {
              name: 'Front',
              coords: {
                x: center.x,
                y: center.y,
                z: center.z + distance * 1.3,
              },
            },
            {
              name: 'Left',
              coords: {
                x: center.x - distance * 1.3,
                y: center.y,
                z: center.z,
              },
            },
            {
              name: 'Back',
              coords: {
                x: center.x,
                y: center.y,
                z: center.z - distance * 1.3,
              },
            },
            {
              name: 'Right',
              coords: {
                x: center.x + distance * 1.3,
                y: center.y,
                z: center.z,
              },
            },
            {
              name: 'Bottom',
              coords: {
                x: center.x,
                y: center.y - distance * 1.3,
                z: center.z,
              },
            },
          ]);
          setCenterW(center);
          world.camera.controls.setLookAt(
            cameraPosition.x,
            cameraPosition.y,
            cameraPosition.z,
            center.x,
            center.y,
            center.z,
            true
          );

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
        relationsTree.indentationInText = false;
        relationsTree.expanded = false;
        relationsTree.hidden = true;

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
          setIsDropdownOpen(false);
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
            modelPropertiesRef.current = model._properties;
            setModelProperties(Object.values(model._properties));

            model.name = `${fileUrl}`;
            world.scene.three.add(model);
            world.meshes.add(model);

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
          const expandTable = (e) => {
            const button = e.target;
            propertiesTable.expanded = !propertiesTable.expanded;
            button.label = propertiesTable.expanded
              ? 'Collapse'
              : 'Expand';
          };

          const expandAssembly = (e) => {
            const button = e.target;
            relationsTree.expanded = !relationsTree.expanded;
            button.label = relationsTree.expanded
              ? 'Collapse'
              : 'Expand';
          };

          const onSearch = (e) => {
            const input = e.target;
            const query = input.value.trim();
            relationsTree.queryString = query;

            relationsTree.hidden = !query;
          };

          // Always create with class 'asd' (no hidden)
          return BUI.html`
          <bim-panel class="asd " label="Classifications Tree">
              <bim-panel-section label="Classifications">
              ${classificationsTree}
              </bim-panel-section>
              <bim-panel-section label="Element Data">
                <div style="display: flex; gap: 8px;">
                  <bim-button @click=${expandTable} label=${
            propertiesTable.expanded ? 'Collapse' : 'Expand'
          }></bim-button> 
                </div> 
                ${propertiesTable}
              </bim-panel-section>
             
              <bim-panel-section label="Search Assembly">
              <bim-label>Click a result to highlight the corresponding element.</bim-label>  
               <div style="display: flex; gap: 8px;">
                  <bim-button @click=${expandAssembly} label=${
            relationsTree.expanded ? 'Collapse' : 'Expand'
          }></bim-button> 
                </div> 
              <bim-text-input @input=${onSearch} placeholder="Search..." debounce="200"></bim-text-input>
              ${relationsTree}
              </bim-panel-section>
          </bim-panel> 
          `;
        });

        const measurementPanel = BUI.Component.create(() => {
          const viewAssemblyPDF = () => {
            setTimeout(() => {
              localStorage.setItem('fileName', fileName);
              const selected = localStorage.getItem(
                'SELECTED_PART_MARK'
              );
              console.log('selected', selected);
              navigate(`/project-folder/pdf-from-model/${projectId}`);
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
                      dimensionsInstance.color.set(
                        event.target.color
                      );
                    }}">
                    </bim-color-input>
                    
                    <bim-button label="Delete all"
                    @click="${() => {
                      dimensionsInstance.deleteAll();
                    }}">
                  </bim-button>
                  
                  </bim-panel-section>
                  
              <bim-panel-section collapsed label="View Clip">
                  <bim-label>Lower value: Detailed model</bim-label>  
                  <bim-label>Higher value: Simplified model</bim-label>  
               <bim-number-input 
                  slider step="10" label="Clip Threshold" value="10" min="0" max="500"
                  @change="${({ target }) => {
                    culler.config.threshold = target.value;
                  }}">
                </bim-number-input>
              </bim-panel-section>
              <bim-panel-section collapsed label="Model Opacity">
                <bim-number-input
                    slider step="1" label="Value" value="100" min="0" max="100"
                    @change="${({ target }) => {
                      setOpacity(parseFloat(target.value));
                    }}">
                </bim-number-input>
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

        // IFC GRID
        //   <bim-panel-section collapsed label="IFC Grid">
        //   <bim-checkbox
        //     label="Show IFC Grid"
        //     @change="${(event) => {
        //       if (ifcGridRef.current) {
        //         ifcGridRef.current.visible = event.target.value;
        //         setShowIfcGrid(event.target.value);
        //       }
        //     }}">
        //   </bim-checkbox>
        // </bim-panel-section>

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

  useEffect(() => {
    return () => {
      if (
        isTransparent &&
        originalMaterials.size > 0 &&
        worldRef.current &&
        fragmentsManagerRef.current
      ) {
        const models = Array.from(
          fragmentsManagerRef.current.groups.values()
        );
        models.forEach((model) => {
          model.traverse((object) => {
            if (object.isMesh && object.material) {
              const id = object.uuid;
              const originalMaterial = originalMaterials.get(id);

              if (originalMaterial) {
                if (Array.isArray(object.material)) {
                  object.material.forEach((mat, index) => {
                    if (originalMaterial[index]) {
                      mat.transparent =
                        originalMaterial[index].transparent;
                      mat.opacity = originalMaterial[index].opacity;
                    }
                  });
                } else if (originalMaterial) {
                  object.material.transparent =
                    originalMaterial.transparent;
                  object.material.opacity = originalMaterial.opacity;
                }
              }
            }
          });
        });
      }
    };
  }, [isTransparent, originalMaterials]);

  return (
    <div className={`w-100`} ref={measurementContainerRef}>
      <TopBar
        handleBack={handleBack}
        handleTogglePanel={togglePanel}
        isPanelOpen={isPanelOpen}
      />
      <div className="container" {...bind} ref={containerRef}>
        {/* <StickyHeader /> */}
        {isLoading && <Loader />}
      </div>

      <div className="tools-container">
        <div className="hide-container">
          {isHideContainerOpen && (
            <button
              className="hide-button"
              onClick={() => {
                hiderInstance.set(false, selectedFragmentIdMap);
                addHiddenFragmentId(selectedFragmentIdMap);
              }}
            >
              <FiEyeOff />
            </button>
          )}
          {hiddenFragmentIds.length > 0 && (
            <button
              className="reset-button"
              onClick={restoreHiddenFragments}
            >
              <FiRotateCcw />
            </button>
          )}
          <button
            className="view-button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <FiBox />
            <RiArrowDropRightFill />
          </button>
          {isDropdownOpen &&
            buttonConf.map((button, i) => (
              <button
                key={i}
                onClick={() => {
                  currentWorld.camera.controls.setLookAt(
                    button.coords.x,
                    button.coords.y,
                    button.coords.z,
                    centerW.x,
                    centerW.y,
                    centerW.z,
                    true
                  );
                  setIsDropdownOpen(!isDropdownOpen);
                }}
              >
                {button.name}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

export default IfcViewer;

function TopBar({ handleBack, handleTogglePanel, isPanelOpen }) {
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
          <Switch handleTogglePanel={handleTogglePanel} isPanelOpen={isPanelOpen} />
        </div>
      </div>
    </div>
  );
}
