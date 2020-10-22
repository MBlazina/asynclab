<script>
  const pageTitle = "Services Page";
  import BackgroundTitle from "../../components/BackgroundTitle.svelte";

  import ImageGroup from "../../components/ImageGroup.svelte";
</script>

<style lang="scss">
  @import "../../styles/global.scss";
  h1 {
    margin-bottom: 126px;
    @media only screen and (max-width: $break-mobile) {
      margin-bottom: 40px;
    }
  }
  .serviceSection {
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

  <!-- SOFTWARE AND APP DEVELOPMENT -->
  <div class="serviceSection">
    <ImageGroup
      title="Software & App Development"
      text="Delivering tailored engineering solutions to your 
            business challenges, whether it is architectural 
            design or web application development."
      position="left"
      listItems={['Frontend Development', 'Backend Development', 'Mobile Development', 'Blockchain Development']}
      imageMain="assets/images/services/1.jpg"
      imageSecondary="assets/images/services/2.jpg" />
  </div>

  <!-- PRODUCT MARKETING -->
  <div class="serviceSection">
    <ImageGroup
      title="Product Marketing"
      text="Your potential users are already here. We can 
      help you reach them through different marketing 
      channels and convert them to profitable customers."
      position="right"
      listItems={['SEO & Search Marketing', 'Social Media Marketing', 'Content Marketing', 'Inbound Marketing', 'Paid Advertising']}
      imageMain="assets/images/services/1.jpg"
      imageSecondary="assets/images/services/2.jpg" />
  </div>

  <!-- DIGITAL DESIGN -->
  <div class="serviceSection">
    <ImageGroup
      title="Digital Design"
      text="From UX to visual design, we create digital 
      products people love to use."
      position="left"
      listItems={['User Interface Design', 'User Experience Design', 'Graphic Design']}
      imageMain="assets/images/services/1.jpg"
      imageSecondary="assets/images/services/2.jpg" />
  </div>
</div>
