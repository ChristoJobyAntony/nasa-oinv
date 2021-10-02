<template>
  <nav>
    <div class="nav-wrapper">
      <a href="#" class="brand-logo">
        <img src="./assets/icon.png">
        The Black Sheep
      </a>
    </div>
  </nav>
  <div class="row main">

    <div class="col s3 nav-bar-left card">
      <div class="card-content">
        <span class="card-title">
            {{ node === null ? "Select A Node to Know more about" : node.properties.name }}
        </span>
        <h6 id="node-type" v-if="node !== null">
          Type: {{ node.type }}
        </h6>
        <div id="node-properties" v-if="node !== null">
          <!-- Fill in with node info -->
          <button class="waves-effect waves-light btn" style="width: 100%" @click="setNode">View Relations</button>
          
          <ul v-bind:key="name" v-for="(value, name) in node.properties" class="collection">
             <li class="collection-item" v-if="name !== 'name'">{{ name }}: {{ value }} </li>
          </ul>
         
        </div>
      </div>
    </div>

    <div class="col s10"> </div>
    <div id="cy" class="content"></div>
  </div>

  
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
      node: null
    };
  }

  async mounted(): Promise<void> {
    console.log("mounted");
    await this.setUpCytoscape(2131)
    await this.addRelations(2131)

    this.cytoscape!.on('select', 'node', async (evt) => {
      this.node = await this.fetchNode(evt.target.id())
    })

    this.cytoscape!.on('taphold', 'node', async (evt) => {
      this.node = await this.fetchNode(evt.target.id())
      await this.setNode()
    })
  }

  async fetchNode(nodeID: number): Promise<Dataset> {
    const res = await axios.get("/Node/info", {
      params: { identity: nodeID },
    });
    return res.data;
  }

  async fetchNodeRelations(nodeID: number): Promise<any> {
    const res = await axios.get("/Node/getAllRelations", {
      params: { identity: nodeID },
    });
    return res.data;
  }
  
  async setUpCytoscape(id: number): Promise<void> {
    console.log('Setting up cytoscape');
    const dataset = await this.fetchNode(id)
    this.node = dataset
    let nodes: cytoscape.ElementDefinition[] = [{
      group: "nodes",
      data: { id : dataset.identity.toString(), name: dataset.properties.name },
      classes: 'Dataset', 
      selected: true
    }]

    const config = Object.assign(cytoscapeConfig, {
      container: document.getElementById('cy'),
      elements: nodes
    })

    this.cytoscape = cytoscape(config as cytoscape.CytoscapeOptions)
  }

  async addRelations(id: number) {
      const relationships = await this.fetchNodeRelations(id)
      let nodes: cytoscape.ElementDefinition[] = []
      // Add the relationships and their corresponding nodes
      for (const data of relationships) {
        nodes.push({
          group: 'nodes',
          data: { id: data.node.identity, name: data.node.name },
          classes: data.node.type
        })
        nodes.push({
          group: 'edges', 
          data: {id: data.relation.identity, name: data.node.type, source: id, target: data.node.identity },
          classes: data.relation.type
        })
      }

      this.cytoscape!.add(nodes)
      this.cytoscape!.layout(cytoscapeConfig.layout).run()
    }

  async setNode(): Promise<void> {
    console.log('Primary Node Update : ' + this.node?.identity);
    this.cytoscape!.remove(`[id != "${this.node?.identity}"]`)
    await this.addRelations(this.node!.identity)
  }

}
</script>

<style src="@/assets/styles/main.css"></style>
