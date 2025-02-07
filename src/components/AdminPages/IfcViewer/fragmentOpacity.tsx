import {
    FragmentsManager,
    SimpleWorld,
    Hider,
    Disposer
}
from "@thatopen/components";
import {
    Fragment,
    FragmentIdMap,
    Item
}
from "@thatopen/fragments";
import {
    Material,
    MeshLambertMaterial,
}
from 'three';

export class TransparentFragments {

    private world: SimpleWorld;
    private transparentFragments: {
        [opacity: number]: Map<string, Fragment>;
    } = {};


    constructor(world: SimpleWorld) {
        this.world = world;
    }


    public get(): TransparentFragments {
        return this;
    }

    /**
     * Creates a transparent copy of each Fragment, with the selected opacity level
     * @param opacityLevel the opacity level
     * @returns
     */
    public createTransparentFragments(baseFragments: Fragment[], opacityLevel: number): void {
        if (this.transparentFragments[opacityLevel]) {
            return;
        }

        this.transparentFragments[opacityLevel] = new Map<string, Fragment>();

        for (let frag of baseFragments) {

            //create transparent materials for fragment
            let transparentMaterials = new Array<Material>();
            for (const material of frag.mesh.material) {
                transparentMaterials[transparentMaterials.length] = this.copyToTransparentMaterial(material, opacityLevel);
            }

            //create new transparent fragment
            let tFrag = new Fragment(frag.mesh.geometry, transparentMaterials, 1)

            //copy items
            let transparentItems: Item[] = [];
            for (const iid of frag.ids) {
                const item = frag.get(iid);
                let tItem: Item = { id: item.id, transforms: [], colors: [] };
                for (const m of item.transforms) {
                    tItem.transforms![tItem.transforms!.length] = m.clone();
                }
                for (const c of item.colors) {
                    tItem.colors![tItem.colors!.length] = c.clone();
                }
                transparentItems[transparentItems.length] = tItem;
            }
            tFrag.add(transparentItems);
            (tFrag.mesh as THREE.InstancedMesh).frustumCulled = false;

            //finalize creation
            tFrag.group = frag.group;
            tFrag.setVisibility(false);
            this.transparentFragments[opacityLevel].set(frag.id, tFrag);

            //add fragment to scene
            this.world.scene.three.add(tFrag.mesh);
            this.world.meshes.add(tFrag.mesh);
        }

    }

    /**
     * Creates a transparent copy or a material
     * @param material the source material
     * @param opacityLevel the opacity level
     * @returns
     */
    private copyToTransparentMaterial(material: Material, opacityLevel: number) {
        const transparentMaterial = new MeshLambertMaterial();
        transparentMaterial.copy(material);
        transparentMaterial.transparent = true;
        transparentMaterial.opacity = opacityLevel;

        return transparentMaterial;
    }

    /**
     * Changes visibility of transparent elements.
     * Visibility of base elements shall be managed elsewhere, as it may depend upon other circumstances.
     * @param opacityLevel the opacity level to be applied
     * @param fragmentIdMap elements to act upon
     * @param transparent whether the transparent elements shall be visible or not
     */
    public setTransparencyByIdMap(opacityLevel: number, fragmentIdMap: FragmentIdMap, transparent: boolean) {
        if (!this.transparentFragments[opacityLevel]) {
            throw new Error("Opacity level " + opacityLevel + " not found");
        }
        for (const fragmentId in fragmentIdMap) {
            if (this.transparentFragments[opacityLevel].has(fragmentId)) {
                const ids = [...(fragmentIdMap[fragmentId])]
                this.transparentFragments[opacityLevel].get(fragmentId).setVisibility(transparent, ids);
            }
            else {
                throw new Error("Fragment " + fragmentId + " not found");
            }
        }

    }


    /**
     * Hides all transparent objects. Corresponding opaque objects are not shown automatically, as they might be hidden for other reasons.
     * @param opacityLevel the opacity level to be hidden
     */
    public setAllNotTransparent(opacityLevel: number) {
        for (const [fid, frag] of this.transparentFragments[opacityLevel]) {
            frag.setVisibility(false);
        }
    }    


    public disposeOpacityLevel(disposer: Disposer, opacityLevel: number) {
        for (const fid in this.transparentFragments[opacityLevel]) {
            let frag = this.transparentFragments[opacityLevel][fid]
            this.world.scene.three.remove(frag.mesh);
            this.world.meshes.delete(frag.mesh);
            disposer.destroy(frag.mesh);
            frag.dispose();
            delete this.transparentFragments[opacityLevel][fid];
        }
    }

    public disposeAllOpacityLevels(disposer: Disposer) {
        for (const opacity in this.transparentFragments) {
            this.disposeOpacityLevel(disposer, Number(opacity));
        }
    }

}