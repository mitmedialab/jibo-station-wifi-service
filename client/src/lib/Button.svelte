<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  // https://www.reddit.com/r/sveltejs/comments/fkfpd8/svg_ripple_button_component/
  // https://svelte.dev/repl/dbf681d6ba014f1d9cfc919f1bc59481?version=3.19.2
  import RippleButton from '$lib/RippleBtn/Button.svelte';
  import { materialBtn } from '$lib/RippleBtn/buttons.js';

  export let height = 54;
  export let width = 200;
  export let fontsize = '20px';

  const ourBtn = {
    ...materialBtn,
    height: height,
    width: width,
    fontSize: fontsize,
    bgColor: '68, 204, 204',
    rippleColor: '#187D8B',
    rippleBlur: 1,
    round: '.3rem',
    opacityIn: .5,
    shadow: 4,
    shadowHover: 5,
    shadowActive: 2,
    speed: 900
  }

  export let nofeedback = false;

  let feedback_clicked = false;
  let feedback_error = false;
  let feedback_text = ''

  export function feedback(err, message) {
    console.log(err, message);
    feedback_clicked = false;
    if (err) {
      feedback_error = `${err}`;
      console.log('fe', feedback_error);
      feedback_text = '';
    } else {
      feedback_error = false;
      feedback_text = message;
    }
  }
    
  function clickHandler(event) {
    feedback_clicked = true;
//    feedback_error = false;
    feedback_text = '';

    //button.focus();
    
    console.log('dispatch');
    dispatch('click');
  }
</script>


<div class="button-feedback-container">
  <RippleButton {...ourBtn} on:click="{clickHandler}">
    <slot/>
  </RippleButton>
  {#if !nofeedback}
    <div id="feedback">
      <center>
	{#if feedback_clicked}
	  • • •
	{:else if feedback_error}
	  <span class="error">{feedback_error}</span>
	{:else}
	  {feedback_text}
	{/if}
      </center>
    </div>
  {/if}
</div>

<style>
  #feedback {
    color: darkgrey;
    font-size: 20px;
    line-height: 22px;
    margin-top: 20px;
  }

  .error {
    color: #DD2C1D;
  }

  /* old buttons: */
  /* upload button
  button#connect {
    display: inline-block;
    color: white;
    background-color: #2ab27b;
    font-weight: normal;
    text-decoration: none;
    word-break: break-word;
    font-size: 20px;
    line-height: 26px;
    border: 14px solid;
    border-bottom: 14px solid;
    border-right: 32px solid;
    border-left: 32px solid;
    border-color: #2ab27b;
    letter-spacing: 1px;
    min-width: 80px;
    text-align: center;
    border-radius: 4px;
    text-shadow: 0 1px 1px rgba(0,0,0,0.25);
  }
 */
</style>
