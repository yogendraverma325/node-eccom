export default (sequelize, Sequelize) => {
	const comp_off_assignment = sequelize.define("comp_off_assignment", {
		comp_off_assignment_auto_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
			type: Sequelize.STRING,
		},
	});
	return comp_off_assignment;
};
