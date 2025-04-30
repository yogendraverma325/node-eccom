import { Op, where } from "sequelize";
import db from "../../../config/db.config.js";
import respHelper from "../../../helper/respHelper.js";
import xlsx from "json-as-xlsx";
import fs from "fs";
import client from "../../../config/redisDb.config.js";
import pkg from "xlsx";
import bcrypt from "bcryptjs";
import moment from "moment";
import helper from "../../../helper/helper.js";
import paymentHelper from "../payments/paymentHelper.js";

const maritalStatusOptions = {
	Married: 1,
	Single: 2,
	Divorced: 3,
	Separated: 4,
	Widowed: 5,
	Others: 6,
};
const dbName = process.env.DB_NAME;
async function getDataFromCache(key) {
	return client.lRange(key, 0, -1);
}

class MasterController {
	/***********************************export data********************************************************/

	async employee(req, res) {
		try {
			const {
				search,
				department,
				designation,
				buSearch,
				sbuSearch,
				areaSearch,
			} = req.query;

			const employeeData = await db.employeeMaster.findAndCountAll({
				attributes: [
					"id",
					"empCode",
					"name",
					"email",
					"firstName",
					"lastName",
					"officeMobileNumber",
					"buId",
					"personalMobileNumber",
				],
				where: Object.assign(
					search
						? {
								[Op.or]: [
									{ empCode: { [Op.like]: `%${search}%` } },
									{ name: { [Op.like]: `%${search}%` } },
									{ email: { [Op.like]: `%${search}%` } },
								],
							}
						: {},
				),
				include: [
					{
						model: db.designationMaster,
						attributes: ["name"],
						where: {
							...(designation && { name: { [Op.like]: `%${designation}%` } }),
						},
						required: !!designation,
					},
					{
						model: db.functionalAreaMaster,
						attributes: ["functionalAreaName"],
						where: {
							...(areaSearch && {
								functionalAreaName: { [Op.like]: `%${areaSearch}%` },
							}),
						},
						required: !!areaSearch,
					},
					{
						model: db.departmentMaster,
						attributes: ["departmentName"],
						where: {
							...(department && {
								departmentName: { [Op.like]: `%${department}%` },
							}),
						},
						required: !!department,
					},
					{
						model: db.educationDetails,
						attributes: [
							"educationDegree",
							"educationSpecialisation",
							"educationInstitute",
							"educationRemark",
							"educationStartDate",
							"educationCompletionDate",
						],
					},
					{
						model: db.familyDetails,
						attributes: [
							"name",
							"dob",
							"gender",
							"mobileNo",
							"relationWithEmp",
						],
						as: "employeefamilydetails",
					},
					{
						model: db.employeeMaster,
						required: false,
						attributes: ["id", "name"],
						as: "managerData",
					},
					{
						model: db.buMaster,
						attributes: ["buName"],
						where: {
							...(buSearch && { buName: { [Op.like]: `%${buSearch}%` } }),
						},
						required: !!buSearch,
					},
					{
						model: db.sbuMaster,
						attributes: ["sbuname"],
						where: {
							...(sbuSearch && { sbuname: { [Op.like]: `%${sbuSearch}%` } }),
						},
						required: !!sbuSearch,
					},
				],
			});

			const arr = await Promise.all(
				employeeData.rows.map(async (ele) => {
					return {
						id: ele.dataValues.id || "",
						empCode: ele.dataValues.empCode || "",
						name: ele.dataValues.name || "",
						email: ele.dataValues.email || "",
						firstName: ele.dataValues.firstName || "",
						lastName: ele.dataValues.lastName || "",
						officeMobileNumber: ele.dataValues.officeMobileNumber || "",
						personalMobileNumber: ele.dataValues.personalMobileNumber || "",
						manager_id: ele.dataValues.managerData
							? ele.dataValues.managerData.id
							: "",
						manager_name: ele.dataValues.managerData
							? ele.dataValues.managerData.name
							: "",
						buId: ele.dataValues.buId || "",
						designation_name: ele.dataValues.designationmaster?.name || "",
						functional_area_name:
							ele.dataValues.functionalareamaster?.functionalAreaName || "",
						department_name:
							ele.dataValues.departmentmaster?.departmentName || "",
						bu_name: ele.dataValues.bumaster?.buName || "",
						sub_bu_name: ele.dataValues.sbumaster?.sbuname || "",
					};
				}),
			);

			let educationDetails = [];
			let familyDetails = [];

			employeeData.rows.forEach((employee) => {
				employee.employeeeducationdetails.forEach((education) => {
					// Extract only the required fields
					const extractedEducation = {
						userId: education.userId ? education.userId : "",
						name: employee.firstName + " " + employee.lastName,
						empCode: employee.empCode ? employee.empCode : "",
						educationId: education.educationId ? education.educationId : "",
						educationDegree: education.educationDegree
							? education.educationDegree
							: "",
						educationSpecialisation: education.educationSpecialisation
							? education.educationSpecialisation
							: "",
						educationStartDate: education.educationStartDate
							? education.educationStartDate
							: "",
						educationCompletionDate: education.educationCompletionDate
							? education.educationCompletionDate
							: "",
						educationInstitute: education.educationInstitute
							? education.educationInstitute
							: "",
						educationRemark: education.educationRemark
							? education.educationRemark
							: "",
					};
					// Push the extracted education details object into the educationDetails array
					educationDetails.push(extractedEducation);
				});
			});

			employeeData.rows.forEach((employee) => {
				employee.employeefamilydetails.forEach((family) => {
					const extractedFamily = {
						empCode: employee.empCode ? employee.empCode : "",
						name: employee.firstName + " " + employee.lastName,
						familyName: family.name ? family.name : "",
						dob: family.dob ? family.dob : "",
						gender: family.gender ? family.gender : "",
						mobileNo: family.mobileNo ? family.mobileNo : "",
						relationWithEmp: family.relationWithEmp
							? family.relationWithEmp
							: "",
					};
					familyDetails.push(extractedFamily);
				});
			});

			if (arr.length > 0) {
				const dt = new Date();
				const sheetName = "uploads/temp/dataSheet"; //+ dt.getTime();
				fs.writeFileSync(sheetName + ".xlsx", "", { flag: "a+" }, (err) => {
					if (err) {
						console.error("Error writing file:", err);
						return;
					}
					console.log("File created successfully!");
				});

				const data = [
					{
						sheet: "Employee",
						columns: [
							{ label: "Employee_Code", value: "empCode" },
							{ label: "Email", value: "email" },
							{ label: "First_Name", value: "firstName" },
							{ label: "Last_Name", value: "lastName" },
							{ label: "Office_Mobile_Number", value: "officeMobileNumber" },
							{
								label: "Personal_Mobile_Number",
								value: "personalMobileNumber",
							},
							{ label: "Manager_Id", value: "manager_id" },
							{ label: "Manager_Name", value: "manager_name" },
							{ label: "Designation_Name", value: "designation_name" },
							{ label: "Department_Name", value: "department_name" },
							{ label: "Functional_Area_Name", value: "functional_area_name" },
							{ label: "Bu_Name", value: "bu_name" },
							{ label: "Sub_Bu_Name", value: "sub_bu_name" },
						],
						content: arr,
					},
					{
						sheet: "Education",
						columns: [
							{ label: "Employee_Code", value: "empCode" },
							{ label: "Name", value: "name" },
							{
								label: "Education_Specialisation",
								value: "educationSpecialisation",
							},
							{ label: "Education_Institute", value: "educationInstitute" },
						],
						content: educationDetails,
					},
					{
						sheet: "Family Details",
						columns: [
							{ label: "Employee_Code", value: "empCode" },
							{ label: "Name", value: "name" },
							{ label: "Family_Member_Name", value: "familyName" },
							{ label: "Date_Of_Birth", value: "dob" },
							{ label: "Gender", value: "gender" },
							{ label: "Mobile_Number", value: "mobileNo" },
							{ label: "Relation_With_Employee", value: "relationWithEmp" },
						],
						content: familyDetails,
					},
				];

				const settings = {
					fileName: sheetName,
					extraLength: 3,
					writeMode: "writeFile",
					writeOptions: {},
					RTL: false,
				};

				xlsx(data, settings, () => {
					return res.download(sheetName + ".xlsx");
				});
			}
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}
	async pendingLeave(req, res) {
		try {
			const {
				startDate,
				endDate,
				search,
				employeeType,
				businessUnit,
				grade,
				department,
				companyLocation,
				attendanceFor,
				companyId,
				managerId,
				reporteIds,
			} = req.query;

			const usersData = req.userData;
			const filters = await helper.getFiltersByPermission(
				usersData.role_id,
				usersData.permissionAndAccess,
			);

			const getPendingLeave = await db.EmployeeLeaveHeader.findAll({
				attributes: ["leaveCount", "reason", "appliedOn", "fromDate", "toDate"],
				where: { status: "pending" },
				include: [
					{
						model: db.employeeLeaveTransactions,
						attributes: ["appliedFor"],
						where: {
							appliedFor: {
								[db.Sequelize.Op.between]: [startDate, endDate],
							},
						},
					},
					{
						model: db.employeeMaster,
						attributes: ["id", "empCode", "name"],
						where: {
							companyId: companyId,
							...(managerId && { manager: managerId }),
							...(reporteIds && {
								id: { [Op.in]: reporteIds.split(",") },
							}),
							...(attendanceFor == 0 && { isActive: 0 }),
							...(attendanceFor == 1 && { isActive: 1 }),
							...(attendanceFor == 2 && { isActive: [0, 1] }),
							...(search && { id: { [Op.in]: search.split(",") } }),
							...(employeeType && {
								employeeType: { [Op.in]: employeeType.split(",") },
							}),
							...(businessUnit && {
								buId: { [Op.in]: businessUnit.split(",") },
							}),
							...(department && {
								departmentId: { [Op.in]: department.split(",") },
							}),
							...(companyLocation && {
								companyLocationId: { [Op.in]: companyLocation.split(",") },
							}),
						},
						include: [
							{
								model: db.buMaster,
								attributes: ["buName", "buCode"],
								where: {
									...filters.buFIlter,
								},
							},
							{
								model: db.companyMaster,
								attributes: ["companyName"],
							},
							{
								model: db.designationMaster,
								attributes: ["name", "code"],
								where: {
									...filters.designationFIlter,
								},
							},
							{
								model: db.departmentMaster,
								attributes: ["departmentName", "departmentCode"],
								where: {
									...filters.departmentFIlter,
								},
							},
							{
								model: db.sbuMaster,
								attributes: ["sbuname", "code"],
								where: {
									...filters.sbbuFIlter,
								},
							},
						],
					},
					{
						model: db.leaveMaster,
						attributes: ["leaveName", "leaveCode"],
						as: "leaveMasterDetails",
					},
					{
						model: db.leaveApprovalTrails,
						where: { isVisible: 1, isPending: 1, isApproved: 0 },
						include: [
							{
								model: db.employeeMaster,
								attributes: ["id", "empCode", "name"],
							},
						],
						required: true,
						limit: 1,
					},
				],
			});
			let dataForExcel = getPendingLeave.map((leave) => ({
				"Employee Code": leave.employee?.empCode || "",
				"Employee Name": leave.employee?.name || "",
				BUName: leave.employee?.bumaster
					? `${leave.employee.bumaster.buName} (${leave.employee.bumaster.buCode})`
					: "",
				Designation: leave.employee?.designationmaster
					? `${leave.employee.designationmaster.name} (${leave.employee.designationmaster.code})`
					: "",
				Department: leave.employee?.departmentmaster
					? `${leave.employee.departmentmaster.departmentName} (${leave.employee.departmentmaster.departmentCode})`
					: "",
				fromDate: leave.fromDate
					? moment(leave.fromDate).format("DD-MM-YYYY")
					: "",
				toDate: leave.toDate ? moment(leave.toDate).format("DD-MM-YYYY") : "",
				leaveCount: leave.leaveCount || 0,
				Reason: leave.reason || "",
				AppliedOn: leave.appliedOn
					? moment(leave.appliedOn).format("DD-MM-YYYY")
					: "",
				pendingWith: leave.leaveapprovaltrails[0]?.employee
					? `${leave.leaveapprovaltrails[0].employee.name} (${leave.leaveapprovaltrails[0].employee.empCode})`
					: "",
				leaveName: leave.leaveMasterDetails[0]?.leaveName || "",
				leaveCode: leave.leaveMasterDetails[0]?.leaveCode || "",
				appliedFor: leave.employeeleavetransactions[0].appliedFor,
			}));

			const data = [
				{
					sheet: "Pending Leave Report",
					columns: [
						{ label: "Employee ID", value: "Employee Code" },
						{ label: "Name", value: "Employee Name" },
						{ label: "Job Title", value: "Designation" },
						{ label: "Department", value: "Department" },
						{ label: "Business Unit", value: "BUName" },
						{ label: "From", value: "fromDate" },
						{ label: "To", value: "toDate" },
						{ label: "Working Days", value: "leaveCount" },
						{ label: "Leave Name", value: "leaveName" },
						{ label: "Leave Code", value: "leaveCode" },
						{ label: "Applied On", value: "AppliedOn" },
						{ label: "pending With", value: "pendingWith" },
						{ label: "Reason", value: "Reason" },
						{ label: "appliedFor", value: "appliedFor" },
					],
					content: dataForExcel,
				},
			];

			let settings = {
				writeOptions: {
					type: "buffer",
					bookType: "xlsx",
				},
			};

			const buffer = xlsx(data, settings);
			res.writeHead(200, {
				"Content-Type": "application/octet-stream",
				"Content-disposition": `attachment; filename=Pending Leave Report.xlsx`,
			});
			res.end(buffer);
		} catch (error) {
			console.error(error);
			return res.status(500).json({
				status: false,
				message: "Internal Server Error",
			});
		}
	}
	async leaveTaken(req, res) {
		try {
			const {
				startDate,
				endDate,
				search,
				employeeType,
				businessUnit,
				grade,
				department,
				companyLocation,
				attendanceFor,
				companyId,
				managerId,
				reporteIds,
			} = req.query;

			const usersData = req.userData;
			const filters = await helper.getFiltersByPermission(
				usersData.role_id,
				usersData.permissionAndAccess,
			);
			console.log("filters", filters);
			const companyMappedLeaves = await db.leaveCompanyMapping.findAll({
				attributes: ["leaveAutoId"],
				where: { companyId: companyId },
				include: [
					{
						model: db.leaveMaster,
						attributes: ["leaveName", "leaveCode"],
						as: "companyleaveMasterDetails",
					},
				],
				raw: true,
			});

			const mappedLeavesLookup = companyMappedLeaves.reduce(
				(
					acc,
					{
						leaveAutoId,
						"companyleaveMasterDetails.leaveName": leaveName,
						"companyleaveMasterDetails.leaveCode": leaveCode,
					},
				) => {
					acc[leaveAutoId] = { leaveAutoId, leaveName, leaveCode };
					return acc;
				},
				{},
			);

			const getTakenLeave = await db.employeeLeaveTransactions.findAll({
				attributes: [
					"employeeId",
					"leaveAutoId",
					[
						db.Sequelize.fn(
							"SUM",
							db.Sequelize.cast(db.Sequelize.col("leaveCount"), "FLOAT"),
						),
						"totalLeaveCount",
					],
				],
				where: {
					status: "approved",
					appliedFor: {
						[db.Sequelize.Op.between]: [startDate, endDate],
					},
				},
				include: [
					{ model: db.leaveMaster, attributes: ["leaveName", "leaveCode"] },
					{
						model: db.employeeMaster,
						attributes: ["name", "empCode"],
						where: {
							companyId: companyId,
							...(managerId && { manager: managerId }),
							...(reporteIds && {
								id: { [Op.in]: reporteIds.split(",") },
							}),
							...(attendanceFor == 0 && { isActive: 0 }),
							...(attendanceFor == 1 && { isActive: 1 }),
							...(attendanceFor == 2 && { isActive: [0, 1] }),
							...(search && { id: { [Op.in]: search.split(",") } }),
							...(employeeType && {
								employeeType: { [Op.in]: employeeType.split(",") },
							}),
							...(businessUnit && {
								buId: { [Op.in]: businessUnit.split(",") },
							}),
							...(department && {
								departmentId: { [Op.in]: department.split(",") },
							}),
							...(companyLocation && {
								companyLocationId: { [Op.in]: companyLocation.split(",") },
							}),
						},
						include: [
							{
								model: db.buMaster,
								attributes: ["buName", "buCode"],
								where: {
									...filters.buFIlter,
								},
							},
							{
								model: db.departmentMaster,
								attributes: ["departmentName", "departmentCode"],
								where: {
									...filters.departmentFIlter,
								},
							},
							{
								model: db.designationMaster,
								attributes: ["name", "code"],
								where: {
									...filters.designationFIlter,
								},
							},
							{
								model: db.sbuMaster,
								attributes: ["sbuname", "code"],
								where: {
									...filters.sbbuFIlter,
								},
							},
						],
					},
				],
				group: ["employeeId", "leaveAutoId"],
				raw: true,
			});

			const employeeLeaveMap = {};

			for (const leave of getTakenLeave) {
				const {
					employeeId,
					"employee.name": name,
					"employee.empCode": empCode,
					"employee.bumaster.buName": buName,
					"employee.departmentmaster.departmentName": departmentName,
					"employee.designationmaster.name": designationName,
					leaveAutoId,
					totalLeaveCount,
				} = leave;

				const assignedToEmployee = await db.leaveMapping.findAll({
					attributes: ["leaveAutoId"],
					where: { employeeId },
					raw: true,
				});

				const assignedLeavesSet = new Set(
					assignedToEmployee.map((l) => l.leaveAutoId),
				);

				if (!employeeLeaveMap[employeeId]) {
					employeeLeaveMap[employeeId] = {
						employeeId,
						empCode,
						name,
						bu: buName || "N.A",
						department: departmentName || "N.A",
						designation: designationName || "N.A",
						leave: {},
					};
				}

				if (mappedLeavesLookup[leaveAutoId]) {
					const { leaveCode } = mappedLeavesLookup[leaveAutoId];
					employeeLeaveMap[employeeId].leave[leaveCode] = totalLeaveCount; // Assign actual count
				}

				assignedToEmployee.forEach(({ leaveAutoId }) => {
					const { leaveCode } = mappedLeavesLookup[leaveAutoId] || {};
					if (leaveCode && !(leaveCode in employeeLeaveMap[employeeId].leave)) {
						employeeLeaveMap[employeeId].leave[leaveCode] = 0.0;
					}
				});

				Object.values(mappedLeavesLookup).forEach(
					({ leaveAutoId, leaveCode }) => {
						if (!(leaveCode in employeeLeaveMap[employeeId].leave)) {
							employeeLeaveMap[employeeId].leave[leaveCode] =
								assignedLeavesSet.has(leaveAutoId) ? 0.0 : "N.A";
						}
					},
				);
			}

			const transformedResponse = Object.values(employeeLeaveMap).map(
				(emp) => ({
					employeeId: emp.employeeId,
					empCode: emp.empCode,
					name: emp.name,
					bu: emp.bu,
					department: emp.department,
					designation: emp.designation,
					...emp.leave,
				}),
			);

			const leaveColumns = Object.values(mappedLeavesLookup).map(
				({ leaveName, leaveCode }) => ({
					label: `${leaveName} (${leaveCode})`,
					value: leaveCode,
				}),
			);

			const data = [
				{
					sheet: "Taken Balance Report",
					columns: [
						{ label: "Employee ID", value: "empCode" },
						{ label: "Name", value: "name" },
						{ label: "Job Title", value: "designation" },
						{ label: "Department", value: "department" },
						{ label: "Business Unit", value: "bu" },
						...leaveColumns,
					],
					content: transformedResponse,
				},
			];

			let settings = { writeOptions: { type: "buffer", bookType: "xlsx" } };
			const buffer = xlsx(data, settings);

			res.writeHead(200, {
				"Content-Type": "application/octet-stream",
				"Content-disposition": `attachment; filename=Leave_Utilize_Report.xlsx`,
			});
			res.end(buffer);
		} catch (error) {
			console.error("Error:", error);
			return res.status(500).json({
				status: false,
				message: "Internal Server Error",
				error: error.message,
			});
		}
	}
	async LeaveBalance(req, res) {
		try {
			const {
				startDate,
				endDate,
				search,
				employeeType,
				businessUnit,
				grade,
				department,
				companyLocation,
				attendanceFor,
				companyId,
				managerId,
				reporteIds,
			} = req.query;

			const usersData = req.userData;
			const filters = await helper.getFiltersByPermission(
				usersData.role_id,
				usersData.permissionAndAccess,
			);
			console.log("filersss>>", filters);
			const companyMappedLeaves = await db.leaveCompanyMapping.findAll({
				attributes: ["leaveAutoId"],
				where: { companyId: companyId },
				raw: true,
			});

			const companyMappedLeaveIds = companyMappedLeaves.map(
				(l) => l.leaveAutoId,
			);

			const employees = await db.employeeMaster.findAll({
				attributes: ["id", "empCode", "name"],
				where: {
					isActive: 1,
					companyId: companyId,
					...(managerId && { manager: managerId }),
					...(reporteIds && {
						id: { [Op.in]: reporteIds.split(",") },
					}),
					...(attendanceFor == 0 && { isActive: 0 }),
					...(attendanceFor == 1 && { isActive: 1 }),
					...(attendanceFor == 2 && { isActive: [0, 1] }),
					...(search && { id: { [Op.in]: search.split(",") } }),
					...(employeeType && {
						employeeType: { [Op.in]: employeeType.split(",") },
					}),
					...(businessUnit && {
						buId: { [Op.in]: businessUnit.split(",") },
					}),
					...(department && {
						departmentId: { [Op.in]: department.split(",") },
					}),
					...(companyLocation && {
						companyLocationId: { [Op.in]: companyLocation.split(",") },
					}),
				},
				include: [
					{
						model: db.departmentMaster,
						attributes: ["departmentName", "departmentCode"],
						where: {
							...filters.departmentFIlter,
						},
					},
					{
						model: db.designationMaster,
						attributes: ["name", "code"],
					},
					{
						model: db.buMaster,
						attributes: ["buName", "buCode"],
						where: {
							...filters.buFIlter,
						},
					},
					{
						model: db.sbuMaster,
						attributes: ["sbuname", "code"],
						where: {
							...filters.sbbuFIlter,
						},
					},
				],
				raw: true,
				nest: true,
			});

			const leaveMasterList = await db.leaveMaster.findAll({
				attributes: ["leaveId", "leaveName", "leaveCode"],
				where: { leaveId: { [Op.in]: companyMappedLeaveIds } },
				raw: true,
			});

			let leaveMasterDetails = {};
			let uniqueLeaveTypes = new Set();
			leaveMasterList.forEach((leave) => {
				const leaveColumnName = `${leave.leaveName} (${leave.leaveCode})`;
				leaveMasterDetails[leave.leaveId] = leaveColumnName;
				uniqueLeaveTypes.add(leaveColumnName);
			});

			const allLeaveMappings = await db.leaveMapping.findAll({
				attributes: ["EmployeeId", "leaveAutoId", "availableLeave"],
				where: { EmployeeId: { [Op.in]: employees.map((emp) => emp.id) } },
				raw: true,
			});

			const leaveMappingData = {};
			allLeaveMappings.forEach(
				({ EmployeeId, leaveAutoId, availableLeave }) => {
					if (!leaveMappingData[EmployeeId]) {
						leaveMappingData[EmployeeId] = {};
					}
					leaveMappingData[EmployeeId][leaveMasterDetails[leaveAutoId]] =
						availableLeave || "0";
				},
			);

			const employeesData = employees.map((emp) => {
				let leaveBalanceMap = leaveMappingData[emp.id] || {};

				companyMappedLeaveIds.forEach((leaveId) => {
					const leaveColumnName = leaveMasterDetails[leaveId];
					if (leaveColumnName && !leaveBalanceMap[leaveColumnName]) {
						leaveBalanceMap[leaveColumnName] = "N/A";
					}
				});

				return {
					employeeCode: emp.empCode,
					name: emp.name,
					departmentName: emp.departmentmaster
						? `${emp.departmentmaster.departmentName} (${emp.departmentmaster.departmentCode})`
						: "N/A",
					designationName: emp.designationmaster
						? `${emp.designationmaster.name} (${emp.designationmaster.code})`
						: "N/A",
					buName: emp.bumaster
						? `${emp.bumaster.buName} (${emp.bumaster.buCode})`
						: "N/A",
					...leaveBalanceMap,
				};
			});

			if (employeesData.length === 0) {
				return res
					.status(404)
					.json({ status: false, message: "No data found" });
			}

			const leaveColumns = [...uniqueLeaveTypes].map((leaveColumnName) => ({
				label: leaveColumnName,
				value: (row) => row[leaveColumnName] || "N/A",
			}));

			const data = [
				{
					sheet: "Leave Balance Report",
					columns: [
						{ label: "Employee ID", value: "employeeCode" },
						{ label: "Name", value: "name" },
						{ label: "Job Title", value: "designationName" },
						{ label: "Department", value: "departmentName" },
						{ label: "Business Unit", value: "buName" },
						...leaveColumns,
					],
					content: employeesData,
				},
			];

			let settings = { writeOptions: { type: "buffer", bookType: "xlsx" } };
			const buffer = xlsx(data, settings);

			res.writeHead(200, {
				"Content-Type": "application/octet-stream",
				"Content-disposition": `attachment; filename=Leave Balance Report.xlsx`,
			});
			res.end(buffer);
		} catch (error) {
			console.error("Error in LeaveBalance API:", error);
			return res.status(500).json({
				status: false,
				message: "Internal Server Error",
			});
		}
	}

	async employeeMissedData(req, res) {
		try {
			const { arrMissingData } = req.body;
			const dt = new Date();
			const sheetName = "uploads/temp/dataSheetMissed"; //+ dt.getTime();
			fs.writeFileSync(sheetName + ".xlsx", "", { flag: "a+" }, (err) => {
				if (err) {
					return;
				}
			});
			const data = [
				{
					sheet: "Employee",
					columns: [
						{ label: "Employee_Code", value: "Employee_Code" },
						{ label: "Email", value: "Email" },
						{ label: "First_Name", value: "First_Name" },
						{ label: "Last_Name", value: "Last_Name" },
						{ label: "Office_Mobile_Number", value: "Office_Mobile_Number" },
						{
							label: "Personal_Mobile_Number",
							value: "Personal_Mobile_Number",
						},
						{ label: "Manager_Id", value: "Manager_Id" },
						{ label: "Manager_Name", value: "manager_name" },
						{ label: "Designation_Name", value: "Designation_Name" },
						{ label: "Department_Name", value: "Department_Name" },
						{ label: "Functional_Area_Name", value: "Functional_Area_Name" },
						{ label: "Bu_Name", value: "Bu_Name" },
						{ label: "Sub_Bu_Name", value: "Sub_Bu_Name" },
					],
					content: arrMissingData,
				},
			];

			const settings = {
				fileName: sheetName,
				extraLength: 3,
				writeMode: "writeFile",
				writeOptions: {},
				RTL: false,
			};

			xlsx(data, settings, () => {
				return res.download(sheetName + ".xlsx");
			});
		} catch (error) {
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	/************************************import data****************************************************/

	async employeeImport(req, res) {
		const transaction = await db.sequelize.transaction(); // Start the transaction
		try {
			// Read Excel file
			const workbookEmployee = pkg.readFile(req.file.path);
			const sheetNameEmployee = workbookEmployee.SheetNames[0];
			const sheetToImportEmployee = pkg.utils.sheet_to_json(
				workbookEmployee.Sheets[sheetNameEmployee],
			);

			let arrPoper = [];
			let arrMissingData = [];
			// Insert data into the database
			for (const row of sheetToImportEmployee) {
				if (
					row.Employee_Code &&
					row.Manager_Name &&
					row.Designation_Name &&
					row.Department_Name &&
					row.Functional_Area_Name &&
					row.Bu_Name
				) {
					let manager_id = await db.employeeMaster.findOne({
						where: { name: row.Manager_Name },
					});
					let department_id = await db.departmentMaster.findOne({
						where: { departmentName: row.Department_Name },
					});
					let designation_id = await db.designationMaster.findOne({
						where: { name: row.Designation_Name },
					});
					let function_area_id = await db.functionalAreaMaster.findOne({
						where: { functionalAreaName: row.Functional_Area_Name },
					});
					let bu_id = await db.buMaster.findOne({
						where: { buName: row.Bu_Name },
					});
					let sub_bu_id = await db.sbuMaster.findOne({
						where: { sbuname: row.Sub_Bu_Name },
					});

					if (
						manager_id &&
						department_id &&
						designation_id &&
						function_area_id &&
						bu_id &&
						sub_bu_id
					) {
						const existUser = await db.employeeMaster.findOne({
							where: {
								[Op.or]: [
									{ email: row.Email },
									{ officeMobileNumber: row.Office_Mobile_Number },
								],
							},
							transaction, // Add transaction object here
						});
						if (existUser) {
							arrMissingData.push(row);
						} else {
							const maxCode = await db.employeeMaster.max("empCode", {
								transaction,
							});
							const salt = await bcrypt.genSalt(10);

							let data = {
								name:
									(row.First_Name ? row.First_Name : "") +
									" " +
									(row.Last_Name ? row.Last_Name : ""),
								firstName: row.First_Name ? row.First_Name : "",
								lastName: row.Last_Name ? row.Last_Name : "",
								password: await bcrypt.hash("test1234", salt),
								officeMobileNumber: row.Office_Mobile_Number
									? row.Office_Mobile_Number
									: "",
								personalMobileNumber: row.Personal_Mobile_Number
									? row.Personal_Mobile_Number
									: "",
								role_id: 3,
								empCode: parseInt(maxCode) + 1,
								manager: manager_id.dataValues.id, //row.Manager_Id ? row.Manager_Id : 31,
								email: row.Email ? row.Email : "",
								departmentId: department_id.dataValues.departmentId,
								designation_id: designation_id.dataValues.designationId,
								functionalAreaId: function_area_id.dataValues.functionalAreaId,
								buId: bu_id.dataValues.buId,
								sbuId: sub_bu_id.dataValues.sbuId,
							};

							await db.employeeMaster.create(data, { transaction }); // Add transaction object here
						}
					} else {
						arrMissingData.push(row);
					}
				}
				await transaction.commit(); // Commit the transaction
				return respHelper(res, {
					status: 200,
					msg: "File Uploaded Successfully",
					data: {
						arrPoper: arrPoper,
						arrMissingData: arrMissingData,
					},
				});
			}
		} catch (error) {
			await transaction.rollback(); // Rollback the transaction in case of an error
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async employeeImportNew(req, res) {
		const transaction = await db.sequelize.transaction(); // Start a transaction
		try {
			// Read Excel file
			const workbookEmployee = pkg.readFile(req.file.path);
			const sheetNameEmployee = workbookEmployee.SheetNames[0];
			const sheetToImportEmployee = pkg.utils.sheet_to_json(
				workbookEmployee.Sheets[sheetNameEmployee],
			);

			let arrPoper = [];
			let arrMissingData = [];

			for (const row of sheetToImportEmployee) {
				const existUser = await db.employeeMaster.findOne({
					where: {
						[Op.and]: [
							{ email: row["Direct Manager Email Id"] },
							{ empCode: row["Direct Manager Code"] },
						],
					},
					transaction, // Pass transaction object
				});

				if (existUser) {
					arrMissingData.push(row);
				} else {
					const salt = await bcrypt.genSalt(10);
					const fullName = row["Direct Manager Name"].split(" ");
					let data = {
						empCode: row["Direct Manager Code"],
						name: row["Direct Manager Name"],
						email: row["Direct Manager Email Id"],
						officeMobileNumber: row["officeMobileNumber"],
						personalMobileNumber: row["personalMobileNumber"],
						firstName: fullName[0],
						lastName: fullName.slice(1).join(" "),
						isActive: 1,
						role_id: 3,
						password: await bcrypt.hash("test1234", salt),
					};

					arrPoper.push(data);
					// await db.employeeMaster.create(data, { transaction }); // Add transaction object here
				}
			}

			await db.employeeMaster.bulkCreate(arrPoper);
			await transaction.commit(); // Commit the transaction if all operations are successful

			return respHelper(res, {
				status: 200,
				msg: "File Uploaded Successfully",
				data: {
					arrPoper: arrPoper,
					arrMissingData: arrMissingData,
				},
			});
		} catch (error) {
			await transaction.rollback(); // Rollback the transaction in case of an error
			console.log(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	/*************************************redis**********************************************************/
	//   async employeeRedis(req, res) {
	//     try {
	//       const {
	//         search,
	//         department,
	//         designation,
	//         buSearch,
	//         sbuSearch,
	//         areaSearch,
	//       } = req.query;
	//       const limit = req.query.limit * 1 || 10;
	//       const pageNo = req.query.page * 1 || 1;
	//       const offset = (pageNo - 1) * limit;
	//       const cacheKey = `employeeList:${pageNo}`;

	//       var employeeData = [];
	//       await client.get("employeeList").then(async (data) => {
	//         if (data) {
	//           employeeData = JSON.parse(data);
	//           console.log("Array of objects fetched Redis successfully.");
	//           return respHelper(res, {
	//             status: 200,
	//             data: employeeData,
	//           });
	//         } else {
	//           employeeData = await db.employeeMaster.findAndCountAll({
	//             limit,
	//             offset,
	//             where: Object.assign(
	//               search
	//                 ? {
	//                     [Op.or]: [
	//                       {
	//                         empCode: {
	//                           [Op.like]: `%${search}%`,
	//                         },
	//                       },
	//                       {
	//                         name: {
	//                           [Op.like]: `%${search}%`,
	//                         },
	//                       },
	//                       {
	//                         email: {
	//                           [Op.like]: `%${search}%`,
	//                         },
	//                       },
	//                     ],
	//                   }
	//                 : {}
	//             ),
	//             attributes: [
	//               "id",
	//               "empCode",
	//               "name",
	//               "email",
	//               "firstName",
	//               "lastName",
	//               "officeMobileNumber",
	//               "buId",
	//             ],
	//             include: [
	//               {
	//                 model: db.designationMaster,
	//                 attributes: ["name"],
	//                 required: !!designation,
	//                 where: {
	//                   ...(designation && {
	//                     name: { [Op.like]: `%${designation}%` },
	//                   }),
	//                 },
	//               },
	//               {
	//                 model: db.functionalAreaMaster,
	//                 attributes: ["functionalAreaName"],
	//                 required: !!areaSearch,
	//                 where: {
	//                   ...(areaSearch && {
	//                     functionalAreaName: { [Op.like]: `%${areaSearch}%` },
	//                   }),
	//                 },
	//               },
	//               {
	//                 model: db.departmentMaster,
	//                 attributes: ["departmentName"],
	//                 required: !!department,
	//                 where: {
	//                   ...(department && {
	//                     departmentName: { [Op.like]: `%${department}%` },
	//                   }),
	//                 },
	//               },
	//               {
	//                 model: db.educationDetails,
	//                 attributes: [
	//                   "educationDegree",
	//                   "educationSpecialisation",
	//                   "educationInstitute",
	//                   "educationRemark",
	//                   "educationStartDate",
	//                   "educationCompletionDate",
	//                 ],
	//               },
	//               {
	//                 model: db.employeeMaster,
	//                 required: false,
	//                 attributes: ["name"],
	//                 as: "managerData",
	//               },
	//               {
	//                 model: db.buMaster,
	//                 attributes: ["buName"],
	//                 where: {
	//                   ...(buSearch && { buName: { [Op.like]: `%${buSearch}%` } }),
	//                 },
	//                 required: !!buSearch,
	//               },
	//               {
	//                 model: db.sbuMaster,
	//                 attributes: ["sbuname"],
	//                 where: {
	//                   ...(sbuSearch && {
	//                     sbuname: { [Op.like]: `%${sbuSearch}%` },
	//                   }),
	//                 },
	//                 required: !!sbuSearch,
	//               },
	//             ],
	//           });
	//           const employeeJson = JSON.stringify(employeeData);
	//           client
	//             .setEx("employeeList", 10, employeeJson)
	//             .then(() => {
	//               console.log("Array of objects stored in Redis successfully.");
	//             })
	//             .catch((err) => {
	//               console.error("Error storing array of objects in Redis:", err);
	//             });
	//           return respHelper(res, {
	//             status: 200,
	//             data: employeeData,
	//           });
	//         }
	//       });
	//     } catch (error) {
	//       console.log(error);
	//       return respHelper(res, {
	//         status: 500,
	//       });
	//     }
	//   }
	async employeeRedis(req, res) {
		try {
			const {
				search,
				department,
				designation,
				buSearch,
				sbuSearch,
				areaSearch,
			} = req.query;
			const limit = parseInt(req.query.limit) || 10;
			const pageNo = parseInt(req.query.page) || 1;
			const offset = (pageNo - 1) * limit;
			const cacheKey = `employeeList:${pageNo}:${limit}:${search || ""}:${
				department || ""
			}:${designation || ""}:${buSearch || ""}:${sbuSearch || ""}:${
				areaSearch || ""
			}`;

			let employeeData = [];
			await client.get(cacheKey).then(async (data) => {
				if (data) {
					employeeData = JSON.parse(data);
					return respHelper(res, {
						status: 200,
						data: employeeData,
					});
				} else {
					employeeData = await db.employeeMaster.findAndCountAll({
						limit,
						offset,
						where: {
							...(search && {
								[Op.or]: [
									{ empCode: { [Op.like]: `%${search}%` } },
									{ name: { [Op.like]: `%${search}%` } },
									{ email: { [Op.like]: `%${search}%` } },
								],
							}),
						},
						attributes: [
							"id",
							"empCode",
							"name",
							"email",
							"firstName",
							"lastName",
							"officeMobileNumber",
							"buId",
						],
						include: [
							{
								model: db.designationMaster,
								attributes: ["name"],
								required: !!designation,
								where: {
									...(designation && {
										name: { [Op.like]: `%${designation}%` },
									}),
								},
							},
							{
								model: db.functionalAreaMaster,
								attributes: ["functionalAreaName"],
								required: !!areaSearch,
								where: {
									...(areaSearch && {
										functionalAreaName: { [Op.like]: `%${areaSearch}%` },
									}),
								},
							},
							{
								model: db.departmentMaster,
								attributes: ["departmentName"],
								required: !!department,
								where: {
									...(department && {
										departmentName: { [Op.like]: `%${department}%` },
									}),
								},
							},
							{
								model: db.educationDetails,
								attributes: [
									"educationDegree",
									"educationSpecialisation",
									"educationInstitute",
									"educationRemark",
									"educationStartDate",
									"educationCompletionDate",
								],
							},
							{
								model: db.employeeMaster,
								required: false,
								attributes: ["name"],
								as: "managerData",
							},
							{
								model: db.buMaster,
								attributes: ["buName"],
								where: {
									...(buSearch && { buName: { [Op.like]: `%${buSearch}%` } }),
								},
								required: !!buSearch,
							},
							{
								model: db.sbuMaster,
								attributes: ["sbuname"],
								where: {
									...(sbuSearch && {
										sbuname: { [Op.like]: `%${sbuSearch}%` },
									}),
								},
								required: !!sbuSearch,
							},
						],
					});

					const employeeJson = JSON.stringify(employeeData);
					await client.setEx(cacheKey, 200, employeeJson); // Cache for 10 minutes

					return respHelper(res, {
						status: 200,
						data: employeeData,
					});
				}
			});
		} catch (error) {
			console.error(error);
			return respHelper(res, {
				status: 500,
				message: "Internal Server Error",
			});
		}
	}

	async allAttendancePunchDetails(req, res) {
		try {
			const {
				startDate,
				endDate,
				search,
				employeeType,
				businessUnit,
				grade,
				department,
				companyLocation,
				attendanceFor,
				companyId,
				managerId,
				reporteIds,
			} = req.query;
			let buFIlter = {};
			let sbbuFIlter = {};
			let functionAreaFIlter = {};
			let departmentFIlter = {};
			let designationFIlter = {};
			let companyFIlter = {};
			const usersData = req.userData;
			let employeeDataExisting = [];
			if (usersData.role_id == 4 || usersData.role_id == 5) {
				let permissionAssignTousers = [];
				if (usersData.permissionAndAccess) {
					permissionAssignTousers = usersData.permissionAndAccess
						.split(",")
						.map((el) => parseInt(el));
				}
				let permissionAndAccess = await db.permissoinandaccess.findAll({
					where: {
						role_id: usersData.role_id,
						isActive: 1,
						permissoinandaccessId: {
							[Op.in]: permissionAssignTousers,
						},
					},
				}); /// get all permission of access to fetch list with active status as per role
				const buArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "BU")
					.map((obj) => obj.permissionValue); // checking BU Access

				if (buArrayForFilter.length > 0) {
					buFIlter.buId = {
						///appedning Bu to filter
						[Op.in]: buArrayForFilter,
					};
				}

				const sbuArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "SBU")
					.map((obj) => obj.permissionValue); // checking SBU Access
				if (sbuArrayForFilter.length > 0) {
					sbbuFIlter.sbuId = {
						///appedning SBU to filter
						[Op.in]: sbuArrayForFilter,
					};
				}

				const departmentArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "DEPARTMENT")
					.map((obj) => obj.permissionValue); // checking department Access

				if (departmentArrayForFilter.length > 0) {
					departmentFIlter.departmentId = {
						///appedning department to filter
						[Op.in]: departmentArrayForFilter,
					};
				}
				const funcareaArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "FUNCAREA")
					.map((obj) => obj.permissionValue); // checking SBU Access

				if (funcareaArrayForFilter.length > 0) {
					functionAreaFIlter.functionalAreaId = {
						///appedning SBU to filter
						[Op.in]: funcareaArrayForFilter,
					};
				}

				const designationArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "DESIGNATION")
					.map((obj) => obj.permissionValue); // checking SBU Access

				if (designationArrayForFilter.length > 0) {
					designationFIlter.designationId = {
						///appedning SBU to filter
						[Op.in]: designationArrayForFilter,
					};
				}
				const comapnyArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "COMPANY")
					.map((obj) => obj.permissionValue); // checking SBU Access

				if (comapnyArrayForFilter.length > 0) {
					companyFIlter.companyId = {
						///appedning SBU to filter
						[Op.in]: comapnyArrayForFilter,
					};
				}
			}

			const attendanceData = await db.attendanceMaster.findAll({
				attributes: [
					"attendanceDate",
					"attendanceStatus",
					"attendancePresentStatus",
					"attendancePunchInLocation",
					"attendancePunchOutLocation",
					"attendancePunchInTime",
					"attendancePunchOutTime",
					"attendancePunchInRemark",
					"attendancePunchOutRemark",
					"attendancePunchInLocationType",
					"attendancePunchOutLocationType",
					"punchInSource",
					"punchOutSource",
					"createdBy",
					"createdAt",
					"updatedBy",
					"updatedAt",
				],
				where: {
					attendanceDate: {
						[db.Sequelize.Op.between]: [startDate, endDate],
					},
				},
				include: [
					{
						model: db.employeeMaster,
						attributes: ["id", "name", "empCode"],
						where: {
							// isActive: 1,
							// attendanceFor,
							companyId: companyId,
							...(managerId && { manager: managerId }),
							...(reporteIds && {
								id: { [Op.in]: reporteIds.split(",") },
							}),
							...(attendanceFor == 0 && { isActive: 0 }),
							...(attendanceFor == 1 && { isActive: 1 }),
							...(attendanceFor == 2 && { isActive: [0, 1] }),
							...(search && { id: { [Op.in]: search.split(",") } }),
							...(employeeType && {
								employeeType: { [Op.in]: employeeType.split(",") },
							}),
							...(businessUnit && {
								buId: { [Op.in]: businessUnit.split(",") },
							}),
							...(department && {
								departmentId: { [Op.in]: department.split(",") },
							}),
							...(companyLocation && {
								companyLocationId: { [Op.in]: companyLocation.split(",") },
							}),
						},
						include: [
							{
								model: db.departmentMaster,
								attributes: [
									"departmentId",
									"departmentName",
									"departmentCode",
								],
								where: {
									...departmentFIlter,
								},
							},
							{
								model: db.designationMaster,
								attributes: ["name"],
								where: {
									...designationFIlter,
								},
							},
							{
								model: db.jobDetails,
								attributes: ["jobId"],
								where: {
									...(grade && { gradeId: { [Op.in]: grade.split(",") } }),
								},
								include: [
									{
										model: db.gradeMaster,
										attributes: ["gradeName"],
									},
								],
							},
							{
								model: db.buMaster,
								attributes: ["buName", "buCode"],
								required: true,
								where: {
									...buFIlter,
								},
							},
							{
								model: db.sbuMaster,
								attributes: ["sbuname", "code"],
								required: true,
								where: {
									...sbbuFIlter,
								},
							},
							{
								model: db.functionalAreaMaster,
								attributes: ["functionalAreaName", "functionalAreaCode"],
								required: false,
								where: {
									...functionAreaFIlter,
								},
							},
							{
								model: db.employeeMaster,
								required: false,
								as: "managerData",
								attributes: ["id", "name", "email", "empCode"],
							},
							{
								model: db.companyMaster,
								attributes: ["companyName", "companyCode"],
								// where: {
								// 	...companyFIlter,
								// },
							},
						],
					},
					{
						model: db.shiftMaster,
						attributes: [
							"shiftId",
							"shiftName",
							"shiftStartTime",
							"shiftEndTime",
						],
					},
					{
						model: db.attendancePolicymaster,
						attributes: ["policyName", "policyCode"],
					},
					{
						model: db.weekOffMaster,
						attributes: ["weekOffName"],
					},
					{
						model: db.employeeMaster,
						attributes: ["id", "name", "empCode"],
						as: "punchInCreatedBy",
					},
					{
						model: db.employeeMaster,
						attributes: ["id", "name", "empCode"],
						as: "punchOutCreatedBy",
					},
				],
				raw: true,
			});

			if (attendanceData.length > 0) {
				const simplifiedData = await Promise.all(
					attendanceData.map(async (record) => ({
						employeeId: record["employee.id"],
						employeeCode: record["employee.empCode"],
						employeeName: record["employee.name"],
						buName:
							record["employee.bumaster.buName"] +
							" " +
							"(" +
							record["employee.bumaster.buCode"] +
							")",
						sbuName:
							record["employee.sbumaster.sbuname"] +
							" " +
							"(" +
							record["employee.sbumaster.code"] +
							")",
						departmentName:
							record["employee.departmentmaster.departmentName"] +
							" " +
							"(" +
							record["employee.departmentmaster.departmentCode"] +
							")",
						designationName:
							record["employee.designationmaster.name"] +
							" " +
							"(" +
							record["employee.departmentmaster.departmentCode"] +
							")",
						functionArea:
							record["employee.functionalareamaster.functionalAreaName"] +
							" " +
							"(" +
							record["employee.functionalareamaster.functionalAreaCode"] +
							")",
						manager: record["employee.managerData.name"]
							? record["employee.managerData.name"] +
								" (" +
								record["employee.managerData.empCode"] +
								")"
							: "-",
						attendanceDate: moment(record.attendanceDate).format("DD-MM-YYYY"),
						attendanceStatus: record.attendanceStatus,
						attendancePresentStatus: record.attendancePresentStatus,
						attendancePunchInTime: record.attendancePunchInTime || "N/A",
						attendancePunchInLocation: record.attendancePunchInLocation,
						attendancePunchInLocationType:
							record.attendancePunchInLocationType || "N/A",
						attendancePunchInRemark: record.attendancePunchInRemark || "N/A",
						attendancePunchOutTime: record.attendancePunchOutTime || "N/A",
						attendancePunchOutLocation:
							record.attendancePunchOutLocation || "N/A",
						attendancePunchOutLocationType:
							record.attendancePunchOutLocationType || "N/A",
						attendancePunchOutRemark: record.attendancePunchOutRemark || "N/A",
						status: "APPROVED",
						punchInSource: record.punchInSource || "N/A",
						punchOutSource: record.punchOutSource || "N/A",
						grade: record["employee.employeejobdetail.grademaster.gradeName"],
						shiftName: record["shiftsmaster.shiftName"],
						shiftStartTime: record["shiftsmaster.shiftStartTime"],
						shiftEndTime: record["shiftsmaster.shiftEndTime"],
						attendancePolicyName: record["attendancePolicymaster.policyName"],
						attendancePolicyCode:
							record["attendancePolicymaster.policyCode"] || "N/A",
						weekOffName: record["weekOffMaster.weekOffName"] || "N/A",
						//createdBy: record["punchInCreatedBy.name"] + record["punchInCreatedBy.empCode"] || "N/A",
						//updatedBy: record["punchOutCreatedBy.name"] + record["punchOutCreatedBy.empCode"]|| "N/A",
						createdBy: record["punchInCreatedBy.name"]
							? `${record["punchInCreatedBy.name"]} (${
									record["punchInCreatedBy.empCode"] ?? "N/A"
								})`
							: "N/A",
						updatedBy: record["punchOutCreatedBy.name"]
							? `${record["punchOutCreatedBy.name"]} (${
									record["punchOutCreatedBy.empCode"] ?? "N/A"
								})`
							: "N/A",
						createdAt:
							record.createdAt != null
								? moment(record.createdAt).format("DD-MM-YYYY HH:mm:ss")
								: "N/A",
						updatedAt:
							record.updatedAt != null
								? moment(record.updatedAt).format("DD-MM-YYYY HH:mm:ss")
								: "N/A",
					})),
				);
				simplifiedData.sort((a, b) => {
					// First, sort by employeeId
					if (a.employeeId !== b.employeeId) {
						return a.employeeId - b.employeeId;
					}
					// If employeeId is the same, then sort by attendanceDate
					return (
						new Date(a.attendanceDate.split("-").reverse().join("-")) -
						new Date(b.attendanceDate.split("-").reverse().join("-"))
					);
				});

				if (simplifiedData.length > 0) {
					const timestamp = Date.now();
					const data = [
						{
							sheet: "Attendance Report",
							columns: [
								{ label: "Employee Code", value: "employeeCode" },
								{ label: "Employee Name", value: "employeeName" },
								{ label: "Grade", value: "grade" },
								{ label: "BU Name", value: "buName" },
								{ label: "SBU Name", value: "sbuName" },
								{ label: "Department Name", value: "departmentName" },
								{ label: "Designation", value: "designationName" },
								{ label: "Functional Area Name", value: "functionArea" },
								{ label: "Manager", value: "manager" },
								{ label: "Attendance Date", value: "attendanceDate" },
								{ label: "Attendance Status", value: "attendanceStatus" },
								{
									label: "Attendance Present Status",
									value: "attendancePresentStatus",
								},
								{ label: "Punch In Time", value: "attendancePunchInTime" },
								{
									label: "Punch In Location",
									value: "attendancePunchInLocation",
								},
								{
									label: "Attendance Punch In Location Type",
									value: "attendancePunchInLocationType",
								},
								{ label: "Punch In Source", value: "punchInSource" },
								{ label: "Punch In Remark", value: "attendancePunchInRemark" },
								{ label: "Punch Out Time", value: "attendancePunchOutTime" },
								{
									label: "Punch Out Location",
									value: "attendancePunchOutLocation",
								},
								{
									label: "Attendance Punch Out Location Type",
									value: "attendancePunchOutLocationType",
								},
								{ label: "Punch Out Source", value: "punchOutSource" },
								{
									label: "Punch Out Remark",
									value: "attendancePunchOutRemark",
								},
								{ label: "Status(Pending/Approved/Rejected)", value: "status" },
								{ label: "Shift Name", value: "shiftName" },
								{ label: "Shift Start Time", value: "shiftStartTime" },
								{ label: "Shift End Time", value: "shiftEndTime" },
								{
									label: "Attendance Policy Name",
									value: "attendancePolicyName",
								},
								{
									label: "Attendance Policy Code",
									value: "attendancePolicyCode",
								},
								{ label: "Week Off Name", value: "weekOffName" },
								{ label: "Created By Punch In", value: "createdBy" },
								{ label: "Created On Punch In ", value: "createdAt" },
								{ label: "Created By Punch Out", value: "updatedBy" },
								{ label: "Created On Punch Out", value: "updatedAt" },
							],
							content: simplifiedData,
						},
					];

					let settings = {
						writeOptions: {
							type: "buffer",
							bookType: "xlsx",
						},
					};
					const buffer = xlsx(data, settings);
					res.writeHead(200, {
						"Content-Type": "application/octet-stream",
						"Content-disposition": `attachment; filename=Attendance Punch In/Out${timestamp}.xlsx`,
					});
					res.end(buffer);
				}
			} else {
				return respHelper(res, {
					status: 404,
					message: "Data not availble for available dates",
				});
			}
		} catch (error) {
			console.error(error);
			return res.status(500).json({
				status: false,
				message: "Internal Server Error",
			});
		}
	}

	async attendanceSummary(req, res) {
		try {
			const {
				startDate,
				endDate,
				search,
				employeeType,
				designation,
				department,
				areaSearch,
				grade,
				companyLocation,
				attendanceFor,
				companyId,
				managerId,
				reporteIds,
			} = req.query;
			console.log("reporteIds", reporteIds);
			let buFIlter = {};
			let sbbuFIlter = {};
			let functionAreaFIlter = {};
			let departmentFIlter = {};
			let designationFIlter = {};
			let companyFIlter = {};
			const usersData = req.userData;
			let employeeDataExisting = [];
			if (usersData.role_id == 4 || usersData.role_id == 5) {
				let permissionAssignTousers = [];
				if (usersData.permissionAndAccess) {
					permissionAssignTousers = usersData.permissionAndAccess
						.split(",")
						.map((el) => parseInt(el));
				}
				let permissionAndAccess = await db.permissoinandaccess.findAll({
					where: {
						role_id: usersData.role_id,
						isActive: 1,
						permissoinandaccessId: {
							[Op.in]: permissionAssignTousers,
						},
					},
				}); /// get all permission of access to fetch list with active status as per role
				const buArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "BU")
					.map((obj) => obj.permissionValue); // checking BU Access

				if (buArrayForFilter.length > 0) {
					buFIlter.buId = {
						///appedning Bu to filter
						[Op.in]: buArrayForFilter,
					};
				}

				const sbuArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "SBU")
					.map((obj) => obj.permissionValue); // checking SBU Access
				if (sbuArrayForFilter.length > 0) {
					sbbuFIlter.sbuId = {
						///appedning SBU to filter
						[Op.in]: sbuArrayForFilter,
					};
				}

				const departmentArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "DEPARTMENT")
					.map((obj) => obj.permissionValue); // checking department Access

				if (departmentArrayForFilter.length > 0) {
					departmentFIlter.departmentId = {
						///appedning department to filter
						[Op.in]: departmentArrayForFilter,
					};
				}
				const funcareaArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "FUNCAREA")
					.map((obj) => obj.permissionValue); // checking SBU Access

				if (funcareaArrayForFilter.length > 0) {
					functionAreaFIlter.functionalAreaId = {
						///appedning SBU to filter
						[Op.in]: funcareaArrayForFilter,
					};
				}

				const designationArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "DESIGNATION")
					.map((obj) => obj.permissionValue); // checking SBU Access

