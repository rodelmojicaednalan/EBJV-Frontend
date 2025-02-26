import * as BUI from '@thatopen/ui';
import * as WEBIFC from 'web-ifc';
import * as OBC from '@thatopen/components';
import * as FRAGS from '@thatopen/fragments';

const attrsToIgnore = [
  'OwnerHistory',
  'ObjectPlacement',
  'CompositionType',
];

export const createAttributesRow = async (
  attrs: { [attribute: string]: any },
  _options?: {
    groupName?: string;
    includeClass?: boolean;
    indexer?: OBC.IfcRelationsIndexer;
    model?: FRAGS.FragmentsGroup;
    expressID?: number;
  }
) => {
  const defaultOptions = {
    groupName: 'Attributes',
    includeClass: false,
  };
  const options = { ...defaultOptions, ..._options };
  const { groupName, includeClass, indexer, model, expressID } =
    options;

  const attrsRow: BUI.TableGroupData = { data: { Name: groupName } };

  // Assembly
  const assembly = indexer?.getEntityRelations(
    model,
    expressID,
    'Decomposes'
  );

  // Materials
  const associateRelations = indexer?.getEntityRelations(
    model,
    expressID,
    'HasAssociations'
  );

  if (includeClass) {
    if (!attrsRow.children) attrsRow.children = [];
    attrsRow.children.push({
      data: {
        Name: 'Class',
        Value: OBC.IfcCategoryMap[attrs.type],
      },
    });
  }

  // Property Sets
  const definedByRelations = indexer?.getEntityRelations(
    model,
    expressID,
    'IsDefinedBy'
  );

  for (const attrName in attrs) {
    if (attrsToIgnore.includes(attrName)) continue;
    const attrValue = attrs[attrName];
    if (!attrValue) continue;
    if (typeof attrValue === 'object' && !Array.isArray(attrValue)) {
      if (attrValue.type === WEBIFC.REF) continue;
      const valueRow: BUI.TableGroupData = {
        data: { Name: attrName, Value: attrValue.value },
      };
      if (!attrsRow.children) attrsRow.children = [];
      attrsRow.children.push(valueRow);
    }
  }

  // Assembly Mark
  if (assembly && assembly[0]) {
    const containerID = assembly[0];
    const container = await model.getProperties(containerID);
    if (container) {
      if (container.type == WEBIFC.IFCELEMENTASSEMBLY) {
        if (!attrsRow.children) attrsRow.children = [];
        attrsRow.children.push({
          data: {
            Name: 'Assembly Mark',
            Value: container['Tag'].value,
          },
        });
      }
    }
  }

  // Material
  if (associateRelations && associateRelations[0]) {
    const containerID = associateRelations[0];
    const container = await model.getProperties(containerID);

    if (container) {
      if (container.type == WEBIFC.IFCMATERIAL) {
        if (!attrsRow.children) attrsRow.children = [];
        attrsRow.children.push({
          data: {
            Name: 'Material',
            Value: container['Name'].value,
          },
        });
      }
    }
  }

  // Psets
  if (definedByRelations) {
    const containerIDs = definedByRelations;
    let pset = [];
    let finish = [];
    for (const containerID of containerIDs) {
      const container = await model?.getProperties(containerID);
      if (container['Name'].value == 'Tekla Quantity')
        pset.push(container);
      if (container['Name'].value == 'Tekla Common')
        finish.push(container);
    }

    if (pset) {
      const p = pset[0];
      if (p.type == WEBIFC.IFCPROPERTYSET) {
        p.HasProperties.forEach(async (property) => {
          const { value: propID } = property;
          const propAttrs = await model?.getProperties(propID);

          if (
            propAttrs['Name'].value == 'Weight' ||
            propAttrs['Name'].value == 'Length'
          ) {
            attrsRow.children.push({
              data: {
                Name: propAttrs['Name'].value,
                Value: propAttrs['NominalValue'].value,
              },
            });
          }
        });
      }
    }

    if (finish) {
      const p = finish[0];
      if (p.type == WEBIFC.IFCPROPERTYSET) {
        p.HasProperties.forEach(async (property) => {
          const { value: propID } = property;
          const propAttrs = await model?.getProperties(propID);

          if (propAttrs['Name'].value == 'Finish') {
            attrsRow.children.push({
              data: {
                Name: propAttrs['Name'].value,
                Value: propAttrs['NominalValue'].value
                  ? propAttrs['NominalValue'].value
                  : 'none',
              },
            });
          }
        });
      }
    }
  }

  if (attrsRow.data['Name'] == 'Tekla Assembly') {
    attrsRow.children = attrsRow.children?.filter(
      (item) => item.data.Name === 'Assembly/Cast unit Mark'
    );

    return attrsRow;
  }

  attrsRow.children = attrsRow.children?.filter((child) => {
    if (child.data.Name === 'Tag') {
      child.data.Name = 'Part Mark';
    }

    return (
      child.data.Name !== 'Class' && child.data.Name !== 'GlobalId'
    );
  });

  return attrsRow;
};
