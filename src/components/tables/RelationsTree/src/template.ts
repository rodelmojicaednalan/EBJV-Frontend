// eslint-disable-next-line import/no-extraneous-dependencies
import * as FRAGS from '@thatopen/fragments';
import * as OBC from '@thatopen/components';
import * as OBF from '@thatopen/components-front';
import * as BUI from '@thatopen/ui';
import * as WEBIFC from 'web-ifc';
import { createAttributesRow } from '../../ElementProperties/src/attributes-row';
import { collectActions } from 'pdfjs-dist/build/pdf.worker';

export interface RelationsTreeUIState {
  components: OBC.Components;
  models: Iterable<FRAGS.FragmentsGroup>;
  selectHighlighterName?: string;
  hoverHighlighterName?: string;
  inverseAttributes?: OBC.InverseAttribute[];
  expressID?: number;
}

const WEBIFC_ENTITIESE_TO_IGNORE = [
  WEBIFC.IFCPROJECT,
  WEBIFC.IFCSITE,
  WEBIFC.IFCBUILDING,
  WEBIFC.IFCBUILDINGSTOREY,
  WEBIFC.IFCELEMENTASSEMBLY,
];

// console.log(WEBIFC_ENTITIESE_TO_IGNORE);

const getDecompositionTree = async (
  components: OBC.Components,
  model: FRAGS.FragmentsGroup,
  expressID: number,
  inverseAttributes: OBC.InverseAttribute[]
) => {
  const rows: BUI.TableGroupData[] = [];
  const indexer = components.get(OBC.IfcRelationsIndexer);

  const entityAttrs = await model.getProperties(expressID);
  if (!entityAttrs) return rows;
  const { type } = entityAttrs;
  const entityRow: BUI.TableGroupData = {
    data: {
      Entity: OBC.IfcCategoryMap[type],
      Name: entityAttrs.Name?.value,
      modelID: model.uuid,
      expressID,
    },
  };

  for (const attrName of inverseAttributes) {
    const relations = indexer.getEntityRelations(
      model,
      expressID,
      attrName
    );
    if (!relations) continue;
    if (!entityRow.children) entityRow.children = [];
    entityRow.data.relations = JSON.stringify(relations);
    const entityGroups: any = {};
    for (const id of relations) {
      const decompositionRow = await getDecompositionTree(
        components,
        model,
        id,
        inverseAttributes
      );
      for (const row of decompositionRow) {
        const entityNumericValue = WEBIFC[row?.data.Entity];

        // console.log('inner assemblyRelations: ', assemblyRelations);
        if (row.data.relations) {
          if (row.data.Name !== 'Undefined') {
            row.children = row.children?.filter(
              (child) => child.data.Name === row.data.Name
            );
          }

          entityRow.children.push(row);

          if (
            !WEBIFC_ENTITIESE_TO_IGNORE.includes(
              entityNumericValue
            ) &&
            row.children?.length == 0
          ) {
            const assemblyRelations = indexer.getEntityRelations(
              model,
              row?.data?.expressID,
              'Decomposes'
            );

            if (assemblyRelations && assemblyRelations[0]) {
              const containerID = assemblyRelations[0];
              const container = await model.getProperties(
                containerID
              );

              // console.log('container: ', container);
              if (container) {
                if (container.type == WEBIFC.IFCELEMENTASSEMBLY) {
                  if (row.children == null) row.children = [];
                  row.children.push({
                    data: {
                      Name: 'Assembly Mark',
                      Value: container['Tag'].value,
                    },
                  });
                }
              }
            }
          }
        } else {
          const data = model.data.get(id);
          if (!data) {
            entityRow.children.push(row);
            continue;
          }
          const type = data[1][1];
          const entity = OBC.IfcCategoryMap[type];
          if (!(entity in entityGroups)) entityGroups[entity] = [];
          row.data.Entity = row.data.Name;
          delete row.data.Name;
          entityGroups[entity].push(row);
        }
      }
    }

    for (const entity in entityGroups) {
      const children = entityGroups[entity];
      const relations = children.map(
        (child: any) => child.data.expressID
      );
      const row: BUI.TableGroupData = {
        data: {
          Entity: entity,
          modelID: model.uuid,
          relations: JSON.stringify(relations),
        },
        children,
      };
      entityRow.children.push(row);
    }
  }

  rows.push(entityRow);

  return rows;
};

