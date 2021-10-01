<template>
  <h1>Interactive Data Visualisation</h1>
  <input type="text" v-model="nodeID" placeholder="Search ID">
  <button v-on:click="fetchNodeInfo">Search</button>
  <div id="cy">
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';
import axios from 'axios';
import cytoscape from 'cytoscape';

interface NodeProperties {
  description: string;
  identifier: string;
  issued: string;
  landingPage: string;
  name: string;
}

interface Node {
  identity: number;
  type: string;
  properties: NodeProperties;
}


export default class App extends Vue {
  cytoscape?: cytoscape.Core;
  nodeID!: number;

  data(): any {
    return {
      nodeID: 0
    }
  }

  async mounted(): Promise<void> {
    console.log('mounted')
    // Initialise cytoscape
    this.cytoscape = cytoscape({
      container: document.getElementById('cy'),
      layout: { name: 'grid', rows: 1 }
    })
  }

  async fetchNodeInfo(): Promise<Node> {
    const response = await axios.get('/Dataset/info', { params: {identity: this.nodeID}})
    const node = response.data[0] as Node
    console.log(node)

    this.cytoscape!.add({
      group: 'nodes',
      data: { 
        id: 'n' + node.identity.toString(),
        ...node.properties
      },
      position: { x: 100, y: 100 }
    })

    await this.getAllRelations()
    return node
  }
  
  async getAllRelations(): Promise<void> {
    const response = await axios.get('/Node/getAllRelations', { params: {identity: this.nodeID} })
    console.log(response.data[0])
    console.log(response.data.length)

    for (let data of response.data) {
      this.cytoscape!.add([{
        group: 'nodes',
        data: { 
          id: 'n' + data.node.identity.toString(), 
          ...data.node
        }
      }, {
        group: 'edges',
        data: { 
          id: 'e' + data.relation.identity.toString(), 
          type: data.relation.type,
          source: 'n' + this.nodeID.toString(),
          target: 'n' + data.node.identity
        },
      }])
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
