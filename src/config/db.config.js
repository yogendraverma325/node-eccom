/* eslint-disable no-undef */
import Sequelize from "sequelize";
import logger from "../helper/logger.js";
import Employee from "../api/model/Employee.js";
import Band from "../api/model/BandMaster.js";
import Bu from "../api/model/BuMaster.js";
import CostCenter from "../api/model/CostCenterMaster.js";
import Designation from "../api/model/DesignationMaster.js";
import Grade from "../api/model/GradeMaster.js";
import JobLevel from "../api/model/JobLevelMaster.js";
import FunctionalArea from "../api/model/FunctionalAreaMaster.js";
import State from "../api/model/StateMaster.js";
import Role from "../api/model/RoleMaster.js";
import Region from "../api/model/RegionMaster.js";
import City from "../api/model/CityMaster.js";
import CompanyLocation from "../api/model/CompanyLocationMaster.js";
import Company from "../api/model/CompanyMaster.js";
import CompanyType from "../api/model/CompanyTypeMaster.js";
import Country from "../api/model/CountryMaster.js";
import Currency from "../api/model/CurrencyMaster.js";
import Department from "../api/model/DepartmentMaster.js";
import District from "../api/model/DistrictMaster.js";
import EmployeeType from "../api/model/EmployeeTypeMaster.js";
import Industry from "../api/model/industryMaster.js";
import PinCode from "../api/model/PinCodeMaster.js";
import TimeZone from "../api/model/Timezone.js";
import GroupCompany from "../api/model/GroupCompany.js";
import BuMapping from "../api/model/BuMapping.js";
import SbuMapping from "../api/model/SbuMapping.js";
import EmployeeBiographicalDetails from "../api/model/EmployeeBiographicalDetails.js";
import EmployeeJobDetails from "../api/model/EmployeeJobDetails.js";
import EmployeeEmergencyContact from "../api/model/EmployeeEmergencyContact.js";
import EmployeeFamilyDetails from "../api/model/EmployeeFamilyDetails.js";
import DegreeMaster from "../api/model/DegreeMaster.js";
import EmployeeEducationDetails from "../api/model/EmployeeEducationDetails.js";
import EmployeePaymentDetails from "../api/model/EmployeePaymentDetails.js";
import EmployeeVaccinationDetails from "../api/model/EmployeeVaccinationDetails.js";
import DepartmentMapping from "../api/model/DepartmentMapping.js";
import FunctionalAreaMapping from "../api/model/FunctionalAreaMapping.js";
import SalaryComponent from "../api/model/SalaryComponent.js";
import PayElements from "../api/model/PayElements.js";
import PaySlip from "../api/model/PaySlip.js";
import PaySlipComponent from "../api/model/PaySlipComponent.js";
import PayPackage from "../api/model/PayPackage.js";
import ShiftMaster from "../api/model/ShiftMaster.js";
import AttendanceMaster from "../api/model/AttendanceMaster.js";
import RegularizationMaster from "../api/model/RegularizationMaster.js";
import SbuMaster from "../api/model/SbuMaster.js";
import BusinessLogic from "../api/model/BusinessLogic.js";
import DashboardCard from "../api/model/DashboardCard.js";
import Leave from "../api/model/LeaveMaster.js";
import LeaveMapping from "../api/model/LeaveMapping.js";
import holidayMaster from "../api/model/HolidayMaster.js";
import holidayCompanyLocationConfiguration from "../api/model/holidayCompanyLocationConfiguration.js";
import attendancePolicymaster from "../api/model/attendancePolicymaster.js";
import employeeLeaveTransactions from "../api/model/EmployeeLeaveTransactions.js";
import LoginDetails from "../api/model/LoginDetails.js";
import DaysMaster from "../api/model/DaysMaster.js";
import weekOffMaster from "../api/model/weekOffMaster.js";
import weekOffDayMappingMaster from "../api/model/weekOffDayMappingMaster.js";
// import CalenderYear from "../api/model/CalenderYear.js";
import permissoinandaccess from "../api/model/PermissionAndAccess.js";
import ManagerHistory from "../api/model/ManagerHistory.js";
import employeeJobDetailsHistory from "../api/model/EmployeeJobDetailsHistory.js";
import EmployeeEducationDetailsHistory from "../api/model/EmployeeEducationDetailsHistory.js";
import FamilyMemberHistory from "../api/model/FamilyMemberHistory.js";
import AttendanceHistory from "../api/model/AttendanceHistory.js";
import AttendanceLogs from "../api/model/AttendanceLogs.js";
import SalutationMaster from "../api/model/salutationMaster.js";
import UnionCodeIncrementMaster from "../api/model/UnionIncrementCodeMaster.js";
import EmployeeAddress from "../api/model/EmployeeAddress.js";
import EmployeeWorkExperience from "../api/model/EmployeeWorkExperience.js";
import HrLetters from "../api/model/HrLetters.js";
import HrDocumentMaster from "../api/model/HrDocumentMaster.js";
import EmployeeCertificates from "../api/model/EmployeeCertificates.js";
import SeparationMaster from "../api/model/SeparationMaster.js";
import NoticePeriodMaster from "../api/model/NoticePeriodMaster.js";
import SeparationType from "../api/model/SeparationType.js";
import SeparationReason from "../api/model/SeparationReason.js";
import SeparationStatus from "../api/model/SeparationStatus.js";
import EmployeeStaging from "../api/model/EmployeeStaging.js";
import ProbationMaster from "../api/model/ProbationMaster.js";
import LwfDesignationMaster from "../api/model/LwfDesignationMaster.js";
import NewCustomerNameMaster from "../api/model/NewCustomerNameMaster.js";
import ReportModuleMaster from "../api/model/ReportModuleMaster.js";
import ReportType from "../api/model/ReportType.js";
import SeparationTrails from "../api/model/SeparationTrails.js";
import TaskFilterMaster from "../api/model/taskFilterMaster.js";
import SeparationTaskMaster from "../api/model/SeparationTaskMaster.js";
import SeparationTaskConfig from "../api/model/SeparationTaskConfig.js";
import SeparationTaskOwner from "../api/model/SeparationTaskOwner.js";
import SeparationTaskMapping from "../api/model/SeparationTaskMapping.js";
import SeparationTaskFields from "../api/model/SeparationTaskFields.js";
import SeparationFieldsValues from "../api/model/SeparationFieldsValues.js";
import SeparationInitiatedTask from "../api/model/SeparationInitiatedTask.js";
import CategoryMaster from "../api/model/CategoryMaster.js";
import SubCategoryMaster from "../api/model/SubCategoryMaster.js";
import PTLocationMaster from "../api/model/PTLocationMaster.js";
import TaskBuMapping from "../api/model/TaskBuMapping.js";
import BankMaster from "../api/model/BankMaster.js";

import PolicyHistory from "../api/model/PolicyHistory.js";
import EmployeeLeaveHeader from "../api/model/EmployeeLeaveHeader.js";
import JobLevelMapping from "../api/model/JobLevelMapping.js";
import offRoleCtc from "../api/model/offRoleCtc.js";
import EmployeePaymentDetailsHistory from "../api/model/EmployeePaymentDetailsHistory.js";
import DesignationEmploymentHistory from "../api/model/DesignationEmploymentHistory.js";
import DepartmentEmploymentHistory from "../api/model/DepartmentEmploymentHistory.js";
import CostCenterEmploymentHistory from "../api/model/CostCenterEmploymentHistory.js";
import JobLevelEmploymentHistory from "../api/model/JobLevelEmploymentHistory.js";
import OfficeLocationEmploymentHistory from "../api/model/OfficeLocationEmploymentHistory.js";
import EmployeeTypeEmploymentHistory from "../api/model/EmployeeTypeEmploymentHistory.js";

//CONFIRMATION
import Confirmationinitiated from "../api/model/ConfirmationInitiated.js";
import Confirmationowners from "../api/model/Confirmationowners.js";
import Confirmatoinformfields from "../api/model/ConfirmationFormFields.js";
import Confirmatoinformfieldsoptions from "../api/model/Confirmatoinformfieldsoptions.js";
import Confirmationformfilledvalues from "../api/model/ConfirmationFormFilledValues.js";
import Confirmationaudittrail from "../api/model/ConfirmationAudit.js";
import Confimationpolicy from "../api/model/ConfirmatinoPolicy.js";
import Confirmationassignment from "../api/model/ConfirmationAssignment.js";
import Confirmationpolicyworkflow from "../api/model/ConfirmationPolicyWorkflow.js";
import Signingauthority from "../api/model/signingAuthority.js";
//CONFIRMATION
///Payrol//////
import SalaryComponentMapping from "../api/model/SalaryComponentElementMapping.js";
import SalaryStructure from "../api/model/SalaryStructures.js";
import SalaryComponentElement from "../api/model/SalaryComponentElement.js";
import SalaryStructureComponentMapping from "../api/model/SalaryStructureComponentMapping.js";
import EarningArears from "../api/model/EarningsArears.js";
import LopDeductions from "../api/model/LopDeductions.js";
import TDSDeductions from "../api/model/tdsDeductions.js";
import ExtraDeductions from "../api/model/ExtraDeductions.js";
import PayProcessDetail from "../api/model/payProcessDetails.js";
import PayProcessMaster from "../api/model/payProcessMaster.js";
import PayProcessFlowMaster from "../api/model/PayProcessFlowMaster.js";
import PayProcessStatusMaster from "../api/model/PayProcessStatusMaster.js";
import PayMonthlyElements from "../api/model/payMonthlyElements.js";
import PtMapping from "../api/model/PtMapping.js";
import LwfMapping from "../api/model/lwfMapping.js";
import ExtraPayment from "../api/model/ExtraPayment.js";
import ExportSheetMaster from "../api/model/exportSheetMaster.js";
import ExportSheetMapping from "../api/model/exportSheetMapping.js";
import FinancialYearMaster from "../api/model/FinancialYearMaster.js";
import CompensationCategoryMaster from "../api/model/CompensationCategory.js";

////////////////////PAyroll////////////
//Attendace Roster///
import AttendanceRoster from "../api/model/AttendanceRoster.js";
//Ateendance Roster///

//COMP OFF
import comp_off_assignment from "../api/model/CompOffAssignment.js";
import comp_off_assignment_filters from "../api/model/CompOffAssignmentFilter.js";
import comp_off_polices from "../api/model/comp_off_polices.js";
import comp_off_credit_history from "../api/model/CompOffCreditHistory.js";
import status_master from "../api/model/StatusMaster.js";
import LeaveCompanyMapping from "../api/model/LeaveCompanyMapping.js";
import leavemanager from "../api/model/LeaveManager.js";
//COMP OFF

