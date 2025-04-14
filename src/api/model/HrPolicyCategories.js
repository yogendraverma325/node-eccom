export default (sequelize, Sequelize) => {
	const HrPolicyCategories = sequelize.define("hr_policy_categories", {
		id: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		name: {
			type: Sequelize.STRING(255),
		},
		is_archived: {
			type: Sequelize.TINYINT,
		},
		isActive: {
			type: Sequelize.TINYINT,
		},
		createdAt: {
			type: Sequelize.DATE,
		},
		createdBy: {
			type: Sequelize.STRING(10),
		},
		updatedAt: {
			type: Sequelize.DATE,
		},
		updatedBy: {
			type: Sequelize.STRING(10),
		},
	});
	return HrPolicyCategories;
};
