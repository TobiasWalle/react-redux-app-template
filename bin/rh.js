#!/usr/bin/env node
const spawn = require('child_process').spawn;
const isWindows = /^win/.test(process.platform);
const yoCommand = isWindows ? 'yo.cmd' : 'yo';
const args = process.argv;
const firstArgument = args[2] || '';
const isFirstArgumentAnOption = firstArgument[0] === '-';
const subGenerator = firstArgument && !isFirstArgumentAnOption ? firstArgument : 'app';
const generatorName = `rush:${subGenerator}`;
const parameterStart = isFirstArgumentAnOption ? 2 : 3;

spawn(yoCommand, [generatorName].concat(args.slice(parameterStart)), {stdio: 'inherit'})
  .on('error', err => {
    throw err;
  });
