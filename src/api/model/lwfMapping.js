export default (sequelize, Sequelize) => {
	const lwfMapping = sequelize.define("lwfmapping", {
		lwfmappingId: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		lwfDesignationId: {
			type: Sequelize.INTEGER,
		},
		contributorType: {
			type: Sequelize.STRING,
		},
		stateId: {
			type: Sequelize.INTEGER,
		},
		apr: {
			type: Sequelize.DECIMAL(10, 2), // 0=> monthly 1=>yearly
		},
		may: {
			type: Sequelize.DECIMAL(10, 2),
		},
		jun: {
			type: Sequelize.DECIMAL(10, 2),
		},
		jul: {
			type: Sequelize.DECIMAL(10, 2),
		},
		aug: {
			type: Sequelize.DECIMAL(10, 2),
		},
		sep: {
			type: Sequelize.DECIMAL(10, 2),
		},
		oct: {
			type: Sequelize.DECIMAL(10, 2),
		},
		nov: {
			type: Sequelize.DECIMAL(10, 2),
		},
		dec: {
			type: Sequelize.DECIMAL(10, 2),
		},
		jan: {
			type: Sequelize.DECIMAL(10, 2),
		},
		feb: {
			type: Sequelize.DECIMAL(10, 2),
		},
		mar: {
			type: Sequelize.DECIMAL(10, 2),
		},
		createdAt: {
			type: Sequelize.DATE,
		},
		createdBy: {
			type: Sequelize.INTEGER,
		},
		updatedBy: {
			type: Sequelize.INTEGER,
		},
		updatedAt: {
			type: Sequelize.DATE,
		},
		isActive: {
			type: Sequelize.INTEGER,
		},
	});
	return lwfMapping;
};
