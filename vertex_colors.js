const VERTEX_COLOR_DATA_NAME = "data_vertex_colors"

// indices into the vertex color list.
// In the future this may be replaced with an actual class.
// TODO: in fact maybe it should be converted into a class, the only issue with that is it's not POD anymore and needs custom json serialization logic I think.
const RED = 0
const GREEN = 1
const BLUE = 2
const ALPHA = 3
const MIX = 4

// "error code" Magenta with a mix factor of zero (fully textured, no vertex color applied to preview)
// TODO: switch this to black
const DEFAULT_VERTEX_COLOR = [1.0, 0.0, 1.0, 1.0, 0.0]

// The property for vertex colors so they are saved and loaded to/from the bbmodel file correctly.
let vertex_color_property

// Old versions of monkey patched functions
let old_MeshFace_extend
let old_MeshFace_getSaveCopy

Plugin.register('vertex_colors', {
    title: 'Vertex Colors',
    author: 'bluesillybeard',
    icon: 'icon',
    description: 'Adds vertex colors to Blockbench',
    version: '1.0.0',
    variant: 'both',
    await_loading: 'true',
    onload() {
        vertex_color_property = new Property(MeshFace, "object", VERTEX_COLOR_DATA_NAME, {
            default: {},
            merge: (instance, data) => {
                instance[VERTEX_COLOR_DATA_NAME] = structuredClone(data[VERTEX_COLOR_DATA_NAME])
            },
            copy_value: (instance, target) => {
                target[VERTEX_COLOR_DATA_NAME] = structuredClone(instance[VERTEX_COLOR_DATA_NAME])
            },
            reset: (instance) => {
                instance_vertex_colors = {};
                for(let vertex_key in instance.vertices) {
                    instance_vertex_colors[vertex_key] = DEFAULT_VERTEX_COLOR
                }
                instance[VERTEX_COLOR_DATA_NAME] = instance_vertex_colors
            },
            export: true
        });

        // MeshFace.extend updates the uv coordinates to match any changes in the vertices
        // We need to also update the vertex colors in the same way
        // The MeshFace constructor also uses this, to reduce code duplication (nice)
        old_MeshFace_extend = MeshFace.prototype.extend;
        MeshFace.prototype.extend = function(data) {
            let old_return = old_MeshFace_extend.bind(this, data)()
            if(old_return !== this) {
                console.warn("[Vertex_colors]: Return value of MeshFace.extend() was unexpected. This indicates a change in Blockbench that may effect vertex colors!")
            }
            this.vertices.forEachReverse((key, i) => {
                if (typeof key != 'string' || !key.length) {
                    delete this[VERTEX_COLOR_DATA_NAME][key];
                    return;
                }
                if(!this[VERTEX_COLOR_DATA_NAME]){
                    this[VERTEX_COLOR_DATA_NAME] = {};
                }
                if(!this[VERTEX_COLOR_DATA_NAME][key]){
                    this[VERTEX_COLOR_DATA_NAME][key] = DEFAULT_VERTEX_COLOR;
                }
                if (data[VERTEX_COLOR_DATA_NAME] && data[VERTEX_COLOR_DATA_NAME][key] instanceof Array) {
                    this[VERTEX_COLOR_DATA_NAME][key].replace(data[VERTEX_COLOR_DATA_NAME][key]);
                }
            })
            for (let key in this[VERTEX_COLOR_DATA_NAME]) {
                if (!this.vertices.includes(key)) {
                    delete this[VERTEX_COLOR_DATA_NAME][key];
                }
		    }
            return old_return;
        }

        // Same deal with getSaveCopy, need to make sure the copy also gets the vertex color data
        old_MeshFace_getSaveCopy = MeshFace.prototype.getSaveCopy;
        MeshFace.prototype.getSaveCopy = function(nested) {
            let copy = old_MeshFace_getSaveCopy.bind(this, nested)()
            copy[VERTEX_COLOR_DATA_NAME] = structuredClone(this[VERTEX_COLOR_DATA_NAME])
            return copy;
        }
    },
    onunload() {
        // Reset all the monkey patches
        MeshFace.prototype.extend = old_MeshFace_extend;
        MeshFace.prototype.getSaveCopy = old_MeshFace_getSaveCopy;
        vertex_color_property.delete()
    }
});

