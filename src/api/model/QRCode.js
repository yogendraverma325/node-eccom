export default (sequelize, Sequelize) => {
	const qr_codes = sequelize.define("qr_codes", {
		qr_codes_auto_id: {
			type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		redirect_url: {
			type: Sequelize.STRING,
		},
       	created_for: {
			type: Sequelize.STRING,
		},
        scan_count: {
			type: Sequelize.INTEGER,
		},
        updatedBy: {
			type: Sequelize.INTEGER,
		},
        createdBy: {
			type: Sequelize.INTEGER,
		},
		createdAt: {
			type: Sequelize.DATE,
		},
		updatedAt: {
			type: Sequelize.DATE,
		},
	});
	return qr_codes;
};
