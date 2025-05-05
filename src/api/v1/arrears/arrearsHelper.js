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
			//return `SELECT ea.earningArrearAutoId,e.empCode  AS "EmployeeID", e.name AS "Employee Name",ea.arearType AS "Arrear Type",ea.arrearPayMonth AS "Arrear Month",ea.arearDays AS "Arrear Days", ea.hasPF AS "Has PF Arrear?", ea.computeESIC AS "Compute ESIC Arrear?",ea.status AS "Status",cb.name AS "Created Through",     ea.createdAt AS "Created On",ea.processedOn as "Processed On" FROM tara.earningarrears ea JOIN tara.employee e ON ea.EmployeeId = e.id JOIN tara.employee cb ON ea.createdThrough = cb.id WHERE arrearPayMonth = '${data}' and status=${data2.status};`;
			//return `SELECT ROW_NUMBER() OVER (ORDER BY impInfo.importAutoId DESC) AS serialNo, impInfo.importAutoId, impInfo.importType, impInfo.importStatusDesc, impInfo.importStatus, impInfo.createdAt, e.name, COUNT(impData.importedRow) AS totalImportedRows, SUM(CASE WHEN impData.importStatus = 1 THEN 1 ELSE 0 END) AS successCounts, SUM(CASE WHEN impData.importStatus = 2 THEN 1 ELSE 0 END) AS failureCounts FROM importinfo impInfo JOIN employee e ON impInfo.createdBy = e.id JOIN importdata impData ON impInfo.importAutoId = impData.importAutoId WHERE YEAR(impInfo.createdAt) = ${data.year} AND MONTH(impInfo.createdAt) = ${data.month} AND impInfo.companyId =${data.companyId} AND impInfo.buId =${data.buId} AND impInfo.sbuId =${data.sbuId} AND impInfo.isActive =${data.isActive} GROUP BY impInfo.importAutoId, impInfo.importType, impInfo.importStatusDesc, impInfo.importStatus, impInfo.createdAt, e.name ORDER BY impInfo.importAutoId DESC;`;
			  return `WITH statusCounts AS (SELECT SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS createdCounts, SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) AS failedCounts, SUM(CASE WHEN status = 3 THEN 1 ELSE 0 END) AS completedCount FROM tara.earningarrears WHERE arrearPayMonth = '2025-04') SELECT ea.earningArrearAutoId, e.empCode AS 'EmployeeID', e.name AS 'Employee Name', ea.arearType AS 'Arrear Type', ea.arrearPayMonth AS 'Arrear Month', ea.arearDays AS 'Arrear Days', ea.hasPF AS 'Has PF Arrear?', ea.computeESIC AS 'Compute ESIC Arrear?', ea.status AS 'Status', cb.name AS 'Created Through', DATE_FORMAT(ea.createdAt, '%d-%m-%Y %r') AS 'Created On', ea.processedOn AS 'Processed On', sc.createdCounts, sc.failedCounts, sc.completedCount FROM tara.earningarrears ea JOIN tara.employee e ON ea.EmployeeId = e.id JOIN tara.employee cb ON ea.createdThrough = cb.id CROSS JOIN statusCounts sc WHERE ea.arrearPayMonth = '${data}' AND ea.status = ${data2.status};`	
			break;
	}
}

export default {
	getFinancialYear,
	query,
};
