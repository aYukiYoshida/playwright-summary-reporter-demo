/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require ('fs');
const path = require ('path');
const dotenv = require ('dotenv');
const proc = require('child_process');

/* eslint-enable @typescript-eslint/no-var-requires */

dotenv.config ();
const projectRoot = path.resolve(path.join (__dirname, ".."));

const latestReportFolder = path.join (projectRoot, process.env.PLAYWRIGHT_REPORT_FOLDER, 'latest');
const latestReport = path.join (latestReportFolder, 'summary.json');
if (!process.env.PLAYWRIGHT_REPORT_FOLDER){
  console.error('PLAYWRIGHT_REPORT_FOLDER is not defined in .env file');
  process.exit(1);
}
if (!fs.existsSync (process.env.PLAYWRIGHT_REPORT_FOLDER)){
  console.error(`${process.env.PLAYWRIGHT_REPORT_FOLDER} does not exist`);
  process.exit(1);
}
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
  proc.execSync(`npm test -- ${targets.join(" ")} ${process.argv.slice(2).join(" ")}`, {stdio: 'inherit'});
} else {
  console.info("There is no failed test case in the latest report");
}
