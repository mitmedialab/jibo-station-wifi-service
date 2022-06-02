<script>
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/env';
  import Page from '$lib/Page.svelte';
  import WiFiSetup from '$lib/../pages/WiFiSetup.svelte';


  onMount(() => {
  });
</script>

<div id="sectionholder">

  <Page title="WiFi Setup">
    <WiFiSetup/>
  </Page>

</div>


<!--
<style>
  #sectionholder {
    font-family: sans-serif;
    scroll-snap-type: x mandatory;	
    overscroll-behaviour: contain;
    /*scroll-behavior: smooth;*/
    display: flex;
    -webkit-overflow-scrolling: touch;
    overflow-x: scroll;
    height: 100vh;
  }
  #sectionholder::-webkit-scrollbar {
    display: none;
    height: 0 !important;
    width: 0 !important;
  }
</style>
-->