//////////////////Start F&F by jay/////////////////
import GratuityOverrides from "../api/model/GratuityOverrides.js";
import LeaveEncashmentOverrides from "../api/model/LeaveEncashmentOverrides.js";
import PTOverrides from "../api/model/PTOverrides.js";
import LWFOverrides from "../api/model/LWFOverrides.js";
import NoticeRecoveryOverrides from "../api/model/NoticeRecoveryOverrides.js";
import ExtraBenefits from "../api/model/ExtraBenefits.js";

// Leave Approval Flow ////
import LeaveApprovalFlow from "../api/model/LeaveApprovalFlow.js";
import LeaveApprovalLevel from "../api/model/LeaveApprovalLevel.js";
import LeaveApprovalTrails from "../api/model/LeaveApprovalTrails.js";
// Leave Approval Flow ////

//////////////////End F&F by jay/////////////////

///////////////////Import Models By Himanshu////////

import ImportInfo from "../api/model/ImportInfo.js";
import ImportData from "../api/model/ImportData.js";
///////////////////Start Import Models By Jay////////

import QRSessionHistory from "../api/model/QRSessionHistory.js";

///////////////////End Import Models By Jay////////

///////////////////Import Models By Himanshu////////
import PushNotificationHistory from "../api/model/PushNotificationHistory.js";

//ritak address approval start
import EmployeeAddressHistory from "../api/model/EmployeeAddressHistory.js";

//ritak address approval end

///////////////////Appraisal/////////////////////////

import AppraisalGoalsMaster from "../api/model/AppraisalGoalsMaster.js";
import GoalAttributesConfigMaster from "../api/model/GoalAttributesConfigMaster.js";
import GoalAttributesMapping from "../api/model/GoalAttributesMapping.js";
import GoalAttributesOptions from "../api/model/GoalAttributesOptions.js";
import GoalAreaForUser from "../api/model/GoalAreaForUser.js";
import SubGoalAreaForUser from "../api/model/SubGoalAreaForUser.js";
import GoalAreaPragatiTrail from "../api/model/GoalAreaPragatiTrail.js";
import ReviewFramework from "../api/model/ReviewFramework.js";
import GoalRating from "../api/model/GoalRating.js";
import GoalPlanMail from "../api/model/GoalPlanMail.js";
import RatingScaleMaster from "../api/model/RatingScaleMaster.js";
import RatingScaleConfig from "../api/model/RatingScaleConfig.js";
import CompentanyTier from "../api/model/CompentancyTier.js";
import CompentancyAttributes from "../api/model/CompentancyAttributes.js";
///////////////////Appraisal/////////////////////////

// start import model by jay
import LoginSessionHistory from "../api/model/LoginSessionHistory.js";
// end by jay
import PragatiActivity from "../api/model/PragatiActivity.js";

//ritak Hr Policy start

import HrPolicyCategories from "../api/model/HrPolicyCategories.js";
import HrPolicies from "../api/model/HrPolicies.js";
import HrPolicySignoffs from "../api/model/HrPolicySignoffs.js";

import user_assignment from "../api/model/user_assignment.js";
import user_assignment_process_master from "../api/model/user_assignment_process_master.js";
import user_assignment_condition from "../api/model/user_assignment_condition.js";
import user_assignment_attribute_master from "../api/model/user_assignment_attribute_master.js";

//ritak Hr Policy end

import literal from "sequelize";
import QueryTypes from "sequelize";
import  EarningArearsAmount from "../api/model/EarningArrearsAmounts.js";
const sequelize = new Sequelize(
	process.env.DB_NAME,
	process.env.DB_USER,
	process.env.DB_PASSWORD,
	{
		port: process.env.DB_PORT,
		host: process.env.DB_HOST,
		dialect: process.env.DB_DIALECT,
		define: {
			charset: "utf8",
			collate: "utf8_general_ci",
			freezeTableName: true,
			timestamps: false,
		},
		pool: {
			max: 2000,
			min: 0,
			acquire: 30000,
			idle: 10000,
		},
		logging: false,
		timezone: "+05:30",
	},
);

sequelize
	.authenticate()
	.then(() => {
		logger.info(
			`DB Connection Success --> ${process.env.DB_NAME} (${process.env.DB_USER})`,
		);
		console.log(
			`DB Connection Success --> ${process.env.DB_NAME} (${process.env.DB_USER})`,
		);
	})
	.catch((error) => {
		logger.error(`DB Connection Failed --> ${error}`);
		console.log(
			`DB Connection Failed --> {(${error.name})<<--->>(${error.message})}`,
		);
	});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.literal = literal;
db.QueryTypes = QueryTypes;
db.employeeMaster = Employee(sequelize, Sequelize);
db.bandMaster = Band(sequelize, Sequelize);
db.buMaster = Bu(sequelize, Sequelize);
db.costCenterMaster = CostCenter(sequelize, Sequelize);
db.designationMaster = Designation(sequelize, Sequelize);
db.gradeMaster = Grade(sequelize, Sequelize);
db.jobLevelMaster = JobLevel(sequelize, Sequelize);
db.roleMaster = Role(sequelize, Sequelize);
db.functionalAreaMaster = FunctionalArea(sequelize, Sequelize);
db.stateMaster = State(sequelize, Sequelize);
db.regionMaster = Region(sequelize, Sequelize);
db.cityMaster = City(sequelize, Sequelize);
db.companyLocationMaster = CompanyLocation(sequelize, Sequelize);
db.companyMaster = Company(sequelize, Sequelize);
db.companyTypeMaster = CompanyType(sequelize, Sequelize);
db.countryMaster = Country(sequelize, Sequelize);
db.currencyMaster = Currency(sequelize, Sequelize);
db.departmentMaster = Department(sequelize, Sequelize);
db.districtMaster = District(sequelize, Sequelize);
db.employeeTypeMaster = EmployeeType(sequelize, Sequelize);
db.industryMaster = Industry(sequelize, Sequelize);
db.pinCodeMaster = PinCode(sequelize, Sequelize);
db.timeZoneMaster = TimeZone(sequelize, Sequelize);
db.groupCompanyMaster = GroupCompany(sequelize, Sequelize);
db.buMapping = BuMapping(sequelize, Sequelize);
db.sbuMapping = SbuMapping(sequelize, Sequelize);
db.biographicalDetails = EmployeeBiographicalDetails(sequelize, Sequelize);
db.jobDetails = EmployeeJobDetails(sequelize, Sequelize);
db.emergencyDetails = EmployeeEmergencyContact(sequelize, Sequelize);
db.familyDetails = EmployeeFamilyDetails(sequelize, Sequelize);
db.degreeMaster = DegreeMaster(sequelize, Sequelize);
db.educationDetails = EmployeeEducationDetails(sequelize, Sequelize);
db.paymentDetails = EmployeePaymentDetails(sequelize, Sequelize);
db.vaccinationDetails = EmployeeVaccinationDetails(sequelize, Sequelize);
db.departmentMapping = DepartmentMapping(sequelize, Sequelize);
db.functionalAreaMapping = FunctionalAreaMapping(sequelize, Sequelize);
db.salaryComponent = SalaryComponent(sequelize, Sequelize);
db.payElements = PayElements(sequelize, Sequelize);
db.paySlips = PaySlip(sequelize, Sequelize);
db.paySlipComponent = PaySlipComponent(sequelize, Sequelize);
db.payPackage = PayPackage(sequelize, Sequelize);
db.shiftMaster = ShiftMaster(sequelize, Sequelize);
db.attendanceMaster = AttendanceMaster(sequelize, Sequelize);
db.regularizationMaster = RegularizationMaster(sequelize, Sequelize);
db.sbuMaster = SbuMaster(sequelize, Sequelize);
db.BusinessLogic = BusinessLogic(sequelize, Sequelize);
db.DashboardCard = DashboardCard(sequelize, Sequelize);
db.leaveMaster = Leave(sequelize, Sequelize);
db.leaveMapping = LeaveMapping(sequelize, Sequelize);
db.holidayMaster = holidayMaster(sequelize, Sequelize);
db.holidayCompanyLocationConfiguration = holidayCompanyLocationConfiguration(
	sequelize,
	Sequelize,
);
db.attendancePolicymaster = attendancePolicymaster(sequelize, Sequelize);
db.employeeLeaveTransactions = employeeLeaveTransactions(sequelize, Sequelize);

db.DaysMaster = DaysMaster(sequelize, Sequelize);
db.weekOffMaster = weekOffMaster(sequelize, Sequelize);
db.weekOffDayMappingMaster = weekOffDayMappingMaster(sequelize, Sequelize);
// db.CalenderYear = CalenderYear(sequelize, Sequelize);
db.loginDetails = LoginDetails(sequelize, Sequelize);
db.permissoinandaccess = permissoinandaccess(sequelize, Sequelize);
db.managerHistory = ManagerHistory(sequelize, Sequelize);
db.employeeJobDetailsHistory = employeeJobDetailsHistory(sequelize, Sequelize);
db.employeeEducationDetailsHistory = EmployeeEducationDetailsHistory(
	sequelize,
	Sequelize,
);
db.familyMemberHistory = FamilyMemberHistory(sequelize, Sequelize);
db.attendanceHistory = AttendanceHistory(sequelize, Sequelize);
db.AttendanceLogs = AttendanceLogs(sequelize, Sequelize);
db.unionCodIncrementMaster = UnionCodeIncrementMaster(sequelize, Sequelize);
db.salutationMaster = SalutationMaster(sequelize, Sequelize);
db.employeeAddress = EmployeeAddress(sequelize, Sequelize);
db.employeeWorkExperience = EmployeeWorkExperience(sequelize, Sequelize);
db.hrLetters = HrLetters(sequelize, Sequelize);
db.hrDocumentMaster = HrDocumentMaster(sequelize, Sequelize);
db.employeeCertificates = EmployeeCertificates(sequelize, Sequelize);
db.separationMaster = SeparationMaster(sequelize, Sequelize);
db.noticePeriodMaster = NoticePeriodMaster(sequelize, Sequelize);
db.separationType = SeparationType(sequelize, Sequelize);
db.separationReason = SeparationReason(sequelize, Sequelize);
db.managerHistory = ManagerHistory(sequelize, Sequelize);
db.employeeJobDetailsHistory = employeeJobDetailsHistory(sequelize, Sequelize);
db.employeeEducationDetailsHistory = EmployeeEducationDetailsHistory(
	sequelize,
	Sequelize,
);
db.familyMemberHistory = FamilyMemberHistory(sequelize, Sequelize);
db.attendanceHistory = AttendanceHistory(sequelize, Sequelize);
db.employeeStagingMaster = EmployeeStaging(sequelize, Sequelize);
db.probationMaster = ProbationMaster(sequelize, Sequelize);
db.separationStatus = SeparationStatus(sequelize, Sequelize);
db.lwfDesignationMaster = LwfDesignationMaster(sequelize, Sequelize);
db.newCustomerNameMaster = NewCustomerNameMaster(sequelize, Sequelize);
db.reportModuleMaster = ReportModuleMaster(sequelize, Sequelize);
db.reportType = ReportType(sequelize, Sequelize);
db.separationTrail = SeparationTrails(sequelize, Sequelize);
db.taskFilterMaster = TaskFilterMaster(sequelize, Sequelize);
db.separationTaskMaster = SeparationTaskMaster(sequelize, Sequelize);
db.separationTaskConfig = SeparationTaskConfig(sequelize, Sequelize);
db.separationTaskOwner = SeparationTaskOwner(sequelize, Sequelize);
db.separationTaskMapping = SeparationTaskMapping(sequelize, Sequelize);
db.separationTaskFields = SeparationTaskFields(sequelize, Sequelize);
db.separationFieldValues = SeparationFieldsValues(sequelize, Sequelize);
db.separationInitiatedTask = SeparationInitiatedTask(sequelize, Sequelize);
db.categoryMaster = CategoryMaster(sequelize, Sequelize);
db.subCategoryMaster = SubCategoryMaster(sequelize, Sequelize);
db.PolicyHistory = PolicyHistory(sequelize, Sequelize);
db.ptLocationMaster = PTLocationMaster(sequelize, Sequelize);
db.taskBuMapping = TaskBuMapping(sequelize, Sequelize);
db.offRoleCtc = offRoleCtc(sequelize, Sequelize);
db.paymentDetailsHistory = EmployeePaymentDetailsHistory(sequelize, Sequelize);