				if (designationArrayForFilter.length > 0) {
					designationFIlter.designationId = {
						///appedning SBU to filter
						[Op.in]: designationArrayForFilter,
					};
				}
				const comapnyArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "COMPANY")
					.map((obj) => obj.permissionValue); // checking SBU Access

				if (comapnyArrayForFilter.length > 0) {
					companyFIlter.companyId = {
						///appedning SBU to filter
						[Op.in]: comapnyArrayForFilter,
					};
				}
			}
			const fromDate = moment(startDate, "YYYY-MM-DD");
			const toDate = moment(endDate, "YYYY-MM-DD");

			const totalDays = toDate.diff(fromDate, "days") + 1;
			const attendanceData = await db.attendanceMaster.findAll({
				attributes: ["employeeId", "attendanceDate", "attendancePresentStatus"],
				where: {
					// employeeId: 1431,
					attendanceDate: {
						[db.Sequelize.Op.between]: [
							fromDate.format("YYYY-MM-DD"),
							toDate.format("YYYY-MM-DD"),
						],
					},
				},
				include: [
					{
						model: db.employeeMaster,
						attributes: [
							"id",
							"name",
							"empCode",
							"weekOffId",
							"companyLocationId",
							"dateOfexit",
						],
						where: {
							// isActive: 1,
							//id:5074,
							companyId: companyId,
							...(managerId && { manager: managerId }),
							...(reporteIds && {
								id: { [Op.in]: reporteIds.split(",") },
							}),
							...(attendanceFor == 0 && { isActive: 0 }),
							...(attendanceFor == 1 && { isActive: 1 }),
							...(attendanceFor == 2 && { isActive: [0, 1] }),
							...(search && { id: { [Op.in]: search.split(",") } }),
							...(fromDate && {
								[Op.or]: [
									{ dateOfexit: null },
									{ dateOfexit: { [Op.gte]: fromDate.format("YYYY-MM-DD") } },
								],
							}),
							...(employeeType && {
								employeeType: { [Op.in]: employeeType.split(",") },
							}),
							...(department && {
								departmentId: { [Op.in]: department.split(",") },
							}),
							...(designation && {
								designation_id: { [Op.in]: designation.split(",") },
							}),
							...(companyLocation && {
								companyLocationId: { [Op.in]: companyLocation.split(",") },
							}),
							...(areaSearch && {
								functionalAreaId: { [Op.in]: areaSearch.split(",") },
							}),
						},
						include: [
							{
								model: db.jobDetails,
								attributes: ["jobId", "dateOfJoining"],
								where: {
									...(grade && { gradeId: { [Op.in]: grade.split(",") } }),
								},
								include: [
									{
										model: db.gradeMaster,
										attributes: ["gradeName"],
									},
								],
							},
							{
								model: db.designationMaster,
								attributes: ["name"],
								required: true,
								where: {
									...designationFIlter,
								},
							},
							{
								model: db.departmentMaster,
								attributes: ["departmentName", "departmentCode"],
								required: true,
								where: {
									...departmentFIlter,
								},
								// where: {
								//   ...(department && {
								//     departmentId: { [Op.like]: `%${department}%` },
								//   })
								// },
							},
							{
								model: db.functionalAreaMaster,
								seperate: true,
								attributes: ["functionalAreaName"],
								// where: {
								//   ...(areaSearch && {
								//     functionalAreaName: { [Op.like]: `%${areaSearch}%` },
								//   }),
								// },
							},
							{
								model: db.companyMaster,
								// where: {
								// 	comapanyId:comapanyId
								// },
							},
						],
					},
					{
						model: db.regularizationMaster,
						as: "latest_Regularization_Request",
						attributes: ["regularizeId"],
					},
				],
			});

			const activeButAttendanceNotAvailable = await db.employeeMaster.findAll({
				attributes: [
					"id",
					"name",
					"empCode",
					"weekOffId",
					"companyLocationId",
					"dateOfexit",
				],
				where: {
					// isActive: 1,
					//id:5074,
					companyId: companyId,
					...(managerId && { manager: managerId }),
					...(reporteIds && {
						id: { [Op.in]: reporteIds.split(",") },
					}),
					...(attendanceFor == 0 && { isActive: 0 }),
					...(attendanceFor == 1 && { isActive: 1 }),
					...(attendanceFor == 2 && { isActive: [0, 1] }),
					...(search && { id: { [Op.in]: search.split(",") } }),
					...(employeeType && {
						employeeType: { [Op.in]: employeeType.split(",") },
					}),
					...(fromDate && {
						[Op.or]: [
							{ dateOfexit: null },
							{ dateOfexit: { [Op.gte]: fromDate.format("YYYY-MM-DD") } },
						],
					}),
					...(department && {
						departmentId: { [Op.in]: department.split(",") },
					}),
					...(designation && {
						designation_id: { [Op.in]: designation.split(",") },
					}),
					...(companyLocation && {
						companyLocationId: { [Op.in]: companyLocation.split(",") },
					}),
					...(areaSearch && {
						functionalAreaId: { [Op.in]: areaSearch.split(",") },
					}),
					// Ensuring only records with no attendance data
					//"$attendancemaster.employeeId$": null,
				},
				include: [
					{
						model: db.attendanceMaster,
						attributes: [
							"employeeId",
							"attendanceDate",
							"attendancePresentStatus",
						],
						where: {
							attendanceDate: {
								[db.Sequelize.Op.between]: [
									fromDate.format("YYYY-MM-DD"),
									toDate.format("YYYY-MM-DD"),
								],
							},
						},
						required: false,
					},
					{
						model: db.jobDetails,
						attributes: ["jobId", "dateOfJoining"],
						where: {
							...(grade && { gradeId: { [Op.in]: grade.split(",") } }),
						},
						include: [
							{
								model: db.gradeMaster,
								attributes: ["gradeName"],
							},
						],
					},
					{
						model: db.designationMaster,
						attributes: ["name"],
						required: true,
						where: {
							...designationFIlter,
						},
					},
					{
						model: db.departmentMaster,
						attributes: ["departmentName", "departmentCode"],
						required: true,
						where: {
							...departmentFIlter,
						},
					},
					{
						model: db.functionalAreaMaster,
						seperate: true,
						attributes: ["functionalAreaName"],
					},
					{
						model: db.companyMaster,
						// required:true,
						// where: {
						// 	...companyFIlter,
						// },
					},
				],
			});

			const activeButAttendanceNotAvailableIds = [
				...new Set(activeButAttendanceNotAvailable.map((record) => record.id)),
			];

			const employeeIdsAvailable = [
				...new Set(attendanceData.map((record) => record.employeeId)),
			];
			const employeeIds = [
				...new Set([
					...employeeIdsAvailable,
					...activeButAttendanceNotAvailableIds,
				]),
			];
			const finalData = [];
			const today = moment().startOf("day");

			for (const employeeId of employeeIds) {
				const employeeRecords = attendanceData.filter(
					(record) => record.employeeId === employeeId,
				);
				//console.log("employeeRecords", employeeRecords);
				let employeeRecord;

				if (employeeRecords.length === 0) {
					const employeeData = await db.employeeMaster.findOne({
						attributes: [
							"id",
							"name",
							"empCode",
							"weekOffId",
							"companyLocationId",
							"dateOfexit",
						],
						where: { id: employeeId },
						include: [
							{
								model: db.jobDetails,
								attributes: ["dateOfJoining"],
							},
						],
					});
					//console.log("employeeData>>>>>>>>", employeeData?.employeejobdetail?.dateOfJoining);
					// Create the employeeRecord object with fetched data
					employeeRecord = {
						empId: employeeData?.id || null,
						name: employeeData?.name || "Unknown",
						empCode: employeeData?.empCode || "N/A",
						weekOffId: employeeData?.weekOffId || 0,
						companyLocationId: employeeData?.companyLocationId || 0,
						dateOfJoining:
							employeeData?.employeejobdetail?.dateOfJoining || null,
						dateOfexit: employeeData?.dateOfexit || null,
						type: 0,
					};
				} //continue;
				else {
					employeeRecord = {
						empId: employeeRecords[0].employee?.id || null,
						name: employeeRecords[0].employee?.name || "Unknown",
						empCode: employeeRecords[0].employee?.empCode || "N/A",
						weekOffId: employeeRecords[0].employee?.weekOffId || 0,
						companyLocationId:
							employeeRecords[0].employee?.companyLocationId || 0,
						dateOfJoining:
							employeeRecords[0].employee?.employeejobdetail?.dateOfJoining ||
							null,
						dateOfexit: employeeRecords[0].employee?.dateOfexit || null,
						type: 1,
					};
				}
				//console.log("employeeRecordemployeeRecord>>>>", employeeRecord);
				const dayRecords = {};
				let attendanceCount = {
					P: 0,
					A: 0,
					SA: 0,
					R: 0,
					H: 0,
					W: 0,
					L: 0,
					U: 0,
				};

				// Fetch approved leave transactions for the employee
				const leaveTransactions = await db.employeeLeaveTransactions.findAll({
					attributes: ["employeeId", "leaveAutoId", "leaveCount", "appliedFor"],
					where: {
						employeeId: employeeRecord.empId,
						[Op.or]: [
							{ source: { [Op.ne]: "system_generated" } }, // Source is not 'system_generated'
							{ source: null }, // Source is null
						],
						status: "approved",
						appliedFor: {
							[db.Sequelize.Op.between]: [
								fromDate.format("YYYY-MM-DD"),
								toDate.format("YYYY-MM-DD"),
							],
						},
					},
					raw: true,
				});
				const getLeaveForDay = (date) =>
					leaveTransactions.find((leave) => leave.appliedFor === date);

				for (let dayOffset = 0; dayOffset < totalDays; dayOffset++) {
					const currentDay = moment(fromDate).add(dayOffset, "days");
					const currentDate = currentDay.format("YYYY-MM-DD");
					const dayKey = currentDay.format("DD");

					// Check if the day is a holiday or week off using isDayWorking function
					const isDayWorking = await helper.isDayWorkingForReport(
						currentDate,
						employeeRecord.weekOffId,
						employeeRecord.companyLocationId,
					);

					// If the day is a holiday, set status to H
					if (isDayWorking === "H") {
						const leave = getLeaveForDay(currentDate);
						const attendanceRecord = employeeRecords.find(
							(record) => record.attendanceDate === currentDate,
						);
						if (attendanceRecord) {
							const { attendancePresentStatus } = attendanceRecord;

							// Set attendance based on the presence status
							if (attendancePresentStatus === "present") {
								dayRecords[dayKey] = "P"; // Initially set to P
								//attendanceCount.P++;

								// Check for regularization
								if (attendanceRecord.latest_Regularization_Request.length > 0) {
									dayRecords[dayKey] = `${dayRecords[dayKey]},R`; // Append R for regularization
									attendanceCount.R++;
								}

								// If there was a leave, append it after regularization
								if (leave) {
									// Determine the leave status based on leaveCount and leaveAutoId
									let leaveStatus =
										leave.leaveCount === "1.0"
											? "L"
											: leave.leaveAutoId == 6
												? "0.5U"
												: "0.5L";
									dayRecords[dayKey] = `${dayRecords[dayKey]},${leaveStatus}`; // Append leave status
									//attendanceCount.L++;
									attendanceCount.L += parseFloat(leave.leaveCount);
								}

								if (isDayWorking === "H") {
									dayRecords[dayKey] = `${dayRecords[dayKey]},H`; // Append R for regularization
									attendanceCount.H++; // uncommenting this line 10-10-2024
								}
							} else if (attendancePresentStatus === "singlePunchAbsent") {
								dayRecords[dayKey] = "SA";
								attendanceCount.SA++;

								if (attendanceRecord.latest_Regularization_Request.length > 0) {
									dayRecords[dayKey] = `${dayRecords[dayKey]},R`; // Append R for regularization
									attendanceCount.R++;
								}

								// If there was a leave, append it after regularization
								if (leave) {
									// Determine the leave status based on leaveCount and leaveAutoId
									let leaveStatus =
										leave.leaveCount === "1.0"
											? "L"
											: leave.leaveAutoId == 6
												? "0.5U"
												: "0.5L";
									dayRecords[dayKey] = `${dayRecords[dayKey]},${leaveStatus}`; // Append leave status
									//attendanceCount.L++;
									attendanceCount.L += parseFloat(leave.leaveCount);
								}

								if (isDayWorking === "H") {
									dayRecords[dayKey] = `${dayRecords[dayKey]},H`; // Append R for regularization
									attendanceCount.H++; // uncommenting this line 10-10-2024
								}
							} else if (attendancePresentStatus === "absent") {
								dayRecords[dayKey] = "A";
								attendanceCount.A++;

								if (attendanceRecord.latest_Regularization_Request.length > 0) {
									dayRecords[dayKey] = `${dayRecords[dayKey]},R`; // Append R for regularization
									attendanceCount.R++;
								}

								// If there was a leave, append it after regularization
								if (leave) {
									// Determine the leave status based on leaveCount and leaveAutoId
									let leaveStatus =
										leave.leaveCount === "1.0"
											? "L"
											: leave.leaveAutoId == 6
												? "0.5U"
												: "0.5L";
									dayRecords[dayKey] = `${dayRecords[dayKey]},${leaveStatus}`; // Append leave status
									// attendanceCount.L++;
									attendanceCount.L += parseFloat(leave.leaveCount);
								}

								if (isDayWorking === "H") {
									dayRecords[dayKey] = `${dayRecords[dayKey]},H`; // Append R for regularization
									attendanceCount.H++; // uncommenting this line 10-10-2024
								}
							} else if (attendancePresentStatus === "weeklyOff") {
								dayRecords[dayKey] = "W";
								attendanceCount.W++;
							} else {
								// If there are no attendance records, set to '-'
								dayRecords[dayKey] = "H"; // Set to H for holiday
								attendanceCount.H++;
							}
						} else {
							// here need to add record
							// If there are no attendance records, set to '-'
							if (employeeRecord.type == 0) {
								dayRecords[dayKey] = "-"; // Set to W for week off
							} else {
								dayRecords[dayKey] = "H"; // Set to H for holiday
								attendanceCount.H++;
							}
						}
					}
					// If the day is a week off, set status to W
					else if (isDayWorking === "W") {
						const leave = getLeaveForDay(currentDate);
						const attendanceRecord = employeeRecords.find(
							(record) => record.attendanceDate === currentDate,
						);
						if (attendanceRecord) {
							const { attendancePresentStatus } = attendanceRecord;
							// Set attendance based on the presence status
							if (attendancePresentStatus === "present") {
								dayRecords[dayKey] = "P"; // Initially set to P
								//attendanceCount.P++;

								// Check for regularization
								if (attendanceRecord.latest_Regularization_Request.length > 0) {
									dayRecords[dayKey] = `${dayRecords[dayKey]},R`; // Append R for regularization
									attendanceCount.R++;
								}

								// If there was a leave, append it after regularization
								if (leave) {
									// Determine the leave status based on leaveCount and leaveAutoId
									let leaveStatus =
										leave.leaveCount === "1.0"
											? "L"
											: leave.leaveAutoId == 6
												? "0.5U"
												: "0.5L";
									dayRecords[dayKey] = `${dayRecords[dayKey]},${leaveStatus}`; // Append leave status
									//attendanceCount.L++;
									attendanceCount.L += parseFloat(leave.leaveCount);
								}

								if (isDayWorking === "W") {
									dayRecords[dayKey] = `${dayRecords[dayKey]},W`; // Append R for regularization
									attendanceCount.W++; // uncommenting this line 10-10-2024
								}
							} else if (attendancePresentStatus === "singlePunchAbsent") {
								dayRecords[dayKey] = "SA";
								attendanceCount.SA++;

								if (attendanceRecord.latest_Regularization_Request.length > 0) {
									dayRecords[dayKey] = `${dayRecords[dayKey]},R`; // Append R for regularization
									attendanceCount.R++;
								}

								// If there was a leave, append it after regularization
								if (leave) {
									// Determine the leave status based on leaveCount and leaveAutoId
									let leaveStatus =
										leave.leaveCount === "1.0"
											? "L"
											: leave.leaveAutoId == 6
												? "0.5U"
												: "0.5L";
									dayRecords[dayKey] = `${dayRecords[dayKey]},${leaveStatus}`; // Append leave status
									// attendanceCount.L++;
									attendanceCount.L += parseFloat(leave.leaveCount);
								}

								if (isDayWorking === "W") {
									dayRecords[dayKey] = `${dayRecords[dayKey]},W`; // Append R for regularization
									attendanceCount.W++; // uncommenting this line 10-10-2024
								}
							} else if (attendancePresentStatus === "absent") {
								dayRecords[dayKey] = "A";
								attendanceCount.A++;

								if (attendanceRecord.latest_Regularization_Request.length > 0) {
									dayRecords[dayKey] = `${dayRecords[dayKey]},R`; // Append R for regularization
									attendanceCount.R++;
								}

								// If there was a leave, append it after regularization
								if (leave) {
									// Determine the leave status based on leaveCount and leaveAutoId
									let leaveStatus =
										leave.leaveCount === "1.0"
											? "L"
											: leave.leaveAutoId == 6
												? "0.5U"
												: "0.5L";
									dayRecords[dayKey] = `${dayRecords[dayKey]},${leaveStatus}`; // Append leave status
									//attendanceCount.L++;
									attendanceCount.L += parseFloat(leave.leaveCount);
								}

								if (isDayWorking === "W") {
									dayRecords[dayKey] = "W"; //`${dayRecords[dayKey]},W`; // Append R for regularization

									// dayRecords[dayKey] = "W"//${dayRecords[dayKey]},W`; // Append R for regularization
									attendanceCount.W++;
									attendanceCount.A--;
								}
							} else if (attendancePresentStatus === "weeklyOff") {
								dayRecords[dayKey] = "W";
								attendanceCount.W++;
							} else {
								dayRecords[dayKey] = "W"; // Set to W for week off
								attendanceCount.W++;
							}
						} else {
							if (employeeRecord.type == 0) {
								dayRecords[dayKey] = "-"; // Set to W for week off
							} else {
								dayRecords[dayKey] = "W"; // Set to W for week off
								attendanceCount.W++;
							}
						}
					} else {
						// Check for approved leave first
						const leave = getLeaveForDay(currentDate);
						const attendanceRecord = employeeRecords.find(
							(record) => record.attendanceDate === currentDate,
						);

						if (attendanceRecord) {
							const { attendancePresentStatus } = attendanceRecord;

							// Set attendance based on the presence status
							if (attendancePresentStatus === "present") {
								if (
									!currentDay.isBefore(employeeRecord.dateOfJoining) &&
									(!employeeRecord.dateOfexit ||
										!currentDay.isAfter(
											moment(employeeRecord.dateOfexit).format("YYYY-MM-DD"),
										))
								) {
									dayRecords[dayKey] = "P"; // Initially set to P
									attendanceCount.P++;

									// Check for regularization
									if (
										attendanceRecord.latest_Regularization_Request.length > 0
									) {
										dayRecords[dayKey] = `${dayRecords[dayKey]},R`; // Append R for regularization
										attendanceCount.R++;
									}

									// If there was a leave, append it after regularization
									if (leave) {
										// Determine the leave status based on leaveCount and leaveAutoId
										let leaveStatus =
											leave.leaveCount === "1.0"
												? "L"
												: leave.leaveAutoId == 6
													? "0.5U"
													: "0.5L";
										dayRecords[dayKey] = `${dayRecords[dayKey]},${leaveStatus}`; // Append leave status
										//attendanceCount.L++;
										attendanceCount.L += parseFloat(leave.leaveCount);
									}
								}
							} else if (attendancePresentStatus === "singlePunchAbsent") {
								if (
									!currentDay.isBefore(employeeRecord.dateOfJoining) &&
									(!employeeRecord.dateOfexit ||
										!currentDay.isAfter(
											moment(employeeRecord.dateOfexit).format("YYYY-MM-DD"),
										))
								) {
									dayRecords[dayKey] = "SA";
									attendanceCount.SA++;

									if (
										attendanceRecord.latest_Regularization_Request.length > 0
									) {
										dayRecords[dayKey] = `${dayRecords[dayKey]},R`; // Append R for regularization
										attendanceCount.R++;
									}

									// If there was a leave, append it after regularization
									if (leave) {
										// Determine the leave status based on leaveCount and leaveAutoId
										let leaveStatus =
											leave.leaveCount === "1.0"
												? "L"
												: leave.leaveAutoId == 6
													? "0.5U"
													: "0.5L";
										dayRecords[dayKey] = `${dayRecords[dayKey]},${leaveStatus}`; // Append leave status
										//attendanceCount.L++;
										attendanceCount.L += parseFloat(leave.leaveCount);
									}
								}
							} else if (attendancePresentStatus === "absent") {
								if (
									!currentDay.isBefore(employeeRecord.dateOfJoining) &&
									(!employeeRecord.dateOfexit ||
										!currentDay.isAfter(
											moment(employeeRecord.dateOfexit).format("YYYY-MM-DD"),
										))
								) {
									dayRecords[dayKey] = "A";
									attendanceCount.A++;

									if (
										attendanceRecord.latest_Regularization_Request.length > 0
									) {
										dayRecords[dayKey] = `${dayRecords[dayKey]},R`; // Append R for regularization
										attendanceCount.R++;
									}

									// If there was a leave, append it after regularization
									if (leave) {
										// Determine the leave status based on leaveCount and leaveAutoId
										let leaveStatus =
											leave.leaveCount === "1.0"
												? "L"
												: leave.leaveAutoId == 6
													? "0.5U"
													: "0.5L";
										dayRecords[dayKey] = `${dayRecords[dayKey]},${leaveStatus}`; // Append leave status
										//attendanceCount.L++;
										attendanceCount.L += parseFloat(leave.leaveCount);
									}
								}
							} else if (attendancePresentStatus === "weeklyOff") {
								dayRecords[dayKey] = "W";
								attendanceCount.W++;
							} else if (attendancePresentStatus === "leave") {
								dayRecords[dayKey] = "L";
								attendanceCount.L++;
							}
							//  }
						} else {
							// If there are no attendance records, set to '-'
							//dayRecords[dayKey] = "-";
							//If it's a working day
							//new changes

							dayRecords[dayKey] = "A"; // Default to 'A' (Absent)
							// if(currentDay.isBefore(employeeRecord.dateOfJoining)){
							if (currentDay.isBefore(today)) {
								dayRecords[dayKey] = "A"; // For past dates, default to "A" if no data
							} else if (currentDay.isSame(today)) {
								dayRecords[dayKey] = "-"; // For today, set "-" if no data
							} else if (currentDay.isAfter(today)) {
								dayRecords[dayKey] = "-"; // For future dates, return blank
							}
						}
						//}
					}

					// Ensure future or current day shows '-'
					if (currentDay.isAfter(today) || currentDay.isSame(today)) {
						if (!dayRecords[dayKey]) {
							dayRecords[dayKey] = "-"; // Default to '-' for future/current days if not already set
						}
					}

					if (currentDay.isBefore(employeeRecord.dateOfJoining)) {
						// if (currentDay.isSameOrBefore(employeeRecord.dateOfJoining)) {
						// if (currentDay.isBefore(today)) {
						dayRecords[dayKey] = "-"; // For past dates, default to "A" if no data
					}
					//  console.log("currentDay.isAfter",employeeRecord.dateOfexit)
					if (
						currentDay.isAfter(
							moment(employeeRecord.dateOfexit).format("YYYY-MM-DD"),
						)
					) {
						dayRecords[dayKey] = "-"; // For past dates, default to "A" if no data
					}

					if (employeeRecord.type == 0) {
						dayRecords[dayKey] = "-"; // For past dates, default to "A" if no data
					}
				}
				console.log("employeeRecord.empId", employeeRecord.empId);
				const orderedEmployeeRecord = {
					employeeId: employeeRecord.empId,
					name: employeeRecord.name,
					empCode: employeeRecord.empCode,
					dateOfJoining: employeeRecord.dateOfJoining,
					dateOfExit: employeeRecord.dateOfexit,
					...dayRecords,
					P: attendanceCount.P,
					A: attendanceCount.A,
					SA: attendanceCount.SA,
					R: attendanceCount.R,
					L: attendanceCount.L,
					U: attendanceCount.U,
					H: attendanceCount.H,
					W: attendanceCount.W,
					SU: 0,
					C: 0,
					Payroll: attendanceCount.P,
					PayableDays:
						attendanceCount.P +
						attendanceCount.W +
						attendanceCount.H +
						attendanceCount.L,
				};

				finalData.push(orderedEmployeeRecord);
			}
			finalData.sort((a, b) => a.employeeId - b.employeeId);

			if (finalData.length > 0) {
				const timestamp = Date.now();
				const dayColumns = [];

				for (let dayOffset = 0; dayOffset < totalDays; dayOffset++) {
					const currentDay = moment(fromDate).add(dayOffset, "days");
					dayColumns.push({
						label: currentDay.format("DD-MMM"),
						value: currentDay.format("DD"),
					});
				}

				const data = [
					{
						sheet: "Attendance Summary",
						columns: [
							{ label: "Employee Code", value: "empCode" },
							{ label: "Employee Name", value: "name" },
							{ label: "Date Of Joining", value: "dateOfJoining" },
							{ label: "Date Of Exit", value: "dateOfExit" },
							...dayColumns,
							{ label: "P", value: "P" },
							{ label: "A", value: "A" },
							{ label: "SA", value: "SA" },
							{ label: "R", value: "R" },
							{ label: "W", value: "W" },
							{ label: "H", value: "H" },
							{ label: "L", value: "L" },
							{ label: "U", value: "U" },
							{ label: "SYSTEM U", value: "SU" },
							{ label: "C", value: "C" },
							{ label: "P (Payroll)", value: "Payroll" },
							{ label: "Payable Days", value: "PayableDays" },
						],
						content: finalData,
					},
				];

				const buffer = xlsx(data, {
					writeOptions: { type: "buffer", bookType: "xlsx", RTL: true },
				});

				res.writeHead(200, {
					"Content-Type": "application/octet-stream",
					"Content-disposition": `attachment; filename=Attendance Summary_${timestamp}.xlsx`,
				});
				return res.end(buffer);
			} else {
				return respHelper(res, {
					status: 404,
					message: "Data not availble for available dates",
				});
			}
		} catch (error) {
			console.error(error);
			return res.status(500).json({
				status: false,
				message: "Internal Server Error",
			});
		}
	}

	// async employeeMasterExport(req, res) {
	// 	try {
	// 		const {
	// 			search,
	// 			department,
	// 			designation,
	// 			buSearch,
	// 			sbuSearch,
	// 			areaSearch,
	// 			grade,
	// 			attendanceFor,
	// 			employeeType,
	// 			businessUnit,
	// 			companyLocation,
	// 		} = req.query;

	// 		const employeeData = await db.employeeMaster.findAll({
	// 			attributes: [
	// 				"id",
	// 				"empCode",
	// 				"name",
	// 				"email",
	// 				"personalEmail",
	// 				"firstName",
	// 				"lastName",
	// 				"officeMobileNumber",
	// 				"buId",
	// 				"companyId",
	// 				"personalMobileNumber",
	// 				"drivingLicence",
	// 				"passportNumber",
	// 				"lastIncrementDate",
	// 				"iqTestApplicable",
	// 				"positionType",
	// 				"newCustomerName",
	// 				"recruiterName",
	// 				"dataCardAdmin",
	// 				"visitingCardAdmin",
	// 				"workstationAdmin",
	// 				"dateOfexit",
	// 				"isActive",
	// 				"offRoleCTC",
	// 				"ESICPFDeduction",
	// 			],
	// 			where: {
	// 				//empCode: "18950",
	// 				...(attendanceFor == 0 && { isActive: 0 }),
	// 				...(attendanceFor == 1 && { isActive: 1 }),
	// 				...(attendanceFor == 2 && { isActive: [0, 1] }),
	// 				...(search && { id: { [Op.in]: search.split(",") } }),
	// 				...(employeeType && {
	// 					employeeType: { [Op.in]: employeeType.split(",") },
	// 				}),
	// 				...(businessUnit && {
	// 					buId: { [Op.in]: businessUnit.split(",") },
	// 				}),
	// 				...(department && {
	// 					departmentId: { [Op.in]: department.split(",") },
	// 				}),
	// 				...(companyLocation && {
	// 					companyLocationId: { [Op.in]: companyLocation.split(",") },
	// 				}),
	// 			},
	// 			include: [
	// 				{
	// 					model: db.employeeTypeMaster,
	// 					attributes: ["emptypename"],
	// 					required: false,
	// 				},
	// 				{ model: db.biographicalDetails, required: false },
	// 				{
	// 					model: db.emergencyDetails,
	// 					required: false,
	// 				},
	// 				{
	// 					model: db.costCenterMaster,
	// 					attributes: ["costCenterName", "costCenterCode"],
	// 					required: false,
	// 				},
	// 				{
	// 					model: db.designationMaster,
	// 					attributes: ["name", "code"],
	// 					required: !!designation,
	// 				},
	// 				{
	// 					model: db.functionalAreaMaster,
	// 					attributes: ["functionalAreaName", "functionalAreaCode"],
	// 					required: !!areaSearch,
	// 					include: [
	// 						{
	// 							model: db.functionalAreaMaster,
	// 							attributes: ["functionalAreaName", "functionalAreaCode"],
	// 							as: "parentFunctionalArea",
	// 							required: false,
	// 						},
	// 					],
	// 				},
	// 				{
	// 					model: db.departmentMaster,
	// 					attributes: ["departmentName", "departmentCode"],
	// 					required: !!department,
	// 				},
	// 				{
	// 					model: db.jobDetails,
	// 					attributes: [
	// 						"dateOfJoining",
	// 						"residentEng",
	// 						"customerName",
	// 						"projectCode",
	// 					],
	// 					where: { ...(grade && { gradeId: { [Op.in]: grade.split(",") } }) },
	// 					include: [
	// 						{ model: db.gradeMaster, attributes: ["gradeName"] },
	// 						{ model: db.bandMaster, attributes: ["bandDesc"] },
	// 						{
	// 							model: db.jobLevelMaster,
	// 							attributes: ["jobLevelName", "jobLevelCode"],
	// 						},
	// 					],
	// 				},
	// 				{
	// 					model: db.educationDetails,
	// 					attributes: [
	// 						"educationDegree",
	// 						"educationSpecialisation",
	// 						"educationInstitute",
	// 						"educationRemark",
	// 						"educationStartDate",
	// 						"educationCompletionDate",
	// 					],
	// 					where: { isHighestEducation: 1 },
	// 					include: [
	// 						{
	// 							model: db.degreeMaster,
	// 						},
	// 					],
	// 					required: false,
	// 				},
	// 				{
	// 					model: db.familyDetails,
	// 					attributes: [
	// 						"name",
	// 						"dob",
	// 						"gender",
	// 						"mobileNo",
	// 						"relationWithEmp",
	// 					],
	// 					where: { relationWithEmp: ["Father", "Mother"] },
	// 					required: false,
	// 					as: "employeefamilydetails",
	// 				},
	// 				{
	// 					model: db.employeeMaster,
	// 					required: false,
	// 					attributes: ["id", "name", "empCode", "email"],
	// 					as: "managerData",
	// 				},
	// 				{ model: db.buMaster, attributes: ["buName"], required: false },
	// 				{
	// 					model: db.sbuMaster,
	// 					attributes: ["sbuname", "code"],
	// 					required: false,
	// 				},
	// 				{
	// 					model: db.companyLocationMaster,
	// 					attributes: ["address1", "companyLocationCode", "isHeadquarter"],
	// 					include: [
	// 						{ model: db.countryMaster, attributes: ["countryName"] },
	// 						{ model: db.stateMaster, attributes: ["stateName"] },
	// 						{ model: db.cityMaster, attributes: ["cityName"] },
	// 						{ model: db.pinCodeMaster, attributes: ["pincodeId", "pincode"] },
	// 					],
	// 				},
	// 				{
	// 					model: db.companyMaster,
	// 					attributes: ["companyName", "companyCode"],
	// 				},
	// 				{ model: db.shiftMaster, attributes: ["shiftName"] },
	// 				{ model: db.attendancePolicymaster, attributes: ["policyName"] },
	// 				{ model: db.weekOffMaster, attributes: ["weekOffName"] },
	// 				{
	// 					model: db.employeeAddress,
	// 					include: [
	// 						{
	// 							model: db.countryMaster,
	// 							attributes: ["countryId", "countryName"],
	// 							as: "currentcountry",
	// 						},
	// 						{
	// 							model: db.countryMaster,
	// 							attributes: ["countryId", "countryName"],
	// 							as: "permanentcountry",
	// 						},
	// 						{
	// 							model: db.countryMaster,
	// 							attributes: ["countryId", "countryName"],
	// 							as: "emergencycountry",
	// 						},
	// 						{
	// 							model: db.stateMaster,
	// 							attributes: ["stateId", "stateName"],
	// 							as: "currentstate",
	// 						},
	// 						{
	// 							model: db.stateMaster,
	// 							attributes: ["stateId", "stateName"],
	// 							as: "permanentstate",
	// 						},
	// 						{
	// 							model: db.stateMaster,
	// 							attributes: ["stateId", "stateName"],
	// 							as: "emergencystate",
	// 						},
	// 						{
	// 							model: db.cityMaster,
	// 							attributes: ["cityId", "cityName"],
	// 							as: "currentcity",
	// 						},
	// 						{
	// 							model: db.cityMaster,
	// 							attributes: ["cityId", "cityName"],
	// 							as: "permanentcity",
	// 						},
	// 						{
	// 							model: db.cityMaster,
	// 							attributes: ["cityId", "cityName"],
	// 							as: "emergencycity",
	// 						},
	// 						{
	// 							model: db.pinCodeMaster,
	// 							attributes: ["pincodeId", "pincode"],
	// 							as: "currentpincode",
	// 						},
	// 						{
	// 							model: db.pinCodeMaster,
	// 							attributes: ["pincodeId", "pincode"],
	// 							as: "permanentpincode",
	// 						},
	// 						{
	// 							model: db.pinCodeMaster,
	// 							attributes: ["pincodeId", "pincode"],
	// 							as: "emergencypincode",
	// 						},
	// 					],
	// 				},
	// 				{
	// 					model: db.separationMaster,
	// 					include: [
	// 						{
	// 							model: db.separationReason,
	// 							as: "empReasonofResignation",
	// 							attributes: ["separationReason"],
	// 						},
	// 						{
	// 							model: db.separationReason,
	// 							as: "l1ReasonofResignation",
	// 							attributes: ["separationReason"],
	// 						},
	// 						{
	// 							model: db.separationReason,
	// 							attributes: ["separationReason"],
	// 							as: "l2ReasonofSeparation",
	// 						},
	// 						{
	// 							model: db.separationType,
	// 							as: "l2Separationtype",
	// 						},
	// 					],
	// 				},
	// 			],
	// 		});

	// 		const arr = [];
	// 		for (let i = 0; i < employeeData.length; i++) {
	// 			const ele = employeeData[i];
	// 			let headAndHrData = {};
	// 			if (ele.dataValues.buId && ele.dataValues.companyId) {
	// 				headAndHrData =
	// 					(await db.buMapping.findOne({
	// 						where: {
	// 							buId: ele.dataValues.buId,
	// 							companyId: ele.dataValues.companyId,
	// 						},
	// 						include: [
	// 							{
	// 								model: db.employeeMaster,
	// 								attributes: ["id", "name", "empCode", "email"],
	// 								as: "buHeadData",
	// 							},
	// 							{
	// 								model: db.employeeMaster,
	// 								attributes: ["id", "name", "empCode", "email"],
	// 								as: "buhrData",
	// 							},
	// 						],
	// 					})) || {};
	// 			}

	// 			const data = {
	// 				id: ele.dataValues.id || "",
	// 				empCode: ele.dataValues.empCode || "",
	// 				name: ele.dataValues.name || "",
	// 				email: ele.dataValues.email || "",
	// 				personalEmail: ele.dataValues.personalEmail || "",
	// 				firstName: ele.dataValues.firstName || "",
	// 				lastName: ele.dataValues.lastName || "",
	// 				dateOfexit: ele.dataValues.dateOfexit
	// 					? moment(ele.dataValues.dateOfexit).format("DD-MM-YYYY")
	// 					: "",
	// 				officeMobileNumber: ele.dataValues.officeMobileNumber || "",
	// 				personalMobileNumber: ele.dataValues.personalMobileNumber || "",
	// 				manager_code: ele.dataValues.managerData?.empCode || "",
	// 				manager_name: ele.dataValues.managerData?.name || "",
	// 				manager_email_id: ele.dataValues.managerData?.email || "",
	// 				designation_name: ele.dataValues.designationmaster
	// 					? `${ele.dataValues.designationmaster.name || ""} (${
	// 							ele.dataValues.designationmaster.code || ""
	// 						})`.trim()
	// 					: "",
	// 				designation_code: ele.dataValues.designationmaster?.code || "",
	// 				functional_area_name:
	// 					ele.dataValues.functionalareamaster?.functionalAreaName || "",
	// 				functional_area_code:
	// 					ele.dataValues.functionalareamaster?.functionalAreaCode || "",
	// 				parent_functional_area:
	// 					ele.dataValues.functionalareamaster?.parentFunctionalArea
	// 						?.dataValues?.functionalAreaName || "",
	// 				department_name:
	// 					ele.dataValues.departmentmaster?.departmentName || "",
	// 				department_code:
	// 					ele.dataValues.departmentmaster?.departmentCode || "",
	// 				bu_name: ele.dataValues.bumaster?.buName || "",
	// 				sbu_name: ele.dataValues.sbumaster?.dataValues.sbuname || "",
	// 				sbu_code: ele.dataValues.sbumaster?.dataValues.code || "",

	// 				grade: ele.employeejobdetail?.grademaster?.gradeName || "",
	// 				band: ele.employeejobdetail?.bandmaster?.bandDesc || "",
	// 				jobLevel: ele.employeejobdetail?.joblevelmaster?.jobLevelName || "",
	// 				jobLevelCode:
	// 					ele.employeejobdetail?.joblevelmaster?.jobLevelCode || "",
	// 				costCenter:
	// 					ele.costcentermaster?.costCenterName +
	// 						" " +
	// 						ele.costcentermaster?.costCenterCode || "",
	// 				dateOfJoining: ele.employeejobdetail?.dateOfJoining
	// 					? moment(ele.employeejobdetail.dateOfJoining).format("DD-MM-YYYY")
	// 					: "",
	// 				residentEng: ele.employeejobdetail?.residentEng || "",
	// 				customerName: ele.employeejobdetail?.customerName || "",
	// 				fathersName:
	// 					ele.employeefamilydetails.find(
	// 						(f) => f.relationWithEmp === "Father",
	// 					)?.name || "",
	// 				motherName:
	// 					ele.employeefamilydetails.find(
	// 						(m) => m.relationWithEmp === "Mother",
	// 					)?.name || "",
	// 				nationality: ele.employeebiographicaldetail?.nationality || "",
	// 				maritalStatus: ele.employeebiographicaldetail?.maritalStatus
	// 					? Object.keys(maritalStatusOptions).find(
	// 							(key) =>
	// 								maritalStatusOptions[key] ===
	// 								ele.employeebiographicaldetail.maritalStatus,
	// 						) || ""
	// 					: "",
	// 				maritalStatusSince:
	// 					ele.employeebiographicaldetail.maritalStatusSince || "",
	// 				gender: ele.employeebiographicaldetail?.gender,
	// 				dateOfBirth: ele.employeebiographicaldetail?.dateOfBirth
	// 					? moment(ele.employeebiographicaldetail.dateOfBirth).format(
	// 							"DD-MM-YYYY",
	// 						)
	// 					: "",
	// 				office_country: ele.companylocationmaster?.countrymaster?.countryName,
	// 				office_state: ele.companylocationmaster?.statemaster?.stateName,
	// 				office_city: ele.companylocationmaster?.citymaster?.cityName,
	// 				employeeType: ele.employeetypemaster?.emptypename || "",
	// 				groupCompany: ele.companymaster?.companyName || "",
	// 				groupCode: ele.companymaster?.companyCode || "",
	// 				passportNumber: ele.dataValues.passportNumber || "",
	// 				drivingLicence: ele.dataValues.drivingLicence || "",
	// 				isActive: ele.dataValues.isActive == 1 ? "Active" : "In Active",
	// 				lastIncrementDate: ele.dataValues.lastIncrementDate
	// 					? moment(ele.dataValues.lastIncrementDate).format("DD-MM-YYYY")
	// 					: "",
	// 				iqTestApplicable: ele.dataValues.iqTestApplicable == 0 ? "No" : "Yes",
	// 				highestQualification:
	// 					ele.employeeeducationdetails.length > 0
	// 						? ele.employeeeducationdetails[0].degreemaster.degreeName
	// 						: "",
	// 				positionType: ele.dataValues.positionType,
	// 				newCustomerName: ele.dataValues.newCustomerName,
	// 				shiftName: ele.shiftsmaster?.shiftName || "",
	// 				attendancePolicymaster: ele.attendancePolicymaster?.policyName || "",
	// 				weekOffMaster: ele.weekOffMaster?.weekOffName || "",
	// 				buhrData: headAndHrData.buhrData,
	// 				hrbpCode:
	// 					ele.dataValues.buId && ele.dataValues.companyId
	// 						? headAndHrData?.buhrData?.empCode
	// 						: "", //ele.dataValues?.buhrData?.empCode || "",
	// 				hrbpName:
	// 					ele.dataValues.buId && ele.dataValues.companyId
	// 						? headAndHrData?.buhrData?.name
	// 						: "", //ele.dataValues.buhrData?.name,
	// 				// first_exp:
	// 				//   ele.dataValues.buId && ele.dataValues.companyId
	// 				//     ? headAndHrData?.buhrData?.name
	// 				//     : "",
	// 				hrbpEmail:
	// 					ele.dataValues.buId && ele.dataValues.companyId
	// 						? headAndHrData?.buhrData?.email
	// 						: "", //ele.dataValues.buhrData?.email,
	// 				// second_exp:
	// 				//   ele.dataValues.buId && ele.dataValues.companyId
	// 				//     ? headAndHrData?.buhrData?.email
	// 				//     : "",
	// 				buHeadName:
	// 					ele.dataValues.buId && ele.dataValues.companyId
	// 						? headAndHrData?.buHeadData?.name
	// 						: "", //ele.dataValues.buHeadData?.name,
	// 				// third_exp:
	// 				//   ele.dataValues.buId && ele.dataValues.companyId
	// 				//     ? headAndHrData?.buHeadData?.name
	// 				//     : "",
	// 				emergencyContactRelation:
	// 					ele.employeeemergencycontact?.emergencyContactRelation || "",
	// 				emergencyBloodGroup:
	// 					ele.employeeemergencycontact?.emergencyBloodGroup || "",
	// 				emergencyContactNumber:
	// 					ele.employeeemergencycontact?.emergencyContactNumber || "",
	// 				recruiterName: ele.dataValues.recruiterName || "",
	// 				mobileAccess:
	// 					ele.employeebiographicaldetail?.mobileAccess == 0 ? "No" : "Yes",
	// 				laptopSystem: ele.employeebiographicaldetail?.laptopSystem || "",
	// 				backgroundVerification:
	// 					ele.employeebiographicaldetail?.backgroundVerification == 0
	// 						? "No"
	// 						: "Yes",
	// 				dataCardAdmin: ele.dataValues.dataCardAdmin == 0 ? "No" : "Yes",
	// 				visitingCardAdmin:
	// 					ele.dataValues.visitingCardAdmin == 0 ? "No" : "Yes",
	// 				workstationAdmin: ele.dataValues.workstationAdmin == 0 ? "No" : "Yes",
	// 				buHeadCode:
	// 					ele.dataValues.buId && ele.dataValues.companyId
	// 						? headAndHrData?.buHeadData?.empCode
	// 						: "", //ele.dataValues.buHeadData?.empCode,
	// 				nomineeName: ele.employeebiographicaldetail?.nomineeName || "",
	// 				nomineeRelation:
	// 					ele.employeebiographicaldetail?.nomineeRelation || "",
	// 				offRoleCTC: ele.dataValues.offRoleCTC || "",
	// 				ESICPFDeduction: ele.dataValues.ESICPFDeduction || "",

	// 				anniversary_date: ele.employeebiographicaldetail?.dataValues
	// 					?.maritalStatusSince
	// 					? moment(
	// 							ele.employeebiographicaldetail?.dataValues?.maritalStatusSince,
	// 						).format("DD-MM-YYYY")
	// 					: "",

	// 				location_type:
	// 					ele.companylocationmaster?.isHeadquarter === true
	// 						? "Head Office"
	// 						: "Branch",
	// 				work_area: ele.companylocationmaster?.dataValues
	// 					? [
	// 							ele.companylocationmaster?.dataValues?.address1 || "",
	// 							ele.companylocationmaster?.dataValues?.currentcity?.cityName ||
	// 								"",
	// 							ele.companylocationmaster?.dataValues?.currentstate
	// 								?.stateName || "",
	// 							ele.companylocationmaster?.dataValues?.currentcountry
	// 								?.countryName || "",
	// 							ele.companylocationmaster?.dataValues?.pincodmaster?.pincode
	// 								?.pincode || "",
	// 						]
	// 							.filter((item) => item.trim() !== "") // filter out empty or whitespace-only strings
	// 							.join(", ")
	// 					: "",
	// 				work_area_code:
	// 					ele.companylocationmaster?.dataValues?.companyLocationCode || "",

	// 				date_of_confirmation: "",
	// 				date_of_resignation: ele.separationmaster
	// 					? moment(ele.separationmaster.resignationDate).format("DD-MM-YYYY")
	// 					: "",
	// 				// exit_date: ele.separationmaster
	// 				// ?ele.separationmaster.l2LastWorkingDay? moment(ele.separationmaster.l2LastWorkingDay).format("DD-MM-YYYY")
	// 				// : "":"",
	// 				exit_type:
	// 					ele.separationmaster?.l2Separationtype?.separationTypeName || "",
	// 				//  exit_reason: ele.separationmaster?.empReasonofResignation?.separationReason || "",
	// 				admin_exit_reason:
	// 					ele.separationmaster?.l2ReasonofSeparation?.separationReason || "",
	// 				// customer_code:"",
	// 				project_code: ele.employeejobdetail?.projectCode || "",
	// 				customer_code: ele.employeejobdetail?.dataValues?.customerName
	// 					? (ele.employeejobdetail.dataValues.customerName.match(/(C\d+)/) ||
	// 							[])[1] || ""
	// 					: "",
	// 				current_address: ele.employeeaddress?.dataValues
	// 					? [
	// 							ele.employeeaddress?.dataValues?.currentHouse || "",
	// 							ele.employeeaddress?.dataValues?.currentStreet || "",
	// 							ele.employeeaddress?.dataValues?.currentLandmark || "",
	// 							ele.employeeaddress?.dataValues?.currentcity?.cityName || "",
	// 							ele.employeeaddress?.dataValues?.currentstate?.stateName || "",
	// 							ele.employeeaddress?.dataValues?.currentcountry?.countryName ||
	// 								"",
	// 							ele.employeeaddress?.dataValues?.currentpincode?.pincode || "",
	// 						]
	// 							.filter((item) => item.trim() !== "") // filter out empty or whitespace-only strings
	// 							.join(", ")
	// 					: "",
	// 				permanent_address: ele.employeeaddress?.dataValues
	// 					? [
	// 							ele.employeeaddress?.dataValues?.permanentHouse || "",
	// 							ele.employeeaddress?.dataValues?.permanentStreet || "",
	// 							ele.employeeaddress?.dataValues?.permanentLandmark || "",
	// 							ele.employeeaddress?.dataValues?.permanentcity?.cityName || "",
	// 							ele.employeeaddress?.dataValues?.permanentstate?.stateName ||
	// 								"",
	// 							ele.employeeaddress?.dataValues?.permanentcountry
	// 								?.countryName || "",
	// 							ele.employeeaddress?.dataValues?.permanentpincode?.pincode ||
	// 								"",
	// 						]
	// 							.filter((item) => item.trim() !== "") // filter out empty or whitespace-only strings
	// 							.join(", ")
	// 					: "",
	// 			};

	// 			arr.push(data);
	// 		}

	// 		if (arr.length > 0) {
	// 			const timestamp = moment().format("h:mm A");

	// 			const data = [
	// 				{
	// 					sheet: "Employee",
	// 					columns: [
	// 						{ label: "Employee Code", value: "empCode" },
	// 						{ label: "Employee Status", value: "isActive" },
	// 						{ label: "Full Name", value: "name" },
	// 						{ label: "Email", value: "email" },
	// 						{ label: "Personal Email", value: "personalEmail" },
	// 						{ label: "Office_Mobile_Number", value: "officeMobileNumber" },
	// 						{
	// 							label: "Personal_Mobile_Number",
	// 							value: "personalMobileNumber",
	// 						},
	// 						{ label: "Business Unit", value: "bu_name" },
	// 						{ label: "Business Unit Head", value: "buHeadName" },
	// 						{ label: "Business Unit Head Code", value: "buHeadCode" },
	// 						{ label: "Direct Manager Name", value: "manager_name" },
	// 						{ label: "Direct Manager Code", value: "manager_code" },
	// 						{ label: "Direct Manager Email Id", value: "manager_email_id" },
	// 						{ label: "HRBP Code", value: "hrbpCode" },
	// 						{ label: "HRBP Name", value: "hrbpName" },
	// 						{ label: "HRBP Email", value: "hrbpEmail" },
	// 						{ label: "Designation", value: "designation_name" },
	// 						{ label: "Designation Code", value: "designation_code" },
	// 						{ label: "Functional Area Name", value: "functional_area_name" },
	// 						{ label: "Functional Area Code", value: "functional_area_code" },
	// 						{
	// 							label: "Parent Functional Area",
	// 							value: "parent_functional_area",
	// 						},

	// 						{ label: "Department", value: "department_name" },
	// 						{ label: "Department Code", value: "department_code" },
	// 						{ label: "Sbu Name", value: "sbu_name" },
	// 						{ label: "Sbu Code", value: "sbu_code" },
	// 						{ label: "Grade", value: "grade" },
	// 						{ label: "Band", value: "band" },
	// 						{ label: "Job Level", value: "jobLevel" },
	// 						{ label: "Job Level Code", value: "jobLevelCode" },
	// 						{ label: "Cost Center", value: "costCenter" },
	// 						{ label: "Date of Joining", value: "dateOfJoining" },
	// 						{ label: "Resident Engineer", value: "residentEng" },
	// 						{ label: "Father's Name", value: "fathersName" },
	// 						{ label: "Mother's Name", value: "motherName" },
	// 						{ label: "Nationality", value: "nationality" },
	// 						{ label: "Marital Status", value: "maritalStatus" },
	// 						{ label: "Gender", value: "gender" },
	// 						{ label: "Date of Birth", value: "dateOfBirth" },
	// 						{ label: "Country", value: "office_country" },
	// 						{ label: "State", value: "office_state" },
	// 						{ label: "City", value: "office_city" },
	// 						{ label: "Employee Type", value: "employeeType" },
	// 						{ label: "Group Company", value: "groupCompany" },
	// 						{ label: "Group Code", value: "groupCode" },
	// 						{ label: "Passport Number", value: "passportNumber" },
	// 						{ label: "Driving Licence", value: "drivingLicence" },
	// 						{ label: "Last Increment Date", value: "lastIncrementDate" },
	// 						{ label: "Highest Qualification", value: "highestQualification" },
	// 						{ label: "IQ Test Applicable", value: "iqTestApplicable" },
	// 						{ label: "Attendance Shift", value: "shiftName" },
	// 						{ label: "Attendance Policy", value: "attendancePolicymaster" },
	// 						{ label: "Attendance Week Off", value: "weekOffMaster" },
	// 						{ label: "customerName", value: "customerName" },
	// 						{ label: "Position Type", value: "positionType" },
	// 						{ label: "New Customer Name", value: "newCustomerName" },
	// 						{
	// 							label: "Emergency Relation",
	// 							value: "emergencyContactRelation",
	// 						},
	// 						{ label: "Emergency Blood Group", value: "emergencyBloodGroup" },
	// 						{ label: "Emergency Contact", value: "emergencyContactNumber" },
	// 						{ label: "Recruiter Name", value: "recruiterName" },
	// 						{ label: "Laptop System", value: "laptopSystem" },
	// 						{
	// 							label: "Background Verification",
	// 							value: "backgroundVerification",
	// 						},
	// 						{ label: "Mobile (Admin)", value: "mobileAccess" },
	// 						{ label: "Data Card (Admin)", value: "dataCardAdmin" },
	// 						{ label: "Visiting Card (Admin)", value: "visitingCardAdmin" },
	// 						{ label: "Workstation (Admin)", value: "workstationAdmin" },
	// 						{ label: "Nominee Name", value: "nomineeName" },
	// 						{ label: "Date Of Exit", value: "dateOfexit" },
	// 						{ label: "Off Role CTC", value: "offRoleCTC" },
	// 						{ label: "ESIC PF Deduction", value: "ESICPFDeduction" },
	// 						{ label: "Anniversary Date", value: "anniversary_date" },
	// 						{ label: "Location Type", value: "location_type" },
	// 						{ label: "Work Area", value: "work_area" },
	// 						{ label: "Work Area Code", value: "work_area_code" },
	// 						{ label: "Date Of Confirmation", value: "date_of_confirmation" },
	// 						{ label: "Date Of Resignation", value: "date_of_resignation" },
	// 						// { label: "Exit Date", value: "exit_date" },
	// 						{ label: "Exit Type", value: "exit_type" },
	// 						// { label: "Exit Reason", value: "exit_reason" },
	// 						{ label: "Admin Exit Reason", value: "admin_exit_reason" },
	// 						{ label: "Customer Code", value: "customer_code" },
	// 						{ label: "Project Code", value: "project_code" },
	// 						{ label: "Current Address", value: "current_address" },
	// 						{ label: "permanent Address", value: "permanent_address" },
	// 					],
	// 					content: arr,
	// 				},
	// 			];

	// 			const settings = {
	// 				fileName: `Employee_Master_${timestamp}`,
	// 				extraLength: 3,
	// 				writeOptions: {
	// 					type: "buffer",
	// 					bookType: "xlsx",
	// 				},
	// 			};

	// 			const report = xlsx(data, settings);
	// 			res.setHeader(
	// 				"Content-Disposition",
	// 				`attachment; filename=Employee_Master_${timestamp}.xlsx`,
	// 			);
	// 			res.end(report);
	// 		} else {
	// 			res.status(404).json({
	// 				message: "Data not found",
	// 			});
	// 		}
	// 	} catch (error) {
	// 		console.error("Error:", error);
	// 		res.status(500).json({
	// 			message: "An error occurred while exporting employee master data",
	// 		});
	// 	}
	// }
	async employeeMasterExport(req, res) {
		try {
			const {
				search,
				department,
				designation,
				buSearch,
				sbuSearch,
				areaSearch,
				grade,
				attendanceFor,
				employeeType,
				businessUnit,
				companyLocation,
				companyId,
				managerId,
				reporteIds,
			} = req.query;

			let buFIlter = {};
			let sbbuFIlter = {};
			let functionAreaFIlter = {};
			let departmentFIlter = {};
			let designationFIlter = {};
			let companyFIlter = {};
			const usersData = req.userData;

			let employeeDataExisting = [];
			if (usersData.role_id == 4 || usersData.role_id == 5) {
				let permissionAssignTousers = [];
				if (usersData.permissionAndAccess) {
					permissionAssignTousers = usersData.permissionAndAccess
						.split(",")
						.map((el) => parseInt(el));
				}
				let permissionAndAccess = await db.permissoinandaccess.findAll({
					where: {
						role_id: usersData.role_id,
						isActive: 1,
						permissoinandaccessId: {
							[Op.in]: permissionAssignTousers,
						},
					},
				}); /// get all permission of access to fetch list with active status as per role
				const buArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "BU")
					.map((obj) => obj.permissionValue); // checking BU Access

				if (buArrayForFilter.length > 0) {
					buFIlter.buId = {
						///appedning Bu to filter
						[Op.in]: buArrayForFilter,
					};
				}

				const sbuArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "SBU")
					.map((obj) => obj.permissionValue); // checking SBU Access
				if (sbuArrayForFilter.length > 0) {
					sbbuFIlter.sbuId = {
						///appedning SBU to filter
						[Op.in]: sbuArrayForFilter,
					};
				}

				const departmentArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "DEPARTMENT")
					.map((obj) => obj.permissionValue); // checking department Access

				if (departmentArrayForFilter.length > 0) {
					departmentFIlter.departmentId = {
						///appedning department to filter
						[Op.in]: departmentArrayForFilter,
					};
				}
				const funcareaArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "FUNCAREA")
					.map((obj) => obj.permissionValue); // checking SBU Access

				if (funcareaArrayForFilter.length > 0) {
					functionAreaFIlter.functionalAreaId = {
						///appedning SBU to filter
						[Op.in]: funcareaArrayForFilter,
					};
				}

				const designationArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "DESIGNATION")
					.map((obj) => obj.permissionValue); // checking SBU Access

				if (designationArrayForFilter.length > 0) {
					designationFIlter.designationId = {
						///appedning SBU to filter
						[Op.in]: designationArrayForFilter,
					};
				}
				const comapnyArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "COMPANY")
					.map((obj) => obj.permissionValue); // checking SBU Access

				if (comapnyArrayForFilter.length > 0) {
					companyFIlter.companyId = {
						///appedning SBU to filter
						[Op.in]: comapnyArrayForFilter,
					};
				}
			}

			employeeDataExisting = await db.employeeMaster.findAll({
				attributes: [
					"id",
					"empCode",
					"name",
					"email",
					"personalEmail",
					"firstName",
					"lastName",
					"officeMobileNumber",
					"buId",
					"companyId",
					"personalMobileNumber",
					"drivingLicence",
					"passportNumber",
					"lastIncrementDate",
					"iqTestApplicable",
					"positionType",
					"newCustomerName",
					"recruiterName",
					"dataCardAdmin",
					"visitingCardAdmin",
					"workstationAdmin",
					"dateOfexit",
					"isActive",
					"offRoleCTC",
					"ESICPFDeduction",
				],
				where: {
					//empCode: "18950",
					companyId: companyId,
					...(managerId && { manager: managerId }),
					...(reporteIds && {
						id: { [Op.in]: reporteIds.split(",") },
					}),
					...(attendanceFor == 0 && { isActive: 0 }),
					...(attendanceFor == 1 && { isActive: 1 }),
					...(attendanceFor == 2 && { isActive: [0, 1] }),
					...(search && { id: { [Op.in]: search.split(",") } }),
					...(employeeType && {
						employeeType: { [Op.in]: employeeType.split(",") },
					}),
					...(businessUnit && {
						buId: { [Op.in]: businessUnit.split(",") },
					}),
					...(department && {
						departmentId: { [Op.in]: department.split(",") },
					}),
					...(companyLocation && {
						companyLocationId: { [Op.in]: companyLocation.split(",") },
					}),
				},
				include: [
					{
						model: db.employeeTypeMaster,
						attributes: ["emptypename"],
						required: false,
					},
					{ model: db.biographicalDetails, required: false },
					{
						model: db.emergencyDetails,
						required: false,
					},
					{
						model: db.costCenterMaster,
						attributes: ["costCenterName", "costCenterCode"],
						required: false,
					},
					{
						model: db.designationMaster,
						attributes: ["name", "code"],
						where: {
							...designationFIlter,
						},
						required: !!designation,
					},
					{
						model: db.functionalAreaMaster,
						attributes: ["functionalAreaName", "functionalAreaCode"],
						where: {
							...functionAreaFIlter,
						},
						required: !!areaSearch,
						include: [
							{
								model: db.functionalAreaMaster,
								attributes: ["functionalAreaName", "functionalAreaCode"],
								as: "parentFunctionalArea",
								required: false,
							},
						],
					},
					{
						model: db.departmentMaster,
						attributes: ["departmentName", "departmentCode"],
						where: {
							...departmentFIlter,
						},
						required: true,
					},
					{
						model: db.jobDetails,
						attributes: [
							"dateOfJoining",
							"residentEng",
							"customerName",
							"customerCode",
							"projectCode",
						],
						where: { ...(grade && { gradeId: { [Op.in]: grade.split(",") } }) },
						include: [
							{ model: db.gradeMaster, attributes: ["gradeName"] },
							{ model: db.bandMaster, attributes: ["bandDesc"] },
							{
								model: db.jobLevelMaster,
								attributes: ["jobLevelName", "jobLevelCode"],
							},
						],
					},
					{
						model: db.educationDetails,
						attributes: [
							"educationDegree",
							"educationSpecialisation",
							"educationInstitute",
							"educationRemark",
							"educationStartDate",
							"educationCompletionDate",
						],
						where: { isHighestEducation: 1 },
						include: [
							{
								model: db.degreeMaster,
							},
						],
						required: false,
					},
					{
						model: db.familyDetails,
						attributes: [
							"name",
							"dob",
							"gender",
							"mobileNo",
							"relationWithEmp",
						],
						where: { relationWithEmp: ["Father", "Mother"] },
						required: false,
						as: "employeefamilydetails",
					},
					{
						model: db.employeeMaster,
						required: false,
						attributes: ["id", "name", "empCode", "email"],
						as: "managerData",
					},
					{
						model: db.buMaster,
						attributes: ["buName"],
						where: {
							...buFIlter,
						},
						required: true,
					},
					{
						model: db.sbuMaster,
						attributes: ["sbuname", "code"],
						where: {
							...sbbuFIlter,
						},
						required: false,
					},
					{
						model: db.companyLocationMaster,
						attributes: ["address1", "companyLocationCode", "isHeadquarter"],
						include: [
							{ model: db.countryMaster, attributes: ["countryName"] },
							{ model: db.stateMaster, attributes: ["stateName"] },
							{ model: db.cityMaster, attributes: ["cityName"] },
							{ model: db.pinCodeMaster, attributes: ["pincodeId", "pincode"] },
						],
						// where: {
						// 	...companyFIlter,
						// },
					},
					{
						model: db.companyMaster,
						attributes: ["companyName", "companyCode"],
						// where: {
						// 	...companyFIlter,
						// },
					},
					{ model: db.shiftMaster, attributes: ["shiftName"] },
					{ model: db.attendancePolicymaster, attributes: ["policyName"] },
					{ model: db.weekOffMaster, attributes: ["weekOffName"] },
					{
						model: db.employeeAddress,
						include: [
							{
								model: db.countryMaster,
								attributes: ["countryId", "countryName"],
								as: "currentcountry",
							},
							{
								model: db.countryMaster,
								attributes: ["countryId", "countryName"],
								as: "permanentcountry",
							},
							{
								model: db.countryMaster,
								attributes: ["countryId", "countryName"],
								as: "emergencycountry",
							},
							{
								model: db.stateMaster,
								attributes: ["stateId", "stateName"],
								as: "currentstate",
							},
							{
								model: db.stateMaster,
								attributes: ["stateId", "stateName"],
								as: "permanentstate",
							},
							{
								model: db.stateMaster,
								attributes: ["stateId", "stateName"],
								as: "emergencystate",
							},
							{
								model: db.cityMaster,
								attributes: ["cityId", "cityName"],
								as: "currentcity",
							},
							{
								model: db.cityMaster,
								attributes: ["cityId", "cityName"],
								as: "permanentcity",
							},
							{
								model: db.cityMaster,
								attributes: ["cityId", "cityName"],
								as: "emergencycity",
							},
							// {
							// 	model: db.pinCodeMaster,
							// 	attributes: ["pincodeId", "pincode"],
							// 	as: "currentpincode",
							// },
							// {
							// 	model: db.pinCodeMaster,
							// 	attributes: ["pincodeId", "pincode"],
							// 	as: "permanentpincode",
							// },
							// {
							// 	model: db.pinCodeMaster,
							// 	attributes: ["pincodeId", "pincode"],
							// 	as: "emergencypincode",
							// },
						],
					},
					{
						model: db.separationMaster,
						include: [
							{
								model: db.separationReason,
								as: "empReasonofResignation",
								attributes: ["separationReason"],
							},
							{
								model: db.separationReason,
								as: "l1ReasonofResignation",
								attributes: ["separationReason"],
							},
							{
								model: db.separationReason,
								attributes: ["separationReason"],
								as: "l2ReasonofSeparation",
							},
							{
								model: db.separationType,
								as: "l2Separationtype",
							},
						],
					},
				],
			});

			const arr = [];
			for (let i = 0; i < employeeDataExisting.length; i++) {
				const ele = employeeDataExisting[i];
				let headAndHrData = {};
				if (ele.dataValues.buId && ele.dataValues.companyId) {
					headAndHrData =
						(await db.buMapping.findOne({
							where: {
								buId: ele.dataValues.buId,
								companyId: ele.dataValues.companyId,
							},
							include: [
								{
									model: db.employeeMaster,
									attributes: ["id", "name", "empCode", "email"],
									as: "buHeadData",
								},
								{
									model: db.employeeMaster,
									attributes: ["id", "name", "empCode", "email"],
									as: "buhrData",
								},
							],
						})) || {};
				}
				//console.log(ele.employeeaddress.currentPincodeId,"ele.employeeaddress");
				const data = {
					id: ele.dataValues.id || "",
					empCode: ele.dataValues.empCode || "",
					name: ele.dataValues.name || "",
					email: ele.dataValues.email || "",
					personalEmail: ele.dataValues.personalEmail || "",
					firstName: ele.dataValues.firstName || "",
					lastName: ele.dataValues.lastName || "",
					dateOfexit: ele.dataValues.dateOfexit
						? moment(ele.dataValues.dateOfexit).format("DD-MM-YYYY")
						: "",
					officeMobileNumber: ele.dataValues.officeMobileNumber || "",
					personalMobileNumber: ele.dataValues.personalMobileNumber || "",
					manager_code: ele.dataValues.managerData?.empCode || "",
					manager_name: ele.dataValues.managerData?.name || "",
					manager_email_id: ele.dataValues.managerData?.email || "",
					designation_name: ele.dataValues.designationmaster
						? `${ele.dataValues.designationmaster.name || ""} (${
								ele.dataValues.designationmaster.code || ""
							})`.trim()
						: "",
					designation_code: ele.dataValues.designationmaster?.code || "",
					functional_area_name:
						ele.dataValues.functionalareamaster?.functionalAreaName || "",
					functional_area_code:
						ele.dataValues.functionalareamaster?.functionalAreaCode || "",
					parent_functional_area:
						ele.dataValues.functionalareamaster?.parentFunctionalArea
							?.dataValues?.functionalAreaName || "",
					department_name:
						ele.dataValues.departmentmaster?.departmentName || "",
					department_code:
						ele.dataValues.departmentmaster?.departmentCode || "",
					bu_name: ele.dataValues.bumaster?.buName || "",
					sbu_name: ele.dataValues.sbumaster?.dataValues.sbuname || "",
					sbu_code: ele.dataValues.sbumaster?.dataValues.code || "",

					grade: ele.employeejobdetail?.grademaster?.gradeName || "",
					band: ele.employeejobdetail?.bandmaster?.bandDesc || "",
					jobLevel: ele.employeejobdetail?.joblevelmaster?.jobLevelName || "",
					jobLevelCode:
						ele.employeejobdetail?.joblevelmaster?.jobLevelCode || "",
					costCenter:
						ele.costcentermaster?.costCenterName +
							" " +
							ele.costcentermaster?.costCenterCode || "",
					dateOfJoining: ele.employeejobdetail?.dateOfJoining
						? moment(ele.employeejobdetail.dateOfJoining).format("DD-MM-YYYY")
						: "",
					residentEng: ele.employeejobdetail?.residentEng == 1 ? "Yes" : "No",
					customerName: ele.employeejobdetail?.customerName || "",
					fathersName:
						ele.employeefamilydetails.find(
							(f) => f.relationWithEmp === "Father",
						)?.name || "",
					motherName:
						ele.employeefamilydetails.find(
							(m) => m.relationWithEmp === "Mother",
						)?.name || "",
					nationality: ele.employeebiographicaldetail?.nationality || "",
					maritalStatus: ele.employeebiographicaldetail?.maritalStatus
						? Object.keys(maritalStatusOptions).find(
								(key) =>
									maritalStatusOptions[key] ===
									ele.employeebiographicaldetail.maritalStatus,
							) || ""
						: "",
					maritalStatusSince:
						ele.employeebiographicaldetail.maritalStatusSince || "",
					gender: ele.employeebiographicaldetail?.gender,
					dateOfBirth: ele.employeebiographicaldetail?.dateOfBirth
						? moment(ele.employeebiographicaldetail.dateOfBirth).format(
								"DD-MM-YYYY",
							)
						: "",
					office_country: ele.companylocationmaster?.countrymaster?.countryName,
					office_state: ele.companylocationmaster?.statemaster?.stateName,
					office_city: ele.companylocationmaster?.citymaster?.cityName,
					employeeType: ele.employeetypemaster?.emptypename || "",
					groupCompany: ele.companymaster?.companyName || "",
					groupCode: ele.companymaster?.companyCode || "",
					passportNumber: ele.dataValues.passportNumber || "",
					drivingLicence: ele.dataValues.drivingLicence || "",
					isActive: ele.dataValues.isActive == 1 ? "Active" : "In Active",
					lastIncrementDate: ele.dataValues.lastIncrementDate
						? moment(ele.dataValues.lastIncrementDate).format("DD-MM-YYYY")
						: "",
					iqTestApplicable: ele.dataValues.iqTestApplicable == 0 ? "No" : "Yes",
					highestQualification:
						ele.employeeeducationdetails.length > 0
							? ele.employeeeducationdetails[0].degreemaster.degreeName
							: "",
					positionType: ele.dataValues.positionType,
					newCustomerName: ele.dataValues.newCustomerName,
					shiftName: ele.shiftsmaster?.shiftName || "",
					attendancePolicymaster: ele.attendancePolicymaster?.policyName || "",
					weekOffMaster: ele.weekOffMaster?.weekOffName || "",
					buhrData: headAndHrData.buhrData,
					hrbpCode:
						ele.dataValues.buId && ele.dataValues.companyId
							? headAndHrData?.buhrData?.empCode
							: "", //ele.dataValues?.buhrData?.empCode || "",
					hrbpName:
						ele.dataValues.buId && ele.dataValues.companyId
							? headAndHrData?.buhrData?.name
							: "", //ele.dataValues.buhrData?.name,
					// first_exp:
					//   ele.dataValues.buId && ele.dataValues.companyId
					//     ? headAndHrData?.buhrData?.name
					//     : "",
					hrbpEmail:
						ele.dataValues.buId && ele.dataValues.companyId
							? headAndHrData?.buhrData?.email
							: "", //ele.dataValues.buhrData?.email,
					// second_exp:
					//   ele.dataValues.buId && ele.dataValues.companyId
					//     ? headAndHrData?.buhrData?.email
					//     : "",
					buHeadName:
						ele.dataValues.buId && ele.dataValues.companyId
							? headAndHrData?.buHeadData?.name
							: "", //ele.dataValues.buHeadData?.name,
					// third_exp:
					//   ele.dataValues.buId && ele.dataValues.companyId
					//     ? headAndHrData?.buHeadData?.name
					//     : "",
					emergencyContactRelation:
						ele.employeeemergencycontact?.emergencyContactRelation || "",
					emergencyBloodGroup:
						ele.employeeemergencycontact?.emergencyBloodGroup || "",
					emergencyContactNumber:
						ele.employeeemergencycontact?.emergencyContactNumber || "",
					recruiterName: ele.dataValues.recruiterName || "",
					mobileAccess:
						ele.employeebiographicaldetail?.mobileAccess == 0 ? "No" : "Yes",
					laptopSystem: ele.employeebiographicaldetail?.laptopSystem || "",
					backgroundVerification:
						ele.employeebiographicaldetail?.backgroundVerification == 0
							? "No"
							: "Yes",
					dataCardAdmin: ele.dataValues.dataCardAdmin == 0 ? "No" : "Yes",
					visitingCardAdmin:
						ele.dataValues.visitingCardAdmin == 0 ? "No" : "Yes",
					workstationAdmin: ele.dataValues.workstationAdmin == 0 ? "No" : "Yes",
					buHeadCode:
						ele.dataValues.buId && ele.dataValues.companyId
							? headAndHrData?.buHeadData?.empCode
							: "", //ele.dataValues.buHeadData?.empCode,
					nomineeName: ele.employeebiographicaldetail?.nomineeName || "",
					nomineeRelation:
						ele.employeebiographicaldetail?.nomineeRelation || "",
					offRoleCTC: ele.dataValues.offRoleCTC || "",
					ESICPFDeduction: ele.dataValues.ESICPFDeduction || "",

					anniversary_date: ele.employeebiographicaldetail?.dataValues
						?.maritalStatusSince
						? moment(
								ele.employeebiographicaldetail?.dataValues?.maritalStatusSince,
							).format("DD-MM-YYYY")
						: "",

					location_type:
						ele.companylocationmaster?.isHeadquarter === true
							? "Head Office"
							: "Branch",
					work_area: ele.companylocationmaster?.dataValues
						? [
								ele.companylocationmaster?.dataValues?.address1 || "",
								ele.companylocationmaster?.dataValues?.currentcity?.cityName ||
									"",
								ele.companylocationmaster?.dataValues?.currentstate
									?.stateName || "",
								ele.companylocationmaster?.dataValues?.currentcountry
									?.countryName || "",
								ele.companylocationmaster?.dataValues?.pincodmaster?.pincode
									?.pincode || "",
							]
								.filter((item) => item.trim() !== "") // filter out empty or whitespace-only strings
								.join(", ")
						: "",
					work_area_code:
						ele.companylocationmaster?.dataValues?.companyLocationCode || "",

					date_of_confirmation: "",
					date_of_resignation: ele.separationmaster
						? moment(ele.separationmaster.resignationDate).format("DD-MM-YYYY")
						: "",
					// exit_date: ele.separationmaster
					// ?ele.separationmaster.l2LastWorkingDay? moment(ele.separationmaster.l2LastWorkingDay).format("DD-MM-YYYY")
					// : "":"",
					exit_type:
						ele.separationmaster?.l2Separationtype?.separationTypeName || "",
					//  exit_reason: ele.separationmaster?.empReasonofResignation?.separationReason || "",
					admin_exit_reason:
						ele.separationmaster?.l2ReasonofSeparation?.separationReason || "",
					// customer_code:"",
					project_code: ele.employeejobdetail?.projectCode || "",
					customer_code: ele.employeejobdetail?.dataValues?.customerCode,
					// customer_code: ele.employeejobdetail?.dataValues?.customerName
					//   ? (ele.employeejobdetail.dataValues.customerName.match(/(C\d+)/) ||
					//     [])[1] || ""
					//   : "",

					current_address: ele.employeeaddress?.dataValues
						? [
								ele.employeeaddress.dataValues.currentHouse || "",
								ele.employeeaddress.dataValues.currentStreet || "",
								ele.employeeaddress.dataValues.currentLandmark || "",
								ele.employeeaddress.dataValues.currentcity?.cityName || "",
								ele.employeeaddress.dataValues.currentstate?.stateName || "",
								ele.employeeaddress.dataValues.currentcountry?.countryName ||
									"",
								ele.employeeaddress.dataValues.currentPincodeId?.toString() ||
									"", // convert to string safely
							]
								.map((item) => (item ?? "").toString().trim()) // ensure item is string, trim whitespace
								.filter((item) => item !== "")
								.join(", ")
						: "",

					permanent_address: ele.employeeaddress?.dataValues
						? [
								ele.employeeaddress.dataValues.permanentHouse || "",
								ele.employeeaddress.dataValues.permanentStreet || "",
								ele.employeeaddress.dataValues.permanentLandmark || "",
								ele.employeeaddress.dataValues.permanentcity?.cityName || "",
								ele.employeeaddress.dataValues.permanentstate?.stateName || "",
								ele.employeeaddress.dataValues.permanentcountry?.countryName ||
									"",
								ele.employeeaddress.dataValues.permanentPincodeId?.toString() ||
									"",
							]
								.map((item) => (item ?? "").toString().trim())
								.filter((item) => item !== "")
								.join(", ")
						: "",
				};

				arr.push(data);
			}

			if (arr.length > 0) {
				const timestamp = moment().format("h:mm A");

				const data = [
					{
						sheet: "Employee",
						columns: [
							{ label: "Employee Code", value: "empCode" },
							{ label: "Employee Status", value: "isActive" },
							{ label: "Full Name", value: "name" },
							{ label: "Email", value: "email" },
							{ label: "Personal Email", value: "personalEmail" },
							{ label: "Office_Mobile_Number", value: "officeMobileNumber" },
							{
								label: "Personal_Mobile_Number",
								value: "personalMobileNumber",
							},
							{ label: "Business Unit", value: "bu_name" },
							{ label: "Business Unit Head", value: "buHeadName" },
							{ label: "Business Unit Head Code", value: "buHeadCode" },
							{ label: "Direct Manager Name", value: "manager_name" },
							{ label: "Direct Manager Code", value: "manager_code" },
							{ label: "Direct Manager Email Id", value: "manager_email_id" },
							{ label: "HRBP Code", value: "hrbpCode" },
							{ label: "HRBP Name", value: "hrbpName" },
							{ label: "HRBP Email", value: "hrbpEmail" },
							{ label: "Designation", value: "designation_name" },
							{ label: "Designation Code", value: "designation_code" },
							{ label: "Functional Area Name", value: "functional_area_name" },
							{ label: "Functional Area Code", value: "functional_area_code" },
							{
								label: "Parent Functional Area",
								value: "parent_functional_area",
							},

							{ label: "Department", value: "department_name" },
							{ label: "Department Code", value: "department_code" },
							{ label: "Sbu Name", value: "sbu_name" },
							{ label: "Sbu Code", value: "sbu_code" },
							{ label: "Grade", value: "grade" },
							{ label: "Band", value: "band" },
							{ label: "Job Level", value: "jobLevel" },
							{ label: "Job Level Code", value: "jobLevelCode" },
							{ label: "Cost Center", value: "costCenter" },
							{ label: "Date of Joining", value: "dateOfJoining" },
							{ label: "Resident Engineer", value: "residentEng" },
							{ label: "Father's Name", value: "fathersName" },
							{ label: "Mother's Name", value: "motherName" },
							{ label: "Nationality", value: "nationality" },
							{ label: "Marital Status", value: "maritalStatus" },
							{ label: "Gender", value: "gender" },
							{ label: "Date of Birth", value: "dateOfBirth" },
							{ label: "Country", value: "office_country" },
							{ label: "State", value: "office_state" },
							{ label: "City", value: "office_city" },
							{ label: "Employee Type", value: "employeeType" },
							{ label: "Group Company", value: "groupCompany" },
							{ label: "Group Code", value: "groupCode" },
							{ label: "Passport Number", value: "passportNumber" },
							{ label: "Driving Licence", value: "drivingLicence" },
							{ label: "Last Increment Date", value: "lastIncrementDate" },
							{ label: "Highest Qualification", value: "highestQualification" },
							{ label: "IQ Test Applicable", value: "iqTestApplicable" },
							{ label: "Attendance Shift", value: "shiftName" },
							{ label: "Attendance Policy", value: "attendancePolicymaster" },
							{ label: "Attendance Week Off", value: "weekOffMaster" },
							{ label: "customerName", value: "customerName" },
							{ label: "Position Type", value: "positionType" },
							{ label: "New Customer Name", value: "newCustomerName" },
							{
								label: "Emergency Relation",
								value: "emergencyContactRelation",
							},
							{ label: "Emergency Blood Group", value: "emergencyBloodGroup" },
							{ label: "Emergency Contact", value: "emergencyContactNumber" },
							{ label: "Recruiter Name", value: "recruiterName" },
							{ label: "Laptop System", value: "laptopSystem" },
							{
								label: "Background Verification",
								value: "backgroundVerification",
							},
							{ label: "Mobile (Admin)", value: "mobileAccess" },
							{ label: "Data Card (Admin)", value: "dataCardAdmin" },
							{ label: "Visiting Card (Admin)", value: "visitingCardAdmin" },
							{ label: "Workstation (Admin)", value: "workstationAdmin" },
							{ label: "Nominee Name", value: "nomineeName" },
							{ label: "Date Of Exit", value: "dateOfexit" },
							{ label: "Off Role CTC", value: "offRoleCTC" },
							{ label: "ESIC PF Deduction", value: "ESICPFDeduction" },
							{ label: "Anniversary Date", value: "anniversary_date" },
							{ label: "Location Type", value: "location_type" },
							{ label: "Work Area", value: "work_area" },
							{ label: "Work Area Code", value: "work_area_code" },
							{ label: "Date Of Confirmation", value: "date_of_confirmation" },
							{ label: "Date Of Resignation", value: "date_of_resignation" },
							// { label: "Exit Date", value: "exit_date" },
							{ label: "Exit Type", value: "exit_type" },
							// { label: "Exit Reason", value: "exit_reason" },
							{ label: "Admin Exit Reason", value: "admin_exit_reason" },
							{ label: "Customer Code", value: "customer_code" },
							{ label: "Project Code", value: "project_code" },
							{ label: "Current Address", value: "current_address" },
							{ label: "permanent Address", value: "permanent_address" },
						],
						content: arr,
					},
				];

				const settings = {
					fileName: `Employee_Master_${timestamp}`,
					extraLength: 3,
					writeOptions: {
						type: "buffer",
						bookType: "xlsx",
					},
				};

				const report = xlsx(data, settings);
				res.setHeader(
					"Content-Disposition",
					`attachment; filename=Employee_Master_${timestamp}.xlsx`,
				);
				res.end(report);
			} else {
				res.status(404).json({
					message: "Data not found",
				});
			}
		} catch (error) {
			console.error("Error:", error);
			res.status(500).json({
				message: "An error occurred while exporting employee master data",
			});
		}
	}

	async sperationPending(req, res) {
		try {
			const {
				search,
				department,
				designation,
				buSearch,
				sbuSearch,
				areaSearch,
				grade,
				attendanceFor,
				employeeType,
				businessUnit,
				companyLocation,
				companyId,
			} = req.query;

			let buFIlter = {};
			let sbbuFIlter = {};
			let functionAreaFIlter = {};
			let departmentFIlter = {};
			let designationFIlter = {};
			let companyFIlter = {};
			const usersData = req.userData;
			let employeeDataExisting = [];
			if (usersData.role_id == 4 || usersData.role_id == 5) {
				let permissionAssignTousers = [];
				if (usersData.permissionAndAccess) {
					permissionAssignTousers = usersData.permissionAndAccess
						.split(",")
						.map((el) => parseInt(el));
				}
				let permissionAndAccess = await db.permissoinandaccess.findAll({
					where: {
						role_id: usersData.role_id,
						isActive: 1,
						permissoinandaccessId: {
							[Op.in]: permissionAssignTousers,
						},
					},
				}); /// get all permission of access to fetch list with active status as per role
				const buArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "BU")
					.map((obj) => obj.permissionValue); // checking BU Access

				if (buArrayForFilter.length > 0) {
					buFIlter.buId = {
						///appedning Bu to filter
						[Op.in]: buArrayForFilter,
					};
				}

				const sbuArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "SBU")
					.map((obj) => obj.permissionValue); // checking SBU Access
				if (sbuArrayForFilter.length > 0) {
					sbbuFIlter.sbuId = {
						///appedning SBU to filter
						[Op.in]: sbuArrayForFilter,
					};
				}

				const departmentArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "DEPARTMENT")
					.map((obj) => obj.permissionValue); // checking department Access

				if (departmentArrayForFilter.length > 0) {
					departmentFIlter.departmentId = {
						///appedning department to filter
						[Op.in]: departmentArrayForFilter,
					};
				}
				const funcareaArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "FUNCAREA")
					.map((obj) => obj.permissionValue); // checking SBU Access

				if (funcareaArrayForFilter.length > 0) {
					functionAreaFIlter.functionalAreaId = {
						///appedning SBU to filter
						[Op.in]: funcareaArrayForFilter,
					};
				}

				const designationArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "DESIGNATION")
					.map((obj) => obj.permissionValue); // checking SBU Access

				if (designationArrayForFilter.length > 0) {
					designationFIlter.designationId = {
						///appedning SBU to filter
						[Op.in]: designationArrayForFilter,
					};
				}
				const comapnyArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "COMPANY")
					.map((obj) => obj.permissionValue); // checking SBU Access

				if (comapnyArrayForFilter.length > 0) {
					companyFIlter.companyId = {
						///appedning SBU to filter
						[Op.in]: comapnyArrayForFilter,
					};
				}
			}

			const employeeData = await db.employeeMaster.findAll({
				attributes: [
					"id",
					"empCode",
					"name",
					"email",
					"personalEmail",
					"firstName",
					"lastName",
					"officeMobileNumber",
					"buId",
					"companyId",
					"personalMobileNumber",
					"drivingLicence",
					"passportNumber",
					"lastIncrementDate",
					"iqTestApplicable",
					"positionType",
					"newCustomerName",
					"recruiterName",
					"dataCardAdmin",
					"visitingCardAdmin",
					"workstationAdmin",
					"isActive",
				],
				where: {
					companyId: companyId,
					...(attendanceFor == 0 && { isActive: 0 }),
					...(attendanceFor == 1 && { isActive: 1 }),
					...(attendanceFor == 2 && { isActive: [0, 1] }),
					...(search && { id: { [Op.in]: search.split(",") } }),
					...(employeeType && {
						employeeType: { [Op.in]: employeeType.split(",") },
					}),
					...(businessUnit && {
						buId: { [Op.in]: businessUnit.split(",") },
					}),
					...(department && {
						departmentId: { [Op.in]: department.split(",") },
					}),
					...(companyLocation && {
						companyLocationId: { [Op.in]: companyLocation.split(",") },
					}),
				},
				include: [
					{
						model: db.employeeTypeMaster,
						attributes: ["emptypename"],
						required: false,
					},
					{ model: db.biographicalDetails, required: false },
					{
						model: db.designationMaster,
						attributes: ["name", "code"],
						required: !!designation,
						where: {
							...designationFIlter,
						},
					},
					{
						model: db.functionalAreaMaster,
						attributes: ["functionalAreaName", "functionalAreaCode"],
						required: !!areaSearch,
					},
					{
						model: db.departmentMaster,
						attributes: ["departmentName", "departmentCode"],
						required: !!department,
						where: {
							...departmentFIlter,
						},
					},
					{
						model: db.jobDetails,
						attributes: ["dateOfJoining", "residentEng", "customerName"],
						where: { ...(grade && { gradeId: { [Op.in]: grade.split(",") } }) },
						include: [
							{ model: db.gradeMaster, attributes: ["gradeName"] },
							{ model: db.bandMaster, attributes: ["bandDesc"] },
							{
								model: db.jobLevelMaster,
								attributes: ["jobLevelName", "jobLevelCode"],
							},
						],
					},
					{
						model: db.employeeMaster,
						required: false,
						attributes: ["id", "name", "empCode", "email"],
						as: "managerData",
					},
					{
						model: db.employeeMaster,
						attributes: ["id", "name", "empCode", "email"],
						as: "buHeadData",
					},
					{
						model: db.employeeMaster,
						attributes: ["id", "name", "empCode", "email"],
						as: "buhrData",
					},
					{
						model: db.buMaster,
						attributes: ["buName"],
						required: true,
						where: {
							...buFIlter,
						},
					},
					{
						model: db.sbuMaster,
						attributes: ["sbuname"],
						required: true,
						where: {
							...sbbuFIlter,
						},
					},
					{ model: db.shiftMaster, attributes: ["shiftName"] },
					{ model: db.attendancePolicymaster, attributes: ["policyName"] },
					{ model: db.weekOffMaster, attributes: ["weekOffName"] },
					{
						model: db.separationMaster,
						finalStatus: { [Op.in]: [2, 5] },
						required: true,
						include: [
							{
								model: db.separationStatus,
								attributes: ["separationStatusCode", "separationStatusDesc"],
							},
							{
								model: db.separationReason,
								as: "empReasonofResignation",
								attributes: ["separationReason"],
							},
						],
					},
					{
						model: db.noticePeriodMaster,
					},
					{
						model: db.companyMaster,
						//   where: {
						// 	...companyFIlter,
						// },
					},
				],
			});

			const arr = await Promise.all(
				employeeData.map(async (ele) => {
					return {
						empCode: ele.dataValues.empCode || "",
						name: ele.dataValues.name || "",
						jobTitle: `${ele.dataValues.designationmaster?.name || ""} (${
							ele.dataValues.designationmaster?.code || ""
						})`,
						department: `${
							ele.dataValues.departmentmaster?.departmentName || ""
						} (${ele.dataValues.departmentmaster?.departmentCode || ""})`,
						bu_name: ele.dataValues.bumaster?.buName || "",
						separationRequestedOn: ele.dataValues.separationmaster?.createdDt
							? moment(ele.dataValues.separationmaster.createdDt).format(
									"DD-MM-YYYY",
								)
							: "",
						requestedLastDay: ele.dataValues.separationmaster
							?.empProposedLastWorkingDay
							? moment(
									ele.dataValues.separationmaster.empProposedLastWorkingDay,
								).format("DD-MM-YYYY")
							: "",
						status:
							ele.dataValues.separationmaster?.finalStatus === 2 ||
							ele.dataValues.separationmaster?.finalStatus === 5
								? "Pending with Manager"
								: "Pending with BuHr",
						agreedLastDay: "N/A",
						reasonForResignation:
							ele.dataValues.separationmaster?.empReasonofResignation
								?.separationReason || "",
						otherReason: ele.dataValues.separationmaster?.empRemark || "N/A",
						comment: "N/A",
						transactionDate: "",
						noticePeriodName:
							ele.dataValues.noticeperiodmaster?.noticePeriodName || "N/A",
						noticePeriodDuration:
							ele.dataValues.noticeperiodmaster?.nPDaysAfterConfirmation +
								" " +
								"Day(s)" || "N/A",
						replacementRequired:
							ele.dataValues.separationmaster?.replacementRequired == null ||
							false
								? "N/A"
								: "Yes",
						replacementRequiredBy:
							ele.dataValues.separationmaster?.replacementRequired == null ||
							false
								? "N/A"
								: ele.dataValues.separationmaster?.replacementRequired,
						shortFallPayout:
							ele.dataValues.separationmaster?.shortFallPayoutBasis || "N/A",
						newCompanyName:
							ele.dataValues.separationmaster?.empNewOrganizationName || "N/A",
						newCtc: ele.dataValues.separationmaster?.empSalaryHike || "N/A",
						newRole: "N/A",
						newLetterConfimation:
							ele.dataValues.separationmaster?.ndaConfirmation == null
								? "No"
								: "Yes",
						buHeadCode: ele.dataValues.buHeadData?.empCode,
						buHeadName: ele.dataValues.buHeadData?.name,
						buHeadEmail: ele.dataValues.buHeadData?.email,
						hrbpCode: ele.dataValues?.buhrData?.empCode || "",
						hrbpName: ele.dataValues.buhrData?.name,
						hrbpEmail: ele.dataValues.buhrData?.email,
					};
				}),
			);
			if (arr.length > 0) {
				const timestamp = moment().format("HH:mm"); //Date.now();

				const data = [
					{
						sheet: "Employee",
						columns: [
							{ label: "Employee ID", value: "empCode" },
							{ label: "Name", value: "name" },
							{ label: "Job Title", value: "jobTitle" },
							{ label: "Department", value: "department" },
							{ label: "Business Unit", value: "bu_name" },
							{
								label: "Separation Requested On",
								value: "separationRequestedOn",
							},
							{ label: "Requested Last Day", value: "requestedLastDay" },
							{ label: "status", value: "status" },
							{ label: "Agreed Last Day", value: "agreedLastDay" },
							{
								label: "Reason For Resignation",
								value: "reasonForResignation",
							},
							{ label: "Other Reason", value: "otherReason" },
							{ label: "Comment", value: "comment" },
							{ label: "Notice Period Name", value: "noticePeriodName" },
							{
								label: "Notice Period Duration",
								value: "noticePeriodDuration",
							},
							{ label: "Short Fall Payout", value: "shortFallPayout" },
							{ label: "New Company Name", value: "newCompanyName" },
							{ label: "New CTC", value: "newCtc" },
							{ label: "New Role", value: "newRole" },
							{
								label: "NDA Letter Confirmation",
								value: "newLetterConfimation",
							},
						],
						content: arr,
					},
				];

				const settings = {
					fileName: `Employee_Master_${timestamp}`,
					extraLength: 3,
					writeOptions: {
						type: "buffer",
						bookType: "xlsx",
					},
				};

				const report = xlsx(data, settings);
				res.setHeader(
					"Content-Disposition",
					`attachment; filename=Separation_Pending_${timestamp}.xlsx`,
				);
				res.end(report);
			} else {
				res.status(404).json({
					message: "Data not found",
				});
			}
		} catch (error) {
			console.error("Error:", error);
			res.status(500).json({
				message: "An error occurred while exporting employee master data",
			});
		}
	}

	async sperationApproved(req, res) {
		try {
			const {
				search,
				department,
				designation,
				buSearch,
				sbuSearch,
				areaSearch,
				grade,
				attendanceFor,
				employeeType,
				businessUnit,
				companyLocation,
				companyId,
			} = req.query;
			let buFIlter = {};
			let sbbuFIlter = {};
			let functionAreaFIlter = {};
			let departmentFIlter = {};
			let designationFIlter = {};
			let companyFIlter = {};
			const usersData = req.userData;
			let employeeDataExisting = [];
			if (usersData.role_id == 4 || usersData.role_id == 5) {
				let permissionAssignTousers = [];
				if (usersData.permissionAndAccess) {
					permissionAssignTousers = usersData.permissionAndAccess
						.split(",")
						.map((el) => parseInt(el));
				}
				let permissionAndAccess = await db.permissoinandaccess.findAll({
					where: {
						role_id: usersData.role_id,
						isActive: 1,
						permissoinandaccessId: {
							[Op.in]: permissionAssignTousers,
						},
					},
				}); /// get all permission of access to fetch list with active status as per role
				const buArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "BU")
					.map((obj) => obj.permissionValue); // checking BU Access

				if (buArrayForFilter.length > 0) {
					buFIlter.buId = {
						///appedning Bu to filter
						[Op.in]: buArrayForFilter,
					};
				}

				const sbuArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "SBU")
					.map((obj) => obj.permissionValue); // checking SBU Access
				if (sbuArrayForFilter.length > 0) {
					sbbuFIlter.sbuId = {
						///appedning SBU to filter
						[Op.in]: sbuArrayForFilter,
					};
				}

				const departmentArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "DEPARTMENT")
					.map((obj) => obj.permissionValue); // checking department Access

				if (departmentArrayForFilter.length > 0) {
					departmentFIlter.departmentId = {
						///appedning department to filter
						[Op.in]: departmentArrayForFilter,
					};
				}
				const funcareaArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "FUNCAREA")
					.map((obj) => obj.permissionValue); // checking SBU Access

				if (funcareaArrayForFilter.length > 0) {
					functionAreaFIlter.functionalAreaId = {
						///appedning SBU to filter
						[Op.in]: funcareaArrayForFilter,
					};
				}

				const designationArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "DESIGNATION")
					.map((obj) => obj.permissionValue); // checking SBU Access

				if (designationArrayForFilter.length > 0) {
					designationFIlter.designationId = {
						///appedning SBU to filter
						[Op.in]: designationArrayForFilter,
					};
				}
				const comapnyArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "COMPANY")
					.map((obj) => obj.permissionValue); // checking SBU Access

				if (comapnyArrayForFilter.length > 0) {
					companyFIlter.companyId = {
						///appedning SBU to filter
						[Op.in]: comapnyArrayForFilter,
					};
				}
			}
			const employeeData = await db.employeeMaster.findAll({
				attributes: [
					"id",
					"empCode",
					"name",
					"email",
					"personalEmail",
					"firstName",
					"lastName",
					"officeMobileNumber",
					"buId",
					"companyId",
					"personalMobileNumber",
					"drivingLicence",
					"passportNumber",
					"lastIncrementDate",
					"iqTestApplicable",
					"positionType",
					"newCustomerName",
					"recruiterName",
					"dataCardAdmin",
					"visitingCardAdmin",
					"workstationAdmin",
					"isActive",
				],
				where: {
					companyId: companyId,
					...(attendanceFor == 0 && { isActive: 0 }),
					...(attendanceFor == 1 && { isActive: 1 }),
					...(attendanceFor == 2 && { isActive: [0, 1] }),
					...(search && { id: { [Op.in]: search.split(",") } }),
					...(employeeType && {
						employeeType: { [Op.in]: employeeType.split(",") },
					}),
					...(businessUnit && {
						buId: { [Op.in]: businessUnit.split(",") },
					}),
					...(department && {
						departmentId: { [Op.in]: department.split(",") },
					}),
					...(companyLocation && {
						companyLocationId: { [Op.in]: companyLocation.split(",") },
					}),
				},
				include: [
					{
						model: db.employeeTypeMaster,
						attributes: ["emptypename"],
						required: false,
					},
					{ model: db.biographicalDetails, required: false },
					{
						model: db.designationMaster,
						attributes: ["name", "code"],
						required: !!designation,
						where: {
							...designationFIlter,
						},
					},
					{
						model: db.functionalAreaMaster,
						attributes: ["functionalAreaName", "functionalAreaCode"],
						required: !!areaSearch,
					},
					{
						model: db.departmentMaster,
						attributes: ["departmentName", "departmentCode"],
						required: !!department,
						where: {
							...departmentFIlter,
						},
					},
					{
						model: db.jobDetails,
						attributes: ["dateOfJoining", "residentEng", "customerName"],
						where: { ...(grade && { gradeId: { [Op.in]: grade.split(",") } }) },
						include: [
							{ model: db.gradeMaster, attributes: ["gradeName"] },
							{ model: db.bandMaster, attributes: ["bandDesc"] },
							{
								model: db.jobLevelMaster,
								attributes: ["jobLevelName", "jobLevelCode"],
							},
						],
					},
					{
						model: db.employeeMaster,
						required: false,
						attributes: ["id", "name", "empCode", "email"],
						as: "managerData",
					},
					{
						model: db.employeeMaster,
						attributes: ["id", "name", "empCode", "email"],
						as: "buHeadData",
					},
					{
						model: db.employeeMaster,
						attributes: ["id", "name", "empCode", "email"],
						as: "buhrData",
					},
					{
						model: db.buMaster,
						attributes: ["buName"],
						required: false,
						where: {
							...buFIlter,
						},
					},
					{
						model: db.sbuMaster,
						attributes: ["sbuname"],
						required: false,
						where: {
							...sbbuFIlter,
						},
					},
					{ model: db.shiftMaster, attributes: ["shiftName"] },
					{ model: db.attendancePolicymaster, attributes: ["policyName"] },
					{ model: db.weekOffMaster, attributes: ["weekOffName"] },
					{
						model: db.separationMaster,
						// finalStatus: { [Op.in]: [9] },
						required: true,
						include: [
							{
								model: db.separationStatus,
								attributes: ["separationStatusCode", "separationStatusDesc"],
							},
							{
								model: db.separationReason,
								as: "empReasonofResignation",
								attributes: ["separationReason"],
							},
							{
								model: db.separationType,
								as: "l2Separationtype",
								required: false,
							},
							{
								model: db.separationReason,
								as: "l2ReasonofSeparation",
								attributes: ["separationReason"],
							},
							{
								model: db.separationTrail,
								where: { separationStatus: 9, pending: 0 },
								required: true,
							},
						],
					},
					{
						model: db.noticePeriodMaster,
					},
					{
						model: db.companyMaster,
						// 	where: {
						// 	  ...companyFIlter,
						//   },
					},
				],
			});

			const arr = await Promise.all(
				employeeData.map(async (ele) => {
					return {
						empCode: ele.dataValues.empCode || "",
						name: ele.dataValues.name || "",
						jobTitle: `${ele.dataValues.designationmaster?.name || ""} (${
							ele.dataValues.designationmaster?.code || ""
						})`,
						department: `${
							ele.dataValues.departmentmaster?.departmentName || ""
						} (${ele.dataValues.departmentmaster?.departmentCode || ""})`,
						bu_name: ele.dataValues.bumaster?.buName || "",

						resignationDate: ele.dataValues.separationmaster?.resignationDate,

						requestedLastDay: ele.dataValues.separationmaster
							?.empProposedLastWorkingDay
							? moment(
									ele.dataValues.separationmaster.empProposedLastWorkingDay,
								).format("DD-MM-YYYY")
							: "",
						noticePeriodRecoveryDays:
							ele.dataValues.separationmaster?.noticePeriodDay || "N/A",
						empProposedRecoveryDays:
							ele.dataValues.separationmaster?.empProposedRecoveryDays || "N/A",

						reasonForResignation:
							ele.dataValues.separationmaster?.empReasonofResignation
								?.separationReason || "N/A",

						otherReason: ele.dataValues.separationmaster?.empRemark || "N/A",

						comment: "N/A",
						l1ProposedLastWorkingDay:
							ele.dataValues.separationmaster?.l1ProposedLastWorkingDay ||
							"N/A",

						l1ProposedRecoveryDays:
							ele.dataValues.separationmaster?.l1ProposedRecoveryDays || "N/A",

						l1ReasonForProposedRecoveryDays:
							ele.dataValues.separationmaster
								?.l1ReasonForProposedRecoveryDays || "N/A",
						l1BillingType:
							ele.dataValues.separationmaster?.l1BillingType || "N/A",
						l1CustomerName:
							ele.dataValues.separationmaster?.l1CustomerName || "N/A",

						l2NewOrganizationName:
							ele.dataValues.separationmaster?.l2NewOrganizationName || "N/A",
						l2SalaryHike:
							ele.dataValues.separationmaster?.l2SalaryHike == null
								? "N/A"
								: ele.dataValues.separationmaster?.l2SalaryHike,
						doNotReHire:
							ele.dataValues.separationmaster?.doNotReHire == null
								? "N/A"
								: ele.dataValues.separationmaster?.doNotReHire,
						l2BillingType:
							ele.dataValues.separationmaster?.l2BillingType == null
								? "N/A"
								: ele.dataValues.separationmaster?.l2BillingType,
						l2CustomerName:
							ele.dataValues.separationmaster?.l2CustomerName == null
								? "N/A"
								: ele.dataValues.separationmaster?.l2CustomerName,

						finalRecoveryDays:
							ele.dataValues.separationmaster?.l2RecoveryDays == null
								? ""
								: ele.dataValues.separationmaster?.l2RecoveryDays,

						finalRecoveryDaysReason:
							ele.dataValues.separationmaster?.l2RecoveryDaysReason == null
								? ""
								: ele.dataValues.separationmaster?.l2RecoveryDaysReason,

						adminSeparationType:
							ele.dataValues.separationmaster?.l2Separationtype
								?.separationTypeName || "N/A",

						adminSeparationReason:
							ele.dataValues.separationmaster?.l2ReasonofSeparation
								?.separationReason || "N/A",

						adminOtherReason:
							ele.dataValues.separationmaster?.l2Remark?.separationReason ||
							"N/A",

						dateOfApproval:
							ele.dataValues.separationmaster.initiatedBy == "BuHr"
								? ele.dataValues.separationmaster.separationtrails[0].createdDt
								: ele.dataValues.separationmaster.separationtrails[0].updatedDt,

						noticePeriodName:
							ele.dataValues.noticeperiodmaster?.noticePeriodName || "N/A",
						noticePeriodDuration:
							ele.dataValues.noticeperiodmaster?.nPDaysAfterConfirmation +
								" " +
								"Day(s)" || "N/A",

						replacementRequired:
							ele.dataValues.separationmaster?.replacementRequired == null ||
							false
								? "N/A"
								: "Yes",
						replacementRequiredBy:
							ele.dataValues.separationmaster?.replacementRequired == null ||
							false
								? "N/A"
								: ele.dataValues.separationmaster?.replacementRequired,

						//need to add
						shortFallPayoutRequired:
							ele.dataValues.separationmaster?.shortFallPayoutRequired ==
								null || false
								? "No"
								: "Yes",

						shortFallPayout:
							ele.dataValues.separationmaster?.shortFallPayoutBasis || "N/A",

						shortFallPayoutDays:
							ele.dataValues.separationmaster?.shortFallPayoutDays || "N/A",

						//need to add
						l2LastWorkingDay: ele.dataValues.separationmaster?.l2LastWorkingDay
							? moment(ele.dataValues.separationmaster.l2LastWorkingDay).format(
									"DD-MM-YYYY",
								)
							: "",
						// newCompanyName:
						//ele.dataValues.separationmaster?.empNewOrganizationName || "N/A",

						holdFnf:
							ele.dataValues.separationmaster?.holdFnf == null ? "No" : "Yes",

						newCtc: "N/A",
						newRole: "N/A",

						newLetterConfimation:
							ele.dataValues.separationmaster?.ndaConfirmation == null
								? "No"
								: "Yes",

						buHeadCode: ele.dataValues.buHeadData?.empCode,
						buHeadName: ele.dataValues.buHeadData?.name,
						buHeadEmail: ele.dataValues.buHeadData?.email,
						hrbpCode: ele.dataValues?.buhrData?.empCode || "",
						hrbpName: ele.dataValues.buhrData?.name,
						hrbpEmail: ele.dataValues.buhrData?.email,
					};
				}),
			);
			if (arr.length > 0) {
				const timestamp = moment().format("HH:mm"); //Date.now();

				const data = [
					{
						sheet: "Employee",
						columns: [
							{ label: "Employee ID", value: "empCode" },
							{ label: "Name", value: "name" },
							{ label: "Job Title", value: "jobTitle" },
							{ label: "Department", value: "department" },
							{ label: "Business Unit", value: "bu_name" },
							{
								label: "Date Of Resignation",
								value: "resignationDate",
							},
							{ label: "Requested Last Day", value: "requestedLastDay" },
							{
								label: "Notice Period Recovery Days",
								value: "noticePeriodRecoveryDays",
							},
							{
								label: "Reason For Resignation",
								value: "reasonForResignation",
							},
							{ label: "Other Reason", value: "otherReason" },
							{ label: "Comment", value: "comment" },
							{
								label: "Proposed Last Day (L1)",
								value: "l1ProposedLastWorkingDay",
							},
							{
								label: "Proposed Number Of Recovery Days (L1)",
								value: "l1ProposedRecoveryDays",
							},
							{
								label: "Reson For Porposed Recovery Day (L1)",
								value: "l1ReasonForProposedRecoveryDays",
							},
							{ label: "Billing Type (L1)", value: "l1BillingType" },
							{ label: "Customer Name (L1)", value: "l1CustomerName" },

							{ label: "Final Recovery Days (L2)", value: "finalRecoveryDays" },
							{
								label: "Final Recovery Days Reason (L2)",
								value: "finalRecoveryDaysReason",
							},
							{
								label: "Organization Name (L2)",
								value: "l2NewOrganizationName",
							},
							{ label: "SalaryHike (L2)", value: "l2SalaryHike" },
							{ label: "Do Not ReHire (L2)", value: "doNotReHire" },
							{ label: "Billing Type (L2)", value: "l2BillingType" },
							{ label: "Customer Name (L2)", value: "l2CustomerName" },
							{ label: "Admin Separation Type", value: "adminSeparationType" },
							{
								label: "Admin Separation Reason",
								value: "adminSeparationReason",
							},
							{ label: "Admin Other Reason", value: "adminOtherReason" },
							{ label: "Final Last Working Day", value: "l2LastWorkingDay" },
							{ label: "Date Of Approval", value: "dateOfApproval" },
							{ label: "Notice Period Name", value: "noticePeriodName" },
							{
								label: "Notice Period Duration",
								value: "noticePeriodDuration",
							},
							{
								label: "short Fall Payout Required",
								value: "shortFallPayoutRequired",
							},
							{ label: "Short Fall Payout", value: "shortFallPayout" },
							{ label: "Short Fall Payout Days", value: "shortFallPayoutDays" },

							// { label: "New Company Name", value: "newCompanyName" },
							// { label: "New CTC", value: "newCtc" },
							// { label: "New Role", value: "newRole" },
							{
								label: "NDA Letter Confirmation",
								value: "newLetterConfimation",
							},
						],
						content: arr,
					},
				];

				const settings = {
					fileName: `Employee_Master_${timestamp}`,
					extraLength: 3,
					writeOptions: {
						type: "buffer",
						bookType: "xlsx",
					},
				};

				const report = xlsx(data, settings);
				res.setHeader(
					"Content-Disposition",
					`attachment; filename=Separation_Approved_${timestamp}.xlsx`,
				);
				res.end(report);
			} else {
				res.status(404).json({
					message: "Data not found",
				});
			}
		} catch (error) {
			console.error("Error:", error);
			res.status(500).json({
				message: "An error occurred while exporting employee master data",
			});
		}
	}

	async sperationApprovedHistory(req, res) {
		try {
			const {
				search,
				department,
				designation,
				buSearch,
				sbuSearch,
				areaSearch,
				grade,
				attendanceFor,
				employeeType,
				businessUnit,
				companyLocation,
				startDate,
				endDate,
				companyId,
			} = req.query;

			let buFIlter = {};
			let sbbuFIlter = {};
			let functionAreaFIlter = {};
			let departmentFIlter = {};
			let designationFIlter = {};
			let companyFIlter = {};
			const usersData = req.userData;
			let employeeDataExisting = [];
			if (usersData.role_id == 4 || usersData.role_id == 5) {
				let permissionAssignTousers = [];
				if (usersData.permissionAndAccess) {
					permissionAssignTousers = usersData.permissionAndAccess
						.split(",")
						.map((el) => parseInt(el));
				}
				let permissionAndAccess = await db.permissoinandaccess.findAll({
					where: {
						role_id: usersData.role_id,
						isActive: 1,
						permissoinandaccessId: {
							[Op.in]: permissionAssignTousers,
						},
					},
				}); /// get all permission of access to fetch list with active status as per role
				const buArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "BU")
					.map((obj) => obj.permissionValue); // checking BU Access

				if (buArrayForFilter.length > 0) {
					buFIlter.buId = {
						///appedning Bu to filter
						[Op.in]: buArrayForFilter,
					};
				}

				const sbuArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "SBU")
					.map((obj) => obj.permissionValue); // checking SBU Access
				if (sbuArrayForFilter.length > 0) {
					sbbuFIlter.sbuId = {
						///appedning SBU to filter
						[Op.in]: sbuArrayForFilter,
					};
				}

				const departmentArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "DEPARTMENT")
					.map((obj) => obj.permissionValue); // checking department Access

				if (departmentArrayForFilter.length > 0) {
					departmentFIlter.departmentId = {
						///appedning department to filter
						[Op.in]: departmentArrayForFilter,
					};
				}
				const funcareaArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "FUNCAREA")
					.map((obj) => obj.permissionValue); // checking SBU Access

				if (funcareaArrayForFilter.length > 0) {
					functionAreaFIlter.functionalAreaId = {
						///appedning SBU to filter
						[Op.in]: funcareaArrayForFilter,
					};
				}

				const designationArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "DESIGNATION")
					.map((obj) => obj.permissionValue); // checking SBU Access

				if (designationArrayForFilter.length > 0) {
					designationFIlter.designationId = {
						///appedning SBU to filter
						[Op.in]: designationArrayForFilter,
					};
				}
				const comapnyArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "COMPANY")
					.map((obj) => obj.permissionValue); // checking SBU Access

				if (comapnyArrayForFilter.length > 0) {
					companyFIlter.companyId = {
						///appedning SBU to filter
						[Op.in]: comapnyArrayForFilter,
					};
				}
			}
			const employeeData = await db.employeeMaster.findAll({
				attributes: [
					"id",
					"empCode",
					"name",
					"email",
					"personalEmail",
					"firstName",
					"lastName",
					"officeMobileNumber",
					"buId",
					"companyId",
					"personalMobileNumber",
					"drivingLicence",
					"passportNumber",
					"lastIncrementDate",
					"iqTestApplicable",
					"positionType",
					"newCustomerName",
					"recruiterName",
					"dataCardAdmin",
					"visitingCardAdmin",
					"workstationAdmin",
					"isActive",
				],
				where: {
					companyId: companyId,
					...(attendanceFor == 0 && { isActive: 0 }),
					...(attendanceFor == 1 && { isActive: 1 }),
					...(attendanceFor == 2 && { isActive: [0, 1] }),
					...(search && { id: { [Op.in]: search.split(",") } }),
					...(employeeType && {
						employeeType: { [Op.in]: employeeType.split(",") },
					}),
					...(businessUnit && {
						buId: { [Op.in]: businessUnit.split(",") },
					}),
					...(department && {
						departmentId: { [Op.in]: department.split(",") },
					}),
					...(companyLocation && {
						companyLocationId: { [Op.in]: companyLocation.split(",") },
					}),
				},
				include: [
					{
						model: db.employeeTypeMaster,
						attributes: ["emptypename"],
						required: false,
					},
					{ model: db.biographicalDetails, required: false },
					{
						model: db.designationMaster,
						attributes: ["name", "code"],
						required: !!designation,
						where: {
							...designationFIlter,
						},
					},
					{
						model: db.functionalAreaMaster,
						attributes: ["functionalAreaName", "functionalAreaCode"],
						required: !!areaSearch,
					},
					{
						model: db.departmentMaster,
						attributes: ["departmentName", "departmentCode"],
						required: !!department,
						where: {
							...departmentFIlter,
						},
					},
					{
						model: db.jobDetails,
						attributes: ["dateOfJoining", "residentEng", "customerName"],
						where: { ...(grade && { gradeId: { [Op.in]: grade.split(",") } }) },
						include: [
							{ model: db.gradeMaster, attributes: ["gradeName"] },
							{ model: db.bandMaster, attributes: ["bandDesc"] },
							{
								model: db.jobLevelMaster,
								attributes: ["jobLevelName", "jobLevelCode"],
							},
						],
					},
					{
						model: db.employeeMaster,
						required: false,
						attributes: ["id", "name", "empCode", "email"],
						as: "managerData",
					},
					{
						model: db.employeeMaster,
						attributes: ["id", "name", "empCode", "email"],
						as: "buHeadData",
					},
					{
						model: db.employeeMaster,
						attributes: ["id", "name", "empCode", "email"],
						as: "buhrData",
					},
					{
						model: db.buMaster,
						attributes: ["buName"],
						required: true,
						where: {
							...buFIlter,
						},
					},
					{
						model: db.sbuMaster,
						attributes: ["sbuname"],
						required: false,
						where: {
							...sbbuFIlter,
						},
					},
					{ model: db.shiftMaster, attributes: ["shiftName"] },
					{ model: db.attendancePolicymaster, attributes: ["policyName"] },
					{ model: db.weekOffMaster, attributes: ["weekOffName"] },
					{
						model: db.separationMaster,
						where: {
							...(startDate &&
								endDate && {
									resignationDate: {
										[db.Sequelize.Op.between]: [startDate, endDate],
									},
								}),
						},
						required: true,
						include: [
							{
								model: db.separationStatus,
								attributes: ["separationStatusCode", "separationStatusDesc"],
							},
							{
								model: db.separationReason,
								as: "empReasonofResignation",
								attributes: ["separationReason"],
							},
							{
								model: db.separationType,
								as: "l2Separationtype",
								required: false,
							},
							{
								model: db.separationReason,
								as: "l2ReasonofSeparation",
								attributes: ["separationReason"],
							},
							{
								model: db.separationTrail,
								where: { separationStatus: 9, pending: 0 },
								include: [
									{
										model: db.employeeMaster,
										attributes: ["id", "name", "empCode"],
										as: "createdBySeparationTrail",
										required: false,
									},
									{
										model: db.employeeMaster,
										attributes: ["id", "name", "empCode"],
										as: "updatedBySeparationTrail",
										required: false,
									},
								],
								required: true,
							},
						],
					},
					{
						model: db.noticePeriodMaster,
					},
					{
						model: db.companyMaster,
						// 	where: {
						// 	  ...companyFIlter,
						//   },
					},
				],
			});
			const arr = await Promise.all(
				employeeData.map(async (ele) => {
					return {
						empCode: ele.dataValues.empCode || "",
						name: ele.dataValues.name || "",
						jobTitle: `${ele.dataValues.designationmaster?.name || ""} (${
							ele.dataValues.designationmaster?.code || ""
						})`,

						department: `${
							ele.dataValues.departmentmaster?.departmentName || ""
						} (${ele.dataValues.departmentmaster?.departmentCode || ""})`,

						bu_name: ele.dataValues.bumaster?.buName || "",

						resignationDate: ele.dataValues.separationmaster?.resignationDate,

						requestedLastDay: ele.dataValues.separationmaster
							?.empProposedLastWorkingDay
							? moment(
									ele.dataValues.separationmaster.empProposedLastWorkingDay,
								).format("DD-MM-YYYY")
							: "",

						noticePeriodRecoveryDays:
							ele.dataValues.separationmaster?.noticePeriodDay || "N/A",

						reasonForResignation:
							ele.dataValues.separationmaster?.empReasonofResignation
								?.separationReason || "N/A",

						otherReason: ele.dataValues.separationmaster?.empRemark || "N/A",

						comment: "N/A",
						l1ProposedLastWorkingDay:
							ele.dataValues.separationmaster?.l1ProposedLastWorkingDay ||
							"N/A",

						l1ProposedRecoveryDays:
							ele.dataValues.separationmaster?.l1ProposedRecoveryDays || "N/A",

						l1ReasonForProposedRecoveryDays:
							ele.dataValues.separationmaster
								?.l1ReasonForProposedRecoveryDays || "N/A",

						finalRecoveryDays:
							ele.dataValues.separationmaster?.l2RecoveryDays == null
								? ""
								: ele.dataValues.separationmaster?.l2RecoveryDays,

						finalRecoveryDaysReason:
							ele.dataValues.separationmaster?.l2RecoveryDaysReason == null
								? ""
								: ele.dataValues.separationmaster?.l2RecoveryDaysReason,

						adminSeparationType:
							ele.dataValues.separationmaster?.l2Separationtype
								?.separationTypeName || "N/A",

						adminSeparationReason:
							ele.dataValues.separationmaster?.l2ReasonofSeparation
								?.separationReason || "N/A",

						adminOtherReason:
							ele.dataValues.separationmaster?.l2Remark?.separationReason ||
							"N/A",

						dateOfApproval:
							ele.dataValues.separationmaster.initiatedBy == "BuHr"
								? ele.dataValues.separationmaster.separationtrails[0].createdDt
								: ele.dataValues.separationmaster.separationtrails[0].updatedDt,

						updatedByName:
							ele.dataValues.separationmaster.initiatedBy == "BuHr"
								? ele.dataValues.separationmaster.separationtrails[0]
										.createdBySeparationTrail.name
								: ele.dataValues.separationmaster.separationtrails[0]
										.updatedBySeparationTrail.name,

						updatedByEmployeeNumber:
							ele.dataValues.separationmaster.initiatedBy == "BuHr"
								? ele.dataValues.separationmaster.separationtrails[0]
										.createdBySeparationTrail.empCode
								: ele.dataValues.separationmaster.separationtrails[0]
										.updatedBySeparationTrail.empCode,

						updatedOn:
							ele.dataValues.separationmaster.initiatedBy == "BuHr"
								? ele.dataValues.separationmaster.separationtrails[0].createdDt
								: ele.dataValues.separationmaster.separationtrails[0].updatedDt,

						isManger: "",
						noticePeriodName:
							ele.dataValues.noticeperiodmaster?.noticePeriodName || "N/A",
						noticePeriodDuration:
							ele.dataValues.noticeperiodmaster?.nPDaysAfterConfirmation +
								" " +
								"Day(s)" || "N/A",

						l2SalaryHike:
							ele.dataValues.separationmaster?.l2SalaryHike == null
								? "N/A"
								: ele.dataValues.separationmaster?.l2SalaryHike,
						doNotReHire:
							ele.dataValues.separationmaster?.doNotReHire == null
								? "N/A"
								: ele.dataValues.separationmaster?.doNotReHire,
						l2BillingType:
							ele.dataValues.separationmaster?.l2BillingType == null
								? "N/A"
								: ele.dataValues.separationmaster?.l2BillingType,
						l2CustomerName:
							ele.dataValues.separationmaster?.l2CustomerName == null
								? "N/A"
								: ele.dataValues.separationmaster?.l2CustomerName,

						replacementRequired:
							ele.dataValues.separationmaster?.replacementRequired == null ||
							false
								? "N/A"
								: "Yes",
						replacementRequiredBy:
							ele.dataValues.separationmaster?.replacementRequired == null ||
							false
								? "N/A"
								: ele.dataValues.separationmaster?.replacementRequired,

						shortFallPayout:
							ele.dataValues.separationmaster?.shortFallPayoutBasis || "N/A",

						shortFallPayoutDays:
							ele.dataValues.separationmaster?.shortFallPayoutDays || "N/A",

						newCompanyName:
							ele.dataValues.separationmaster?.empNewOrganizationName || "N/A",

						holdFnf:
							ele.dataValues.separationmaster?.holdFnf == null ? "No" : "Yes",

						newCtc: "N/A",
						newRole: "N/A",

						newLetterConfimation:
							ele.dataValues.separationmaster?.ndaConfirmation == null
								? "No"
								: "Yes",

						// empProposedRecoveryDays:
						// ele.dataValues.separationmaster?.empProposedRecoveryDays || "N/A",

						l1BillingType:
							ele.dataValues.separationmaster?.l1BillingType || "N/A",
						l1CustomerName:
							ele.dataValues.separationmaster?.l1CustomerName || "N/A",

						l2NewOrganizationName:
							ele.dataValues.separationmaster?.l2NewOrganizationName || "N/A",
						l2SalaryHike:
							ele.dataValues.separationmaster?.l2SalaryHike == null
								? "N/A"
								: ele.dataValues.separationmaster?.l2SalaryHike,
						doNotReHire:
							ele.dataValues.separationmaster?.doNotReHire == null
								? "N/A"
								: ele.dataValues.separationmaster?.doNotReHire,
						l2BillingType:
							ele.dataValues.separationmaster?.l2BillingType == null
								? "N/A"
								: ele.dataValues.separationmaster?.l2BillingType,
						l2CustomerName:
							ele.dataValues.separationmaster?.l2CustomerName == null
								? "N/A"
								: ele.dataValues.separationmaster?.l2CustomerName,

						l2LastWorkingDay:
							ele.dataValues.separationmaster?.l2LastWorkingDay == null
								? "N/A"
								: ele.dataValues.separationmaster?.l2LastWorkingDay,

						// buHeadCode: ele.dataValues.buHeadData?.empCode,
						// buHeadName: ele.dataValues.buHeadData?.name,
						// buHeadEmail: ele.dataValues.buHeadData?.email,
						// hrbpCode: ele.dataValues?.buhrData?.empCode || "",
						// hrbpName: ele.dataValues.buhrData?.name,
						// hrbpEmail: ele.dataValues.buhrData?.email,
					};
				}),
			);
			// console.log("arrr",arr.length)
			console.log("arr", arr.length);

			if (arr.length > 0) {
				const timestamp = moment().format("HH:mm"); //Date.now();

				const data = [
					{
						sheet: "Employee",
						columns: [
							{ label: "Employee ID", value: "empCode" },
							{ label: "Name", value: "name" },
							{ label: "Job Title", value: "jobTitle" },
							{ label: "Department", value: "department" },
							{ label: "Business Unit", value: "bu_name" },
							{
								label: "Date Of Resignation",
								value: "resignationDate",
							},
							{ label: "Requested Last Day", value: "requestedLastDay" },
							{
								label: "Notice Period Recovery Days",
								value: "noticePeriodRecoveryDays",
							},
							{
								label: "Reason For Resignation",
								value: "reasonForResignation",
							},
							{ label: "Other Reason", value: "otherReason" },
							{ label: "Comment", value: "comment" },
							{
								label: "Proposed Last Day (L1)",
								value: "l1ProposedLastWorkingDay",
							},
							{
								label: "Proposed Number Of Recovery Days (L1)",
								value: "l1ProposedRecoveryDays",
							},
							{
								label: "Reson For Porposed Recovery Day (L1)",
								value: "l1ReasonForProposedRecoveryDays",
							},
							{ label: "Billing Type (L1)", value: "l1BillingType" },
							{ label: "Customer Name (L1)", value: "l1CustomerName" },

							{ label: "Final Recovery Days (L2)", value: "finalRecoveryDays" },
							{
								label: "Final Recovery Days Reason (L2)",
								value: "finalRecoveryDaysReason",
							},
							{
								label: "Organization Name (L2)",
								value: "l2NewOrganizationName",
							},

							{ label: "SalaryHike (L2)", value: "l2SalaryHike" },
							{ label: "Do Not ReHire (L2)", value: "doNotReHire" },
							{ label: "Billing Type (L2)", value: "l2BillingType" },
							{ label: "Customer Name (L2)", value: "l2CustomerName" },
							{ label: "Last Working Day (L2)", value: "l2LastWorkingDay" },
							{ label: "Admin Separation Type", value: "adminSeparationType" },
							{
								label: "Admin Separation Reason",
								value: "adminSeparationReason",
							},
							{ label: "Admin Other Reason", value: "adminOtherReason" },
							{ label: "Date Of Approval", value: "dateOfApproval" },
							{ label: "Notice Period Name", value: "noticePeriodName" },
							{
								label: "Notice Period Duration",
								value: "noticePeriodDuration",
							},
							{ label: "Updated By Name", value: "updatedByName" },
							{
								label: "Updated By Employee Number",
								value: "updatedByEmployeeNumber",
							},
							{ label: "Updated On", value: "updatedOn" },
							{ label: "Short Fall Payout", value: "shortFallPayout" },
							{ label: "Short Fall Payout Days", value: "shortFallPayoutDays" },

							{ label: "New Company Name", value: "newCompanyName" },
							{ label: "New CTC", value: "newCtc" },
							{ label: "New Role", value: "newRole" },
							{
								label: "NDA Letter Confirmation",
								value: "newLetterConfimation",
							},
						],
						content: arr,
					},
				];

				const settings = {
					fileName: `Employee_Master_${timestamp}`,
					extraLength: 3,
					writeOptions: {
						type: "buffer",
						bookType: "xlsx",
					},
				};

				const report = xlsx(data, settings);
				res.setHeader(
					"Content-Disposition",
					`attachment; filename=Separation_History_${timestamp}.xlsx`,
				);
				res.end(report);
			} else {
				res.status(404).json({
					message: "Data not found",
				});
			}
		} catch (error) {
			console.error("Error:", error);
			res.status(500).json({
				message: "An error occurred while exporting employee master data",
			});
		}
	}

	async shiftAndWeekOff(req, res) {
		try {
			const shiftMaster = await db.shiftMaster.findAll({
				attributes: ["shiftName"],
			});
			const weekOffMaster = await db.weekOffMaster.findAll({
				attributes: ["weekOffName"],
			});
			const attendancePolicyMaster = await db.attendancePolicymaster.findAll({
				attributes: ["policyName"],
			});

			let length =
				shiftMaster.length > weekOffMaster.length &&
				shiftMaster.length > attendancePolicyMaster.length
					? shiftMaster.length
					: weekOffMaster.length > attendancePolicyMaster.length
						? weekOffMaster.length
						: attendancePolicyMaster.length;

			let finalData = [];
			for (let index = 0; index < length; index++) {
				finalData.push({
					shift:
						shiftMaster[index] != undefined ? shiftMaster[index].shiftName : "",
					weekoff:
						weekOffMaster[index] != undefined
							? weekOffMaster[index].weekOffName
							: "",
					attendancepolicy:
						attendancePolicyMaster[index] != undefined
							? attendancePolicyMaster[index].policyName
							: "",
				});
			}

			const timestamp = moment().format("HH:mm");

			const data = [
				{
					sheet: "Shift and WeekOff Master",
					columns: [
						{ label: "Shift Master", value: "shift" },
						{ label: "Week Off Master", value: "weekoff" },
						{ label: "Attendance Policy Master", value: "attendancepolicy" },
					],
					content: finalData,
				},
			];

			const settings = {
				fileName: `Shift_and_WeekOff_Master_${timestamp}`,
				extraLength: 3,
				writeOptions: {
					type: "buffer",
					bookType: "xlsx",
				},
			};

			const report = xlsx(data, settings);
			res.setHeader(
				"Content-Disposition",
				`attachment; filename=Shift_and_WeekOff_Master_${timestamp}.xlsx`,
			);
			res.end(report);
		} catch (error) {
			console.error(error);
			return respHelper(res, {
				status: 500,
			});
		}
	}

	async separationWorkflow(req, res) {
		try {
			const {
				search,
				department,
				designation,
				buSearch,
				sbuSearch,
				areaSearch,
			} = req.query;
			let buFIlter = {};
			let sbbuFIlter = {};
			let functionAreaFIlter = {};
			let departmentFIlter = {};
			let designationFIlter = {};
			const usersData = req.userData;
			if (usersData.role_id == 4 || usersData.role_id == 5) {
				let permissionAssignTousers = [];
				if (usersData.permissionAndAccess) {
					permissionAssignTousers = usersData.permissionAndAccess
						.split(",")
						.map((el) => parseInt(el));
				}
				let permissionAndAccess = await db.permissoinandaccess.findAll({
					where: {
						role_id: usersData.role_id,
						isActive: 1,
						permissoinandaccessId: {
							[Op.in]: permissionAssignTousers,
						},
					},
				}); /// get all permission of access to fetch list with active status as per role
				const buArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "BU")
					.map((obj) => obj.permissionValue); // checking BU Access

				if (buArrayForFilter.length > 0) {
					buFIlter.buId = {
						///appedning Bu to filter
						[Op.in]: buArrayForFilter,
					};
				}

				const sbuArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "SBU")
					.map((obj) => obj.permissionValue); // checking SBU Access
				if (sbuArrayForFilter.length > 0) {
					sbbuFIlter.sbuId = {
						///appedning SBU to filter
						[Op.in]: sbuArrayForFilter,
					};
				}

				const departmentArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "DEPARTMENT")
					.map((obj) => obj.permissionValue); // checking department Access

				if (departmentArrayForFilter.length > 0) {
					departmentFIlter.departmentId = {
						///appedning department to filter
						[Op.in]: departmentArrayForFilter,
					};
				}
				const funcareaArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "FUNCAREA")
					.map((obj) => obj.permissionValue); // checking SBU Access

				if (funcareaArrayForFilter.length > 0) {
					functionAreaFIlter.functionalAreaId = {
						///appedning SBU to filter
						[Op.in]: funcareaArrayForFilter,
					};
				}

				const designationArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "DESIGNATION")
					.map((obj) => obj.permissionValue); // checking SBU Access

				if (designationArrayForFilter.length > 0) {
					designationFIlter.designationId = {
						///appedning SBU to filter
						[Op.in]: designationArrayForFilter,
					};
				}
			}

			const taskData = await db.separationInitiatedTask.findAll({
				attributes: [
					"resignationAutoId",
					"initiatedTaskAutoId",
					"taskAutoId",
					"status",
					"createdDt",
					"updatedBy",
					"updatedAt",
				],
				include: [
					{
						model: db.employeeMaster,
						required: true,
						attributes: ["empCode", "name", "buId", "companyId"],
						include: [
							{ model: db.designationMaster, attributes: ["name", "code"] },
							{
								model: db.departmentMaster,
								attributes: ["departmentName", "departmentCode"],
							},
							{
								model: db.separationMaster,
								required: true,
								where: {
									resignationAutoId: db.Sequelize.col(
										"separationinitiatedtask.resignationAutoId",
									),
								},
								attributes: [
									"resignationAutoId",
									"resignationDate",
									"l2LastWorkingDay",
									"noticePeriodLastWorkingDay",
								],
							},
							{ model: db.buMaster, attributes: ["buName", "buCode"] },
							{
								model: db.buMaster,
								attributes: ["buName"],
								where: {
									...buFIlter,
								},
								required: true,
							},
						],
					},
					{
						model: db.separationTaskMaster,
						attributes: ["taskAutoId", "taskName", "taskCode", "mappingData"],
					},
					{ model: db.employeeMaster, attributes: ["name", "empCode"] },
				],
			});

			let formattedData = [];

			for (const task of taskData) {
				let buhrData = "";
				const regex = /^(10|[1-9])(,(10|[1-9]))*$/;

				if (task.separationtaskmaster?.mappingData == "COMPANY,BU") {
					const headAndHrData = await db.buMapping.findOne({
						where: {
							buId: task.employee?.buId,
							companyId: task.employee?.companyId,
						},
						include: [
							{
								model: db.employeeMaster,
								attributes: ["name", "empCode"],
								as: "buhrData",
							},
						],
					});

					if (headAndHrData && headAndHrData.buhrData) {
						buhrData = `${headAndHrData.buhrData.name} (${headAndHrData.buhrData.empCode})`;
					}
				} else if (task.separationtaskmaster?.mappingData == "ME") {
					buhrData =
						task.employee?.name && task.employee?.empCode
							? `${task.employee.name} (${task.employee.empCode})`
							: task.employee?.name || task.employee?.empCode || "";
				} else if (
					task.separationtaskmaster?.mappingData &&
					task.separationtaskmaster.mappingData
						.split(",")
						.every((id) => !isNaN(id.trim()))
				) {
					let empIds = task.separationtaskmaster.mappingData
						.split(",")
						.map((id) => Number(id.trim())); // Convert to numbers

					if (empIds.length > 0) {
						const employees = await db.employeeMaster.findAll({
							attributes: ["name", "empCode"],
							where: { id: { [Op.in]: empIds } },
							raw: true,
						});

						buhrData = employees
							.map((emp) => `${emp.name} (${emp.empCode})`)
							.join(", ");
					} else {
						buhrData = "";
					}
				}

				formattedData.push({
					Employee_Code: task.employee?.empCode || "",
					Employee_Name: task.employee?.name || "",
					Job_Title: task.employee?.designationmaster?.name
						? `${task.employee.designationmaster.name} (${task.employee.designationmaster.code})`
						: "",
					Department: task.employee?.departmentmaster?.departmentName
						? `${task.employee.departmentmaster.departmentName} (${task.employee.departmentmaster.departmentCode})`
						: "",
					Resignation_Date: task.employee?.separationmaster?.resignationDate
						? moment(task.employee.separationmaster.resignationDate).format(
								"DD-MM-YYYY",
							)
						: "",
					Last_Working_Day: task.employee?.separationmaster
						?.noticePeriodLastWorkingDay
						? moment(
								task.employee.separationmaster.noticePeriodLastWorkingDay,
							).format("DD-MM-YYYY")
						: "",
					Task_Name: task.separationtaskmaster?.taskName || "",
					Task_Code: task.separationtaskmaster?.taskCode || "",
					Task_Status: task.status == 0 ? "Pending" : "Completed",
					Business_Unit: task.employee?.bumaster?.buName || "",
					ConfiguredTaskTriggerDate:
						moment(task.createdDt).format("DD-MM-YYYY") || "",
					ActualTaskTriggerDate:
						moment(task.createdDt).format("DD-MM-YYYY") || "",
					TaskCompletedBy:
						task.initiateUpdatedBy?.name && task.initiateUpdatedBy?.empCode
							? `${task.initiateUpdatedBy.name} (${task.initiateUpdatedBy.empCode})`
							: "",
					TaskCompletionDate: task.updatedAt
						? moment(task.updatedAt).format("DD-MM-YYYY")
						: "",
					TransactionDate: moment(task.createdDt).format("DD-MM-YYYY") || "",
					taskAutoId: task.taskAutoId,
					Task_Holder: buhrData,
				});
			}

			if (formattedData.length > 0) {
				const timestamp = moment().format("HH:mm");
				const data = [
					{
						sheet: "Separation Workflow",
						columns: [
							{ label: "Employees ID", value: "Employee_Code" },
							{ label: "Name", value: "Employee_Name" },
							{ label: "Job Title", value: "Job_Title" },
							{ label: "Department", value: "Department" },
							{ label: "Business Unit", value: "Business_Unit" },
							{ label: "Date Of Resignation", value: "Resignation_Date" },
							{ label: "Last Working Day", value: "Last_Working_Day" },
							{ label: "Task Name", value: "Task_Name" },
							{ label: "Task Holder", value: "Task_Holder" },
							{
								label: "Configured Task Trigger Date",
								value: "ConfiguredTaskTriggerDate",
							},
							{
								label: "Actual Task Trigger Date",
								value: "ActualTaskTriggerDate",
							},
							{ label: "Task Status", value: "Task_Status" },
							{ label: "Task Complete By", value: "TaskCompletedBy" },
							{ label: "Task Completion Date", value: "TaskCompletionDate" },
							{ label: "Transaction Date", value: "TransactionDate" },
						],
						content: formattedData,
					},
				];
				const settings = {
					fileName: `Separation_Workflow_${timestamp}`,
					extraLength: 3,
					writeOptions: { type: "buffer", bookType: "xlsx" },
				};
				const report = xlsx(data, settings);
				res.setHeader(
					"Content-Disposition",
					`attachment; filename=Separation Workflow.xlsx`,
				);
				res.end(report);
			}
		} catch (error) {
			console.error("Error:", error);
			res.status(500).json({
				message: "An error occurred while exporting separation workflow data",
			});
		}
	}

	async attendanceAssignment(req, res) {
		try {
			const {
				search,
				department,
				designation,
				buSearch,
				sbuSearch,
				areaSearch,
				grade,
				attendanceFor,
				employeeType,
				businessUnit,
				companyId,
				companyLocation,
			} = req.query;

			let buFIlter = {};
			let sbbuFIlter = {};
			let functionAreaFIlter = {};
			let departmentFIlter = {};
			let designationFIlter = {};
			const usersData = req.userData;
			let employeeDataExisting = [];
			if (usersData.role_id == 4 || usersData.role_id == 5) {
				let permissionAssignTousers = [];
				if (usersData.permissionAndAccess) {
					permissionAssignTousers = usersData.permissionAndAccess
						.split(",")
						.map((el) => parseInt(el));
				}
				let permissionAndAccess = await db.permissoinandaccess.findAll({
					where: {
						role_id: usersData.role_id,
						isActive: 1,
						permissoinandaccessId: {
							[Op.in]: permissionAssignTousers,
						},
					},
				}); /// get all permission of access to fetch list with active status as per role
				const buArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "BU")
					.map((obj) => obj.permissionValue); // checking BU Access

				if (buArrayForFilter.length > 0) {
					buFIlter.buId = {
						///appedning Bu to filter
						[Op.in]: buArrayForFilter,
					};
				}

				const sbuArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "SBU")
					.map((obj) => obj.permissionValue); // checking SBU Access
				if (sbuArrayForFilter.length > 0) {
					sbbuFIlter.sbuId = {
						///appedning SBU to filter
						[Op.in]: sbuArrayForFilter,
					};
				}

				const departmentArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "DEPARTMENT")
					.map((obj) => obj.permissionValue); // checking department Access

				if (departmentArrayForFilter.length > 0) {
					departmentFIlter.departmentId = {
						///appedning department to filter
						[Op.in]: departmentArrayForFilter,
					};
				}
				const funcareaArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "FUNCAREA")
					.map((obj) => obj.permissionValue); // checking SBU Access

				if (funcareaArrayForFilter.length > 0) {
					functionAreaFIlter.functionalAreaId = {
						///appedning SBU to filter
						[Op.in]: funcareaArrayForFilter,
					};
				}

				const designationArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "DESIGNATION")
					.map((obj) => obj.permissionValue); // checking SBU Access

				if (designationArrayForFilter.length > 0) {
					designationFIlter.designationId = {
						///appedning SBU to filter
						[Op.in]: designationArrayForFilter,
					};
				}
			}

			employeeDataExisting = await db.employeeMaster.findAll({
				attributes: [
					"id",
					"empCode",
					"name",
					"email",
					"personalEmail",
					"firstName",
					"lastName",
					"officeMobileNumber",
					"buId",
					"companyId",
					"personalMobileNumber",
					"drivingLicence",
					"passportNumber",
					"lastIncrementDate",
					"iqTestApplicable",
					"positionType",
					"newCustomerName",
					"recruiterName",
					"dataCardAdmin",
					"visitingCardAdmin",
					"workstationAdmin",
					"dateOfexit",
					"isActive",
					"offRoleCTC",
					"ESICPFDeduction",
					"isLoginActive",
				],
				where: {
					//empCode: "18950",
					companyId: companyId,
					...(attendanceFor == 0 && { isActive: 0 }),
					...(attendanceFor == 1 && { isActive: 1 }),
					...(attendanceFor == 2 && { isActive: [0, 1] }),
					...(search && { id: { [Op.in]: search.split(",") } }),
					...(employeeType && {
						employeeType: { [Op.in]: employeeType.split(",") },
					}),
					...(businessUnit && {
						buId: { [Op.in]: businessUnit.split(",") },
					}),
					...(department && {
						departmentId: { [Op.in]: department.split(",") },
					}),
					...(companyLocation && {
						companyLocationId: { [Op.in]: companyLocation.split(",") },
					}),
				},
				include: [
					{
						model: db.designationMaster,
						attributes: ["name", "code"],
						where: {
							...designationFIlter,
						},
						required: false,
					},
					{
						model: db.departmentMaster,
						attributes: ["departmentName", "departmentCode"],
						where: {
							...departmentFIlter,
						},
						required: true,
					},
					{
						model: db.buMaster,
						attributes: ["buName"],
						where: {
							...buFIlter,
						},
						required: true,
					},
					{ model: db.shiftMaster, attributes: ["shiftName"] },
					{ model: db.attendancePolicymaster, attributes: ["policyName"] },
					{ model: db.weekOffMaster, attributes: ["weekOffName"] },
				],
			});

			const arr = [];
			for (let i = 0; i < employeeDataExisting.length; i++) {
				const ele = employeeDataExisting[i];
				const data = {
					id: ele.dataValues.id || "",
					empCode: ele.dataValues.empCode || "",
					name: ele.dataValues.name || "",
					email: ele.dataValues.email || "",
					personalEmail: ele.dataValues.personalEmail || "",
					firstName: ele.dataValues.firstName || "",
					lastName: ele.dataValues.lastName || "",
					officeMobileNumber: ele.dataValues.officeMobileNumber || "",
					designation_name: ele.dataValues.designationmaster
						? `${ele.dataValues.designationmaster.name || ""} (${
								ele.dataValues.designationmaster.code || ""
							})`.trim()
						: "",
					designation_code: ele.dataValues.designationmaster?.code || "",
					department_name: ele.dataValues.departmentmaster?.departmentName
						? `${ele.dataValues.departmentmaster.departmentName} (${ele.dataValues.departmentmaster.departmentCode || ""})`
						: "",
					bu_name: ele.dataValues.bumaster?.buName || "",
					shiftName: ele.shiftsmaster?.shiftName || "",
					attendancePolicymaster: ele.attendancePolicymaster?.policyName || "",
					weekOffMaster: ele.weekOffMaster?.weekOffName || "",
					isLoginActive: ele.dataValues.isLoginActive == 1 ? "Yes" : "No",
				};

				arr.push(data);
			}

			if (arr.length > 0) {
				const timestamp = moment().format("h:mm A");

				const data = [
					{
						sheet: "Employee Assignment",
						columns: [
							{ label: "Employee ID", value: "empCode" },
							{ label: "Name", value: "name" },
							{ label: "Job Title", value: "designation_name" },
							{ label: "Department", value: "department_name" },
							{ label: "Business Unit", value: "bu_name" },
							{ label: "Shift Name", value: "shiftName" },
							{ label: "Policy Name", value: "attendancePolicymaster" },
							{ label: "Weekly Off Name", value: "weekOffMaster" },
							{ label: "Is Punch In/Out allowed", value: "isLoginActive" },
						],
						content: arr,
					},
				];

				const settings = {
					fileName: `Employee_Master_${timestamp}`,
					extraLength: 3,
					writeOptions: {
						type: "buffer",
						bookType: "xlsx",
					},
				};

				const report = xlsx(data, settings);
				res.setHeader(
					"Content-Disposition",
					`attachment; filename=Employee Assignment.xlsx`,
				);
				res.end(report);
			} else {
				res.status(404).json({
					message: "Data not found",
				});
			}
		} catch (error) {
			console.error("Error:", error);
			res.status(500).json({
				message: "An error occurred while exporting employee master data",
			});
		}
	}

	async pendingAttendanceRequest(req, res) {
		try {
			const {
				startDate,
				endDate,
				search,
				employeeType,
				businessUnit,
				grade,
				department,
				companyLocation,
				attendanceFor,
				companyId,
			} = req.query;

			let buFIlter = {};
			let sbbuFIlter = {};
			let functionAreaFIlter = {};
			let departmentFIlter = {};
			let designationFIlter = {};
			const usersData = req.userData;
			let employeeDataExisting = [];
			if (usersData.role_id == 4 || usersData.role_id == 5) {
				let permissionAssignTousers = [];
				if (usersData.permissionAndAccess) {
					permissionAssignTousers = usersData.permissionAndAccess
						.split(",")
						.map((el) => parseInt(el));
				}
				let permissionAndAccess = await db.permissoinandaccess.findAll({
					where: {
						role_id: usersData.role_id,
						isActive: 1,
						permissoinandaccessId: {
							[Op.in]: permissionAssignTousers,
						},
					},
				}); /// get all permission of access to fetch list with active status as per role
				const buArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "BU")
					.map((obj) => obj.permissionValue); // checking BU Access

				if (buArrayForFilter.length > 0) {
					buFIlter.buId = {
						///appedning Bu to filter
						[Op.in]: buArrayForFilter,
					};
				}

				const sbuArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "SBU")
					.map((obj) => obj.permissionValue); // checking SBU Access
				if (sbuArrayForFilter.length > 0) {
					sbbuFIlter.sbuId = {
						///appedning SBU to filter
						[Op.in]: sbuArrayForFilter,
					};
				}

				const departmentArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "DEPARTMENT")
					.map((obj) => obj.permissionValue); // checking department Access

				if (departmentArrayForFilter.length > 0) {
					departmentFIlter.departmentId = {
						///appedning department to filter
						[Op.in]: departmentArrayForFilter,
					};
				}
				const funcareaArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "FUNCAREA")
					.map((obj) => obj.permissionValue); // checking SBU Access

				if (funcareaArrayForFilter.length > 0) {
					functionAreaFIlter.functionalAreaId = {
						///appedning SBU to filter
						[Op.in]: funcareaArrayForFilter,
					};
				}

				const designationArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "DESIGNATION")
					.map((obj) => obj.permissionValue); // checking SBU Access

				if (designationArrayForFilter.length > 0) {
					designationFIlter.designationId = {
						///appedning SBU to filter
						[Op.in]: designationArrayForFilter,
					};
				}
			}
			const attendanceData = await db.attendanceMaster.findAll({
				attributes: [
					"attendanceDate",
					"attendanceStatus",
					"attendancePresentStatus",
					"attendancePunchInLocation",
					"attendancePunchOutLocation",
					"attendancePunchInTime",
					"attendancePunchOutTime",
					"attendancePunchInRemark",
					"attendancePunchOutRemark",
					"attendancePunchInLocationType",
					"attendancePunchOutLocationType",
					"punchInSource",
					"punchOutSource",
					"createdBy",
					"createdAt",
					"updatedBy",
					"updatedAt",
				],
				where: {
					attendanceDate: {
						[db.Sequelize.Op.between]: [startDate, endDate],
					},
				},
				include: [
					{
						model: db.employeeMaster,
						attributes: ["id", "name", "empCode"],
						where: {
							// isActive: 1,
							// attendanceFor,
							companyId: companyId,
							...(attendanceFor == 0 && { isActive: 0 }),
							...(attendanceFor == 1 && { isActive: 1 }),
							...(attendanceFor == 2 && { isActive: [0, 1] }),
							...(search && { id: { [Op.in]: search.split(",") } }),
							...(employeeType && {
								employeeType: { [Op.in]: employeeType.split(",") },
							}),
							...(businessUnit && {
								buId: { [Op.in]: businessUnit.split(",") },
							}),
							...(department && {
								departmentId: { [Op.in]: department.split(",") },
							}),
							...(companyLocation && {
								companyLocationId: { [Op.in]: companyLocation.split(",") },
							}),
						},
						include: [
							{
								model: db.departmentMaster,
								attributes: [
									"departmentId",
									"departmentName",
									"departmentCode",
								],
								where: {
									...departmentFIlter,
								},
							},
							{
								model: db.designationMaster,
								attributes: ["name", "code"],
							},
							{
								model: db.jobDetails,
								attributes: ["jobId"],
								where: {
									...(grade && { gradeId: { [Op.in]: grade.split(",") } }),
								},
								include: [
									{
										model: db.gradeMaster,
										attributes: ["gradeName"],
									},
								],
							},
							{
								model: db.buMaster,
								attributes: ["buName", "buCode"],
								required: false,
								where: {
									...buFIlter,
								},
							},
							{
								model: db.sbuMaster,
								attributes: ["sbuname", "code"],
								required: false,
								where: {
									...sbbuFIlter,
								},
							},
							{
								model: db.functionalAreaMaster,
								attributes: ["functionalAreaName", "functionalAreaCode"],
								required: false,
							},
							{
								model: db.employeeMaster,
								required: false,
								as: "managerData",
								attributes: ["id", "name", "email", "empCode"],
							},
						],
					},
					{
						model: db.regularizationMaster,
						where: { regularizeStatus: "Pending" },
						as: "latest_Regularization_Request",
						include: [
							{
								model: db.employeeMaster,
								attributes: ["name", "empCode"],
							},
						],
						//limit: 1,
						order: [["createdAt", "desc"]],
						required: true,
					},
				],
				raw: true,
			});

			if (attendanceData.length > 0) {
				const simplifiedData = await Promise.all(
					attendanceData.map(async (record) => ({
						employeeCode: record["employee.empCode"],
						employeeName: record["employee.name"],
						buName:
							record["employee.bumaster.buName"] +
							" " +
							"(" +
							record["employee.bumaster.buCode"] +
							")",
						departmentName:
							record["employee.departmentmaster.departmentName"] +
							" " +
							"(" +
							record["employee.departmentmaster.departmentCode"] +
							")",
						designationName:
							record["employee.designationmaster.name"] +
							" " +
							"(" +
							record["employee.designationmaster.code"] +
							")",
						//regularizePunchInDate:record["latest_Regularization_Request.regularizePunchInDate"],
						regularizePunchInDate: record[
							"latest_Regularization_Request.regularizePunchInDate"
						]
							? moment(
									record["latest_Regularization_Request.regularizePunchInDate"],
								).format("DD-MM-YYYY")
							: "",
						// regularizePunchOutDate:record["latest_Regularization_Request.regularizePunchOutDate"],
						regularizePunchOutDate: record[
							"latest_Regularization_Request.regularizePunchOutDate"
						]
							? moment(
									record[
										"latest_Regularization_Request.regularizePunchOutDate"
									],
								).format("DD-MM-YYYY")
							: "",
						regularizeUserRemark:
							record["latest_Regularization_Request.regularizeUserRemark"],
						regularizePunchInTime:
							record["latest_Regularization_Request.regularizePunchInTime"],
						regularizePunchOutTime:
							record["latest_Regularization_Request.regularizePunchOutTime"],
						regularizeReason:
							record["latest_Regularization_Request.regularizeReason"],
						//createdAt:record["latest_Regularization_Request.createdAt"],
						createdAt: record["latest_Regularization_Request.createdAt"]
							? moment(
									record["latest_Regularization_Request.createdAt"],
								).format("DD-MM-YYYY HH:mm:ss")
							: "",
						requestType: "Attendance Request",
						managerName:
							record["latest_Regularization_Request.employee.name"] +
							" " +
							"(" +
							record["latest_Regularization_Request.employee.empCode"] +
							")",
						attestationStatus: "N/A",
						status: record["latest_Regularization_Request.regularizeStatus"],
					})),
				);

				if (simplifiedData.length > 0) {
					const timestamp = Date.now();
					const data = [
						{
							sheet: "Pending Attendance Report",
							columns: [
								{ label: "Employee ID", value: "employeeCode" },
								{ label: "Name", value: "employeeName" },
								{ label: "Job Title", value: "designationName" },
								{ label: "Department", value: "departmentName" },
								{ label: "Business Unit", value: "buName" },
								{ label: "Request From Date", value: "regularizePunchInDate" },
								{ label: "Request To Date", value: "regularizePunchOutDate" },
								{ label: "Clockin", value: "regularizePunchInTime" },
								{ label: "Clockout", value: "regularizePunchOutTime" },
								{ label: "Applied On", value: "createdAt" },
								{ label: "Pending With", value: "managerName" },
								{ label: "Request Type", value: "requestType" },
								{ label: "Reason", value: "regularizeReason" },
								{ label: "Status", value: "status" },
								{ label: "Remark", value: "regularizeUserRemark" },
							],
							content: simplifiedData,
						},
					];

					let settings = {
						writeOptions: {
							type: "buffer",
							bookType: "xlsx",
						},
					};
					const buffer = xlsx(data, settings);
					res.writeHead(200, {
						"Content-Type": "application/octet-stream",
						"Content-disposition": `attachment; filename=Pending Attendance Report.xlsx`,
					});
					res.end(buffer);
				}
			} else {
				return respHelper(res, {
					status: 404,
					message: "Data not availble for available dates",
				});
			}
		} catch (error) {
			console.error(error);
			return res.status(500).json({
				status: false,
				message: "Internal Server Error",
			});
		}
	}

	async approvedAttendanceRequest(req, res) {
		try {
			const {
				startDate,
				endDate,
				search,
				employeeType,
				businessUnit,
				grade,
				department,
				companyLocation,
				attendanceFor,
				companyId,
			} = req.query;

			let buFIlter = {};
			let sbbuFIlter = {};
			let functionAreaFIlter = {};
			let departmentFIlter = {};
			let designationFIlter = {};
			const usersData = req.userData;
			let employeeDataExisting = [];
			if (usersData.role_id == 4 || usersData.role_id == 5) {
				let permissionAssignTousers = [];
				if (usersData.permissionAndAccess) {
					permissionAssignTousers = usersData.permissionAndAccess
						.split(",")
						.map((el) => parseInt(el));
				}
				let permissionAndAccess = await db.permissoinandaccess.findAll({
					where: {
						//role_id: usersData.role_id,
						isActive: 1,
						permissoinandaccessId: {
							[Op.in]: permissionAssignTousers,
						},
					},
				});
				const buArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "BU")
					.map((obj) => obj.permissionValue);

				if (buArrayForFilter.length > 0) {
					buFIlter.buId = {
						[Op.in]: buArrayForFilter,
					};
				}

				const sbuArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "SBU")
					.map((obj) => obj.permissionValue);
				if (sbuArrayForFilter.length > 0) {
					sbbuFIlter.sbuId = {
						[Op.in]: sbuArrayForFilter,
					};
				}

				const departmentArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "DEPARTMENT")
					.map((obj) => obj.permissionValue);

				if (departmentArrayForFilter.length > 0) {
					departmentFIlter.departmentId = {
						[Op.in]: departmentArrayForFilter,
					};
				}
				const funcareaArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "FUNCAREA")
					.map((obj) => obj.permissionValue);

				if (funcareaArrayForFilter.length > 0) {
					functionAreaFIlter.functionalAreaId = {
						[Op.in]: funcareaArrayForFilter,
					};
				}

				const designationArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "DESIGNATION")
					.map((obj) => obj.permissionValue);

				if (designationArrayForFilter.length > 0) {
					designationFIlter.designationId = {
						[Op.in]: designationArrayForFilter,
					};
				}
			}
			const attendanceData = await db.attendanceMaster.findAll({
				attributes: [
					"attendanceDate",
					"attendanceStatus",
					"attendancePresentStatus",
					"attendancePunchInLocation",
					"attendancePunchOutLocation",
					"attendancePunchInTime",
					"attendancePunchOutTime",
					"attendancePunchInRemark",
					"attendancePunchOutRemark",
					"attendancePunchInLocationType",
					"attendancePunchOutLocationType",
					"punchInSource",
					"punchOutSource",
					"createdBy",
					"createdAt",
					"updatedBy",
					"updatedAt",
				],
				where: {
					attendanceDate: {
						[db.Sequelize.Op.between]: [startDate, endDate],
					},
				},
				include: [
					{
						model: db.employeeMaster,
						attributes: ["id", "name", "empCode"],
						where: {
							companyId: companyId,
							...(attendanceFor == 0 && { isActive: 0 }),
							...(attendanceFor == 1 && { isActive: 1 }),
							...(attendanceFor == 2 && { isActive: [0, 1] }),
							...(search && { id: { [Op.in]: search.split(",") } }),
							...(employeeType && {
								employeeType: { [Op.in]: employeeType.split(",") },
							}),
							...(businessUnit && {
								buId: { [Op.in]: businessUnit.split(",") },
							}),
							...(department && {
								departmentId: { [Op.in]: department.split(",") },
							}),
							...(companyLocation && {
								companyLocationId: { [Op.in]: companyLocation.split(",") },
							}),
						},
						include: [
							{
								model: db.departmentMaster,
								attributes: [
									"departmentId",
									"departmentName",
									"departmentCode",
								],
								where: {
									...departmentFIlter,
								},
							},
							{
								model: db.designationMaster,
								attributes: ["name", "code"],
							},
							{
								model: db.jobDetails,
								attributes: ["jobId"],
								where: {
									...(grade && { gradeId: { [Op.in]: grade.split(",") } }),
								},
								include: [
									{
										model: db.gradeMaster,
										attributes: ["gradeName"],
									},
								],
							},
							{
								model: db.buMaster,
								attributes: ["buName", "buCode"],
								required: false,
								where: {
									...buFIlter,
								},
							},
							{
								model: db.sbuMaster,
								attributes: ["sbuname", "code"],
								required: false,
								where: {
									...sbbuFIlter,
								},
							},
							{
								model: db.functionalAreaMaster,
								attributes: ["functionalAreaName", "functionalAreaCode"],
								required: false,
							},
							{
								model: db.employeeMaster,
								required: false,
								as: "managerData",
								attributes: ["id", "name", "email", "empCode"],
							},
						],
					},
					{
						model: db.regularizationMaster,
						where: { regularizeStatus: "Approved" },
						as: "latest_Regularization_Request",
						include: [
							{
								model: db.employeeMaster,
								attributes: ["name", "empCode"],
							},
						],
						//limit: 1,
						order: [["createdAt", "desc"]],
						required: true,
					},
				],
				raw: true,
			});

			if (attendanceData.length > 0) {
				const simplifiedData = await Promise.all(
					attendanceData.map(async (record) => ({
						employeeCode: record["employee.empCode"],
						employeeName: record["employee.name"],
						buName:
							record["employee.bumaster.buName"] +
							" " +
							"(" +
							record["employee.bumaster.buCode"] +
							")",
						departmentName:
							record["employee.departmentmaster.departmentName"] +
							" " +
							"(" +
							record["employee.departmentmaster.departmentCode"] +
							")",
						designationName:
							record["employee.designationmaster.name"] +
							" " +
							"(" +
							record["employee.designationmaster.code"] +
							")",
						//regularizePunchInDate:record["latest_Regularization_Request.regularizePunchInDate"],
						regularizePunchInDate: record[
							"latest_Regularization_Request.regularizePunchInDate"
						]
							? moment(
									record["latest_Regularization_Request.regularizePunchInDate"],
								).format("DD-MM-YYYY")
							: "",
						// regularizePunchOutDate:record["latest_Regularization_Request.regularizePunchOutDate"],
						regularizePunchOutDate: record[
							"latest_Regularization_Request.regularizePunchOutDate"
						]
							? moment(
									record[
										"latest_Regularization_Request.regularizePunchOutDate"
									],
								).format("DD-MM-YYYY")
							: "",
						regularizeUserRemark:
							record["latest_Regularization_Request.regularizeUserRemark"] ||
							"",
						regularizePunchInTime:
							record["latest_Regularization_Request.regularizePunchInTime"],
						regularizePunchOutTime:
							record["latest_Regularization_Request.regularizePunchOutTime"],
						regularizeReason:
							record["latest_Regularization_Request.regularizeReason"],
						//createdAt:record["latest_Regularization_Request.createdAt"],
						createdAt: record["latest_Regularization_Request.createdAt"]
							? moment(
									record["latest_Regularization_Request.createdAt"],
								).format("DD-MM-YYYY HH:mm:ss")
							: "",
						updatedAt: record["latest_Regularization_Request.updatedAt"]
							? moment(
									record["latest_Regularization_Request.updatedAt"],
								).format("DD-MM-YYYY HH:mm:ss")
							: "",
						requestType: "Attendance Request",
						managerName:
							record["latest_Regularization_Request.employee.name"] +
							" " +
							"(" +
							record["latest_Regularization_Request.employee.empCode"] +
							")",
						attestationStatus: "N/A",
						status: record["latest_Regularization_Request.regularizeStatus"],
						regularizeManagerRemark:
							record["latest_Regularization_Request.regularizeManagerRemark"] ||
							"",
					})),
				);

				if (simplifiedData.length > 0) {
					const timestamp = Date.now();
					const data = [
						{
							sheet: "Pending Attendance Report",
							columns: [
								{ label: "Employee ID", value: "employeeCode" },
								{ label: "Name", value: "employeeName" },
								{ label: "Job Title", value: "designationName" },
								{ label: "Department", value: "departmentName" },
								{ label: "Business Unit", value: "buName" },
								{ label: "Request From Date", value: "regularizePunchInDate" },
								{ label: "Request To Date", value: "regularizePunchOutDate" },
								{ label: "Clockin", value: "regularizePunchInTime" },
								{ label: "Clockout", value: "regularizePunchOutTime" },
								{ label: "Applied On", value: "createdAt" },
								{ label: "Approved On", value: "updatedAt" },
								{ label: "Approved By", value: "managerName" },
								{ label: "Request Type", value: "requestType" },
								{ label: "Approver Comment", value: "regularizeManagerRemark" },
								{ label: "Reason", value: "regularizeReason" },
								{ label: "Status", value: "status" },
								{ label: "Remark", value: "regularizeUserRemark" },
							],
							content: simplifiedData,
						},
					];

					let settings = {
						writeOptions: {
							type: "buffer",
							bookType: "xlsx",
						},
					};
					const buffer = xlsx(data, settings);
					res.writeHead(200, {
						"Content-Type": "application/octet-stream",
						"Content-disposition": `attachment; filename=Approved Attendance Report.xlsx`,
					});
					res.end(buffer);
				}
			} else {
				return respHelper(res, {
					status: 404,
					message: "Data not availble for available dates",
				});
			}
		} catch (error) {
			console.error(error);
			return res.status(500).json({
				status: false,
				message: "Internal Server Error",
			});
		}
	}

	async familyDetails(req, res) {
		try {
			const {
				search,
				department,
				businessUnit,
				employeeType,
				companyLocation,
				sbuSearch,
				areaSearch,
				attendanceFor,
				companyId,
			} = req.query;

			let buFIlter = {};
			let sbbuFIlter = {};
			let functionAreaFIlter = {};
			let departmentFIlter = {};
			let designationFIlter = {};
			const usersData = req.userData;
			if (usersData.role_id == 4 || usersData.role_id == 5) {
				let permissionAssignTousers = [];
				if (usersData.permissionAndAccess) {
					permissionAssignTousers = usersData.permissionAndAccess
						.split(",")
						.map((el) => parseInt(el));
				}
				let permissionAndAccess = await db.permissoinandaccess.findAll({
					where: {
						//role_id: usersData.role_id,
						isActive: 1,
						permissoinandaccessId: {
							[Op.in]: permissionAssignTousers,
						},
					},
				}); /// get all permission of access to fetch list with active status as per role
				const buArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "BU")
					.map((obj) => obj.permissionValue); // checking BU Access

				if (buArrayForFilter.length > 0) {
					buFIlter.buId = {
						///appedning Bu to filter
						[Op.in]: buArrayForFilter,
					};
				}

				const sbuArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "SBU")
					.map((obj) => obj.permissionValue); // checking SBU Access
				if (sbuArrayForFilter.length > 0) {
					sbbuFIlter.sbuId = {
						///appedning SBU to filter
						[Op.in]: sbuArrayForFilter,
					};
				}

				const departmentArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "DEPARTMENT")
					.map((obj) => obj.permissionValue); // checking department Access

				if (departmentArrayForFilter.length > 0) {
					departmentFIlter.departmentId = {
						///appedning department to filter
						[Op.in]: departmentArrayForFilter,
					};
				}
				const funcareaArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "FUNCAREA")
					.map((obj) => obj.permissionValue); // checking SBU Access

				if (funcareaArrayForFilter.length > 0) {
					functionAreaFIlter.functionalAreaId = {
						///appedning SBU to filter
						[Op.in]: funcareaArrayForFilter,
					};
				}

				const designationArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "DESIGNATION")
					.map((obj) => obj.permissionValue); // checking SBU Access

				if (designationArrayForFilter.length > 0) {
					designationFIlter.designationId = {
						///appedning SBU to filter
						[Op.in]: designationArrayForFilter,
					};
				}
			}

			const employeeData = await db.employeeMaster.findAndCountAll({
				attributes: ["empCode", "firstName", "lastName"],
				where: {
					companyId: companyId,
					...(attendanceFor == 0 && { isActive: 0 }),
					...(attendanceFor == 1 && { isActive: 1 }),
					...(attendanceFor == 2 && { isActive: [0, 1] }),
					...(search && { id: { [Op.in]: search.split(",") } }),
					...(employeeType && {
						employeeType: { [Op.in]: employeeType.split(",") },
					}),
					...(businessUnit && {
						buId: { [Op.in]: businessUnit.split(",") },
					}),
					...(department && {
						departmentId: { [Op.in]: department.split(",") },
					}),
					...(companyLocation && {
						companyLocationId: { [Op.in]: companyLocation.split(",") },
					}),
				},
				include: [
					{
						model: db.buMaster,
						attributes: ["buName", "buCode"],
						where: {
							...buFIlter,
						},
						required: true,
					},
					{
						model: db.departmentMaster,
						attributes: ["departmentName", "departmentCode"],
						where: {
							...departmentFIlter,
						},
						required: true,
					},
					{
						model: db.familyDetails,
						attributes: [
							"name",
							"dob",
							"gender",
							"mobileNo",
							"relationWithEmp",
						],
						as: "employeefamilydetails",
					},
				],
			});

			let familyDetails = [];

			// Extract family details from employee records
			employeeData.rows.forEach((employee) => {
				employee.employeefamilydetails.forEach((family) => {
					const extractedFamily = {
						empCode: employee.empCode || "",
						name: `${employee.firstName} ${employee.lastName}`.trim(),
						familyName: family.name || "",
						dob: family.dob || "",
						gender: family.gender || "",
						mobileNo: family.mobileNo || "",
						relationWithEmp: family.relationWithEmp || "",
					};
					familyDetails.push(extractedFamily);
				});
			});

			if (familyDetails.length > 0) {
				const timestamp = Date.now();
				const data = [
					{
						sheet: "Family Report",
						columns: [
							{ label: "Employee ID", value: "empCode" },
							{ label: "Employee Name", value: "name" },
							{ label: "Full Name", value: "familyName" },
							{ label: "Date of Birth", value: "dob" },
							{ label: "Relation", value: "relationWithEmp" },
							{ label: "Gender", value: "gender" },
							{ label: "Mobile Number", value: "mobileNo" },
						],
						content: familyDetails,
					},
				];

				let settings = {
					writeOptions: {
						type: "buffer",
						bookType: "xlsx",
					},
				};

				const buffer = xlsx(data, settings);
				res.writeHead(200, {
					"Content-Type": "application/octet-stream",
					"Content-disposition": `attachment; filename=Family Details Report.xlsx`,
				});
				res.end(buffer);
			} else {
				return res.status(404).json({
					status: false,
					message: "No family details found.",
					data: familyDetails,
				});
			}
		} catch (error) {
			console.error(error);
			return res.status(500).json({
				status: false,
				message: "Internal Server Error",
			});
		}
	}

	async ctcUploaded(req, res) {
		try {
			const { employeeType, search, businessUnit, companyId, attendanceFor } =
				req.query;
			let buFIlter = {};
			let companyFIlter = {};
			let departmentFIlter = {};
			let designationFIlter = {};
			const usersData = req.userData;
			let employeeDataExisting = [];
			if ([2, 4, 5].includes(usersData.role_id)) {
				let permissionAssignTousers = [];
				if (usersData.permissionAndAccess) {
					permissionAssignTousers = usersData.permissionAndAccess
						.split(",")
						.map((el) => parseInt(el));
				}
				let permissionAndAccess = await db.permissoinandaccess.findAll({
					where: {
						role_id: usersData.role_id,
						isActive: 1,
						permissoinandaccessId: {
							[Op.in]: permissionAssignTousers,
						},
					},
				}); /// get all permission of access to fetch list with active status as per role
				const buArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "BU")
					.map((obj) => obj.permissionValue); // checking BU Access

				if (buArrayForFilter.length > 0) {
					buFIlter.buId = {
						///appedning Bu to filter
						[Op.in]: buArrayForFilter,
					};
				}

				const comapnyArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "COMPANY")
					.map((obj) => obj.permissionValue); // checking SBU Access

				if (comapnyArrayForFilter.length > 0) {
					companyFIlter.companyId = {
						///appedning SBU to filter
						[Op.in]: comapnyArrayForFilter,
					};
				}

				const departmentArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "DEPARTMENT")
					.map((obj) => obj.permissionValue); // checking department Access

				if (departmentArrayForFilter.length > 0) {
					departmentFIlter.departmentId = {
						///appedning department to filter
						[Op.in]: departmentArrayForFilter,
					};
				}

				const designationArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "DESIGNATION")
					.map((obj) => obj.permissionValue); // checking SBU Access

				if (designationArrayForFilter.length > 0) {
					designationFIlter.designationId = {
						///appedning SBU to filter
						[Op.in]: designationArrayForFilter,
					};
				}
			} else {
				return res.status(403).send(fileAccessErrorResponse(403));
			}

			employeeDataExisting = await db.employeeMaster.findAll({
				attributes: ["id", "empCode", "name", "email", "isActive"],
				where: {
					companyId: companyId,
					...(attendanceFor == 0 && { isActive: 0 }),
					...(attendanceFor == 1 && { isActive: 1 }),
					...(attendanceFor == 2 && { isActive: [0, 1] }),
					...(search && { id: { [Op.in]: search.split(",") } }),
					...(employeeType && {
						employeeType: { [Op.in]: employeeType.split(",") },
					}),
					...(businessUnit && {
						buId: { [Op.in]: businessUnit.split(",") },
					}),
				},
				// raw:true,
				// nest:true,
				include: [
					{
						model: db.buMaster,
						attributes: ["buName"],
						where: {
							...buFIlter,
						},
						required: true,
					},
					{
						model: db.companyMaster,
						attributes: ["companyName", "companyCode"],
					},
					{
						model: db.designationMaster,
						attributes: ["name", "code"],
						where: {
							...designationFIlter,
						},
						// required: !!designation,
					},
					{
						model: db.departmentMaster,
						attributes: ["departmentName", "departmentCode"],
						where: {
							...departmentFIlter,
						},
						required: true,
					},
					{
						model: db.payPackage,
						attributes: [
							"payPackageAutoId",
							"payPackageEffectiveDate",
							"payPackageMonthlyCTC",
							"payPackageSalaryStructure",
						],
						as: "packageDetails",
						required: true,
						where: { isActive: 1 },
						include: [
							{
								model: db.payElements,
								attributes: ["salaryComponentAutoId", "payElementAmount"],
								as: "empPayElements",
								include: [
									{
										model: db.salaryComponent,
										attributes: [
											"salaryComponentCode",
											"salaryComponentAlias",
											"salaryComponentSequenceNo",
											"includeInPackage",
										],
									},
								],
							},
						],
					},
				],
				distinct: true,
			});

			// console.log(employeeDataExisting);
			//return;

			if (employeeDataExisting.length > 0) {
				const result = await transformData(employeeDataExisting);
				const resultData = getColumnsForSalary(result);
				// const uniqueKeys = [...new Set(result.flatMap(Object.keys))];
				const resultColumns = Object.fromEntries(
					resultData.map((key) => [key, 0]),
				);

				const columns = Object.keys(resultColumns).map((key) => ({
					label: key,
					value: key,
				}));

				// console.log(columns);
				const data = [
					{
						sheet: "Employee",
						columns: columns,
						content: result, // Use the JSON array as content
					},
				];
				const settings = {
					fileName: `Total_${Date.now()}`,
					extraLength: 3,
					writeOptions: {
						type: "buffer",
						bookType: "xlsx",
					},
				};
				const report = xlsx(data, settings);
				res.setHeader(
					"Content-Disposition",
					`attachment; filename=${"Employee"}_${"Structure"}_${moment(new Date()).format("YYYY-MM-DD HH:mm:ss")}.xlsx`,
				);
				return res.end(report);
			} else {
				return res.status(404).send(fileAccessErrorResponse(404));
			}
		} catch (error) {
			console.error("Error:", error);
			return res.status(500).send(fileAccessErrorResponse(500));
		}
	}
	async salaryGenerated(req, res) {
		try {
			const {
				startDate,
				endDate,
				employeeType,
				search,
				businessUnit,
				companyId,
				attendanceFor,
			} = req.query;
			let buFIlter = {};
			let companyFIlter = {};
			let departmentFIlter = {};
			let designationFIlter = {};
			let sMonth = (new Date(startDate).getMonth() + 1)
				.toString()
				.padStart(2, "0");
			let sYear = new Date(startDate).getFullYear();
			let salaryMonth = sYear + "-" + sMonth;
			const usersData = req.userData;
			let employeeDataExisting = [];
			if ([2, 4, 5].includes(usersData.role_id)) {
				let permissionAssignTousers = [];
				if (usersData.permissionAndAccess) {
					permissionAssignTousers = usersData.permissionAndAccess
						.split(",")
						.map((el) => parseInt(el));
				}
				let permissionAndAccess = await db.permissoinandaccess.findAll({
					where: {
						role_id: usersData.role_id,
						isActive: 1,
						permissoinandaccessId: {
							[Op.in]: permissionAssignTousers,
						},
					},
				}); /// get all permission of access to fetch list with active status as per role
				const buArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "BU")
					.map((obj) => obj.permissionValue); // checking BU Access

				if (buArrayForFilter.length > 0) {
					buFIlter.buId = {
						///appedning Bu to filter
						[Op.in]: buArrayForFilter,
					};
				}

				const comapnyArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "COMPANY")
					.map((obj) => obj.permissionValue); // checking SBU Access

				if (comapnyArrayForFilter.length > 0) {
					companyFIlter.companyId = {
						///appedning SBU to filter
						[Op.in]: comapnyArrayForFilter,
					};
				}

				const departmentArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "DEPARTMENT")
					.map((obj) => obj.permissionValue); // checking department Access

				if (departmentArrayForFilter.length > 0) {
					departmentFIlter.departmentId = {
						///appedning department to filter
						[Op.in]: departmentArrayForFilter,
					};
				}

				const designationArrayForFilter = permissionAndAccess
					.filter((obj) => obj.permissionType == "DESIGNATION")
					.map((obj) => obj.permissionValue); // checking SBU Access

				if (designationArrayForFilter.length > 0) {
					designationFIlter.designationId = {
						///appedning SBU to filter
						[Op.in]: designationArrayForFilter,
					};
				}
			} else {
				return res.status(403).send(fileAccessErrorResponse(403));
			}
			employeeDataExisting = await db.employeeMaster.findAll({
				attributes: ["id", "empCode", "name", "email", "isActive"],
				where: {
					companyId: companyId,
					...(attendanceFor == 0 && { isActive: 0 }),
					...(attendanceFor == 1 && { isActive: 1 }),
					...(attendanceFor == 2 && { isActive: [0, 1] }),
					...(search && { id: { [Op.in]: search.split(",") } }),
					...(employeeType && {
						employeeType: { [Op.in]: employeeType.split(",") },
					}),
					...(businessUnit && {
						buId: { [Op.in]: businessUnit.split(",") },
					}),
				},
				raw: true,
				include: [
					{
						model: db.buMaster,
						attributes: ["buName"],
						where: {
							...buFIlter,
						},
						required: true,
					},
					{
						model: db.companyMaster,
						attributes: ["companyName", "companyCode"],
					},
					{
						model: db.designationMaster,
						attributes: ["name", "code"],
						where: {
							...designationFIlter,
						},
						// required: !!designation,
					},
					{
						model: db.departmentMaster,
						attributes: ["departmentName", "departmentCode"],
						where: {
							...departmentFIlter,
						},
						required: true,
					},
				],
				distinct: true,
			});

			if (employeeDataExisting.length > 0) {
				const employeeIds = [];
				for (const element of employeeDataExisting) {
					// console.log(element.id);
					employeeIds.push(element.id);
				}
				const query = `SELECT p.actualWorkingDays "Present Days",p.totalWorkingDays AS "Total Days", e.dateOfexit AS "Exit Date", ej.dateOfJoining AS "Date of Joining", p.totalExtraDeduction AS "EXTRA DEDUCTION", p.extraPaymentCategories AS "EXTRA PAYMENT CATEGORIES", p.salaryComponentEarningType, p.esicEmployerAmount AS "ESIC Employer", p.esicEmployeeAmount AS "ESIC Employee", p.pfEmployeeAmount AS "PF Employee", p.pfEmployerAmount AS "PF Employer", p.salaryComponentCode, p.includeInPackage, p.isPfApplicableComponent, p.isPfApplicable, p.isPfRestriction, p.ptAmount AS "PT AMOUNT", p.lwfAmount AS "LWF AMOUNT", p.extrapaymentAmount AS "EXTRA PAYMENT AMOUNT", p.empName AS "Employee Name", COALESCE(p.lopDays, 0) AS "LOP Days", p.arrearMonth AS "Arrears Month", COALESCE(p.arrearDays, 0) AS "Arrears Days", p.tdsMonth AS "TDS Month", COALESCE(p.tdsAmount, 0) AS "TDS Amount", p.payPackageMonthlyCTC AS "Net Pay", p.payElementAmount AS "Element Amount", p.elementMonthlyAmount AS "Monthly Element Amount", p.extraDeductionCategories AS "Advance Name", COALESCE(p.totalExtraDeduction, 0) AS "Advance Amount", e.empCode AS "Employee Id", CASE WHEN TRIM(p.salaryComponentAlias) IS NULL OR TRIM(p.salaryComponentAlias) = '' THEN p.salaryComponentCode ELSE p.salaryComponentAlias END AS "Element Name", SUM(CASE WHEN p.includeInPackage = 1 THEN p.elementMonthlyAmount ELSE 0 END) OVER (PARTITION BY p.empId) AS "Gross Earning", ed.deductionCategory AS "Deduction Category", ed.deductionAmount AS "Deduction Amount", bu.buName AS "Business Unit", epd.paymentAccountNumber AS "Account No", epd.paymentBankName AS "Bank Name", epd.paymentBankIfsc AS "IFSC" FROM ${dbName}.paymonthlyelement p JOIN ${dbName}.employee e ON p.empId = e.id LEFT JOIN ${dbName}.employeejobdetails ej ON e.id = ej.userId LEFT JOIN ${dbName}.extradeductions ed ON p.empId = ed.EmployeeId AND p.payMonth = ed.startMonth LEFT JOIN ${dbName}.bumaster bu ON e.buId = bu.buId LEFT JOIN ${dbName}.employeepaymentdetails epd ON e.id = epd.userId WHERE p.payMonth = '${salaryMonth}' AND p.empId IN (${employeeIds})  order by salaryComponentSequenceNo desc;`;
				const result1 = await db.sequelize.query(query);
				const processedData = groupByEmployeeId(result1[0]);

				processedData.sort((a, b) => {
					const idA = a["Employee Id"];
					const idB = b["Employee Id"];
					return idA.localeCompare(idB, undefined, { numeric: true });
				});

				if (result1[0].length > 0) {
					const uniqueKeys = getColumnsForSalaryregister(processedData);
					const resultColumns = Object.fromEntries(
						uniqueKeys.map((key) => [key, 0]),
					);
					const columns = Object.keys(resultColumns).map((key) => ({
						label: key,
						value: key,
					}));
					const data = [
						{
							sheet: "Employee",
							columns: columns,
							content: processedData, // Use the JSON array as content
						},
					];
					const settings = {
						fileName: `Total_${Date.now()}`,
						extraLength: 3,
						writeOptions: {
							type: "buffer",
							bookType: "xlsx",
						},
					};
					const report = xlsx(data, settings);
					res.setHeader(
						"Content-Disposition",
						`attachment; filename=${"Salary_Register"}_${salaryMonth}_${moment(new Date()).format("YYYY-MM-DD HH:mm:ss")}.xlsx`,
					);
					return res.end(report);
				} else {
					return res.status(404).send(fileAccessErrorResponse(404));
				}
			} else {
				return res.status(404).send(fileAccessErrorResponse(404));
			}
		} catch (error) {
			console.error("Error:", error);
			return res.status(500).send(fileAccessErrorResponse(500));
		}
	}
}

