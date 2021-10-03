<template>
    <div class="row main">
        <div class="col s3 info panel left">
          <div v-if="node === null">
            <div class="row" style="margin-top: 10px;">
              <div class="col s10 offset-s1">
                <input class="input-field white-text" placeholder="Search for a dataset" type="text" v-model="searchText" v-on:keyup.enter="searchDatasets">
              </div>
            </div>
            <ul class="collection">
              <div v-bind:key="node.name" v-for="node in searchResults">
                <li class="collection-item" style="margin-bottom: 5px">
                  [{{ node.type }} - {{ node.identity.low }}] <br>
                  {{ node.name }}
                </li>
              </div>
            </ul>
          </div>
          <div v-else>
            <a :href="node.properties.landingPage" target="_blank">
              <h5 id="node-title">{{ node.properties.name }}</h5>
            </a>
            <hr>
  
            <div id="node-properties">
            <!-- Fill in with node info -->
            <button class="waves-effect waves-light btn w-100" @click="setNode">View Relations</button>
            <a class="waves-effect waves-light btn w-100" v-bind="node" :href="node.properties.landingPage" target="_blank">Check it out!</a>
  
            <h6 id="node-type">Type: {{ node.type }}</h6>

            <ul class="collection">
                <div v-bind:key="name" v-for="(value, name) in node.properties" >
                <li class="collection-item node-property" >
                    <b>{{ name }}</b><hr>
                    <p>
                    {{ value }}
                    </p>
                </li>
                </div>
            </ul>
          </div>
          </div>
        </div>

        <div class="col s9 main" style="padding: 0">
            <nav>
                <div class="nav-wrapper deep-purple darken-4">
                <img class="title" style="margin-top: 5px" src="./assets/icon.png">
                <a href="#" class="brand-logo title">The Black Sheep</a>
                </div>
            </nav>

            <div id="cy-container" class="col s9">
                <div id="cy" class="content"></div>
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
  cytoscape?: cytoscape.Core;
  node?: Dataset;
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
  }

  async searchDatasets(): Promise<void> {
    this.searchResults.splice(0, this.searchResults.length)
    const response = await axios.get('/Node/search', { params: { term: this.searchText }})
    this.searchResults = response.data
    console.log(response.data)
    /*
    await this.setUpCytoscape(2131)
    await this.addRelations(2131)
    */
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
    let nodes: cytoscape.ElementDefinition[] = [{
      group: "nodes",
      data: { id : dataset.identity.toString(), name: dataset.properties.name },
      classes: 'Dataset', 
      selected: true
    }]
    console.log('Setting up cytoscape');
    const config = Object.assign(cytoscapeConfig, {
      container: document.getElementById('cy'),
      elements: nodes
    })

    this.cytoscape = cytoscape(config as cytoscape.CytoscapeOptions)
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