db.EmployeeLeaveHeader = EmployeeLeaveHeader(sequelize, Sequelize);
db.bankMaster = BankMaster(sequelize, Sequelize);
db.jobLevelMapping = JobLevelMapping(sequelize, Sequelize);
//CONFIRMATION
db.Confirmationinitiated = Confirmationinitiated(sequelize, Sequelize);
db.Confirmationowners = Confirmationowners(sequelize, Sequelize);
db.Confirmatoinformfields = Confirmatoinformfields(sequelize, Sequelize);
db.Confirmatoinformfieldsoptions = Confirmatoinformfieldsoptions(
	sequelize,
	Sequelize,
);
db.Confirmationformfilledvalues = Confirmationformfilledvalues(
	sequelize,
	Sequelize,
);
db.Confirmationaudittrail = Confirmationaudittrail(sequelize, Sequelize);
db.Confimationpolicy = Confimationpolicy(sequelize, Sequelize);
db.Confirmationassignment = Confirmationassignment(sequelize, Sequelize);
db.Confirmationpolicyworkflow = Confirmationpolicyworkflow(
	sequelize,
	Sequelize,
);
db.Signingauthority = Signingauthority(sequelize, Sequelize);
//CONFIRMATION

//Payroll///////////
db.salarycomponentmapping = SalaryComponentMapping(sequelize, Sequelize);
db.salaryStructure = SalaryStructure(sequelize, Sequelize);
db.salarycomponentelement = SalaryComponentElement(sequelize, Sequelize);
db.salarystructurecomponentmapping = SalaryStructureComponentMapping(
	sequelize,
	Sequelize,
);
db.earningsArears = EarningArears(sequelize, Sequelize);
db.tdsDeductions = TDSDeductions(sequelize, Sequelize);
db.lopDeductions = LopDeductions(sequelize, Sequelize);
db.extraDeduction = ExtraDeductions(sequelize, Sequelize);
db.payProcessDetails = PayProcessDetail(sequelize, Sequelize);
db.payProcessMaster = PayProcessMaster(sequelize, Sequelize);
db.payProcessFlowMaster = PayProcessFlowMaster(sequelize, Sequelize);
db.payStatusMaster = PayProcessStatusMaster(sequelize, Sequelize);
db.payMonthlyElements = PayMonthlyElements(sequelize, Sequelize);
db.ptMapping = PtMapping(sequelize, Sequelize);
db.lwfMapping = LwfMapping(sequelize, Sequelize);
db.extraPayment = ExtraPayment(sequelize, Sequelize);
db.exportSheetMaster = ExportSheetMaster(sequelize, Sequelize);
db.exportSheetMapping = ExportSheetMapping(sequelize, Sequelize);

// import by jay
db.financialYearMaster = FinancialYearMaster(sequelize, Sequelize);

// import F&F by jay

db.gratuityOverrides = GratuityOverrides(sequelize, Sequelize);
db.leaveEncashmentOverrides = LeaveEncashmentOverrides(sequelize, Sequelize);
db.PTOverrides = PTOverrides(sequelize, Sequelize);
db.LWFOverrides = LWFOverrides(sequelize, Sequelize);
db.noticeRecoveryOverrides = NoticeRecoveryOverrides(sequelize, Sequelize);
db.ExtraBenefits = ExtraBenefits(sequelize, Sequelize);

//////////////////Payroll///////////////////

//////////////////////////////Import Models By Himanshu////////

db.ImportInfo = ImportInfo(sequelize, Sequelize);
db.ImportData = ImportData(sequelize, Sequelize);

db.DesignationEmploymentHistory = DesignationEmploymentHistory(
	sequelize,
	Sequelize,
);
db.DepartmentEmploymentHistory = DepartmentEmploymentHistory(
	sequelize,
	Sequelize,
);
db.CostCenterEmploymentHistory = CostCenterEmploymentHistory(
	sequelize,
	Sequelize,
);
db.JobLevelEmploymentHistory = JobLevelEmploymentHistory(sequelize, Sequelize);
db.OfficeLocationEmploymentHistory = OfficeLocationEmploymentHistory(
	sequelize,
	Sequelize,
);
db.EmployeeTypeEmploymentHistory = EmployeeTypeEmploymentHistory(
	sequelize,
	Sequelize,
);
db.CompensationCategoryMaster = CompensationCategoryMaster(
	sequelize,
	Sequelize,
);

//Attendance Roster
db.AttendanceRoster = AttendanceRoster(sequelize, Sequelize);
//Attendance Roster
//COMP OFF
db.comp_off_assignment = comp_off_assignment(sequelize, Sequelize);

db.comp_off_assignment_filters = comp_off_assignment_filters(
	sequelize,
	Sequelize,
);
db.comp_off_polices = comp_off_polices(sequelize, Sequelize);
db.comp_off_credit_history = comp_off_credit_history(sequelize, Sequelize);
db.status_master = status_master(sequelize, Sequelize);
db.leaveCompanyMapping = LeaveCompanyMapping(sequelize, Sequelize);
db.leavemanager = leavemanager(sequelize, Sequelize);
//COMP OFF
// start lwf mapping by jay
db.lwfMapping = LwfMapping(sequelize, Sequelize);
// end lwf mapping by jay

/// Leave Approval FLow //////
db.leaveApprovalFlow = LeaveApprovalFlow(sequelize, Sequelize);
db.leaveApprovalLevel = LeaveApprovalLevel(sequelize, Sequelize);
db.leaveApprovalTrails = LeaveApprovalTrails(sequelize, Sequelize);
db.pushNotificationHistory = PushNotificationHistory(sequelize, Sequelize);
/// Leave Approval FLow //////

//ritak address approval start
db.employeeAddressHistory = EmployeeAddressHistory(sequelize, Sequelize);
db.qrSessionHistory = QRSessionHistory(sequelize, Sequelize);
//ritak address approval end

// appraisal //
db.appraisalGoalsMaster = AppraisalGoalsMaster(sequelize, Sequelize);
db.goalAttributesConfigMaster = GoalAttributesConfigMaster(
	sequelize,
	Sequelize,
);
db.goalAttributesMapping = GoalAttributesMapping(sequelize, Sequelize);
db.goalAttributesOptions = GoalAttributesOptions(sequelize, Sequelize);
db.goalAreaForUser = GoalAreaForUser(sequelize, Sequelize);
db.subGoalAreaForUser = SubGoalAreaForUser(sequelize, Sequelize);
db.goalAreaPragatiTrail = GoalAreaPragatiTrail(sequelize, Sequelize);
db.pragatiActivity = PragatiActivity(sequelize, Sequelize);
db.reviewFramework = ReviewFramework(sequelize, Sequelize);
db.goalRating = GoalRating(sequelize, Sequelize);
db.goalPlanMail = GoalPlanMail(sequelize, Sequelize);
db.ratingScaleMaster = RatingScaleMaster(sequelize, Sequelize);
db.ratingScaleConfig = RatingScaleConfig(sequelize, Sequelize);
db.compentanyTier = CompentanyTier(sequelize, Sequelize);
db.compentancyAttributes = CompentancyAttributes(sequelize, Sequelize);

// appraisal //

// start by jay
db.LoginSessionHistory = LoginSessionHistory(sequelize, Sequelize);
// end by jay

//ritak Hr Policy start
db.hrPolicyCategories = HrPolicyCategories(sequelize, Sequelize);
db.hrPolicies = HrPolicies(sequelize, Sequelize);
db.hrPolicySignoffs = HrPolicySignoffs(sequelize, Sequelize);
db.user_assignment = user_assignment(sequelize, Sequelize);
db.user_assignment_process_master = user_assignment_process_master(
	sequelize,
	Sequelize,
);
db.user_assignment_attribute_master = user_assignment_attribute_master(
	sequelize,
	Sequelize,
);
db.user_assignment_condition = user_assignment_condition(sequelize, Sequelize);
//ritak Hr Policy end

db.earningsArearAmounts = EarningArearsAmount(sequelize,Sequelize);

db.holidayCompanyLocationConfiguration.hasOne(db.holidayMaster, {
	foreignKey: "holidayId",
	sourceKey: "holidayId",
	as: "holidayDetails",
});

