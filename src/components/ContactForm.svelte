<script>
    let formFields = {
        name: '',
        email: '',
        phone: '',
        company: '',
        title: '',
        message:''
    }
    let formErrors = {
        name: '',
        email: '',
        phone: '',
        company: '',
        title: '',
        message:''
    }
    let valid = false;

  function handleSubmit() {
      valid = true;
      
    console.log(formFields);
  }
</script>

<style lang="scss">
</style>

<div class="formWrapper">
  <form action="" on:submit|preventDefault={handleSubmit}>
    <input type="text" placeholder="Your name*" bind:value={formFields.name} required/>
    <input type="email" placeholder="Email address*" bind:value={formFields.email} />
    <input type="phone" placeholder="Phone number" bind:value={formFields.phone}/>
    <input type="text" placeholder="Company" bind:value={formFields.company}>
    <input type="text" placeholder="Title*" bind:value={formFields.title}>
    <input type="text" placeholder="Message*" bind:value={formFields.message}/>
    <button>Submit</button>
  </form>
</div>