// const groupByEmployeeId = (data) => {
// 	const groupedData = {};
// 	data.forEach((item) => {
// 		const employeeId = item["Employee Id"];
// 		if (!groupedData[employeeId]) {
// 			let totalEarning = parseFloat(
// 				parseFloat(item["Gross Earning"] ? item["Gross Earning"] : 0) +
// 					parseFloat(
// 						item["EXTRA PAYMENT AMOUNT"] ? item["EXTRA PAYMENT AMOUNT"] : 0,
// 					),
// 			);
// 			let totalDeduction = parseFloat(
// 				parseFloat(item["TDS Amount"] ? item["TDS Amount"] : 0) +
// 					parseFloat(item["PT AMOUNT"] ? item["PT AMOUNT"] : 0) +
// 					parseFloat(item["LWF AMOUNT"] ? item["LWF AMOUNT"] : 0) +
// 					parseFloat(item["PF Employer"] ? item["PF Employer"] : 0) +
// 					parseFloat(item["EXTRA DEDUCTION"] ? item["EXTRA DEDUCTION"] : 0),
// 			);
// 			let payableAmount = totalEarning - totalDeduction;
// 			payableAmount = paymentHelper.customRound(payableAmount);
// 			groupedData[employeeId] = {
// 				"Employee Id": employeeId,
// 				"Employee Name": item["Employee Name"],
// 				"LOP Days": item["LOP Days"],
// 				"Arrears Month": item["Arrears Month"],
// 				"Arrears Days": item["Arrears Days"],
// 				"TDS Month": item["TDS Month"],
// 				"TDS Amount": item["TDS Amount"],
// 				"Net Pay": item["Net Pay"],
// 				"Monthly Pay": payableAmount != "N/A" ? payableAmount : "0.0",
// 				"Extra Deduction Categories": item["Advance Name"],
// 				"Total Extra Deduction Amount": item["Advance Amount"],
// 				"PT Amount": item["PT AMOUNT"],
// 				"LWF Amount": item["LWF AMOUNT"],
// 				"Extra Payment Categories": item["EXTRA PAYMENT CATEGORIES"],
// 				"Extra Payment Amount": item["EXTRA PAYMENT AMOUNT"],
// 				"ESIC Employer": item["ESIC Employer"],
// 				"ESIC Employee": item["ESIC Employee"],
// 				"PF Employee": item["PF Employee"],
// 				"PF Employer": item["PF Employer"],
// 			};
// 			//p.esicEmployerAmount as ESIC EMPLOYER,p.esicEmployeeAmount as ESIC EMPLOYEE,p.pfEmployeeAmount as PF EMPLOYEE,p.pfEmployerAmount as PF EMPLOYER,
// 		}

