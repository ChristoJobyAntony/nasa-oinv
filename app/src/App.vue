<template>
    <div class="row main">
        <div class="col s3 info panel left">
          <div class="row" style="margin-top: 10px;">
            <div class="col s12 ">
              <input id="search-bar" class="input-field" placeholder="Search for a dataset" type="text" v-model="searchText" @keyup="searchDatasets" v-on:keyup.enter="searchDatasets">
            </div>
          </div>
          <hr>
          <div class="collection" style="border-color:transparent" v-if="node === null">
            <div v-bind:key="node.name" v-for="node in searchResults">
              
              <div class="hoverable collection-item search-result-item" style="margin-bottom: 5px" @click="setUpCytoscape(node.identity.low)">
                [{{ node.type }} - {{ node.identity.low }}] <br>
                {{ node.name }}
              </div>
            </div>
            <div class="z-depth-2 collection-item" v-if="searchResults.length === 0">No datasets found</div>
          </div>
          <div v-else>
            <a :href="node.properties.landingPage" target="_blank" class="hoverable">
              <h5 id="node-title">{{ node.properties.name }}</h5>
            </a>
            <hr>
  
            <div id="node-properties">
            <!-- Fill in with node info -->
            <button class="waves-effect waves-light btn w-100" @click="setNode">View Relations</button>
            <a class="waves-effect waves-light btn w-100" v-bind="node" :href="node.properties.landingPage" v-if="node.properties.landingPage" target="_blank" style="margin-top: 5px">Visit Webiste</a>
  
            <!-- <h6 id="node-type">Type: {{ node.type }}</h6> -->

            <ul class="collection">
                <li class="collection-item node-property"><b>Type</b><hr>{{ node.type }}</li>
                <div v-bind:key="name" v-for="(value, name) in node.properties" >
                <li class="collection-item node-property" >
                    <b>{{ name }}</b><hr>
                    <p>{{ value }}</p>
                </li>
                </div>
            </ul>
          </div>
          </div>
        </div>

        <div class="col s9 main" style="padding: 0">
            <nav>
                <div id="title-bar" class="nav-wrapper ">
                <img class="title" style="margin-top: 5px" src="./assets/icon.png">
                <a href="#" class="brand-logo title">Data Visualizer</a>
                </div>
            </nav>

            <div id="cy-container" class="col s9">
                <div id="cy" class="content">
                </div>
                <div id="legend">
                  <ul style="margin:0px">
                    <li><div class="color-key" style="background-color:pink"></div>Dataset</li>
                    <li><div class="color-key" style="background-color:gold"></div>Agency</li>
                    <li><div class="color-key" style="background-color:magenta"></div>Bureau</li>
                    <li><div class="color-key" style="background-color:orangered"></div>Program</li>
                    <li><div class="color-key" style="background-color:springgreen"></div>Publisher</li>
                    <li><div class="color-key" style="background-color:crimson"></div>Contact Point</li>
                    <li><div class="color-key" style="background-color:aquamarine"></div>Keyword</li>
                    <li><div class="color-key" style="background-color:forestgreen"></div>Theme</li>

                  </ul>
                </div>
            </div>

        </div>     
    </div>  
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import axios from "axios";
import cytoscape from "cytoscape";
import cytoscapeConfig from '@/assets/json/cytoscapeConfig.json'
import M from 'materialize-css';

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
  node?: Dataset | null;
  cytoscape?: cytoscape.Core;
  searchText!: string;
  searchResults!: Dataset[];

  data(): any {
    return {
      node: null,
      searchText: '',
      searchResults: []
    };
  }

  async mounted(): Promise<void> {
    console.log("mounted");
    M.AutoInit()
    const randomID = this.randomNumber(2131, 58370)
    await this.setUpCytoscape(randomID)
  }

  randomNumber(min: number, max: number): number {
    return min + Math.floor(Math.random() * (max - min + 1))
  }

  async searchDatasets(): Promise<void> {
    this.node = null
    this.searchResults.splice(0, this.searchResults.length)
    const response = await axios.get('/Node/search', { params: { term: this.searchText }})
    this.searchResults = response.data
  }

  async fetchNode(id: number): Promise<Dataset> {
    const res = await axios.get("/Node/info", {
      params: { identity: id },
    });
    return res.data;
  }

  async fetchNodeRelations(id: number): Promise<any> {
    const res = await axios.get("/Node/getAllRelations", {
      params: { identity: id },
    });
    return res.data;
  }
  
  async setUpCytoscape(id: number): Promise<void> {
    const dataset = await this.fetchNode(id)
    this.node = dataset
    this.searchResults.splice(0, this.searchResults.length)
    let nodes: cytoscape.ElementDefinition[] = [{
      group: "nodes",
      data: { id : dataset.identity.toString(), name: dataset.properties.name },
      classes: dataset.type, 
      selected: true
    }]
    console.log('Setting up cytoscape');
    const config = Object.assign(cytoscapeConfig, {
      container: document.getElementById('cy'),
      elements: nodes
    })

    this.cytoscape = cytoscape(config as cytoscape.CytoscapeOptions)

    await this.addRelations(id)
    this.cytoscape!.on('select', 'node', async (evt) => {
      this.node = await this.fetchNode(evt.target.id())
    })

    this.cytoscape!.on('taphold', 'node', async (evt) => {
      this.node = await this.fetchNode(evt.target.id())
      await this.setNode()
    })
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
