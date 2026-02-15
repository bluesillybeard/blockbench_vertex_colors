let vertex_color_property;

function onaddmesh() {
    console.log("The user added a mesh");
    Mesh.all.forEach(m => {
        m.forAllFaces((face, key) => {
            console.log("Face " + key + " had vertex colors " + face["data_vertex_colors"]);
            face["data_vertex_colors"] = "hello";
        })
    })
}

Plugin.register('vertex_colors', {
    title: 'Vertex Colors',
    author: 'bluesillybeard',
    icon: 'icon',
    description: 'Adds vertex colors to Blockbench',
    version: '1.0.0',
    variant: 'both',
    await_loading: 'true',
    onload() {
        console.log("Hello I am a vertex plugin");
        vertex_color_property = new Property(Face, "string", "data_vertex_colors", {
            default: "hi",
            merge: (instance, data) => {
                instance["data_vertex_colors"] = structuredClone(data["data_vertex_colors"])
                console.log("vertex color merged")
            },
            copy_value: (instance, target) => {
                target["data_vertex_colors"] = structuredClone(instance["data_vertex_colors"])
                console.log("vertex color copied")
            },
            export: true
        });

        Blockbench.on('add_mesh', onaddmesh);
    },
    onunload() {
        vertex_color_property.delete();
        Blockbench.removeListener('add_mesh', onaddmesh);
    }
});
