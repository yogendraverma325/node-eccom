import db from "../../../config/db.config.js";
import moment from "moment";


// create function by jay fot get financial year
async function getFinancialYear(date = moment()) {
	const startMonth = 3; // 0 based index of month 3 for april
	const year = date.year(); // get year
	// if the month before april, consider it is previous financial year
	const financialYearStart = date.month() < startMonth ? year - 1 : year;
	const financialYearEnd = (financialYearStart + 1).toString().slice(-2);

	// get financial year id from table
	let financialYearDetails = await db.financialYearMaster.findOne({
		where: { year: financialYearStart, isActive: 1 },
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
export default {
    getFinancialYear,
    getFromattedDate,
    formatDate,
};
