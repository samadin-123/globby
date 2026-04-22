# Evaluation Setup

This file is outside the editable surface. It defines how results are judged. Agents cannot modify the evaluator or the scoring logic — the evaluation is the trust boundary.

Consider defining more than one evaluation criterion. Optimizing for a single number makes it easy to overfit and silently break other things. A secondary metric or sanity check helps keep the process honest.

eval_cores: 1
eval_memory_gb: 1.0
prereq_command: npm install --silent

## Setup

Install Node.js dependencies:

```bash
npm install --silent
```

The project is pure JavaScript (no build step required). The benchmark uses the `benchmark` npm package to measure operations per second for various glob patterns against a synthetic file tree.

## Run command

```bash
node .polyresearch/benchmark-runner.js
```

The benchmark runner creates a temporary directory structure with 1000 files (500 files in each of two directories), then runs the async globby function against three different pattern sets: negative globs for some files, negative globs for whole directories, and multiple positive globs. It measures operations per second and outputs the mean across all scenarios.

## Output format

The benchmark prints `METRIC=<number>` to stdout, where the number is operations per second (higher is better).

## Metric parsing

The CLI looks for `METRIC=<number>` in the output.

## Ground truth

Baseline performance is measured using the current working directory version of globby. The metric represents the mean operations per second across three glob pattern scenarios:
1. Negative globs matching some files inside a directory (`['a/*', '!a/c*']`)
2. Negative globs matching whole directories (`['a/*', '!a/**']`)
3. Multiple positive globs (`['a/*', 'b/*']`)

Each scenario is executed against a synthetic file tree with 1000 files distributed across two directories. The benchmark uses the `benchmark` npm package's statistical analysis to provide reliable measurements with multiple iterations.
