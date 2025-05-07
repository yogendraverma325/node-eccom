export default (sequelize, Sequelize) => {
	const earningArrears = sequelize.define("earningarrears", {
		earningArrearAutoId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		EmployeeId: {
			type: Sequelize.INTEGER,
		},
		arrearMonth: {
			type: Sequelize.STRING,
		},
		arrearPayMonth: {
			type: Sequelize.STRING,
		},
		arearDays: {
			type: Sequelize.INTEGER,
		},
		arearType: {
			type: Sequelize.STRING,
			default: null,
		},
		hasPF: {
			type: Sequelize.STRING,
			default: null,
		},
		computeESIC: {
			type: Sequelize.STRING,
			default: null,
		},
		isDeleteArrear: {
			type: Sequelize.STRING,
			default: null,
		},
		lopDate: {
			type: Sequelize.DATE,
			default: null,
		},
		createdBy: {
			type: Sequelize.INTEGER,
			default: null,
		},
		createdAt: {
			type: Sequelize.DATE,
			default: null,
		},
		updatedBy: {
			type: Sequelize.INTEGER,
			default: null,
		},
		updatedAt: {
			type: Sequelize.DATE,
			default: null,
		},
		isActive: {
			type: Sequelize.BOOLEAN,
			default: 0,
		},
		empCode:{
			type:Sequelize.STRING,
			default:null,
		},
		companyId:{
			type: Sequelize.INTEGER,
			//default: null,

		},
		buId:{
			type: Sequelize.INTEGER,
			//default: null,
		},
		sbuId:{
			type: Sequelize.INTEGER,
			//default: null,
		},
		financialYearId:{
			type: Sequelize.INTEGER,
			//default: null,		
		},
		processingRemark:{
			type: Sequelize.STRING,
			default: null,
		},
		status:{
			type:Sequelize.STRING,
			default:null
		},
		processedOn:{
			type: Sequelize.DATE,
			default: null,
		}
	});
	return earningArrears;
};