db.employeeMaster.hasMany(db.employeeMaster, {
	foreignKey: "manager",
	sourceKey: "id",
	as: "reportie",
});
db.employeeMaster.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "manager",
	as: "managerData",
});
db.employeeMaster.hasOne(db.roleMaster, {
	foreignKey: "role_id",
	sourceKey: "role_id",
});
db.employeeMaster.hasOne(db.designationMaster, {
	foreignKey: "designationId",
	sourceKey: "designation_id",
});
db.employeeMaster.hasOne(db.employeeTypeMaster, {
	foreignKey: "empTypeId",
	sourceKey: "employeeType",
});
db.buMapping.hasOne(db.buMaster, { foreignKey: "buId", sourceKey: "buId" });
db.employeeMaster.hasOne(db.functionalAreaMaster, {
	foreignKey: "functionalAreaId",
	sourceKey: "functionalAreaId",
});
db.employeeMaster.hasOne(db.buMaster, {
	foreignKey: "buId",
	sourceKey: "buId",
});
db.employeeMaster.hasOne(db.sbuMaster, {
	foreignKey: "sbuId",
	sourceKey: "sbuId",
});
db.employeeMaster.hasOne(db.departmentMaster, {
	foreignKey: "departmentId",
	sourceKey: "departmentId",
});
db.employeeMaster.hasOne(db.companyMaster, {
	foreignKey: "companyId",
	sourceKey: "companyId",
});
db.companyMaster.hasOne(db.groupCompanyMaster, {
	foreignKey: "groupId",
	sourceKey: "groupId",
});
db.employeeMaster.hasOne(db.biographicalDetails, {
	foreignKey: "userId",
	sourceKey: "id",
});
db.employeeMaster.hasOne(db.jobDetails, {
	foreignKey: "userId",
	sourceKey: "id",
});
db.employeeMaster.hasOne(db.emergencyDetails, {
	foreignKey: "userId",
	sourceKey: "id",
});
db.employeeMaster.hasOne(db.shiftMaster, {
	foreignKey: "shiftId",
	sourceKey: "shiftId",
});
db.employeeMaster.hasMany(db.familyDetails, {
	foreignKey: "EmployeeId",
	sourceKey: "id",
});
db.employeeMaster.hasMany(db.educationDetails, {
	foreignKey: "userId",
	sourceKey: "id",
});
db.employeeMaster.hasOne(db.paymentDetails, {
	foreignKey: "userId",
	sourceKey: "id",
});
db.employeeMaster.hasOne(db.vaccinationDetails, {
	foreignKey: "userId",
	sourceKey: "id",
});
db.educationDetails.hasOne(db.degreeMaster, {
	foreignKey: "degreeId",
	sourceKey: "educationDegree",
});
db.sbuMapping.hasOne(db.sbuMaster, { foreignKey: "sbuId", sourceKey: "sbuId" });
db.departmentMapping.hasOne(db.departmentMaster, {
	foreignKey: "departmentId",
	sourceKey: "departmentId",
});
db.functionalAreaMapping.hasOne(db.functionalAreaMaster, {
	foreignKey: "functionalAreaId",
	sourceKey: "functionalAreaId",
});
db.payElements.hasOne(db.salaryComponent, {
	foreignKey: "salaryComponentAutoId",
	sourceKey: "salaryComponentAutoId",
});
db.payElements.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "EmployeeId",
});
db.paySlips.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "EmployeeId",
});
db.paySlipComponent.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "EmployeeId",
});
db.paySlipComponent.hasOne(db.salaryComponent, {
	foreignKey: "salaryComponentAutoId",
	sourceKey: "salaryComponentAutoId",
});
db.paySlips.hasMany(db.paySlipComponent, {
	foreignKey: "paySlipAutoId",
	sourceKey: "paySlipAutoId",
});
db.attendanceMaster.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "employeeId",
});
db.employeeMaster.hasOne(db.attendanceMaster, {
	foreignKey: "employeeId",
	sourceKey: "id",
});
db.attendanceMaster.hasOne(db.shiftMaster, {
	foreignKey: "shiftId",
	sourceKey: "attendanceShiftId",
});
db.attendanceMaster.hasOne(db.attendancePolicymaster, {
	foreignKey: "attendancePolicyId",
	sourceKey: "attendancePolicyId",
});
db.attendanceMaster.hasOne(db.weekOffMaster, {
	foreignKey: "weekOffId",
	sourceKey: "weekOffId",
});
db.regularizationMaster.hasOne(db.attendanceMaster, {
	foreignKey: "attendanceAutoId",
	sourceKey: "attendanceAutoId",
});
db.regularizationMaster.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "updatedBy",
	as: "attendanceUpdatedBy",
});

db.employeeLeaveTransactions.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "updatedBy",
	as: "leaveUpdatedBy",
});
db.attendanceMaster.hasMany(db.regularizationMaster, {
	foreignKey: "attendanceAutoId",
	sourceKey: "attendanceAutoId",
	as: "latest_Regularization_Request",
});
db.leaveMapping.hasOne(db.leaveMaster, {
	foreignKey: "leaveId",
	sourceKey: "leaveAutoId",
});
db.leaveMapping.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "EmployeeId",
});
db.employeeMaster.hasOne(db.attendancePolicymaster, {
	foreignKey: "attendancePolicyId",
	sourceKey: "attendancePolicyId",
});
db.employeeMaster.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "buHRId",
	as: "buhrData",
});

db.employeeMaster.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "buHeadId",
	as: "buHeadData",
});

db.attendanceMaster.hasMany(db.employeeLeaveTransactions, {
	foreignKey: "appliedFor",
	sourceKey: "attendanceDate",
	as: "employeeLeaveTransactionDetails",
});

db.employeeLeaveTransactions.hasMany(db.leaveMaster, {
	foreignKey: "leaveId",
	sourceKey: "leaveAutoId",
	as: "leaveMasterDetails",
});

db.employeeLeaveTransactions.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "employeeId",
});

db.employeeMaster.belongsTo(db.employeeLeaveTransactions, {
	foreignKey: "id",
	sourceKey: "employeeId",
});

db.attendanceMaster.hasMany(db.holidayCompanyLocationConfiguration, {
	foreignKey: "holidayCompanyLocationConfigurationID",
	sourceKey: "holidayCompanyLocationConfigurationID",
	as: "holidayLocationMappingDetails",
});

db.employeeMaster.hasOne(db.weekOffMaster, {
	foreignKey: "weekOffId",
	sourceKey: "weekOffId",
});

db.weekOffMaster.hasMany(db.weekOffDayMappingMaster, {
	foreignKey: "weekOffId",
	sourceKey: "weekOffId",
});

db.employeeMaster.hasMany(db.holidayCompanyLocationConfiguration, {
	foreignKey: "companyLocationId",
	sourceKey: "companyLocationId",
});
db.employeeMaster.hasOne(db.companyLocationMaster, {
	foreignKey: "companyLocationId",
	sourceKey: "companyLocationId",
});
db.employeeMaster.hasOne(db.costCenterMaster, {
	foreignKey: "costCenterId",
	sourceKey: "costId",
});
db.employeeMaster.hasMany(db.loginDetails, {
	foreignKey: "employeeId",
	sourceKey: "id",
});
db.buMapping.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "headId",
	as: "buHeadData",
});
db.buMapping.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "buHrId",
	as: "buhrData",
});
db.jobDetails.hasOne(db.unionCodIncrementMaster, {
	foreignKey: "unionCodeId",
	sourceKey: "unionId",
	as: "incrementCycle",
});
db.jobDetails.hasOne(db.bandMaster, {
	foreignKey: "bandId",
	sourceKey: "bandId",
});
db.jobDetails.hasOne(db.gradeMaster, {
	foreignKey: "gradeId",
	sourceKey: "gradeId",
});
db.jobDetails.hasOne(db.jobLevelMaster, {
	foreignKey: "jobLevelId",
	sourceKey: "jobLevelId",
});
db.employeeMaster.hasOne(db.salutationMaster, {
	foreignKey: "salutationId",
	sourceKey: "salutationId",
});
db.biographicalDetails.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "userId",
});
db.jobDetails.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "userId",
});
db.companyLocationMaster.hasOne(db.cityMaster, {
	foreignKey: "cityId",
	sourceKey: "cityId",
});
db.companyLocationMaster.hasOne(db.stateMaster, {
	foreignKey: "stateId",
	sourceKey: "stateId",
});
db.companyLocationMaster.hasOne(db.countryMaster, {
	foreignKey: "countryId",
	sourceKey: "countryId",
});
db.employeeMaster.hasOne(db.employeeAddress, {
	foreignKey: "employeeId",
	sourceKey: "id",
});
db.employeeAddress.hasOne(db.cityMaster, {
	foreignKey: "cityId",
	sourceKey: "currentCityId",
	as: "currentcity",
});
db.employeeAddress.hasOne(db.cityMaster, {
	foreignKey: "cityId",
	sourceKey: "permanentCityId",
	as: "permanentcity",
});
db.employeeAddress.hasOne(db.cityMaster, {
	foreignKey: "cityId",
	sourceKey: "emergencyCityId",
	as: "emergencycity",
});
db.employeeAddress.hasOne(db.stateMaster, {
	foreignKey: "stateId",
	sourceKey: "currentStateId",
	as: "currentstate",
});
db.employeeAddress.hasOne(db.stateMaster, {
	foreignKey: "stateId",
	sourceKey: "permanentStateId",
	as: "permanentstate",
});
db.employeeAddress.hasOne(db.stateMaster, {
	foreignKey: "stateId",
	sourceKey: "emergencyStateId",
	as: "emergencystate",
});
db.employeeAddress.hasOne(db.countryMaster, {
	foreignKey: "countryId",
	sourceKey: "currentCountryId",
	as: "currentcountry",
});
db.employeeAddress.hasOne(db.countryMaster, {
	foreignKey: "countryId",
	sourceKey: "permanentCountryId",
	as: "permanentcountry",
});
db.employeeAddress.hasOne(db.countryMaster, {
	foreignKey: "countryId",
	sourceKey: "emergencyCountryId",
	as: "emergencycountry",
});
db.employeeAddress.hasOne(db.pinCodeMaster, {
	foreignKey: "pincodeId",
	sourceKey: "currentPincodeId",
	as: "currentpincode",
});
db.employeeAddress.hasOne(db.pinCodeMaster, {
	foreignKey: "pincodeId",
	sourceKey: "permanentPincodeId",
	as: "permanentpincode",
});
db.employeeAddress.hasOne(db.pinCodeMaster, {
	foreignKey: "pincodeId",
	sourceKey: "emergencyPincodeId",
	as: "emergencypincode",
});
db.jobDetails.hasOne(db.stateMaster, {
	foreignKey: "stateId",
	sourceKey: "lwfState",
	as: "lwfStateName",
});
db.jobDetails.hasOne(db.lwfDesignationMaster, {
	foreignKey: "lwfDesignationId",
	sourceKey: "lwfDesignation",
	as: "lwfDesignationName",
});
db.employeeMaster.hasMany(db.employeeWorkExperience, {
	foreignKey: "userId",
	sourceKey: "id",
});
db.employeeMaster.hasMany(db.hrLetters, {
	foreignKey: "userId",
	sourceKey: "id",
});
db.employeeMaster.hasMany(db.employeeCertificates, {
	foreignKey: "userId",
	sourceKey: "id",
});
db.hrLetters.hasOne(db.hrDocumentMaster, {
	foreignKey: "documentId",
	sourceKey: "documentType",
});
db.separationMaster.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "employeeId",
});
db.separationMaster.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "createdBy",
	as: "initiatedByUser",
});
db.employeeMaster.hasOne(db.noticePeriodMaster, {
	foreignKey: "noticePeriodAutoId",
	sourceKey: "noticePeriodAutoId",
});

