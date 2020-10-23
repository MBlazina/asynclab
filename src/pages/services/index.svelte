<script>
  const pageTitle = "Services Page";
  import BackgroundTitle from "../../components/BackgroundTitle.svelte";
  import Button from "../../components/Button.svelte";
  import ImageGroup from "../../components/ImageGroup.svelte";
  import NumbersText from "../../components/NumbersText.svelte";
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
  .numbersSection {
    padding-top: 190px;
    padding-bottom: 212px;
  }
  .interestedSection {
    height: 492px;
    background-image: url("/assets/images/services/bg.jpg");
    background-repeat: no-repeat;
    background-size: cover;
    h2,
    p {
      color: white;
    }
    h2 {
      margin-bottom: 21px;
    }
    p {
      font-size: 20px;
      font-weight: normal;
      font-stretch: normal;
      font-style: normal;
      line-height: 1.5;
      letter-spacing: normal;
      text-align: center;
      color: #ffffff;

      margin-bottom: 41px;
    }
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
      imageMain="assets/images/services/3.jpg"
      imageSecondary="assets/images/services/4.jpg" />
  </div>

  <!-- DIGITAL DESIGN -->
  <div class="serviceSection">
    <ImageGroup
      title="Digital Design"
      text="From UX to visual design, we create digital 
      products people love to use."
      position="left"
      listItems={['User Interface Design', 'User Experience Design', 'Graphic Design']}
      imageMain="assets/images/services/5.jpg"
      imageSecondary="assets/images/services/6.jpg" />
  </div>
</div>

<div class="bg-primary numbersSection">
  <div class="container">
    <div class="row">
      <div class="col-md-4">
        <NumbersText
          title="Analysis & Idea"
          text="Branding and digital are forte, given 
        the state of the world, think."
          number="01" />
      </div>

      <div class="col-md-4">
        <NumbersText
          title="Design & Development"
          text="Dominion it air bearing subdue seed 
          very wherein, moving seas."
          number="02" />
      </div>

      <div class="col-md-4">
        <NumbersText
          title="Testing & Launch"
          text="Land very had you and god make void 
          forth said all and greater."
          number="03" />
      </div>
    </div>
  </div>
</div>

<div class="interestedSection d-flex justify-content-center align-items-center">
  <div class="container">
    <div class="row">
      <div class="col-md-8 offset-md-2 text-center">
        <h2>Interested in discussing a project?</h2>
        <div class="row">
          <p class="col-md-6 offset-md-3">
            Do you have a creative challenge for us? Get in touch with a member
            of the team.
          </p>
        </div>
        <div class="row">
          <div class="col d-flex justify-content-center">
            <Button color="white" text="Get in touch" link="/contact" />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
