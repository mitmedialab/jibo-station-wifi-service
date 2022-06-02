<script>
  import { onMount, onDestroy } from 'svelte';
  import PageHeader from '$lib/PageHeader.svelte';
  export let id = undefined;
  export let title;
</script>

<section {id}>

  <div class="PageHeader">
    <slot name="PageHeader">
      <PageHeader {title}/>
    </slot>
  </div>

  <div class="PageBody-container">
    <div class="PageBody">
      <slot/>
    </div>
  </div>

</section>

<style>
  /* * { outline: solid 1px lightblue; } */

  section {
    width: 100vw;
    min-width: 100vw;
    max-width: 100vw;
    height: 100vh;
    min-height: 100vh;
    max-height: 100vh;
    /* border-right: 1px solid white; */
    /* padding: 1rem; */
    scroll-snap-align: start;
    /* scroll-snap-stop: always; */
    text-align: center;
    position: relative;
    overscroll-behavior: none;
  }

  section:nth-child(even) {
    background-color: #1A4565 /*#1B617C;*/ /*#13343D;*/
  }
  section:nth-child(odd) {
    background-color: #29617C /*#187D8B;*/ /*#1B3C45;*/
  }
  
  .PageHeader {
    position: absolute;
    top: 0;
    height: 120px;
    width: 100%;
    padding-top: 10px;
    overscroll-behavior: none;
  }

  .PageBody-container {
    position: relative;
    top: 120px;
    --height: calc(100vh - 105px);
    height: var(--height);
    max-height: var(--height);
    min-height: var(--height);
    width: 100%;
    max-width: 100%;
    min-width: 100%;
    margin-bottom:20px;
    /* overflow: auto; */
    /* overscroll-behavior: none; */
  }

  .PageBody {
    padding-top: 20px;
    width: 100%;
    --height: calc(100vh - 300px);
    /* height: --height; */
    /* max-height: --height; */
    font-size:22px;
    font-weight:700;
    color:white;
  }
</style>