db.companyLocationMaster.hasOne(db.cityMaster, {
	foreignKey: "cityId",
	sourceKey: "cityId",
});
db.companyLocationMaster.hasOne(db.pinCodeMaster, {
	foreignKey: "pincodeId",
	sourceKey: "pincodeId",
});

db.employeeStagingMaster.hasOne(db.roleMaster, {
	foreignKey: "role_id",
	sourceKey: "role_id",
});
db.employeeStagingMaster.hasOne(db.designationMaster, {
	foreignKey: "designationId",
	sourceKey: "designation_id",
});
db.employeeStagingMaster.hasOne(db.functionalAreaMaster, {
	foreignKey: "functionalAreaId",
	sourceKey: "functionalAreaId",
});
db.employeeStagingMaster.hasOne(db.buMaster, {
	foreignKey: "buId",
	sourceKey: "buId",
});
db.employeeStagingMaster.hasOne(db.sbuMaster, {
	foreignKey: "sbuId",
	sourceKey: "sbuId",
});
db.employeeStagingMaster.hasOne(db.departmentMaster, {
	foreignKey: "departmentId",
	sourceKey: "departmentId",
});
db.employeeStagingMaster.hasOne(db.companyMaster, {
	foreignKey: "companyId",
	sourceKey: "companyId",
});
db.employeeStagingMaster.hasOne(db.shiftMaster, {
	foreignKey: "shiftId",
	sourceKey: "shiftId",
});
db.employeeStagingMaster.hasOne(db.companyLocationMaster, {
	foreignKey: "companyLocationId",
	sourceKey: "companyLocationId",
});
db.separationMaster.hasOne(db.separationStatus, {
	foreignKey: "separationStatusAutoId",
	sourceKey: "finalStatus",
});
db.separationMaster.hasOne(db.separationType, {
	foreignKey: "separationTypeAutoId",
	sourceKey: "l2SeparationType",
	as: "l2Separationtype",
});
db.separationMaster.hasOne(db.separationReason, {
	foreignKey: "separationReasonAutoId",
	sourceKey: "l2ReasonOfSeparation",
	as: "l2ReasonofSeparation",
});

db.separationMaster.hasOne(db.separationReason, {
	foreignKey: "separationReasonAutoId",
	sourceKey: "empReasonOfResignation",
	as: "empReasonofResignation",
});
db.separationMaster.hasOne(db.separationReason, {
	foreignKey: "separationReasonAutoId",
	sourceKey: "l1ReasonOfResignation",
	as: "l1ReasonofResignation",
});

db.employeeMaster.hasMany(db.leaveMapping, {
	foreignKey: "EmployeeId",
	sourceKey: "id",
	as: "employeeLeaves",
});

db.reportModuleMaster.hasMany(db.reportType, {
	foreignKey: "reportModuleId",
	sourceKey: "reportModuleId",
});
db.separationStatus.hasOne(db.separationTrail, {
	foreignKey: "separationStatus",
	sourceKey: "separationStatusAutoId",
});

db.separationTrail.belongsTo(db.separationStatus, {
	foreignKey: "separationStatus", // The foreign key in separationTrail
	targetKey: "separationStatusAutoId", // The primary key in separationStatus
});

db.separationTrail.hasOne(db.separationMaster, {
	foreignKey: "resignationAutoId",
	sourceKey: "separationAutoId",
});

db.separationTrail.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "createdBy",
	as: "createdBySeparationTrail",
});

db.separationTrail.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "updatedBy",
	as: "updatedBySeparationTrail",
});
db.separationMaster.hasMany(db.separationTrail, {
	foreignKey: "separationAutoId",
	sourceKey: "resignationAutoId",
});
db.separationMaster.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "pendingAt",
	as: "pending",
});
db.separationTrail.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "pendingAt",
	as: "pendingat",
});
db.separationTaskMapping.hasOne(db.separationTaskConfig, {
	foreignKey: "taskConfigAutoId",
	sourceKey: "taskConfigAutoId",
});
db.separationTaskMapping.hasOne(db.separationTaskMaster, {
	foreignKey: "taskAutoId",
	sourceKey: "taskAutoId",
});

db.separationTaskOwner.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "taskOwner",
});
db.separationInitiatedTask.hasMany(db.separationTaskOwner, {
	foreignKey: "taskMappingAutoId",
	sourceKey: "initiatedTaskAutoId",
});
db.separationTaskMaster.hasMany(db.separationTaskFields, {
	foreignKey: "taskAutoId",
	sourceKey: "taskAutoId",
});
db.separationInitiatedTask.hasOne(db.separationTaskMapping, {
	foreignKey: "taskAutoId",
	sourceKey: "taskAutoId",
});
db.separationInitiatedTask.hasOne(db.separationTaskMaster, {
	foreignKey: "taskAutoId",
	sourceKey: "taskAutoId",
});
db.separationInitiatedTask.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "employeeId",
});
db.separationMaster.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "employeeId",
});
db.employeeMaster.hasOne(db.separationMaster, {
	foreignKey: "employeeId",
	sourceKey: "id",
});
db.categoryMaster.hasMany(db.subCategoryMaster, {
	foreignKey: "categoryAutoId",
	sourceKey: "categoryAutoId",
});

db.managerHistory.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "managerId",
	as: "managerHistoryDate",
});

db.PolicyHistory.hasOne(db.shiftMaster, {
	foreignKey: "shiftId",
	sourceKey: "shiftPolicy",
	as: "historyshiftMaster",
});
db.PolicyHistory.hasOne(db.attendancePolicymaster, {
	foreignKey: "attendancePolicyId",
	sourceKey: "attendancePolicy",
	as: "historyattendanceMaster",
});
db.PolicyHistory.hasOne(db.weekOffMaster, {
	foreignKey: "weekOffId",
	sourceKey: "weekOffPolicy",
	as: "historyweekOffMaster",
});
db.PolicyHistory.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "createdBy",
	as: "PolicyUpdaterDetails",
});

db.EmployeeLeaveHeader.hasMany(db.leaveMaster, {
	foreignKey: "leaveId",
	sourceKey: "leaveAutoId",
	as: "leaveMasterDetails",
});

db.EmployeeLeaveHeader.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "employeeId",
});

db.employeeMaster.belongsTo(db.EmployeeLeaveHeader, {
	foreignKey: "id",
	sourceKey: "employeeId",
});
db.attendanceMaster.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "createdBy",
	as: "punchInCreatedBy",
});
db.attendanceMaster.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "updatedBy",
	as: "punchOutCreatedBy",
});

db.separationTaskFields.hasOne(db.separationFieldValues, {
	sourceKey: "taskFieldsAutoId",
	foreignKey: "fields",
});

db.employeeStagingMaster.hasOne(db.attendancePolicymaster, {
	foreignKey: "attendancePolicyId",
	sourceKey: "attendancePolicyId",
});

db.employeeStagingMaster.hasOne(db.weekOffMaster, {
	foreignKey: "weekOffId",
	sourceKey: "weekOffId",
});

db.employeeStagingMaster.hasOne(db.employeeTypeMaster, {
	foreignKey: "empTypeId",
	sourceKey: "employeeType",
});

db.employeeStagingMaster.hasOne(db.probationMaster, {
	foreignKey: "probationId",
	sourceKey: "probationId",
});

db.employeeStagingMaster.hasOne(db.newCustomerNameMaster, {
	foreignKey: "newCustomerNameId",
	sourceKey: "newCustomerNameId",
});

db.employeeStagingMaster.hasOne(db.jobLevelMaster, {
	foreignKey: "jobLevelId",
	sourceKey: "jobLevelId",
});

db.employeeStagingMaster.hasOne(db.noticePeriodMaster, {
	foreignKey: "noticePeriodAutoId",
	sourceKey: "noticePeriodAutoId",
});

db.employeeStagingMaster.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "manager",
});

db.EmployeeLeaveHeader.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "updatedBy",
	as: "leaveUpdatedBy",
});

db.separationInitiatedTask.hasMany(db.separationFieldValues, {
	foreignKey: "initiatedTaskAutoId",
});

db.separationFieldValues.hasOne(db.separationTaskFields, {
	foreignKey: "taskFieldsAutoId",
	sourceKey: "fields",
});
db.jobDetails.hasOne(db.probationMaster, {
	foreignKey: "probationId",
	sourceKey: "probationId",
});
db.employeeMaster.hasOne(db.degreeMaster, {
	foreignKey: "degreeId",
	sourceKey: "highestQualification",
});

db.employeeStagingMaster.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "buHRId",
	as: "buhrData",
});

db.employeeStagingMaster.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "buHeadId",
	as: "buHeadData",
});

db.employeeStagingMaster.hasOne(db.degreeMaster, {
	foreignKey: "degreeId",
	sourceKey: "highestQualification",
});

db.paymentDetails.hasOne(db.bankMaster, {
	foreignKey: "bankId",
	sourceKey: "bankId",
});

db.paymentDetails.hasOne(db.bankMaster, {
	foreignKey: "bankId",
	sourceKey: "newBankId",
	as: "newBankName",
});

db.paymentDetails.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "userId",
});
db.separationMaster.hasOne(db.subCategoryMaster, {
	foreignKey: "subCategoryId",
	sourceKey: "l2RevokeReason",
	as: "revokeReason",
});
db.jobLevelMapping.hasOne(db.jobLevelMaster, {
	foreignKey: "jobLevelId",
	sourceKey: "jobLevelId",
});

db.functionalAreaMaster.hasOne(db.functionalAreaMaster, {
	foreignKey: "functionalAreaId",
	sourceKey: "parentFunctionalAreaId",
	as: "parentFunctionalArea",
});

//CONFIRMATION
db.Confirmationinitiated.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "employeeId",
});
db.Confirmationowners.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "employeeId",
});
db.Confirmationinitiated.hasMany(db.Confirmationowners, {
	foreignKey: "confirmationinitiatedAutoId",
});
db.Confirmationowners.belongsTo(db.Confirmationinitiated, {
	foreignKey: "confirmationinitiatedAutoId",
});
db.Confirmatoinformfields.hasMany(db.Confirmatoinformfieldsoptions, {
	foreignKey: "confirmatoinformfieldsAutoId",
});

