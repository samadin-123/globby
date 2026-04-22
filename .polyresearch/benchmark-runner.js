import process from 'node:process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import Benchmark from 'benchmark';
import {globby} from '../index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BENCH_DIR = path.join(__dirname, 'bench-temp');

const benchmarks = [
	{
		name: 'negative globs (some files)',
		patterns: ['a/*', '!a/c*'],
	},
	{
		name: 'negative globs (whole dir)',
		patterns: ['a/*', '!a/**'],
	},
	{
		name: 'multiple positive globs',
		patterns: ['a/*', 'b/*'],
	},
];

const setup = () => {
	// Clean and create benchmark directory
	if (fs.existsSync(BENCH_DIR)) {
		fs.rmSync(BENCH_DIR, {recursive: true, force: true});
	}
	fs.mkdirSync(BENCH_DIR, {recursive: true});

	// Create directory structure with files
	const directories = ['a', 'b'];
	for (const directory of directories) {
		const dirPath = path.join(BENCH_DIR, directory);
		fs.mkdirSync(dirPath);
		for (let i = 0; i < 500; i++) {
			const fileName = (i < 100 ? 'c' : 'd') + i;
			fs.writeFileSync(path.join(dirPath, fileName), '');
		}
	}
};

const cleanup = () => {
	if (fs.existsSync(BENCH_DIR)) {
		fs.rmSync(BENCH_DIR, {recursive: true, force: true});
	}
};

// Run benchmarks and collect results
const results = [];

const runBenchmarks = async () => {
	setup();

	for (const {name, patterns} of benchmarks) {
		await new Promise(resolve => {
			const suite = new Benchmark.Suite();

			suite.add(name, {
				defer: true,
				fn: async (deferred) => {
					await globby(patterns, {cwd: BENCH_DIR});
					deferred.resolve();
				}
			});

			suite.on('cycle', event => {
				const hz = event.target.hz;
				results.push(hz);
			});

			suite.on('complete', () => {
				resolve();
			});

			suite.run({async: true});
		});
	}

	cleanup();

	// Calculate mean ops/sec
	const mean = results.reduce((a, b) => a + b, 0) / results.length;
	console.log(`METRIC=${mean.toFixed(2)}`);
};

runBenchmarks().catch(error => {
	cleanup();
	console.error(error);
	process.exit(1);
});
