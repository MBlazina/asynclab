<script>
import Button from "./Button.svelte";

  let formFields = {
    name: "",
    email: "",
    phone: "",
    company: "",
    title: "",
    message: "",
  };
  let formErrors = {
    name: "",
    email: "",
    phone: "",
    company: "",
    title: "",
    message: "",
  };
  let valid = false;

  function handleSubmit() {
    valid = true;
    //CUSTOM VALIDATION
    if (formFields.name.trim().length < 5) {
      valid = false;
      formErrors.name = "Name must not be shorter than 5 characters";
    } else {
      formErrors.name = "";
    }

    if (formFields.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g)) {
      formErrors.email = "";
    } else {
      valid = false;
      formErrors.email = "Please insert a valid emial address";
    }

    if (formFields.title.trim().length < 5) {
      valid = false;
      formErrors.title = "Please insert a valid title";
    } else {
      formErrors.title = "";
    }

    if (formFields.message.trim().length < 5) {
      valid = false;
      formErrors.message = "Please insert a longer messa";
    } else {
      formErrors.message = "";
    }

    //IF form data is valid
    if (valid) {
      alert("Success"+ JSON.stringify(formFields))
    }
  }
</script>

<style lang="scss">
  @import "../styles/global.scss";
  .formWrapper {
    background-color: $gray-100;
    padding-top: 55px;
    padding-bottom:83px;
    form {
      ::placeholder {
        font-size: 16px;
        font-weight: normal;
        font-stretch: normal;
        font-style: normal;
        line-height: normal;
        letter-spacing: normal;
        color: $primary;
      }
      input {
        border: none;
        background: none;
        padding: 15px;
        border-bottom: 1px solid $gray-200;
        width: 100%;
        height:auto;
      }
    }
    .error{
        color: red;
        padding: 5px 15px;
    }
    .btnSubmit{
        margin-top: 50px;
    }
  }
</style>

<div class="formWrapper col-12">
  <div class="container">
    <form action="" on:submit|preventDefault={handleSubmit} novalidate>
      <div class="row">
        <div class="col-md-6">
          <input
            type="text"
            placeholder="Your name*"
            bind:value={formFields.name} />
          <div class="error">{formErrors.name}</div>
        </div>

        <div class="col-md-6">
          <input
            type="email"
            placeholder="Email address*"
            bind:value={formFields.email} />
          <div class="error">{formErrors.email}</div>
        </div>
      </div>

      <div class="row">
        <div class="col-md-6">
          <input
            type="phone"
            placeholder="Phone number"
            bind:value={formFields.phone} />
          <div class="error">{formErrors.phone}</div>
        </div>

        <div class="col-md-6">
          <input
            type="text"
            placeholder="Company"
            bind:value={formFields.company} />
          <div class="error">{formErrors.company}</div>
        </div>
      </div>

      <div class="row">
        <div class="col-12">
          <input
            type="text"
            placeholder="Title*"
            bind:value={formFields.title} />
          <div class="error">{formErrors.title}</div>
        </div>
      </div>

      <div class="row">
        <div class="col-12">
          <input
            type="text"
            placeholder="Message*"
            bind:value={formFields.message} />
          <div class="error">{formErrors.message}</div>
        </div>
      </div>
      <div class="row">
          <div class="btnSubmit col d-flex justify-content-center">
          	<Button text="Submit"/>
          </div>
      </div>
    </form>
  </div>
</div>
