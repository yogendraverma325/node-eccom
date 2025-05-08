import db from "../../../config/db.config.js";
import moment from "moment";
import { parse } from "dotenv";
import { raw } from "mysql2";
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
			return `SELECT ea.earningArrearAutoId, e.empCode AS 'EmployeeID', e.name AS 'Employee Name', ea.arearType AS 'Arrear Type', ea.arrearPayMonth AS 'Arrear Month', ea.arearDays AS 'Arrear Days', ea.hasPF AS 'Has PF Arrear?', ea.computeESIC AS 'Compute ESIC Arrear?', ea.status AS 'Status', cb.name AS 'Created Through', DATE_FORMAT(ea.createdAt, '%d-%m-%Y %r') AS 'Created On', DATE_FORMAT(ea.processedOn, '%d-%m-%Y %r') AS 'Processed On',ea.processingRemark "Process Remark" FROM tara.earningarrears ea JOIN tara.employee e ON ea.EmployeeId = e.id JOIN tara.employee cb ON ea.createdThrough = cb.id  WHERE ea.arrearPayMonth = '${data}' AND ea.status = ${data2.status} AND ea.arearType = '${data2.arrearType}' AND ea.companyId=${data2.companyId};`;
			break;

		case 2:
			return `SELECT COALESCE(SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END), 0) AS createdCounts, COALESCE(SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END), 0) AS failedCounts, COALESCE(SUM(CASE WHEN status = 3 THEN 1 ELSE 0 END), 0) AS completedCount FROM tara.earningarrears WHERE arrearPayMonth = '${data}' and companyId=${data2.companyId}`;
		case 3:
			//return `SELECT sc.salaryComponentAutoId, scm.elementValue, sce.salaryComponentElementAutoId, sce.salaryComponentElementName FROM salarycomponent sc JOIN salarycomponentmapping scm ON sc.salaryComponentAutoId = scm.salaryComponentAutoId JOIN salarycomponentelement sce ON scm.salaryComponentElementAutoId = sce.salaryComponentElementAutoId WHERE sc.salaryComponentAutoId = ${data}`;
			return `SELECT sscm.salaryComponentAutoId, sscm.salaryStructureAutoId, scm.salaryComponentElementAutoId, scm.elementValue, sce.salaryComponentElementName, sce.salaryComponentElementCode FROM ${dbName}.salarystructurecomponentmapping sscm JOIN ${dbName}.salarycomponentmapping scm ON sscm.salaryStructurecomponentmappingAutoId = scm.salaryStructurecomponentmappingAutoId JOIN ${dbName}.salarycomponentelement sce ON scm.salaryComponentElementAutoId = sce.salaryComponentElementAutoId WHERE sscm.salaryComponentAutoId = ${data} AND sscm.salaryStructureAutoId = ${data2};`;

			break;
	}
}

async function affectArrears(componentAmount, lopDays, totalWorkingdays) {
	let amountAfterLop = 0;
	amountAfterLop = (componentAmount / totalWorkingdays) * lopDays;
	return amountAfterLop;
}
function customRound(num) {
	const decimalPart = num - Math.floor(num);
	if (decimalPart <= 0.5) {
		return Math.floor(num); // Round down
	} else {
		return Math.ceil(num); // Round up
	}
}

function getElementValue(name, data) {
	const item = data.find((item) => item.salaryComponentElementName === name);
	// console.log(name);
	// console.log(item?item.elementValue:0);
	return item ? item.elementValue : 0; // Return elementValue or null if not found
}