const computeRowData = async (
  components: OBC.Components,
  models: Iterable<FRAGS.FragmentsGroup>,
  inverseAttributes: OBC.InverseAttribute[],
  expressID?: number
) => {
  const indexer = components.get(OBC.IfcRelationsIndexer);
  const rows: BUI.TableGroupData[] = [];
  for (const model of models) {
    let modelData: BUI.TableGroupData;
    // const elementAttrs = await model.getProperties(expressID);

    // const attributesRow = await createAttributesRow(elementAttrs, {
    //   indexer: indexer,
    //   model: model,
    //   expressID: expressID,
    // });

    // createAttributesRow();

    if (expressID) {
      modelData = {
        data: {
          Entity: model.name !== '' ? model.name : model.uuid,
        },
        children: await getDecompositionTree(
          components,
          model,
          expressID,
          inverseAttributes
        ),
      };
    } else {
      const modelRelations = indexer.relationMaps[model.uuid];
      const projectAttrs = await model.getAllPropertiesOfType(
        WEBIFC.IFCPROJECT
      );
      if (!(modelRelations && projectAttrs)) continue;
      const { expressID } = Object.values(projectAttrs)[0];

      modelData = {
        data: {
          Entity: model.name !== '' ? model.name : model.uuid,
        },
        children: await getDecompositionTree(
          components,
          model,
          expressID,
          inverseAttributes
        ),
      };
    }
    rows.push(modelData);
  }

  const formatTree = (nodes) => {
    let result = [];

    nodes.forEach((node) => {
      if (!node.children || node.children.length === 0) return;

      const assemblyMarkChildren = node.children.filter(
        (child) => child.data && child.data.Name === 'Assembly Mark'
      );

      if (assemblyMarkChildren.length > 0) {
        result.push({
          ...node,
          children: assemblyMarkChildren,
        });
      }

      result = result.concat(formatTree(node.children));
    });

    return result;
  };

  const formattedTree = formatTree(rows);

  return formattedTree;
};

let table: BUI.Table;

const getRowFragmentIdMap = (
  components: OBC.Components,
  rowData: any
) => {
  const fragments = components.get(OBC.FragmentsManager);
  const { modelID, expressID, relations } = rowData as {
    modelID: string;
    expressID: number;
    relations: string;
  };
  if (!modelID) return null;
  const model = fragments.groups.get(modelID);
  if (!model) return null;
  const fragmentIDMap = model.getFragmentMap([
    expressID,
    ...JSON.parse(relations ?? '[]'),
  ]);
  return fragmentIDMap;
};

export const relationsTreeTemplate = (
  state: RelationsTreeUIState
) => {
  const { components, models, expressID } = state;

  const selectHighlighterName =
    state.selectHighlighterName ?? 'select';
  const hoverHighlighterName = state.hoverHighlighterName ?? 'hover';

  if (!table) {
    table = document.createElement('bim-table');
    table.hiddenColumns = ['modelID', 'expressID', 'relations'];
    table.columns = ['Entity', 'Name'];
    table.headersHidden = true;

    table.addEventListener('cellcreated', ({ detail }) => {
      const { cell } = detail;

      if (cell.column === 'Entity' && !('Name' in cell.rowData)) {
        cell.style.gridColumn = '1 / -1';
      }
    });
  }

  let selectedRow = null;

  table.addEventListener('rowcreated', (e) => {
    e.stopImmediatePropagation();
    const { row } = e.detail;
    const highlighter = components.get(OBF.Highlighter);
    const fragmentIDMap = getRowFragmentIdMap(components, row.data);
    if (!(fragmentIDMap && Object.keys(fragmentIDMap).length !== 0))
      return;

    let isSelected = false;

    row.onmouseover = () => {
      if (!hoverHighlighterName || isSelected) return;
      row.style.backgroundColor = 'var(--bim-ui_bg-contrast-20)';
      highlighter.highlightByID(
        hoverHighlighterName,
        fragmentIDMap,
        true,
        false,
        highlighter.selection[selectHighlighterName] ?? {}
      );
    };

    row.onmouseout = () => {
      if (isSelected) return;
      row.style.backgroundColor = '';
      highlighter.clear(hoverHighlighterName);
    };

    row.onclick = () => {
      if (!selectHighlighterName) return;

      if (selectedRow && selectedRow !== row) {
        selectedRow.style.backgroundColor = '';
        highlighter.clear(selectHighlighterName);
        selectedRow.isSelected = false;
      }

      isSelected = !isSelected;

      if (isSelected) {
        row.style.backgroundColor = 'var(--bim-ui_bg-contrast-20)';
        highlighter.highlightByID(
          selectHighlighterName,
          fragmentIDMap,
          true,
          true
        );
        selectedRow = row;
      } else {
        row.style.backgroundColor = '';
        highlighter.clear(selectHighlighterName);
        selectedRow = null;
      }
    };
  });

  const inverseAttributes: OBC.InverseAttribute[] =
    state.inverseAttributes ?? [
      'IsDecomposedBy',
      'ContainsElements',
      // 'Decomposes',
    ];

  computeRowData(
    components,
    models,
    inverseAttributes,
    expressID
  ).then((data) => {
    table.data = data;
  });

  return BUI.html`${table}`;
};