// 		if (["Balancing", "Earning"].includes(item["salaryComponentEarningType"])) {
// 			Object.assign(groupedData[employeeId], {
// 				[item["Element Name"]]: item["Element Amount"]
// 					? paymentHelper.customRound(item["Element Amount"])
// 					: item["Element Amount"],
// 			});
// 			Object.assign(groupedData[employeeId], {
// 				[item["Element Name"] + " Monthly"]: item["Monthly Element Amount"]
// 					? paymentHelper.customRound(item["Monthly Element Amount"])
// 					: item["Monthly Element Amount"],
// 			});
// 		}
// 	});

// 	return Object.values(groupedData); // Convert the grouped data object back to an array
// };

// const groupByEmployeeId = (data) => {
// 	const groupedData = {};
// 	data.forEach((item,index) => {
// 		const employeeId = item["Employee Id"];
// 		let totalEarning = parseFloat(
// 			parseFloat(item["Gross Earning"] ? item["Gross Earning"] : 0) +
// 				parseFloat(
// 					item["EXTRA PAYMENT AMOUNT"] ? item["EXTRA PAYMENT AMOUNT"] : 0,
// 				),
// 		);
// 		let totalDeduction = parseFloat(
// 			parseFloat(item["TDS Amount"] ? item["TDS Amount"] : 0) +
// 				parseFloat(item["PT AMOUNT"] ? item["PT AMOUNT"] : 0) +
// 				parseFloat(item["LWF AMOUNT"] ? item["LWF AMOUNT"] : 0) +
// 				parseFloat(item["PF Employee"] ? item["PF Employee"] : 0) +
// 				parseFloat(item['ESIC Employee']?item['ESIC Employee']:0) +
// 				parseFloat(item["EXTRA DEDUCTION"] ? item["EXTRA DEDUCTION"] : 0),
// 		);
// 		let payableAmount = totalEarning - totalDeduction;
// 		payableAmount = paymentHelper.customRound(payableAmount);

