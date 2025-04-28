export default (sequelize, Sequelize) => {
	const compensationCategoryMaster = sequelize.define(
		"compensationcategorymaster",
		{
			compensationCategoryId: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			name: {
				type: Sequelize.STRING(155),
				allowNull: true,
			},
			type: {
				type: Sequelize.INTEGER,
				allowNull: true, // 1 for deduction and 2 for payment
			},
			isActive: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			createdBy: {
				type: Sequelize.INTEGER,
				allowNull: true,
				defaultValue: null,
			},
			updatedBy: {
				type: Sequelize.INTEGER,
				allowNull: true,
				defaultValue: null,
			},
			createdAt: {
				type: Sequelize.DATE,
				allowNull: true,
				defaultValue: null,
			},
			updatedAt: {
				type: Sequelize.DATE,
				allowNull: true,
				defaultValue: null,
			},
		},
	);
	return compensationCategoryMaster;
};
