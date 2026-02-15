let button;

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
        button = new Action('vertex_colors', {
            name: 'say hello',
            description: 'this button says hello',
            click: function() {
                console.log("Hello, vertex colors here! I was edited.");
            }
        });
        MenuBar.addAction(button, 'filter');
    },
    onunload() {
        button.delete();
    }
});