async function getCalculatedPF(monthlyElementPay) {
	let calculatedPF = 0,
		applicablePFAmountRestrictionYes = 0,
		applicablePFAmountRestrictionNo = 0,
		actualApplicableAmount = 0;
	if (monthlyElementPay[0].isPfApplicable == 0) return calculatedPF;

	applicablePFAmountRestrictionYes = await monthlyElementPay
		.filter((element) => element.isPfApplicableComponent == 1)
		.reduce(async (sumPromise, element) => {
			const sum = await sumPromise; // Resolve the previous sum
			return sum + parseFloat(element["monthlyAmountAfterArrears"]);
		}, Promise.resolve(0));

	applicablePFAmountRestrictionNo =
		monthlyElementPay.find(
			(item) => item["pfApplicable15000AndNoRestriction"] === 1,
		)?.["monthlyAmountAfterArrears"] || null; // Start with a resolved promise of 0

	if (monthlyElementPay[0].isPfRestriction == 1) {
		calculatedPF =
			applicablePFAmountRestrictionYes < 15000
				? getPercentagePart(applicablePFAmountRestrictionYes, 12)
				: 1800;
		actualApplicableAmount = applicablePFAmountRestrictionYes;
	} else if (
		monthlyElementPay[0].isPfRestriction == 0 &&
		applicablePFAmountRestrictionNo >= 15000
	) {
		calculatedPF = getPercentagePart(applicablePFAmountRestrictionNo, 12);
		actualApplicableAmount = applicablePFAmountRestrictionNo;
	} else if (
		monthlyElementPay[0].isPfRestriction == 0 &&
		applicablePFAmountRestrictionNo < 15000
	) {
		calculatedPF = getPercentagePart(applicablePFAmountRestrictionYes, 12);
		actualApplicableAmount = applicablePFAmountRestrictionYes;
	}
	return calculatedPF; // Return elementValue or null if not found
}
async function calculateArrersAmount(lastPayMonthDetails, arrearDays) {
	let arrearReturnObject = {},
		payElementsAfterArrears = [],
		arrearReturnArray = [];

	for (const payElementObject of lastPayMonthDetails) {
		let payPackage = await db.payPackage.findOne({
			where: { payPackageAutoId: payElementObject.payPackageAutoId },
			raw: true,
			attributes: ["salaryStructureAutoId"],
		});

		const queryForComponentConfiguration = await query(
			3,
			payElementObject.salaryComponentAutoId,
			payPackage.salaryStructureAutoId,
		);
		const componentConfiguration = await db.sequelize.query(
			queryForComponentConfiguration,
		);

		let arrearAmunt =
			(await getElementValue("Affects Arrears", componentConfiguration[0])) == 1
				? customRound(
						await affectArrears(
							payElementObject["elementMonthlyAmount"],
							arrearDays,
							payElementObject["totalWorkingDays"],
						),
					)
				: 0.0;

		if (arrearAmunt > 0) {
			let componentName = payElementObject["salaryComponentAlias"]
				? payElementObject["salaryComponentAlias"]
				: payElementObject["salaryComponentCode"];
			arrearReturnObject[componentName + " Arrears"] = arrearAmunt;
			arrearReturnArray.push({
				arrearName: componentName + " Arrears",
				arrearAmunt: arrearAmunt,
				type: "Earning",
			});
			payElementObject["arrearsAmount"] = arrearAmunt;
			payElementObject["monthlyAmountAfterArrears"] =
				parseFloat(payElementObject["elementMonthlyAmount"]) + arrearAmunt;
		}
		payElementsAfterArrears.push(payElementObject);
	}

	let pfAmountAfterArrearsAdjustment = await getCalculatedPF(
		payElementsAfterArrears,
	);
	let pfArrearAmoun =
		pfAmountAfterArrearsAdjustment -
		payElementsAfterArrears[0]["pfEmployeeAmount"];

	if (pfArrearAmoun > 0) {
		arrearReturnObject["PF Arrears"] = pfArrearAmoun;
		arrearReturnArray.push({
			arrearName: "PF Arrears",
			arrearAmunt: pfArrearAmoun,
			type: "Deduction",
		});
	}

	// console.log("PF After Arrer Adjustment ::: ", pfAmountAfterArrearsAdjustment);
	// console.log(
	// 	"PF Before Arrear Adjustment :: ",
	// 	payElementsAfterArrears[0]["pfEmployeeAmount"],
	// );
	// console.log(arrearReturnObject);

	return arrearReturnArray;
}

export default {
	getFinancialYear,
	query,
	calculateArrersAmount,
};
