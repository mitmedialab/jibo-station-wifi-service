import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
	adapter: adapter({
	    //fallback: '200.html',
	    //prerender: {
	    //    enabled: false,
            //    entries: []
	    //},
	    //ssr: false
        }),
        prerender: {
            default: true
        }
    },
    vite: {
      build: {
        rollupOptions: {
          external: [/[#~]/],
	},
      },
      server: {
	watch: {
	  ignored: [/[#~]/],
	},
      },
    },
};

export default config;
