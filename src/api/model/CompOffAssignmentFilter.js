export default (sequelize, Sequelize) => {
	const comp_off_assignment_filters = sequelize.define(
		"comp_off_assignment_filters",
		{
			comp_off_assignment_filters_auto_id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			comp_off_assignment_auto_id_for_filter: {
				type: Sequelize.INTEGER,
			},
			filter_type: {
				type: Sequelize.STRING,
			},
			filter_colum: {
				type: Sequelize.STRING,
			},
			filter_data: {
				type: Sequelize.STRING,
			},
		},
	);
	return comp_off_assignment_filters;
};