// 		if (!groupedData[employeeId]) {
// 			groupedData[employeeId] = {
// 				"Employee Id": employeeId,//1
// 				"Employee Name": item["Employee Name"],//2
// 				"Date of Joining": item["Date of Joining"],//3
// 				"Exit Date": item["Exit Date"],//4
// 				"Total Days": item["Total Days"],//5
// 				"LOP Days": item["LOP Days"],//6
// 				"Arrears Days": item["Arrears Days"],//7
// 				"Present Days":item["Present Days"]?item["Present Days"]:0,//8
// 				"Business Unit": item["Business Unit"],//9
// 				"Account No": item["Account No"],//10
// 				"Bank Name": item["Bank Name"],//11
// 				"IFSC": item["IFSC"],//12
// 				"Monthly CTC": item["Net Pay"],//13
// 				"Gross Salary":totalEarning,//24
// 				"Income Tax": item["TDS Amount"],//25
// 				"Professional Tax": item["PT AMOUNT"],//26
// 				"ESIC Employee": item["ESIC Employee"],//27
// 				"Statuary PF": item["PF Employee"],//28
// 				"Personal Deduction Categories": item["Advance Name"],//29
// 				"Personal Deduction": item["Advance Amount"],//30
// 				"LWF Amount": item["LWF AMOUNT"],//31
// 				"Total Deductions":totalDeduction,//32
// 				/////Added ///////////
// 				"Extra Payment Categories": item["EXTRA PAYMENT CATEGORIES"],//33
// 				"Extra Payment Amount": item["EXTRA PAYMENT AMOUNT"],//34
// 				"Net Salary": payableAmount != "N/A" ? payableAmount : "0.0",//35
// 			};
// 		}

