<script>
  const pageTitle = "Services Page";
  import BackgroundTitle from "../../components/BackgroundTitle.svelte";
 
  import ImageGroup from "../../components/ImageGroup.svelte";
</script>

<style lang="scss">
  @import "../../styles/global.scss";
  h1 {
    margin-bottom: 126px;
  }
  .serviceSection{
      margin-bottom: 120px;
  }
</style>

<div class="container">
  <div class="row">
    <h1 class="col-md-8 offset-md-1">Building from idea to implementation</h1>
    <div class="col-md-3">
      <BackgroundTitle title={pageTitle} />
    </div>
  </div>
  
      <div class="serviceSection">
          <ImageGroup position="left"/>
      </div>
      <div class="serviceSection">
          <ImageGroup position="right" />
      </div>
      <div class="serviceSection">
          <ImageGroup position="left"/>
      </div>
   
</div>
