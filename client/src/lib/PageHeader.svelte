<script>
  export let title;
</script>


<div id="logo-container">
  <!-- <img id="logo" height="80px" width="80px" src="/favicon.png" alt="ODL Logo"/> -->
</div>
  
<div class="title-container">
  <h2>
    {@html title}
  </h2>
</div>


<style>
  #logo-container {
    position: relative;
    width: 100%;
    height: 10px;
    max-width: 650px;
    margin: 0 auto;
  }
  #logo {
    position: absolute;
    top: 18px;
    left: 25px;
  }

  h2 {
    margin-top: 40px;
    font-size: 56px;
  }
  
  img {
    height: 80px;
    width: 80px;
  }
</style>
