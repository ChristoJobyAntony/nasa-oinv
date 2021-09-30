<template>
  <h1>Interactive Data Visualisation</h1>
  <div id="list-rendering">
  <ol>
    <li v-bind:key="node.identity" v-for="node in nodes">
      {{ node.labels[0] }} {{ node.properties.name }} {{ node.properties.code }}
    </li>
  </ol>
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component';
import axios from 'axios';

export default class App extends Vue {
  nodes?: any[];

  data() {
    return {
      nodes: []
    }
  }

  mounted(): void {
    axios.get('http://readmythoughts.ddns.net:7070/', {
      params: {
        string : 'MATCH (n:Dataset) WHERE id(n) = $id RETURN n',
        data : { id : 2131 }
      }
    }).then((response: any) =>{
        console.log("RESPONSE BODY");
        this.nodes = response.data
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
