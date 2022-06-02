<script>
	import Button from './Button.svelte'
	import Icon from './Icon.svelte'
	import { materialBtn, iconBtn, strangeBtn } from './buttons.js'
</script>

<div>
	<h3>
		Default Button
	</h3>
	<Button>Button</Button>
</div>

<div>
	<h3>
		Material Style Button
	</h3>
<Button {...materialBtn}>Button</Button>	
</div>

<div>
	<h3>
		Icon Button
	</h3>
	<Button {...iconBtn}>
		<Icon />
	</Button>
</div>

<div>
	<h3>
		Strange Button
	</h3>
	<Button {...strangeBtn}>
		Button
	</Button>
</div>

<style>
	:global(body) {
		background: #efefef;
		padding: 1rem;
	}
	div {
		background: #fff;
		border-radius: .5rem;
		margin-bottom: 1rem;
		padding: 1rem
	}
</style>