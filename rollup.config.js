import { spawn } from 'child_process';
import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import css from 'rollup-plugin-css-only';
import replace from '@rollup/plugin-replace';
import htmlTemplate from "./rollup-emped-in-html.js";
// import sveltePreprocess from 'svelte-preprocess';


const production = !process.env.ROLLUP_WATCH;

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

export default {
	input: 'src/main.js',
	output: {
		sourcemap: false,
		format:  'iife',//'es',
		name: 'app',
		file: 'public/tm.js',
		// 'dir': 'public/'
	},
	plugins: [

		/*replace({
			// MIN_FUTURE: 100,
			// MAX_FUTURE: 10
			'customRate_': 'CR',
			'present_': 'P',
			'future_': 'F',
			'payment_': 'M',
			'paymentper_': 'Mp',
			'payload_': 'L',
			'payloadper_': 'Lp',
			'periods_': 'S',

			'rate_': 'R',

			'purePayment_': 'pM',
			'purePayload_': 'pL',
			'rateRecommended_': 'Rr',
			'marginCall_': 'MC'
			// 'future:': 'B:', 'main.future':'main.B',
			// delimiters: ['', '']
		}),*/

		svelte({
			// preprocess: sveltePreprocess(),
			onwarn: (warning, handler) => {
                // disable a11y warnings
                if (warning.code.startsWith("a11y-")) return;
                handler(warning);
            },
			compilerOptions: {
				cssHash: ({ hash, css, name, filename })=>{ return `s${hash(css)}` },
				// enable run-time checks when not in production
				dev: !production
			}
		}),

		// we'll extract any component CSS out into
		// a separate file - better for performance
		css({ output: 'tm.css' }),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			dedupe: ['svelte'],
			exportConditions: ['svelte']
		}),
		htmlTemplate({
			template: 'src/template.php',
			target: 'index.php',
			CSSinclude: 'css/styles.css',
			embedContent: true
		}),
		commonjs(),


		// html(),

		// In dev mode, call `npm run start` once
		// the bundle has been generated
		!production && serve(),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload('public'),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser()
	],
	watch: {
		clearScreen: false
	}
};
