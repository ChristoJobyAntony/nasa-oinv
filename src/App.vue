<template>
  <div class="nav-bar-top">Navigation Bar</div>
  <div class="nav-bar-left">Nav-Bar Left</div>

  <div id="cy" class="content"></div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import axios from "axios";
import cytoscape from "cytoscape";
import cytoscapeConfig from '@/assets/json/cytoscapeConfig.json'

interface DatasetProperties {
  description: string;
  identifier: string;
  issued: string;
  landingPage: string;
  name: string;
}

interface Dataset {
  identity: number;
  type: string;
  properties: DatasetProperties;
}

export default class App extends Vue {
  cytoscape?: cytoscape.Core;
  nodeID!: number;

  data(): any {
    return {
      nodeID: 2131,
    };
  }

  async mounted(): Promise<void> {
    console.log("mounted");
    // Initialise cytoscape
    await this.createPrimaryNode(this.nodeID)
  }

  async fetchDataset(nodeID: number): Promise<Dataset> {
    const res = await axios.get("/Dataset/info", {
      params: { identity: nodeID },
    });
    return res.data;
  }

  async fetchDatasetRelations(nodeID: number): Promise<any> {
    const res = await axios.get("/Node/getAllRelations", {
      params: { identity: nodeID },
    });
    return res.data;
  }

  async createPrimaryNode(nodeID: number): Promise<void> {
    const dataset = await this.fetchDataset(nodeID);
    const relationships = await this.fetchDatasetRelations(nodeID);
    console.log(dataset);
    console.log(relationships);

    let nodes: cytoscape.ElementDefinition[] = [{
      group: "nodes",
      data: { id : dataset.identity.toString(), name: dataset.properties.name },
      classes: 'Dataset', 
      selected: true
    }]

    for (const data of relationships) {
      nodes.push({
        group: 'nodes',
        data: { id: data.node.identity, name: data.node.name },
        classes: data.node.type
      })

      nodes.push({
        group: 'edges', 
        data: { 
          id: data.relation.identity, 
          name: data.node.type, 
          source: data.node.identity, 
          target: dataset.identity 
        }, 
        classes: data.relation.type
      })
    }

    console.log(nodes);
    const config = Object.assign(cytoscapeConfig, {
      container: document.getElementById('cy'),
      elements: nodes
    })
    console.log(config);
    this.cytoscape = cytoscape(config as cytoscape.CytoscapeOptions)
  }
}
</script>

<style src="@/assets/styles/main.css"></style>
