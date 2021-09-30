<template>
  <h1>Interactive Data Visualisation</h1>
  <div id="cy">
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';
import axios from 'axios';
import cytoscape from 'cytoscape';

export default class App extends Vue {
  cytoscape?: cytoscape.Core;

  mounted(): void {
    // Initialise cytoscape
    this.cytoscape = cytoscape({
      container: document.getElementById('cy')
    })

    // Test connection
    axios.get('http://readmythoughts.ddns.net:7070/', {
      params: {
        string : 'MATCH (n:Dataset) WHERE id(n) = $id RETURN n',
        data : { id : 2131 }
      }
    }).then((response: any) =>{
        const nodes = response.data.map((node: any) => node._fields[0]);
        console.log(nodes)
        this.cytoscape!.add({
          group: 'nodes',
          data: nodes[0].identity.low
        })
    })
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