db.Confirmationformfilledvalues.hasOne(db.Confirmatoinformfields, {
	foreignKey: "confirmatoinformfieldsAutoId",
	sourceKey: "confirmatoinformfieldsAutoId",
});
db.Confirmationinitiated.hasMany(db.Confirmationaudittrail, {
	foreignKey: "confirmationinitiatedAutoId",
});
db.employeeMaster.hasOne(db.Confimationpolicy, {
	foreignKey: "confimationPolicyAutoId",
	sourceKey: "confimationPolicyAutoId",
});
db.Signingauthority.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "authorityUser",
});

db.Confimationpolicy.hasMany(db.Confirmationpolicyworkflow, {
	foreignKey: "confimationPolicyAutoId",
	sourceKey: "confimationPolicyAutoId",
});
//CONFIRAMTION
db.employeeMaster.hasMany(db.DesignationEmploymentHistory, {
	foreignKey: "employeeId",
	sourceKey: "id",
	as: "designationHistories",
});

db.employeeMaster.hasMany(db.DepartmentEmploymentHistory, {
	foreignKey: "employeeId",
	sourceKey: "id",
	as: "departmentHistories",
});

db.employeeMaster.hasMany(db.CostCenterEmploymentHistory, {
	foreignKey: "employeeId",
	sourceKey: "id",
	as: "costCenterHistories",
});

db.employeeMaster.hasMany(db.JobLevelEmploymentHistory, {
	foreignKey: "employeeId",
	sourceKey: "id",
	as: "jobLevelHistories",
});

db.employeeMaster.hasMany(db.OfficeLocationEmploymentHistory, {
	foreignKey: "employeeId",
	sourceKey: "id",
	as: "officeLocationHistories",
});

db.employeeMaster.hasMany(db.EmployeeTypeEmploymentHistory, {
	foreignKey: "employeeId",
	sourceKey: "id",
	as: "employeeTypeHistories",
});

db.DesignationEmploymentHistory.hasOne(db.designationMaster, {
	foreignKey: "designationId",
	sourceKey: "designation_id",
});

db.DepartmentEmploymentHistory.hasOne(db.departmentMaster, {
	foreignKey: "departmentId",
	sourceKey: "departmentId",
});

db.DepartmentEmploymentHistory.hasOne(db.functionalAreaMaster, {
	foreignKey: "functionalAreaId",
	sourceKey: "functionalAreaId",
});

db.CostCenterEmploymentHistory.hasOne(db.costCenterMaster, {
	foreignKey: "costCenterId",
	sourceKey: "costId",
});

db.JobLevelEmploymentHistory.hasOne(db.jobLevelMaster, {
	foreignKey: "jobLevelId",
	sourceKey: "jobLevelId",
});

db.OfficeLocationEmploymentHistory.hasOne(db.companyLocationMaster, {
	foreignKey: "companyLocationId",
	sourceKey: "companyLocationId",
});

db.EmployeeTypeEmploymentHistory.hasOne(db.employeeTypeMaster, {
	foreignKey: "empTypeId",
	sourceKey: "employeeType",
});

db.employeeMaster.hasMany(db.managerHistory, {
	foreignKey: "employeeId",
	sourceKey: "id",
	as: "managerHistories",
});

db.DesignationEmploymentHistory.hasOne(db.companyMaster, {
	foreignKey: "companyId",
	sourceKey: "companyId",
});

// START EMPLOYMENT HISTORY

db.DesignationEmploymentHistory.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "createdBy",
	as: "designationHistoryCreatedBy",
});

db.DepartmentEmploymentHistory.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "createdBy",
	as: "departmentHistoryCreatedBy",
});

db.CostCenterEmploymentHistory.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "createdBy",
	as: "costCenterHistoryCreatedBy",
});

db.JobLevelEmploymentHistory.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "createdBy",
	as: "jobLevelHistoryCreatedBy",
});

db.OfficeLocationEmploymentHistory.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "createdBy",
	as: "officeLocationHistoryCreatedBy",
});

db.EmployeeTypeEmploymentHistory.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "createdBy",
	as: "employeeTypeHistoryCreatedBy",
});

db.managerHistory.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "createdBy",
	as: "managerHistoryCreatedBy",
});

db.DepartmentEmploymentHistory.hasOne(db.buMaster, {
	foreignKey: "buId",
	sourceKey: "buId",
});

db.DepartmentEmploymentHistory.hasOne(db.sbuMaster, {
	foreignKey: "sbuId",
	sourceKey: "sbuId",
});

db.DepartmentEmploymentHistory.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "buHRId",
	as: "departmentBUHR",
});

db.DepartmentEmploymentHistory.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "buHeadId",
	as: "departmentBUHead",
});
// Join for Attendance history with Employee details
db.attendanceHistory.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "employeeId",
});

db.attendanceHistory.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "updatedBy",
	as: "attendanceApprover",
});

db.attendanceHistory.hasOne(db.shiftMaster, {
	foreignKey: "shiftId",
	sourceKey: "shiftId",
});

db.attendanceHistory.hasOne(db.weekOffMaster, {
	foreignKey: "weekOffId",
	sourceKey: "weekOffId",
});

db.attendanceHistory.hasOne(db.attendancePolicymaster, {
	foreignKey: "attendancePolicyId",
	sourceKey: "attendancePolicyId",
});

db.attendanceHistory.hasOne(db.companyLocationMaster, {
	foreignKey: "companyLocationId",
	sourceKey: "companyLocationId",
});
// Join for Attendance history with Employee details
// db.DesignationEmploymentHistory.hasOne(db.designationMaster, {
//   foreignKey: "designationId",
//   sourceKey: "oldDesignationId",
//   as: 'designationChangesFrom'
// });

// db.DepartmentEmploymentHistory.hasOne(db.departmentMaster, {
//   foreignKey: "departmentId",
//   sourceKey: "oldDepartmentId",
//   as: 'departmentChangesFrom'
// });

// db.CostCenterEmploymentHistory.hasOne(db.costCenterMaster, {
//   foreignKey: "costCenterId",
//   sourceKey: "oldCostId",
//   as: 'costChangesFrom'
// });

// db.JobLevelEmploymentHistory.hasOne(db.jobLevelMaster, {
//   foreignKey: "jobLevelId",
//   sourceKey: "oldJobLevelId",
//   as: 'jobLevelChangesFrom'
// });

// db.OfficeLocationEmploymentHistory.hasOne(db.companyLocationMaster, {
//   foreignKey: "companyLocationId",
//   sourceKey: "oldCompanyLocationId",
//   as: 'officeLocationChangesFrom'
// });

// db.EmployeeTypeEmploymentHistory.hasOne(db.employeeTypeMaster, {
//   foreignKey: "empTypeId",
//   sourceKey: "oldEmployeeType",
//   as: 'employeeTypeChangesFrom'
// });

// db.managerHistory.hasOne(db.employeeMaster, {
//   foreignKey: "id",
//   sourceKey: "oldManagerId",
//   as: 'managerChangesFrom'
// });

// END EMPLOYMENT HISTORY

////Payroll/////////
db.salaryStructure.hasMany(db.salarystructurecomponentmapping, {
	foreignKey: "salaryStructureAutoId",
	sourceKey: "salaryStructureAutoId",
	as: "structureMappingDetails",
});

db.salarystructurecomponentmapping.hasMany(db.salarycomponentmapping, {
	foreignKey: "salaryStructurecomponentmappingAutoId",
	as: "componentMappedDetails",
});

// In salaryComponent model
db.salarystructurecomponentmapping.hasOne(db.salaryComponent, {
	foreignKey: "salaryComponentAutoId",
	sourceKey: "salaryComponentAutoId",
	as: "componentDetails",
});

db.salarycomponentmapping.belongsTo(db.salarycomponentelement, {
	foreignKey: "salaryComponentElementAutoId",
	as: "componentElementDetails", // This should match your query
});

db.salaryStructure.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "createdBy",
	as: "salaryStructureCreater",
});

db.salaryStructure.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "updatedBy",
	as: "salaryStructureUpdater",
});

db.employeeMaster.hasOne(db.jobDetails, {
	foreignKey: "userId",
	sourceKey: "id",
	as: "employeeJobDetails",
});

db.employeeMaster.hasOne(db.payPackage, {
	foreignKey: "EmployeeId",
	sourceKey: "id",
	as: "packageDetails",
});

db.payPackage.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "EmployeeId",
});

db.payPackage.hasMany(db.payElements, {
	foreignKey: "payPackageAutoId",
	sourceKey: "payPackageAutoId",
	as: "empPayElements",
});

// db.employeeMaster.hasOne(db.ptLocationMaster, {
//   foreignKey: "ptLocationId",
//   sourceKey: "ptLocationId",
// });

// db.employeeMaster.hasOne(db.lwfDesignationMaster, {
//   foreignKey: "lwfDesignationId",
//   sourceKey: "lwfDesignationId",
// });

db.ptLocationMaster.hasOne(db.ptMapping, {
	foreignKey: "ptLocationId",
	sourceKey: "ptLocationId",
});

db.lwfDesignationMaster.hasOne(db.lwfMapping, {
	foreignKey: "lwfDesignationId",
	sourceKey: "lwfDesignationId",
});

db.paymentDetails.hasOne(db.ptLocationMaster, {
	foreignKey: "ptLocationId",
	sourceKey: "ptLocationId",
});

db.salaryComponent.hasOne(db.salarystructurecomponentmapping, {
	foreignKey: "salaryComponentAutoId",
	sourceKey: "salaryComponentAutoId",
});
/////////////////////////////Payroll///////////////////////////
db.salarystructurecomponentmapping.hasOne(db.salarycomponentmapping, {
	foreignKey: "salaryStructurecomponentmappingAutoId",
	sourceKey: "salaryStructurecomponentmappingAutoId",
});

db.exportSheetMapping.hasMany(db.exportSheetMaster, {
	foreignKey: "exportSheetAutoId",
	sourceKey: "exportSheetAutoId",
});

// assign by jay

db.financialYearMaster.hasMany(db.payProcessMaster, {
	foreignKey: "financialYearId",
	sourceKey: "financialYearId",
	as: "payprocessmaster",
});

db.payProcessMaster.hasMany(db.payProcessDetails, {
	foreignKey: "proceessId",
	sourceKey: "payProcessMasterAutoId",
});

db.paySlips.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "EmployeeId",
});

