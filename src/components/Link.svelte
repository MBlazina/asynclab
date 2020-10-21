<script>
    import { url } from "@sveltech/routify";
    export let text = "link text";
    export let link = '/index';
</script>

<style lang="scss">
    @import '../styles/global.scss';
    a{
        position: relative;
        display: inline-block;
        &::after{
            content: "";
            display: block;
            width: 100%;
            height: 2px;
            position: absolute;
            bottom: -4px;
            background-color: $gray-100;
            opacity:0;
            transition: opacity 0.2s, bottom 0.2s;
        }
        &:hover{
            &::after{
                opacity: 1;
                bottom: 0;
            }
        }
    }
</style>

<a class="LinkComponent" href={$url(link)} >
    {text}
  </a>