// 		if (["Balancing", "Earning"].includes(item["salaryComponentEarningType"])) {
// 			Object.assign(groupedData[employeeId], {
// 				[item["Element Name"]]: item["Monthly Element Amount"]
// 					? paymentHelper.customRound(item["Monthly Element Amount"])
// 					: item["Monthly Element Amount"],
// 					[item["Element Name"] + " Arrear"]:0,
// 			});
// 			Object.assign(groupedData[employeeId], {
// 				[item["Element Name"] + " Arrear"]:0,
// 			});

// 			let newObj={
// 				[item["Element Name"]]: item["Monthly Element Amount"]
// 					? paymentHelper.customRound(item["Monthly Element Amount"])
// 					: item["Monthly Element Amount"],
// 					[item["Element Name"] + " Arrear"]:0,
// 			};

// 			groupedData[employeeId] = mergeObjects(groupedData[employeeId],newObj,'Monthly CTC');
// 		}
// 	});
// 	return Object.values(groupedData); // Convert the grouped data object back to an array
// };

const groupByEmployeeId = (data) => {
	const groupedData = {};
	data.forEach((item, index) => {
		const employeeId = item["Employee Id"];
		let totalEarning = parseFloat(
			parseFloat(item["Gross Earning"] ? item["Gross Earning"] : 0) +
				parseFloat(
					item["EXTRA PAYMENT AMOUNT"] ? item["EXTRA PAYMENT AMOUNT"] : 0,
				),
		);
		let totalDeduction = parseFloat(
			parseFloat(item["TDS Amount"] ? item["TDS Amount"] : 0) +
				parseFloat(item["PT AMOUNT"] ? item["PT AMOUNT"] : 0) +
				parseFloat(item["LWF AMOUNT"] ? item["LWF AMOUNT"] : 0) +
				parseFloat(item["PF Employee"] ? item["PF Employee"] : 0) +
				parseFloat(item["ESIC Employee"] ? item["ESIC Employee"] : 0) +
				parseFloat(item["EXTRA DEDUCTION"] ? item["EXTRA DEDUCTION"] : 0),
		);
		let payableAmount = totalEarning - totalDeduction;
		payableAmount = paymentHelper.customRound(payableAmount);

		if (!groupedData[employeeId]) {
			groupedData[employeeId] = {
				"Employee Id": employeeId, //1
				"Employee Name": item["Employee Name"], //2
				"Date of Joining": item["Date of Joining"], //3
				"Exit Date": item["Exit Date"], //4
				"Total Days": item["Total Days"], //5
				"LOP Days": item["LOP Days"], //6
				"Arrears Days": item["Arrears Days"], //7
				"Present Days": item["Present Days"] ? item["Present Days"] : 0, //8
				"Business Unit": item["Business Unit"], //9
				"Account No": item["Account No"], //10
				"Bank Name": item["Bank Name"], //11
				IFSC: item["IFSC"], //12
				"Monthly CTC": item["Net Pay"], //13
				"Gross Salary": totalEarning, //24
				"Income Tax": item["TDS Amount"], //25
				"Professional Tax": item["PT AMOUNT"], //26
				"ESIC Employee": item["ESIC Employee"], //27
				"Statuary PF": item["PF Employee"], //28
				"Standard Deductions Categories": item["Advance Name"], //29
				"Standard Deductions": item["Advance Amount"], //30
				"LWF Amount": item["LWF AMOUNT"], //31
				"Total Deductions": totalDeduction, //32
				/////Added ///////////
				"Extra Payment Categories": item["EXTRA PAYMENT CATEGORIES"], //33
				"Extra Payment Amount": item["EXTRA PAYMENT AMOUNT"], //34
				"Net Salary": payableAmount != "N/A" ? payableAmount : "0.0", //35
			};
		}

		if (["Balancing", "Earning"].includes(item["salaryComponentEarningType"])) {
			Object.assign(groupedData[employeeId], {
				[item["Element Name"]]: item["Monthly Element Amount"]
					? paymentHelper.customRound(item["Monthly Element Amount"])
					: item["Monthly Element Amount"],
				[item["Element Name"] + " Arrear"]: 0,
			});
			Object.assign(groupedData[employeeId], {
				[item["Element Name"] + " Arrear"]: 0,
			});

			let newObj = {
				[item["Element Name"]]: item["Monthly Element Amount"]
					? paymentHelper.customRound(item["Monthly Element Amount"])
					: item["Monthly Element Amount"],
				[item["Element Name"] + " Arrear"]: 0,
			};

			groupedData[employeeId] = mergeObjects(
				groupedData[employeeId],
				newObj,
				"Monthly CTC",
			);
		}
	});
	return Object.values(groupedData); // Convert the grouped data object back to an array
};

