/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require ('fs');
const path = require ('path');
const dotenv = require ('dotenv');
const moment = require ('moment');
/* eslint-enable @typescript-eslint/no-var-requires */

dotenv.config ();
const projectRoot = path.resolve(path.join (__dirname, ".."));

if (!process.env.PLAYWRIGHT_REPORT_FOLDER){
  console.error('PLAYWRIGHT_REPORT_FOLDER is not defined in .env file');
  process.exit(1);
}
const rootReportFolder = path.join(projectRoot, process.env.PLAYWRIGHT_REPORT_FOLDER);
if (!fs.existsSync (rootReportFolder)){
  console.error(`${rootReportFolder} does not exist`);
  process.exit(1);
}
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

const latestReportFolder = path.join (rootReportFolder, 'latest');

if (fs.existsSync(latestReportFolder))
  fs.unlinkSync (latestReportFolder);

fs.symlinkSync (
  path.join (".", `report-${latest.format ('YYYY-MM-DD[T]HH-mm-ss')}`),
  latestReportFolder
);
