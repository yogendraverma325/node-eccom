import db from "../../../config/db.config.js";
import moment from "moment";
import { parse } from "dotenv";
const dbName = process.env.DB_NAME;

// create function by jay fot get financial year
// async function getFinancialYear(date = moment()) {
// 	const startMonth = 3; // 0 based index of month 3 for april
// 	const year = date.year(); // get year
// 	// if the month before april, consider it is previous financial year
// 	const financialYearStart = date.month() < startMonth ? year - 1 : year;
// 	const financialYearEnd = (financialYearStart + 1).toString().slice(-2);

// 	// get financial year id from table
// 	let financialYearDetails = await db.financialYearMaster.findOne({
// 		where: { year: financialYearStart, isActive: 1 },
// 		attributes: ["financialYearId", "financialYearName"],
// 		raw: true,
// 	});
// 	//  return `${financialYearStart}-${financialYearEnd}`;
// 	return financialYearDetails;
// }

async function getFinancialYear(selectedYear) {
	const date = moment();
	const startMonth = 3; // 0 based index of month 3 for april
	const year = date.year(); // get year
	// if the month before april, consider it is previous financial year
	const financialYearStart = date.month() < startMonth ? year - 1 : year;
	const financialYearEnd = (financialYearStart + 1).toString().slice(-2);
	const financialYear = selectedYear ? selectedYear : financialYearStart;
	let financialYearDetails = await db.financialYearMaster.findOne({
		where: { year: financialYear, isActive: 1 },
		attributes: ["financialYearId", "financialYearName"],
		raw: true,
	});
	//  return `${financialYearStart}-${financialYearEnd}`;
	return financialYearDetails;
}
function getFromattedDate(dateInIntger) {
	const formattedDate = new Date((dateInIntger - 25569) * 86400 * 1000); // Convert Excel serial to JS Date
	// Extract day, month, and year
	const day = String(formattedDate.getDate()).padStart(2, "0"); // Pad single-digit days
	const month = String(formattedDate.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
	const year = formattedDate.getFullYear();

	const date = `${day}-${month}-${year}`; // Format as DD-MM-YYYY
	// console.log("*************DATE***********");
	// console.log(date);
	// console.log("*************DATE***********");
	return date;
}

function formatDate(year, month, day) {
	const date = new Date(year, month - 1, day);
	const yyyy = date.getFullYear();
	const mm = String(date.getMonth() + 1).padStart(2, "0");
	const dd = String(date.getDate()).padStart(2, "0");
	return `${yyyy}-${mm}-${dd}`;
}

async function query(caseId, data, data2) {
	switch (caseId) {
		case 1:
			return `SELECT ROW_NUMBER() OVER (ORDER BY impInfo.importAutoId DESC) AS serialNo, impInfo.importAutoId, impInfo.importType, impInfo.importStatusDesc, impInfo.importStatus, impInfo.createdAt, e.name, COUNT(impData.importedRow) AS totalImportedRows, SUM(CASE WHEN impData.importStatus = 1 THEN 1 ELSE 0 END) AS successCounts, SUM(CASE WHEN impData.importStatus = 2 THEN 1 ELSE 0 END) AS failureCounts FROM  ${dbName}.importinfo impInfo JOIN employee e ON impInfo.createdBy = e.id JOIN importdata impData ON impInfo.importAutoId = impData.importAutoId WHERE YEAR(impInfo.createdAt) = ${data.year} AND MONTH(impInfo.createdAt) = ${data.month} GROUP BY impInfo.importAutoId, impInfo.importType, impInfo.importStatusDesc, impInfo.importStatus, impInfo.createdAt, e.name ORDER BY impInfo.importAutoId DESC;`;
			//return `SELECT ROW_NUMBER() OVER (ORDER BY impInfo.importAutoId DESC) AS serialNo, impInfo.importAutoId, impInfo.importType, impInfo.importStatusDesc, impInfo.importStatus, impInfo.createdAt, e.name, COUNT(impData.importedRow) AS totalImportedRows, SUM(CASE WHEN impData.importStatus = 1 THEN 1 ELSE 0 END) AS successCounts, SUM(CASE WHEN impData.importStatus = 2 THEN 1 ELSE 0 END) AS failureCounts FROM importinfo impInfo JOIN employee e ON impInfo.createdBy = e.id JOIN importdata impData ON impInfo.importAutoId = impData.importAutoId WHERE YEAR(impInfo.createdAt) = ${data.year} AND MONTH(impInfo.createdAt) = ${data.month} AND impInfo.companyId =${data.companyId} AND impInfo.buId =${data.buId} AND impInfo.sbuId =${data.sbuId} AND impInfo.isActive =${data.isActive} GROUP BY impInfo.importAutoId, impInfo.importType, impInfo.importStatusDesc, impInfo.importStatus, impInfo.createdAt, e.name ORDER BY impInfo.importAutoId DESC;`;
			break;
		case 2:
			//return `SELECT ROW_NUMBER() OVER (ORDER BY impInfo.importAutoId DESC) AS serialNo, impInfo.importAutoId, impInfo.importType, impInfo.importStatusDesc, impInfo.importStatus, impInfo.createdAt, e.name, COUNT(impData.importedRow) AS totalImportedRows, SUM(CASE WHEN impData.importStatus = 1 THEN 1 ELSE 0 END) AS successCounts, SUM(CASE WHEN impData.importStatus = 2 THEN 1 ELSE 0 END) AS failureCounts FROM importinfo impInfo JOIN employee e ON impInfo.createdBy = e.id JOIN importdata impData ON impInfo.importAutoId = impData.importAutoId WHERE YEAR(impInfo.createdAt) = ${data.year} AND MONTH(impInfo.createdAt) = ${data.month} GROUP BY impInfo.importAutoId, impInfo.importType, impInfo.importStatusDesc, impInfo.importStatus, impInfo.createdAt, e.name ORDER BY impInfo.importAutoId DESC;`;
			return `SELECT ROW_NUMBER() OVER (ORDER BY impInfo.importAutoId DESC) AS serialNo, impInfo.importAutoId, impInfo.importType, impInfo.importStatusDesc, impInfo.importStatus, impInfo.createdAt, e.name, COUNT(impData.importedRow) AS totalImportedRows, SUM(CASE WHEN impData.importStatus = 1 THEN 1 ELSE 0 END) AS successCounts, SUM(CASE WHEN impData.importStatus = 2 THEN 1 ELSE 0 END) AS failureCounts FROM  ${dbName}.importinfo impInfo JOIN employee e ON impInfo.createdBy = e.id JOIN importdata impData ON impInfo.importAutoId = impData.importAutoId WHERE YEAR(impInfo.createdAt) = ${data.year} AND MONTH(impInfo.createdAt) = ${data.month} AND impInfo.companyId =${data.companyId} AND impInfo.buId =${data.buId} AND impInfo.sbuId =${data.sbuId} AND impInfo.isActive =${data.isActive} GROUP BY impInfo.importAutoId, impInfo.importType, impInfo.importStatusDesc, impInfo.importStatus, impInfo.createdAt, e.name ORDER BY impInfo.importAutoId DESC;`;
			break;
			case 3:
				//return `SELECT ROW_NUMBER() OVER (ORDER BY impInfo.importAutoId DESC) AS serialNo, impInfo.importAutoId, impInfo.importType, impInfo.importStatusDesc, impInfo.importStatus, impInfo.createdAt, e.name, COUNT(impData.importedRow) AS totalImportedRows, SUM(CASE WHEN impData.importStatus = 1 THEN 1 ELSE 0 END) AS successCounts, SUM(CASE WHEN impData.importStatus = 2 THEN 1 ELSE 0 END) AS failureCounts FROM importinfo impInfo JOIN employee e ON impInfo.createdBy = e.id JOIN importdata impData ON impInfo.importAutoId = impData.importAutoId WHERE YEAR(impInfo.createdAt) = ${data.year} AND MONTH(impInfo.createdAt) = ${data.month} GROUP BY impInfo.importAutoId, impInfo.importType, impInfo.importStatusDesc, impInfo.importStatus, impInfo.createdAt, e.name ORDER BY impInfo.importAutoId DESC;`;
				return `SELECT SUM(CASE WHEN proceessId = ${data.processId} THEN 1 ELSE 0 END) AS total_processed, SUM(CASE WHEN proceessId = ${data.processId} AND payStatus = 8 THEN 1 ELSE 0 END) AS total_process_and_released FROM ${dbName}.payprocessdetails;`;
				break;
	
				case 4:
					return `DELETE FROM tara_hrms_live.importinfo WHERE importAutoId = ${data.importId};`
					break;
	}
}
export default {
	getFinancialYear,
	getFromattedDate,
	formatDate,
	query,
};