db.payProcessMaster.hasOne(db.companyMaster, {
	foreignKey: "companyId",
	sourceKey: "companyId",
});

db.extraDeduction.hasOne(db.CompensationCategoryMaster, {
	foreignKey: "compensationCategoryId",
	sourceKey: "deductionCategoryId",
});

db.extraPayment.hasOne(db.CompensationCategoryMaster, {
	foreignKey: "compensationCategoryId",
	sourceKey: "paymentCategoryId",
});

//ritak work
db.costCenterMaster.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "costCenterHead",
});

db.holidayMaster.hasMany(db.holidayCompanyLocationConfiguration, {
	foreignKey: "holidayId",
	sourceKey: "holidayId",
});
//ritak work
//JAY work
db.paymentDetails.hasOne(db.stateMaster, {
	foreignKey: "stateId",
	sourceKey: "ptStateId",
});

db.paymentDetails.hasOne(db.ptLocationMaster, {
	foreignKey: "ptLocationId",
	sourceKey: "ptLocationId",
});
//ritak work
db.costCenterMaster.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "costCenterHead",
});

db.holidayMaster.hasMany(db.holidayCompanyLocationConfiguration, {
	foreignKey: "holidayId",
	sourceKey: "holidayId",
});
//ritak work
//JAY work
// Master config by jay

db.jobLevelMapping.hasOne(db.bandMaster, {
	foreignKey: "bandId",
	sourceKey: "bandId",
});

db.jobLevelMapping.hasOne(db.gradeMaster, {
	foreignKey: "gradeId",
	sourceKey: "gradeId",
});

db.jobLevelMapping.hasOne(db.companyMaster, {
	foreignKey: "companyId",
	sourceKey: "companyId",
});

db.departmentMapping.hasOne(db.sbuMapping, {
	foreignKey: "sbuMappingId",
	sourceKey: "sbuMappingId",
});

db.sbuMapping.hasOne(db.buMapping, {
	foreignKey: "buMappingId",
	sourceKey: "buMappingId",
});

db.buMapping.hasOne(db.companyMaster, {
	foreignKey: "companyId",
	sourceKey: "companyId",
});

db.functionalAreaMapping.hasOne(db.departmentMapping, {
	foreignKey: "departmentMappingId",
	sourceKey: "departmentMappingId",
});

db.ptLocationMaster.hasOne(db.stateMaster, {
	foreignKey: "stateId",
	sourceKey: "stateId",
});

db.employeeMaster.hasOne(db.AttendanceRoster, {
	foreignKey: "employeeId",
	sourceKey: "id",
});

db.AttendanceRoster.hasOne(db.shiftMaster, {
	foreignKey: "shiftId",
	sourceKey: "shiftId",
});

//COMP OFF

db.comp_off_assignment.hasMany(db.comp_off_assignment_filters, {
	foreignKey: "comp_off_assignment_auto_id_for_filter",
	sourceKey: "comp_off_assignment_auto_id",
});

db.comp_off_credit_history.hasOne(db.status_master, {
	foreignKey: "status_master_auto_id",
	sourceKey: "status",
});

db.comp_off_credit_history.hasOne(db.attendanceMaster, {
	foreignKey: "attendanceAutoId",
	sourceKey: "attendanceAutoIdHistory",
	as: "compOffAttendanceDetails",
});

db.comp_off_credit_history.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "employee_Id",
	as: "compOffEmpDetails",
});
db.comp_off_credit_history.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "updatedBy",
	as: "approvarEmpDetails",
});
db.comp_off_credit_history.hasOne(db.comp_off_polices, {
	foreignKey: "comp_off_polices_auto_id",
	sourceKey: "comp_off_polices_auto_id_history",
	as: "compOffPolicyDetails",
});

db.companyMaster.hasMany(db.leaveCompanyMapping, {
	foreignKey: "companyId",
	sourceKey: "companyId",
});
//COMP OFF
db.lwfMapping.hasOne(db.stateMaster, {
	foreignKey: "stateId",
	sourceKey: "stateId",
});

db.buMaster.hasMany(db.buMapping, {
	foreignKey: "buId",
	sourceKey: "buId",
});

db.buMapping.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "buHrId",
	as: "buHrData",
});
db.buMapping.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "headId",
	as: "headIdData",
});

db.sbuMaster.hasOne(db.sbuMapping, {
	foreignKey: "sbuId",
	sourceKey: "sbuId",
});

db.sbuMapping.hasOne(db.buMaster, {
	foreignKey: "buId",
	sourceKey: "buMappingId",
});

db.AttendanceRoster.hasOne(db.weekOffMaster, {
	foreignKey: "weekOffId",
	sourceKey: "weekOffId",
});

db.EmployeeLeaveHeader.hasMany(db.employeeLeaveTransactions, {
	foreignKey: "employeeleaveheaderID",
	sourceKey: "employeeleaveheaderID",
});

db.employeeLeaveTransactions.hasOne(db.EmployeeLeaveHeader, {
	foreignKey: "employeeleaveheaderID",
	sourceKey: "employeeleaveheaderID",
});
// added by jay
db.stateMaster.hasMany(db.lwfMapping, {
	foreignKey: "stateId",
	sourceKey: "stateId",
});

db.leaveCompanyMapping.hasOne(db.leaveMaster, {
	foreignKey: "leaveId",
	sourceKey: "leaveAutoId",
	as: "companyleaveMasterDetails",
});

db.leaveMapping.hasOne(db.leaveCompanyMapping, {
	foreignKey: "leaveAutoId",
	sourceKey: "leaveAutoId",
	as: "leaveCompanyDetails",
});

// end by jay

db.EmployeeLeaveHeader.hasMany(db.leaveApprovalTrails, {
	foreignKey: "leaveHeaderAutoId",
	sourceKey: "employeeleaveheaderID",
});

db.EmployeeLeaveHeader.hasMany(db.leaveApprovalTrails, {
	foreignKey: "leaveHeaderAutoId",
	sourceKey: "employeeleaveheaderID",
	as: "trails",
});

db.leaveApprovalTrails.hasOne(db.leaveApprovalFlow, {
	foreignKey: "approvalFlow_Auto_Id",
	sourceKey: "approvalFlowAutoId",
});

db.leaveApprovalTrails.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "pendingOn",
});

db.regularizationMaster.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "regularizeManagerId",
});

db.employeeLeaveTransactions.hasMany(db.leaveMaster, {
	foreignKey: "leaveId",
	sourceKey: "leaveAutoId",
});
//ritak export master data start

db.bankMaster.belongsTo(db.employeeMaster, {
	foreignKey: "createdBy",
	as: "createdEmployee",
});
db.bankMaster.belongsTo(db.employeeMaster, {
	foreignKey: "updatedBy",
	as: "updatedEmployee",
});

db.designationMaster.belongsTo(db.employeeMaster, {
	foreignKey: "createdBy",
	as: "createdEmployee",
});
db.designationMaster.belongsTo(db.employeeMaster, {
	foreignKey: "updatedBy",
	as: "updatedEmployee",
});

db.departmentMaster.belongsTo(db.employeeMaster, {
	foreignKey: "createdBy",
	as: "createdEmployee",
});
db.departmentMaster.belongsTo(db.employeeMaster, {
	foreignKey: "updatedBy",
	as: "updatedEmployee",
});
db.departmentMaster.belongsTo(db.departmentMaster, {
	foreignKey: "parentDepartmentId",
	as: "parentDepartment",
});

// departmentMaster belongs to departmentMapping
db.departmentMaster.belongsTo(db.departmentMapping, {
	foreignKey: "departmentId",
	targetKey: "departmentId",
});

// departmentMapping belongs to sbuMapping (via sbuMappingId)
db.departmentMapping.belongsTo(db.sbuMapping, {
	foreignKey: "sbuMappingId",
	targetKey: "sbuMappingId",
});

// sbuMapping belongs to buMapping (via buMappingId)
db.sbuMapping.belongsTo(db.buMapping, {
	foreignKey: "buMappingId",
	targetKey: "buMappingId",
});

db.functionalAreaMaster.belongsTo(db.employeeMaster, {
	foreignKey: "createdBy",
	as: "createdEmployee",
});
db.functionalAreaMaster.belongsTo(db.employeeMaster, {
	foreignKey: "updatedBy",
	as: "updatedEmployee",
});
db.functionalAreaMaster.belongsTo(db.functionalAreaMaster, {
	foreignKey: "parentFunctionalAreaId",
	as: "parentFunctionalAreaRef",
});

db.functionalAreaMaster.belongsTo(db.functionalAreaMapping, {
	foreignKey: "functionalAreaId",
	targetKey: "functionalAreaId",
});

db.jobLevelMaster.belongsTo(db.employeeMaster, {
	foreignKey: "createdBy",
	as: "createdEmployee",
});
db.jobLevelMaster.belongsTo(db.employeeMaster, {
	foreignKey: "updatedBy",
	as: "updatedEmployee",
});

db.jobLevelMaster.belongsTo(db.jobLevelMapping, {
	foreignKey: "jobLevelId",
	targetKey: "jobLevelId",
});

db.jobLevelMapping.belongsTo(db.companyMaster, { foreignKey: "companyId" });
db.jobLevelMapping.belongsTo(db.bandMaster, { foreignKey: "bandId" });
db.jobLevelMapping.belongsTo(db.gradeMaster, { foreignKey: "gradeId" });

db.companyMaster.belongsTo(db.employeeMaster, {
	foreignKey: "createdBy",
	as: "createdEmployee",
});
db.companyMaster.belongsTo(db.employeeMaster, {
	foreignKey: "updatedBy",
	as: "updatedEmployee",
});
db.companyMaster.belongsTo(db.currencyMaster, { foreignKey: "currencyId" });
db.companyMaster.belongsTo(db.timeZoneMaster, { foreignKey: "timezoneId" });
db.companyMaster.belongsTo(db.industryMaster, { foreignKey: "industryId" });
db.companyMaster.belongsTo(db.companyTypeMaster, {
	foreignKey: "companyTypeId",
});

db.companyTypeMaster.belongsTo(db.employeeMaster, {
	foreignKey: "createdBy",
	as: "createdEmployee",
});
db.companyTypeMaster.belongsTo(db.employeeMaster, {
	foreignKey: "updatedBy",
	as: "updatedEmployee",
});

db.bandMaster.belongsTo(db.employeeMaster, {
	foreignKey: "createdBy",
	as: "createdEmployee",
});
db.bandMaster.belongsTo(db.employeeMaster, {
	foreignKey: "updatedBy",
	as: "updatedEmployee",
});

