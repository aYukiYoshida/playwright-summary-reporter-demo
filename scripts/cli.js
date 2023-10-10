#!/usr/bin/env node
/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require ('fs');
const path = require ('path');
const proc = require('child_process');
const dotenv = require ('dotenv');
const moment = require ('moment');
const { Command } = require('commander');
const pkg = require ('../package.json');
/* eslint-enable @typescript-eslint/no-var-requires */

dotenv.config ();
const projectRoot = path.resolve(path.join (__dirname, ".."));
if (!process.env.PLAYWRIGHT_REPORT_FOLDER){
  console.error('PLAYWRIGHT_REPORT_FOLDER is not defined');
  process.exit(1);
}
const rootReportFolder = path.join(projectRoot, process.env.PLAYWRIGHT_REPORT_FOLDER);
if (!fs.existsSync (rootReportFolder)){
  console.error(`${rootReportFolder} does not exist`);
  process.exit(1);
}
const latestReportFolder = path.join (rootReportFolder, 'latest');

const link = () => {
  const reportFolders = fs.readdirSync (rootReportFolder);
  if (reportFolders.length === 0){
    console.error(`No report folder found in ${rootReportFolder}`);
    process.exit(1);
  }
  const reportReportFolderNameRegex = /^report-(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})$/;
  const dates = reportFolders.filter (folder => {
    return folder.match (reportReportFolderNameRegex);
  }).map (folder => {
    return moment (folder.match (reportReportFolderNameRegex)[1], 'YYYY-MM-DD[T]HH-mm-ss');
  });
  if (dates.length === 0){
    console.error(`No report folder found in ${rootReportFolder}`);
    process.exit(1);
  }

  const latest = dates.reduce ((latest, current) => {
    return current.isAfter (latest) ? current : latest;
  }, moment ('2000-01-01'));

  if (fs.existsSync(latestReportFolder))
    fs.unlinkSync (latestReportFolder);

  fs.symlinkSync (
    path.join (".", `report-${latest.format ('YYYY-MM-DD[T]HH-mm-ss')}`),
    latestReportFolder
  );
  console.info(`The folder of report-${latest.format ('YYYY-MM-DD[T]HH-mm-ss')} is linked to latest.`);
};

const runLatestFailedTests = (options) => {
  if (!process.env.PLAYWRIGHT_SUMMARY_REPORT_FILE_NAME){
    console.error('PLAYWRIGHT_SUMMARY_REPORT_FILE_NAME is not defined');
    process.exit(1);
  }
  const summaryReportName = process.env.PLAYWRIGHT_SUMMARY_REPORT_FILE_NAME;
  const latestReport = path.join (latestReportFolder, summaryReportName);
  if (!fs.existsSync(latestReportFolder)){
    console.error(`${latestReportFolder} does not exist`);
    process.exit(1);
  }
  if (!fs.existsSync(latestReport)){
    console.error(`${latestReport} does not exist`);
    process.exit(1);
  }

  const summary = JSON.parse(fs.readFileSync(latestReport).toString());
  if (summary.status !== "passed"){
    const targets = [].concat(summary.failed, summary.interrupted, summary.timedOut);
    proc.execSync(`npm test --  ${options.join(" ")} ${targets.join(" ")}`, {stdio: 'inherit'});
  } else {
    console.info("There is no failed test case in the latest report");
  }
};

// 親コマンド
const program = new Command();
program
  .version(pkg.version)
  .enablePositionalOptions();
program
  .command('test:latest-failed [options...]')
  .description("Run the latest failed test cases")
  .passThroughOptions()
  .action((options) => {
    runLatestFailedTests(options);
  });
program
  .command('report:link')
  .description("Link the report of latest-run tests to the latest")
  .action(() => {
    link();
  });

program.parse(process.argv);
