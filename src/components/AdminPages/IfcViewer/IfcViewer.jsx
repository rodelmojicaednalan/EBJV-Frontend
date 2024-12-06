import React, { useEffect, useRef } from 'react';
import * as OBC from '@thatopen/components';
import * as BUI from '@thatopen/ui';
import * as CUIT from '../../tables';
import * as CUIB from '../../buttons';

BUI.Manager.init();

function IfcViewer() {
  const containerRef = useRef(null);

  useEffect(() => {
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

      const panel = BUI.Component.create(() => {
        const [loadIfcBtn] = CUIB.buttons.loadIfc({ components });

        return BUI.html`
         <bim-panel label="Classifications Tree">
          <bim-panel-section label="Importing">
            ${loadIfcBtn}
          </bim-panel-section>
          <bim-panel-section label="Classifications">
            ${classificationsTree}
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
  }, []);

  return (
    <div className="container" ref={containerRef}d>
      {/* <div ></div> */}
    </div>
  );
}

export default IfcViewer;