const mergeObjects = (objA, objB, afterKey) => {
	const result = {};
	Object.keys(objA).forEach((key) => {
		result[key] = objA[key];
		if (key === afterKey) {
			Object.keys(objB).forEach((keyB) => {
				result[keyB] = objB[keyB];
			});
		}
	});
	return result;
};
const transformData = (data) => {
	return data.map((employee) => {
		let transformedObj = {
			"Employee ID": employee.empCode,
			Name: employee.name,
			"Job Title":
				employee.designationmaster.name +
				" (" +
				employee.designationmaster.code +
				")",
			Department:
				employee.departmentmaster.departmentName +
				" (" +
				employee.departmentmaster.departmentCode +
				")",
			"Business Unit": employee.bumaster.buName,
			"Company Name": employee.companymaster.companyName,
		};

		employee.packageDetails.empPayElements.forEach((element) => {
			const keyName =
				element.salarycomponent.salaryComponentAlias ||
				element.salarycomponent.salaryComponentCode;
			transformedObj[keyName] = element.payElementAmount;
		});

		return transformedObj;
	});
};

const fileAccessErrorResponse = (data) => {
	switch (data) {
		case 403:
			return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>403 - Forbidden</title>
				<style>
					body {
						background: RGB(39, 161, 217);
						font-family: Arial, sans-serif;
						text-align: center;
						padding: 50px;
						color: white;
					}
					
					.container {
						max-width: 600px;
						margin: auto;
						background: rgba(0, 0, 0, 0.3);
						padding: 30px;
						border-radius: 15px;
						box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
					}
			
					h1 {
						font-size: 50px;
						margin: 0;
					}
			
					p {
						font-size: 18px;
					}
			
					.lock-icon {
						font-size: 80px;
						margin: 20px 0;
					}
			
					.btn {
						display: inline-block;
						margin-top: 20px;
						padding: 10px 20px;
						font-size: 16px;
						color: white;
						text-decoration: none;
						border-radius: 10px;
						background: RGB(39, 161, 217);
						transition: background 0.3s ease-in-out;
					}
			
					.btn:hover {
						background: #57B4BA;
					}
				</style>
			</head>
			<body>
				<div class="container">
					<div class="lock-icon">🔒</div>
					<h1>403</h1>
					<h2>File Not Accessible</h2>
					<p>You do not have permission to view this file.</p>
					<a href="https://tara.teamcomputers.com/" class="btn">Go to Homepage</a>
				</div>
			</body>
			</html>`;
			break;

		case 404:
			return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - Data Not Available</title>
    <style>
        body {
            background: RGB(39, 161, 217);
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
            color: white;
        }
        
        .container {
            max-width: 600px;
            margin: auto;
            background: rgba(0, 0, 0, 0.3);
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
        }

        h1 {
            font-size: 50px;
            margin: 0;
        }

        p {
            font-size: 18px;
        }

        .lock-icon {
            font-size: 80px;
            margin: 20px 0;
        }

        .btn {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            font-size: 16px;
            color: white;
            text-decoration: none;
            border-radius: 10px;
            background: RGB(39, 161, 217);
            transition: background 0.3s ease-in-out;
        }

        .btn:hover {
            background: #57B4BA;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="lock-icon">🔒</div>
        <h1>404</h1>
        <h2>Data  Unavailable</h2>
        <p>Data you want to search is not available or not found.</p>
        <a href="https://tara.teamcomputers.com/" class="btn">Go to Homepage</a>
    </div>
</body>
</html>`;
			break;
		case 500:
			return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>401 - Unauthorized</title>
    <style>
        body {
            background: RGB(39, 161, 217);
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
            color: white;
        }
        
        .container {
            max-width: 600px;
            margin: auto;
            background: rgba(0, 0, 0, 0.3);
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
        }

        h1 {
            font-size: 50px;
            margin: 0;
        }

        p {
            font-size: 18px;
        }

        .lock-icon {
            font-size: 80px;
            margin: 20px 0;
        }

        .btn {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            font-size: 16px;
            color: white;
            text-decoration: none;
            border-radius: 10px;
            background: RGB(39, 161, 217);
            transition: background 0.3s ease-in-out;
        }

        .btn:hover {
            background: #57B4BA;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="lock-icon">🔒</div>
        <h1>500</h1>
        <h2>Server Error</h2>
        <p>Some error occured while processing your request.</p>
        <a href="https://tara.teamcomputers.com/" class="btn">Go to Homepage</a>
    </div>
</body>
</html>`;

			break;
		default:
			break;
	}
};

function getColumnsForSalaryregister(processedData) {
	const uniqueKeys = [...new Set(processedData.flatMap(Object.keys))];
	let preArray = [
			"Employee Id",
			"Employee Name",
			"Date of Joining",
			"Exit Date",
			"Total Days",
			"LOP Days",
			"Arrears Days",
			"Present Days",
			"Business Unit",
			"Account No",
			"Bank Name",
			"IFSC",
			"Monthly CTC",
		],
		lastArray = [
			"Gross Salary",
			"Income Tax",
			"Professional Tax",
			"ESIC Employee",
			"Statuary PF",
			"Standard Deductions Categories",
			"Standard Deductions",
			"LWF Amount",
			"Total Deductions",
			"Extra Payment Categories",
			"Extra Payment Amount",
			"Net Salary",
		],
		finalarray = [],
		middleArray = [];
	for (const element of uniqueKeys) {
		if (!preArray.includes(element) && !lastArray.includes(element)) {
			middleArray.push(element);
		}
	}
	let finalArray = preArray.concat(middleArray, lastArray);
	return finalArray;
}

function getColumnsForSalary(processedData) {
	const uniqueKeys = [...new Set(processedData.flatMap(Object.keys))];
	let preArray = [
			"Employee ID",
			"Name",
			"Job Title",
			"Department",
			"Business Unit",
			"Company Name",
			"Gross Pay",
		],
		middleArray = [],
		lastArray = ["Total CTC"];
	for (const element of uniqueKeys) {
		if (!preArray.includes(element) && !lastArray.includes(element)) {
			middleArray.push(element);
		}
	}
	let finalarray = preArray.concat(middleArray, lastArray);
	return finalarray;
}

export default new MasterController();
