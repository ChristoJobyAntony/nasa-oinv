<template>
  <div class="nav-bar-top">Navigation Bar</div>
  <div class="nav-bar-left">
        <h5 id="">
            {{ node === null ? "Select A Node to Know more about" : node.properties.name }}
        </h5>
        <h6 id="node-type"></h6>
        <ol id="node-properties" v-if="node !== null">
            <!-- Fill in with node info -->
            <div>Description: {{ node.properties.description }}</div>
            <div>Landing Page: {{ node.properties.landingPage }}</div>
            <button>View Relations</button>
        </ol>
    </div>

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
  node?: Dataset;

  data(): any {
    return {
      nodeID: 2131,
      node: null
    };
  }

  async mounted(): Promise<void> {
    console.log("mounted");
    await this.createPrimaryNode(this.nodeID)
    this.cytoscape!.on('tap', 'node', this.updateInfoPanel)
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
    this.node = dataset;
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

    const config = Object.assign(cytoscapeConfig, {
      container: document.getElementById('cy'),
      elements: nodes
    })

    console.log(dataset)
    this.cytoscape = cytoscape(config as cytoscape.CytoscapeOptions)
  }

  async updateInfoPanel(evt: cytoscape.EventObject) : Promise<void> {
      const node = evt.target
      console.log('Tapped ' + node.id())
      const response = await axios.get('/Node/info', {params: { identity : node.id()}})
      this.node = response.data
      console.log(response.data)
  }
  
  async getRelations(nodeID : number) : Promise<void> {
    const response = 'test'   
  }
}
</script>

<style src="@/assets/styles/main.css"></style>
