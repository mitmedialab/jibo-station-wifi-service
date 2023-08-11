<script>
  export let id;
  export let noclosebutton=false;
</script>

<div {id} class="panel">
  {#if !noclosebutton}
    <div id="dismiss">
      <img src="cross.png" alt="dismiss" height="35" width="35">
    </div>
  {/if}
  <slot/>
</div>


<style>
  .panel {
    display: none;
    position: absolute;
    top: 0vh;
    right: 0vw;
    width: 100vw;
    min-width: 100vw;
    height: 100vh;
    background-color: #33546D;
  }

  #dismiss {
    position: absolute;
    color: gray;
    padding: 14px 12px 8px 12px;
    top: 50px;
    right: 100px;
    border: solid 5px gray;
  }

  :global(.showinfopanel) #infopanel {
    display: block !important;
  }

  :global(.noserver) #noserverpanel,
  :global(.nostatus) #noserverpanel {
    display: block !important;
  }

/* s06-tweaks
  :global(.turnjiboonpanel) #turnjiboonpanel,
  :global(.restartstationpanel) #restartstationpanel {
    display: block;
  }
*/

  :global(.rebooting) #rebootingpanel{
    display: block !important;
  }

  :global(.poweringoff) #poweringoffpanel{
    display: block !important;
  }

  :global(.showdonepanel) #donepanel {
    display: block !important;
  }
</style>