db.gradeMaster.belongsTo(db.employeeMaster, {
	foreignKey: "createdBy",
	as: "createdEmployee",
});
db.gradeMaster.belongsTo(db.employeeMaster, {
	foreignKey: "updatedBy",
	as: "updatedEmployee",
});
db.costCenterMaster.belongsTo(db.employeeMaster, {
	foreignKey: "createdBy",
	as: "createdEmployee",
});
db.costCenterMaster.belongsTo(db.employeeMaster, {
	foreignKey: "updatedBy",
	as: "updatedEmployee",
});
db.companyLocationMaster.belongsTo(db.employeeMaster, {
	foreignKey: "createdBy",
	as: "createdEmployee",
});
db.companyLocationMaster.belongsTo(db.employeeMaster, {
	foreignKey: "updatedBy",
	as: "updatedEmployee",
});
db.companyLocationMaster.belongsTo(db.companyMaster, {
	foreignKey: "companyId",
	as: "companyMaster",
});
db.degreeMaster.belongsTo(db.employeeMaster, {
	foreignKey: "createdBy",
	as: "createdEmployee",
});
db.degreeMaster.belongsTo(db.employeeMaster, {
	foreignKey: "updatedBy",
	as: "updatedEmployee",
});
db.holidayMaster.belongsTo(db.employeeMaster, {
	foreignKey: "createdBy",
	as: "createdEmployee",
});
db.holidayMaster.belongsTo(db.employeeMaster, {
	foreignKey: "updatedBy",
	as: "updatedEmployee",
});
db.holidayCompanyLocationConfiguration.belongsTo(db.companyLocationMaster, {
	foreignKey: "companyLocationId",
	as: "companyLocationMaster",
});

db.newCustomerNameMaster.belongsTo(db.employeeMaster, {
	foreignKey: "createdBy",
	as: "createdEmployee",
});
db.newCustomerNameMaster.belongsTo(db.employeeMaster, {
	foreignKey: "updatedBy",
	as: "updatedEmployee",
});
db.buMaster.belongsTo(db.employeeMaster, {
	foreignKey: "createdBy",
	as: "createdEmployee",
});
db.buMaster.belongsTo(db.employeeMaster, {
	foreignKey: "updatedBy",
	as: "updatedEmployee",
});
db.sbuMaster.belongsTo(db.employeeMaster, {
	foreignKey: "createdBy",
	as: "createdEmployee",
});
db.sbuMaster.belongsTo(db.employeeMaster, {
	foreignKey: "updatedBy",
	as: "updatedEmployee",
});
db.weekOffMaster.belongsTo(db.employeeMaster, {
	foreignKey: "createdBy",
	as: "createdEmployee",
});
db.weekOffMaster.belongsTo(db.employeeMaster, {
	foreignKey: "updatedBy",
	as: "updatedEmployee",
});
db.shiftMaster.belongsTo(db.employeeMaster, {
	foreignKey: "createdBy",
	as: "createdEmployee",
});
db.shiftMaster.belongsTo(db.employeeMaster, {
	foreignKey: "updatedBy",
	as: "updatedEmployee",
});
db.attendancePolicymaster.belongsTo(db.employeeMaster, {
	foreignKey: "createdBy",
	as: "createdEmployee",
});
db.attendancePolicymaster.belongsTo(db.employeeMaster, {
	foreignKey: "updatedBy",
	as: "updatedEmployee",
});
db.leaveMaster.belongsTo(db.employeeMaster, {
	foreignKey: "createdBy",
	as: "createdEmployee",
});
db.leaveMaster.belongsTo(db.employeeMaster, {
	foreignKey: "updatedBy",
	as: "updatedEmployee",
});
db.noticePeriodMaster.belongsTo(db.employeeMaster, {
	foreignKey: "createdBy",
	as: "createdEmployee",
});
db.noticePeriodMaster.belongsTo(db.employeeMaster, {
	foreignKey: "updatedBy",
	as: "updatedEmployee",
});

//ritak export master data end

// db.leaveApprovalTrails.hasOne(db.employeeMaster, {
// 	foreignKey: "id",
// 	sourceKey: "pendingOn",
// })
db.ImportInfo.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "createdBy",
	as: "importByDetails",
});

db.ImportInfo.hasMany(db.ImportData, {
	foreignKey: "importAutoId",
	sourceKey: "importAutoId",
	as: "importedData",
});

///YOGI ADDED THIS JOIN
db.employeeMaster.hasOne(db.employeeLeaveTransactions, {
	foreignKey: "employeeId",
	sourceKey: "id",
});
///YOGI ADDED THIS JOIN

//ritak address approval start

db.employeeAddress.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "employeeId",
});

// Associations for newCurrent fields
db.employeeAddress.hasOne(db.cityMaster, {
	foreignKey: "cityId",
	sourceKey: "newCurrentCityId",
	as: "newCurrentCityDetails",
});
db.employeeAddress.hasOne(db.stateMaster, {
	foreignKey: "stateId",
	sourceKey: "newCurrentStateId",
	as: "newCurrentStateDetails",
});
db.employeeAddress.hasOne(db.countryMaster, {
	foreignKey: "countryId",
	sourceKey: "newCurrentCountryId",
	as: "newCurrentCountryDetails",
});
db.employeeAddress.hasOne(db.pinCodeMaster, {
	foreignKey: "pincodeId",
	sourceKey: "newCurrentPincodeId",
	as: "newCurrentPincodeDetails",
});

// Associations for newPermanent fields
db.employeeAddress.hasOne(db.cityMaster, {
	foreignKey: "cityId",
	sourceKey: "newPermanentCityId",
	as: "newPermanentCityDetails",
});
db.employeeAddress.hasOne(db.stateMaster, {
	foreignKey: "stateId",
	sourceKey: "newPermanentStateId",
	as: "newPermanentStateDetails",
});
db.employeeAddress.hasOne(db.countryMaster, {
	foreignKey: "countryId",
	sourceKey: "newPermanentCountryId",
	as: "newPermanentCountryDetails",
});
db.employeeAddress.hasOne(db.pinCodeMaster, {
	foreignKey: "pincodeId",
	sourceKey: "newPermanentPincodeId",
	as: "newPermanentPincodeDetails",
});

// Associations for newEmergency fields
db.employeeAddress.hasOne(db.cityMaster, {
	foreignKey: "cityId",
	sourceKey: "newEmergencyCityId",
	as: "newEmergencyCityDetails",
});
db.employeeAddress.hasOne(db.stateMaster, {
	foreignKey: "stateId",
	sourceKey: "newEmergencyStateId",
	as: "newEmergencyStateDetails",
});
db.employeeAddress.hasOne(db.countryMaster, {
	foreignKey: "countryId",
	sourceKey: "newEmergencyCountryId",
	as: "newEmergencyCountryDetails",
});
db.employeeAddress.hasOne(db.pinCodeMaster, {
	foreignKey: "pincodeId",
	sourceKey: "newEmergencyPincodeId",
	as: "newEmergencyPincodeDetails",
});
// ritak address approval end

// start added by jay
db.regularizationMaster.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "createdBy",
	as: "attendanceCreatedBy",
});
db.EmployeeLeaveHeader.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "createdBy",
	as: "leaveCreatedBy",
});

//Appraisal JOINS
db.appraisalGoalsMaster.hasMany(db.goalAttributesMapping, {
	foreignKey: "appraisalGoalId",
	sourceKey: "appraisalGoalId",
	as: "goalAttributes",
});

db.appraisalGoalsMaster.hasMany(db.goalAttributesMapping, {
	foreignKey: "appraisalGoalId",
	sourceKey: "appraisalGoalId",
	as: "subGoalAttributes",
});

db.appraisalGoalsMaster.hasMany(db.user_assignment, {
	foreignKey: "id",
	sourceKey: "userAssignment",
});

db.goalAttributesMapping.hasOne(db.goalAttributesConfigMaster, {
	foreignKey: "goalAttributeId",
	sourceKey: "goalAttributeId",
});

db.goalAttributesConfigMaster.hasMany(db.goalAttributesOptions, {
	foreignKey: "goalAttributeId",
	sourceKey: "goalAttributeId",
	as: "options",
});

db.goalAreaForUser.hasMany(db.subGoalAreaForUser, {
	foreignKey: "goalAreaId",
	sourceKey: "goalAreaId",
	as: "subGoals",
});

db.goalAreaForUser.hasOne(db.appraisalGoalsMaster, {
	foreignKey: "appraisalGoalId",
	sourceKey: "goalPlanId",
	as: "goalPlanMaster",
});

db.goalAreaPragatiTrail.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "userId",
});

db.goalAreaPragatiTrail.hasOne(db.appraisalGoalsMaster, {
	foreignKey: "appraisalGoalId",
	sourceKey: "goalPlanId",
});

db.goalAreaForUser.hasOne(db.employeeMaster, {
	foreignKey: "id",
	sourceKey: "userId",
});

//ritak Hr Policy start

db.hrPolicyCategories.hasMany(db.hrPolicies, {
	foreignKey: "category_id",
	as: "policies",
});

db.hrPolicies.belongsTo(db.hrPolicyCategories, {
	foreignKey: "category_id",
	as: "category",
});

db.hrPolicies.hasMany(db.hrPolicySignoffs, {
	foreignKey: "hr_policy_id",
	sourceKey: "id",
});

db.hrPolicySignoffs.belongsTo(db.hrPolicies, {
	foreignKey: "hr_policy_id",
	targetKey: "id",
});
db.hrPolicySignoffs.belongsTo(db.employeeMaster, {
	foreignKey: "user_id",
	targetKey: "id",
});
db.user_assignment.belongsTo(db.user_assignment_process_master, {
	foreignKey: "process_id",
	as: "process",
});
db.user_assignment_condition.belongsTo(db.user_assignment, {
	foreignKey: "user_assignment_id",
});
db.user_assignment_condition.belongsTo(db.user_assignment_attribute_master, {
	foreignKey: "attribute_id",
	as: "attribute",
});
db.user_assignment.hasMany(db.user_assignment_condition, {
	foreignKey: "user_assignment_id",
	as: "conditions",
});
db.employeeTypeMaster.belongsTo(db.companyMaster, { foreignKey: "companyId" });

//ritak Hr Policy end
//======================= appraisal==============
db.reviewFramework.hasMany(db.user_assignment, {
	foreignKey: "id",
	sourceKey: "userAssignment",
});

db.ratingScaleMaster.hasMany(db.ratingScaleConfig, {
	foreignKey: "ratingScaleId",
	sourceKey: "ratingScaleId",
});

db.compentancyAttributes.hasOne(db.compentanyTier, {
	foreignKey: "compentancyTierId",
	sourceKey: "compentancyTierId",
});

export default db;
